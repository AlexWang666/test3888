import psycopg2
from flask import jsonify, request

from ..core import db_conn
from . import pages_blueprint

from datetime import date, timedelta

@pages_blueprint.route("/api/get-project-list-planner", methods=["GET"])
def get_project_list_planner():
    projid = request.args.get('projid', '')

    projects = []
    response = {}
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            SELECT p1.id AS id, p1.title AS name, 'project' AS type,
            p1.s_date AS startdate, p1.e_date AS enddate, 'PFP' AS pfp,
            '' AS tasksmilestones
            FROM project p1 LEFT OUTER JOIN project p2
            ON p1.parent = p2.id
            WHERE p1.parent = %(projid)s OR p1.id = %(projid)s
            ORDER BY p1.parent;
        """
        params = {"projid" : projid}

        db_cursor.execute(
            query_string, params,
        )

        for proj in db_cursor:
            with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor_2:
                # Gets tasks and milestones for each project
                task_milestone_query_string = """
                    SELECT id, task.title AS name, 'task' AS type,
                    s_date AS startdate, e_date AS enddate,
                    createdAt FROM task WHERE task.proj = %(proj_id)s
                    UNION
                    SELECT id, milestone.title AS name, 'milestone' AS type,
                    s_date AS startdate, s_date AS enddate,
                    createdAt FROM milestone WHERE milestone.proj = %(proj_id)s
                    ORDER BY createdAt ASC;
                """
                task_milestone_params = {"proj_id" : proj["id"]}
                
                db_cursor_2.execute(
                    task_milestone_query_string, task_milestone_params,
                )
                taskmilestones = db_cursor_2.fetchall()
                proj["tasksmilestones"] = taskmilestones
                projects.append(proj)

    db_conn.commit()
    response['message'] = "Project Planner List Fetched Successfully"
    response["status_code"] = 200
    response['data'] = projects
    return response, 200

# Gets the date range of the entire project for creating the Gantt chart
@pages_blueprint.route("/api/get-project-date-range", methods=["GET"])
def get_project_date_range():
    projid = request.args.get('projid', '')

    date_range = []
    dates = []
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT MIN(p1.s_date) AS startdate, MAX(p1.e_date) AS enddate

            FROM project p1 LEFT OUTER JOIN project p2
            ON p1.parent = p2.id

            WHERE p1.parent = %s OR p1.id = %s;
            """,
            (projid, projid),
        )
        date_range = db_cursor.fetchall()

    start = date_range[0]["startdate"]
    end = date_range[0]["enddate"]

    if start != None and end != None:
        count = (end-start).days + 1
        for date in (start + timedelta(n) for n in range(count)):
            dates.append(date)

    db_conn.commit()
    return jsonify(dates)



@pages_blueprint.route("/api/get-planner-items", methods=["GET"])
def get_planner_items():
    projid = request.args.get('projid', '')

    items = []
    response = {}
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            SELECT p1.id AS id, p1.title AS name, 'project' AS type,
            p1.s_date AS startdate, p1.e_date AS enddate
            FROM project p1 LEFT OUTER JOIN project p2
                ON p1.parent = p2.id
            WHERE p1.parent = %(projid)s OR p1.id = %(projid)s
            ORDER BY p1.parent;
        """
        params = {"projid" : projid}

        db_cursor.execute(
            query_string, params,
        )

        for proj in db_cursor:
            items.append(proj)

            with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor_2:
                # Gets tasks and milestones for each project
                task_milestone_query_string = """
                    SELECT id, title AS name, 'task' AS type,
                    s_date AS startdate, e_date AS enddate, createdat
                    FROM task WHERE task.proj = %(proj_id)s
                    UNION
                    SELECT id, title AS name, 'milestone' AS type,
                    s_date AS startdate, s_date AS enddate, createdat
                    FROM milestone WHERE milestone.proj = %(proj_id)s
                    ORDER BY createdat ASC;
                """
                task_milestone_params = {"proj_id" : proj["id"]}

                db_cursor_2.execute(
                    task_milestone_query_string, task_milestone_params,
                )

                taskmilestones = db_cursor_2.fetchall()
                items.extend(taskmilestones)

    db_conn.commit()
    response['message'] = "Planner Items Fetched Successfully"
    response["status_code"] = 200
    response['data'] = items
    return response, 200
