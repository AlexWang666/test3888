import psycopg2
from flask import jsonify, request

from ..core import db_conn
from . import pages_blueprint


@pages_blueprint.route("/api/get-completion-tasks-and-milestones", methods=["GET"])
def get_completion_tasks_and_milestones():
    data = request.args

    try:
        projid = data["projid"]
        completed = data["completed"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT task.id, task.title as name, 'task' as type,
                profile.first_name as author, 'PFP' as pfp, task.task_desc as description,
                task.e_date as due
            FROM task INNER JOIN profile
                ON task.responsible = profile.id
            WHERE task.proj = %s AND task.completed = %s

            UNION

            SELECT milestone.id, milestone.title as name, 'milestone' as type,
                profile.first_name as author, 'PFP' as pfp, milestone.mile_desc as shortDesc,
                milestone.s_date as due
            FROM milestone INNER JOIN profile
                ON milestone.responsible = profile.id
            WHERE milestone.proj = %s AND milestone.completed = %s

            ORDER BY due;
            """,
            (projid,completed,projid,completed),
        )
        tasks = db_cursor.fetchall()
        
    db_conn.commit()
    return jsonify(tasks)


# Gets the information for the task box
@pages_blueprint.route("/api/get-task-info-box", methods=["GET"])
def get_task_info_box():
    taskid = request.args.get('id', '')

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT task.id AS id,
                task.title AS name,
                'task' AS type,
                profile.first_name || ' ' || profile.last_name AS author,
                'PFP' as pfp,
                task.task_desc AS description,
                task.s_date AS s_date,
                task.e_date AS e_date,
                array[]::varchar[] AS subtasks,
                task.completed AS completed,
                profile.id AS author_id

            FROM task INNER JOIN profile
                ON (task.responsible = profile.id)

            WHERE task.id=%s;
            """,
            (taskid,),
        )
        task_info_results = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(task_info_results)


# Gets the information for the task box if the type is milestone
@pages_blueprint.route("/api/get-milestone-info-box", methods=["GET"])
def get_milestone_info_box():
    milestoneid = request.args.get('id', '')

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT milestone.id AS id,
                milestone.title AS name,
                'milestone' AS type,
                profile.first_name || ' ' || profile.last_name AS author,
                'PFP' as pfp,
                milestone.mile_desc AS description,
                milestone.s_date AS s_date,
                array[]::varchar[] AS subtasks,
                milestone.completed AS completed,
                profile.id AS author_id

            FROM milestone INNER JOIN profile
                ON (milestone.responsible = profile.id)

            WHERE milestone.id=%s;
            """,
            (milestoneid,),
        )
        milestone_info_results = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(milestone_info_results)


# Gets the list of subtasks
@pages_blueprint.route("/api/get-subtasks-for-task", methods=["GET"])
def get_subtasks_for_task():
    taskid = request.args.get('id', '')

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT subtask.id AS id,
                subtask.title AS name,
                subtask.completed AS completed
            FROM subtask
            WHERE subtask.parent_task=%s;
            """,
            (taskid,),
        )
        task_subtasks_results = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(task_subtasks_results)


# Creates a new subtask given a title and user id
@pages_blueprint.route("/api/add-new-subtask", methods=["POST"])
def add_new_subtask():
    data = request.get_json()

    try:
        taskid = data["params"]["taskid"]
        title = data["params"]["title"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        db_cursor.execute(
            """
            INSERT INTO subtask (parent_task, title, completed)
            VALUES (%s, %s, false)
            RETURNING id;
            """,
            (taskid, title),
        )
        subtask_id = db_cursor.fetchone()["id"]

    db_conn.commit()
    return jsonify({"id": subtask_id})


# Changes a task or milestone to completed and vice versa
@pages_blueprint.route("/api/toggle-completion-of-task", methods=["POST"])
def toggle_completion_of_task():
    data = request.get_json()

    try:
        taskid = data["params"]["taskid"]
        type = data["params"]["type"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        if type == "task":
            db_cursor.execute(
                """
                UPDATE task
                SET completed = NOT completed,
                completed_date = CURRENT_DATE
                WHERE task.id = %s;
                """,
                (taskid,),
            )

        elif type == "milestone":
            db_cursor.execute(
                """
                UPDATE milestone
                SET completed = NOT completed,
                completed_date = CURRENT_DATE
                WHERE milestone.id = %s;
                """,
                (taskid,),
            )

    db_conn.commit()
    return jsonify({"msg": "success"})


# Update timeline for project, task and milestone
@pages_blueprint.route("/api/update-timeline", methods=["PUT"])
def update_timeline_from_planner():
    data = request.get_json()
    response = {}

    try:
        type = data["params"]["type"]
        id = data["params"]["id"]
        s_date = data["params"]["s_date"]
        e_date = data["params"]["e_date"]
    except KeyError as e:
        response["message"] = f"Missing field in request - {e}"
        response["status_code"] = 400
        return response, 400

    params = {'id': id ,'s_date': s_date, 'e_date': e_date}

    if type == "project":
        query_string = """
            UPDATE project SET s_date = %(s_date)s, e_date = %(e_date)s,
            last_modified = CURRENT_DATE
            WHERE id = %(id)s;
        """
    elif type == "task":
        query_string = """
            UPDATE task SET s_date = %(s_date)s, e_date = %(e_date)s
            WHERE id = %(id)s;
        """
    elif type == "milestone":
        query_string = """
            UPDATE milestone SET s_date = %(s_date)s
            WHERE id = %(id)s;
        """
    else:
        response["message"] = f"Invalid type value - {type}"
        response["status_code"] = 400
        return response, 400

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        try: 
            db_cursor.execute(
                query_string, params,
            )
        except BaseException as e:
            response['message'] = f"Error while updating {type} - {e}"
            response["status_code"] = 400
            return response, 400
    db_conn.commit()

    response['message'] = f"Timeline for {type} Id - {id} Updated Successfully"
    response["status_code"] = 200
    return response, 200