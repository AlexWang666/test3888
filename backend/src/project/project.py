import psycopg2
from flask import jsonify, request
from flask_jwt_extended import jwt_required

from ..core import db_conn
from . import proj_blueprint


@proj_blueprint.route("/api/new-project", methods=["POST"])
def new_project():
    """
    Creates a new project.

    Receives user id, project id, title, description and dates in the request payload.

    :return: The return status of this function
    :rtype: dict
    """
    data = request.get_json()

    try:
        uid = data["uid"]
        title = data["data"]["title"]
        private = data["data"]["private"]
        description = data["data"]["description"]
        long_description = data["data"]["long_description"]
        start = data["data"]["s_date"]
        end = data["data"]["e_date"]
        parent = data["parent"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        # Create project
        db_cursor.execute(
            """
            INSERT INTO project (title, proj_desc, proj_long_desc, parent, s_date,
            e_date, private, completed, completed_date, last_modified)
            VALUES (%s, %s, %s, %s, %s, %s, %s, false, NULL, CURRENT_DATE)
            RETURNING id;""",
            (title, description, long_description, parent, start, end, private),
        )
        project = db_cursor.fetchone()["id"]

        # link project to user
        db_cursor.execute(
            """insert into people_to_project (user_id, project_id, user_role, status)
            values(%s, %s, %s, %s)""",
            (uid, project, "O", "accepted"),
        )

    db_conn.commit()

    return jsonify({"msg": "success"})

# Gets all the active projects within a project
@proj_blueprint.route("/api/get-projects", methods=["GET"])
def get_projects():
    uid = request.args.get("uid", "")
    parent = request.args.get("parent", "")

    # There is no parent
    if parent == "":
        parent = -1

    projects = []
    response = {}

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT project.id AS id, project.title as name, 0.00 as completion,
                'No milestones' as current_milestone, project.private AS private, 
                project.last_modified AS last_modified, people_to_project.status
            FROM project INNER JOIN people_to_project
                ON project.id = people_to_project.project_id
            WHERE people_to_project.user_id = %s AND project.parent = %s
                AND project.completed=FALSE AND people_to_project.status='accepted';
            """,
            (uid, parent),
        )

        for proj in db_cursor:
            with db_conn.cursor(
                cursor_factory=psycopg2.extras.RealDictCursor
            ) as db_cursor_2:
                # Completion information
                db_cursor_2.execute(
                    """
                    SELECT COUNT(*) AS totaltasks,
                    COALESCE(
                        SUM(CASE WHEN task.completed=true
                        THEN 1 ELSE 0 END), 0) AS completed

                    FROM project INNER JOIN people_to_project
                    ON project.id = people_to_project.project_id
                    INNER JOIN task
                    ON project.id = task.proj

                    WHERE people_to_project.user_id = %s
                    AND project.parent = %s
                    AND task.proj = %s

                    UNION

                    SELECT COUNT(*) AS totaltasks,
                    COALESCE(
                        SUM(CASE WHEN milestone.completed=true
                        THEN 1 ELSE 0 END), 0) AS completed

                    FROM project INNER JOIN people_to_project
                    ON project.id = people_to_project.project_id
                    INNER JOIN milestone
                    ON project.id = milestone.proj

                    WHERE people_to_project.user_id=%s AND project.parent=%s
                    AND milestone.proj=%s;
                    """,
                    (uid, parent, proj["id"], uid, parent, proj["id"]),
                )
                task = db_cursor_2.fetchone()
                milestone = db_cursor_2.fetchone()

                if task != None and milestone != None:
                    completion = task["completed"] + milestone["completed"]
                    total = task["totaltasks"] + milestone["totaltasks"]

                elif milestone != None and task == None:
                    completion = milestone["completed"]
                    total = milestone["totaltasks"]

                elif task != None and milestone == None:
                    completion = task["completed"]
                    total = task["totaltasks"]

                if total != 0:
                    proj["completion"] = completion / total

                # Current milestone
                db_cursor_2.execute(
                    """
                    SELECT milestone.title

                    FROM project INNER JOIN people_to_project
                    ON project.id = people_to_project.project_id
                    INNER JOIN milestone
                    ON milestone.proj = project.id

                    WHERE
                    milestone.s_date>CURRENT_DATE-1 AND milestone.completed=false
                    AND people_to_project.user_id=%s
                    AND milestone.proj=%s
                    AND project.parent = %s

                    ORDER BY milestone.s_date
                    LIMIT 1;
                    """,
                    (uid, proj["id"], parent),
                )
                milestone = db_cursor_2.fetchone()

                if milestone != None:
                    proj["current_milestone"] = milestone["title"]

                if proj not in projects:
                    projects.append(proj)

    db_conn.commit()
    response['message'] = "Projects Fetched Successfully"
    response['data'] = projects
    response["status_code"] = 200
    return response, 200

# Gets all the active projects within a project
@proj_blueprint.route("/api/get-completed-projects", methods=["GET"])
def get_completed_projects():
    uid = request.args.get("uid", "")
    parent = request.args.get("parent", "")
    response = {}
    # There is no parent
    if parent == "":
        parent = -1

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT project.id AS id, project.title AS name,
                project.private AS private, project.completed_date AS completedate
            FROM project INNER JOIN people_to_project
                ON project.id = people_to_project.project_id
            WHERE people_to_project.user_id = %s AND project.parent = %s
                AND project.completed=TRUE;
            """,
            (uid, parent),
        )
        projects = db_cursor.fetchall()

    db_conn.commit()
    response['message'] = "Completed Projects Fetched Successfully"
    response['data'] = projects
    response["status_code"] = 200
    return response, 200

@proj_blueprint.route("/api/get-tasks-in-project")
def get_tasks_in_project():
    projid = request.args.get("projid", "")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        # get all projects related to user
        db_cursor.execute(
            """
            SELECT task.id, task.title as name,
            EXTRACT(DAY FROM task.e_date::timestamp-CURRENT_DATE::timestamp) as dueIn,
            profile.first_name||' '||profile.last_name as assigned, task.task_desc AS description,
            'task' AS type

            FROM task
            INNER JOIN profile
            ON task.responsible = profile.id

            WHERE task.proj = %s AND task.completed = false

            UNION

            SELECT milestone.id, milestone.title as name,
            EXTRACT(DAY FROM milestone.s_date::timestamp-CURRENT_DATE::timestamp) as dueIn,
            profile.first_name||' '||profile.last_name as assigned, milestone.mile_desc AS description,
            'milestone' AS type

            FROM milestone
            INNER JOIN profile
            ON milestone.responsible = profile.id

            WHERE milestone.proj = %s AND milestone.completed = false

            ORDER BY dueIn
            """,
            (projid, projid),
        )
        tasks = db_cursor.fetchall()
    db_conn.commit()

    return jsonify(tasks)


@proj_blueprint.route("/api/get-tasks-and-milestones")
def get_tasks_and_milestones():
    projid = request.args.get("projid", "")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT task.id, task.title as name, 'task' as type,
            profile.first_name as author, 'PFP' as pfp, task.task_desc as description,
            task.e_date as due

            FROM task INNER JOIN profile
            ON task.responsible = profile.id

            WHERE task.proj = %s

            UNION

            SELECT milestone.id, milestone.title as name, 'milestone' as type,
            profile.first_name as author, 'PFP' as pfp, milestone.mile_desc as shortDesc,
            milestone.s_date as due

            FROM milestone INNER JOIN profile
            ON milestone.responsible = profile.id

            WHERE milestone.proj = %s

            ORDER BY due""",
            (projid, projid),
        )
        tasks = db_cursor.fetchall()
    db_conn.commit()

    return jsonify(tasks)
