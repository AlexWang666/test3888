import psycopg2
from flask import jsonify, request

from ..core import db_conn
from . import pages_blueprint

from datetime import datetime


# Get all categories and items
@pages_blueprint.route("/api/get-all-budget", methods=["GET"])
def get_all_budget():
    projid = request.args.get('projid', '')
    cats = []

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT budget_category.id AS id, budget_category.category AS name,
                array[]::varchar[] AS items, 0.00 AS total_budgeted,
                0.00 AS total_spent, 0.00 AS remaining
            FROM budget_category INNER JOIN project
                ON budget_category.proj_id = project.id
            WHERE budget_category.proj_id = %s;
            """,
            (projid,),
        )

        for cat in db_cursor:
            with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor_2:
                db_cursor_2.execute(
                    """
                    SELECT budget_item.id AS id, budget_item.item AS item,
                    budget_item.quantity AS quantity, budget_item.cost_per AS cost_per,
                    budget_item.spent AS spent, budget_item.task_id AS taskid
                    FROM budget_item INNER JOIN budget_category
                        ON budget_item.cat_id = budget_category.id
                    INNER JOIN project
                        ON budget_item.proj_id = project.id
                    WHERE budget_item.proj_id = %s
                        AND budget_item.cat_id = %s;
                    """,
                    (projid, cat["id"],),
                )
                items = db_cursor_2.fetchall()
                cat["items"] = items

                if len(items) != 0:
                    # Calculates the aggregates and adds them
                    all_budgeted = sum(item["quantity"]*item["cost_per"] for item in items)
                    all_spent = sum(item["spent"] for item in items)

                    cat["total_budgeted"] = all_budgeted
                    cat["total_spent"] = all_spent
                    cat["remaining"] = all_budgeted-all_spent

            cats.append(cat)

    db_conn.commit()
    return jsonify(cats)


# Creates a new budget category
@pages_blueprint.route("/api/create-new-category", methods=["POST"])
def create_new_category():
    data = request.get_json()

    try:
        projid = data["params"]["projid"]
        name = data["params"]["name"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            INSERT INTO budget_category (category, proj_id)
            VALUES (%s, %s)
            RETURNING id;
            """,
            (name, projid,),
        )
        cat_id = db_cursor.fetchone();

    db_conn.commit()
    return cat_id


# Creates a new budget item
@pages_blueprint.route("/api/create-new-budget-item", methods=["POST"])
def create_new_budget_item():
    data = request.get_json()

    try:
        projid = data["params"]["projid"]
        item = data["params"]["item"]
        quantity = data["params"]["quantity"]
        cost_per = data["params"]["cost_per"]
        spent = data["params"]["spent"]
        cat_id = data["params"]["cat_id"]
        taskid = data["params"]["taskid"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            INSERT INTO budget_item (item, quantity, cost_per, spent, cat_id,
                proj_id, task_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s);
            """,
            (item, quantity, cost_per, spent, cat_id, projid, taskid,),
        )

    db_conn.commit()
    return jsonify({"msg": "success"})


# Gets budget aggregates
@pages_blueprint.route("/api/get-budget-totals", methods=["GET"])
def get_budget_totals():
    projid = request.args.get('projid', '')
    cats = []

    totals = {
        "total_budgeted": 0,
        "total_spent": 0,
        "remaining": 0
    }

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT budget_category.id AS id, 0.00 AS total_budgeted,
                0.00 AS total_spent, 0.00 AS remaining
            FROM budget_category INNER JOIN project
                ON budget_category.proj_id = project.id
            WHERE budget_category.proj_id = %s;
            """,
            (projid,),
        )

        for cat in db_cursor:
            with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor_2:
                db_cursor_2.execute(
                    """
                    SELECT budget_item.quantity AS quantity,
                        budget_item.cost_per AS cost_per,
                        budget_item.spent AS spent
                    FROM budget_item INNER JOIN budget_category
                        ON budget_item.cat_id = budget_category.id
                    INNER JOIN project
                        ON budget_item.proj_id = project.id
                    WHERE budget_item.proj_id = %s
                        AND budget_item.cat_id = %s;
                    """,
                    (projid, cat["id"],),
                )
                items = db_cursor_2.fetchall()

                # Calculates the aggregates and adds them
                if len(items) != 0:
                    all_budgeted = sum(float(item["quantity"])*float(item["cost_per"]) for item in items)
                    all_spent = sum(float(item["spent"]) for item in items)

                    cat["total_budgeted"] = all_budgeted
                    cat["total_spent"] = all_spent
                    cat["remaining"] = all_budgeted-all_spent

            cats.append(cat)

        if len(cats) != 0:
            totals["total_budgeted"] = sum(float(cat["total_budgeted"]) for cat in cats)
            totals["total_spent"] = sum(float(cat["total_spent"]) for cat in cats)
            totals["remaining"] = sum(float(cat["remaining"]) for cat in cats)

    db_conn.commit()
    return totals


# Gets the list of task names and id's for adding an associated task
@pages_blueprint.route("/api/get-all-task-names", methods=["GET"])
def get_all_task_names():
    projid = request.args.get('projid', '')

    task_names = []
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT task.id AS id, task.title AS name
            FROM task INNER JOIN project
                ON task.proj = project.id
            WHERE project.id = %s;
            """,
            (projid,),
        )
        task_names = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(task_names)
