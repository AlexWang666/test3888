import psycopg2
from flask import jsonify, request
from flask_jwt_extended import jwt_required

from ..core import db_conn
from . import pages_blueprint


@pages_blueprint.route("/api/get-all-projects", methods=["GET"])
# @jwt_required()
def get_all_projects():
    # Gets all the projects in the db for display on the marketplace
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT project.id, project.title as name, 'project' as type,
            profile.id as author_id,
            CONCAT(profile.first_name,' ',profile.last_name) as author,
            'PFP' as pfp, 0 as budget,
            '' as image, project.proj_desc as shortdesc

            FROM (project INNER JOIN people_to_project
                ON (project.id = people_to_project.project_id))
            INNER JOIN profile
                ON (people_to_project.user_id=profile.id)

            WHERE people_to_project.user_role='O'
            AND project.private = false;
            """,
            (),
        )
        projects = db_cursor.fetchall()
    db_conn.commit()

    return jsonify(projects)


@pages_blueprint.route("/api/get-project-basic-info", methods=["GET"])
def get_project_basic_info():
    # Gets the project name, author and date for the description page
    data = request.args

    try:
        projid = data["projid"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT project.title as name,
            profile.id as author_id,
            CONCAT(profile.first_name,' ',profile.last_name) as author,
            project.s_date as date

            FROM (project INNER JOIN people_to_project
                ON (project.id = people_to_project.project_id))
            INNER JOIN profile
                ON (people_to_project.user_id = profile.id)

            WHERE project.id=%s
            """,
            (projid,),
        )
        project_details = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(project_details)


@pages_blueprint.route("/api/get-project-details", methods=["GET"])
def get_project_details():
    # Gets the remaining project details for the description box
    data = request.args

    try:
        projid = data["projid"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT 0 as funded, 0 as budget,
            project.proj_desc as shortDesc, project.proj_long_desc as longDesc
            FROM project
            WHERE project.id=%s
            """,
            (projid),
        )
        project_details = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(project_details)


@pages_blueprint.route("/api/get-num-team-members", methods=["GET"])
def get_num_team_members():
    # Gets the number of team members for display
    data = request.args

    try:
        projid = data["projid"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT COUNT(*) AS num
            FROM (project INNER JOIN people_to_project
                ON (project.id = people_to_project.project_id))
            WHERE project.id=%s
            """,
            (projid),
        )
        num_people = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(num_people)
