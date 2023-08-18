import psycopg2
from flask import jsonify, request

from ..core import db_conn
from . import pages_blueprint


@pages_blueprint.route("/api/get-project-name", methods=["GET"])
def get_project_name():
    # Gets the project name

    projid = request.args.get('projid', '')
    response = {}
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        # Retrieves the program name based on id
        db_cursor.execute(
            """
            SELECT project.title AS name
            FROM project
            WHERE project.id=%s;
            """,
            (projid,),

        )
        project_name = db_cursor.fetchall()

    db_conn.commit()

    response['message'] = "Project Name Fetched Successfully"
    response["status_code"] = 200
    response['data'] = project_name
    return response, 200


@pages_blueprint.route("/api/get-tasks-remaining", methods=["GET"])
def get_tasks_remaining():
    # Gets the number of tasks left for the dashboard
    projid = request.args.get('projid', '')
    response = {}
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        # Retrieves the program name based on id
        db_cursor.execute(
            """
            SELECT COUNT(*) AS totaltasks,
            COALESCE(
                SUM(CASE WHEN task.completed=true
                THEN 1 ELSE 0 END), 0) AS completed,
            COALESCE(
                SUM(CASE WHEN (task.e_date<CURRENT_DATE AND task.completed=false)
                THEN 1 ELSE 0 END), 0) AS expected
            FROM task
            WHERE task.proj=%s;
            """,
            (projid,),

        )
        tasks_remaining = db_cursor.fetchall()

    db_conn.commit()

    response['message'] = "Remaining Tasks Fetched Successfully"
    response["status_code"] = 200
    response['data'] = tasks_remaining
    return response, 200


@pages_blueprint.route("/api/get-milestone-completion", methods=["GET"])
def get_milestone_completion():
    projid = request.args.get('projid', '')
    response = {}
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        # Retrieves the program name based on id
        db_cursor.execute(
            """
            SELECT COUNT(*) AS totalmilestones,
            COALESCE(
                SUM(CASE WHEN milestone.completed=true
                THEN 1 ELSE 0 END), 0) AS completed,
            COALESCE(
                SUM(CASE WHEN (milestone.s_date<CURRENT_DATE AND milestone.completed=false)
                THEN 1 ELSE 0 END), 0) AS expected
            FROM milestone
            WHERE milestone.proj=%s;
            """,
            (projid,),

        )
        milestones_remaining = db_cursor.fetchall()

    db_conn.commit()

    response['message'] = "Remaining Milestones Fetched Successfully"
    response["status_code"] = 200
    response['data'] = milestones_remaining
    return response, 200


@pages_blueprint.route("/api/get-tasks-and-milestones-completed")
def get_tasks_and_milestones_completed():
    projid = request.args.get('projid', '')

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT task.id, task.title as name, task.task_desc AS description,
            task.completed_date AS completeDate,
            profile.first_name||' '||profile.last_name as assigned,
            'task' AS type

            FROM task
            INNER JOIN profile
            ON task.responsible = profile.id

            WHERE task.proj = %s AND task.completed = true

            UNION

            SELECT milestone.id, milestone.title as name, milestone.mile_desc AS description,
            milestone.completed_date AS completeDate,
            profile.first_name||' '||profile.last_name as assigned,
            'milestone' AS type

            FROM milestone
            INNER JOIN profile
            ON milestone.responsible = profile.id

            WHERE milestone.proj = %s AND milestone.completed = true

            ORDER BY completeDate
            """,
            (projid,projid),
        )
        tasks = db_cursor.fetchall()
    db_conn.commit()

    return jsonify(tasks)


@pages_blueprint.route("/api/get-project-members-widget", methods=["GET"])
def get_project_members_widget():
    projid = request.args.get('projid', '')
    people = []
    response = {}
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        # Retrieves the program name based on id
        db_cursor.execute(
            """
            SELECT profile.id AS id, profile.first_name||' '||profile.last_name AS name,
            people_to_project.user_role AS role, '' AS currenttask

            FROM profile INNER JOIN people_to_project
                ON profile.id = people_to_project.user_id
            INNER JOIN project
                ON people_to_project.project_id = project.id

            WHERE project.id=%s;
            """,
            (projid,),
        )

        for boi in db_cursor:
            with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor_2:

                # Retrieves the program name based on id
                db_cursor_2.execute(
                    """
                    SELECT task.title AS currenttask

                    FROM profile INNER JOIN task
                        ON profile.id = task.responsible

                    WHERE profile.id=%s AND task.completed=false
                    AND task.proj = %s

                    ORDER BY task.e_date
                    LIMIT 1;
                    """,
                    (boi["id"], projid),
                )
                current_task = db_cursor_2.fetchone()
                if current_task != None:
                    boi["currenttask"] = current_task["currenttask"]

            if boi not in people:
                people.append(boi)

    db_conn.commit()

    response['message'] = "Project Members Fetched Successfully"
    response["status_code"] = 200
    response['data'] = people
    return response, 200


@pages_blueprint.route("/api/get-parent-project", methods=["GET"])
def get_parent_project():
    # Gets the project name

    projid = request.args.get('projid', '')
    response = {}
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        # Retrieves the program name based on id
        db_cursor.execute(
            """
            SELECT mum.id AS id, mum.title AS name
            FROM project mum INNER JOIN project child
            ON child.parent = mum.id
            WHERE child.id=%s;
            """,
            (projid,),
        )
        project_name = db_cursor.fetchall()
        
    db_conn.commit()
    response['message'] = "Parent Project Fetched Successfully"
    response["status_code"] = 200
    response['data'] = project_name
    return response, 200


# Changes a program or project to completed and vice versa
@pages_blueprint.route("/api/toggle-completion-of-project", methods=["POST"])
def toggle_completion_of_project():
    data = request.get_json()

    try:
        pid = data["params"]["pid"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            UPDATE project
            SET completed = NOT completed,
            completed_date = CURRENT_DATE,
            last_modified = CURRENT_DATE
            WHERE project.id = %s;
            """,
            (pid,),
        )

    db_conn.commit()
    return jsonify({"msg": "success"})


# Gets the project info such as description, funding, etc.
@pages_blueprint.route("/api/get-project-top-info", methods=["GET"])
def get_project_top_info():
    projid = request.args.get('projid', '')

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT
                project.id AS id, project.proj_desc AS shortdesc,
                project.proj_long_desc AS longdesc, 0 AS funded,
                0 AS budget, project.completed AS completed, 'project' AS type
            FROM project
            WHERE project.id=%s;
            """,
            (projid,),
        )
        project_top_info = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(project_top_info)
