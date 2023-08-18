import psycopg2
from flask import jsonify, request

from ..core import db_conn
from . import pages_blueprint


@pages_blueprint.route("/api/get-program-name", methods=["GET"])
def get_program_name():
    # Gets the program name

    progid = request.args.get('progid', '')
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        # Retrieves the program name based on id
        db_cursor.execute(

            """
            SELECT program.title AS name
            FROM program
            WHERE program.id=%s;
            """,
            (progid),
        )
        program_name = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(program_name)


@pages_blueprint.route("/api/get-program-top-info", methods=["GET"])
def get_program_top_info():
    # Gets the program info such as description, funding, etc.

    progid = request.args.get('progid', '')
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT program.prog_desc AS shortdesc,
            program.prog_long_desc AS longdesc,
            0 AS funded,
            0 AS budget

            FROM program

            WHERE program.id=%s;
            """,
            (progid),
        )
        program_top_info = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(program_top_info)


@pages_blueprint.route("/api/get-program-members", methods=["GET"])
def get_program_members():
    # Gets the list of program members

    progid = request.args.get('progid', '')
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT profile.id AS id,
            people_to_program.user_role AS role,
            '' AS pfp

            FROM (program INNER JOIN people_to_program
            ON (program.id = people_to_program.program_id))
            INNER JOIN profile
            ON (people_to_program.user_id = profile.id)

            WHERE program.id=%s;
            """,
            (progid),
        )
        program_members = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(program_members)


@pages_blueprint.route("/api/get-project-completion", methods=["GET"])
def get_project_completion():
    # Gets the number of tasks left for the dashboard

    projid = request.args.get('projid', '')
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        # Retrieves the program name based on id
        db_cursor.execute(
            """
            SELECT COUNT(*) AS totalproj,
            SUM(CASE WHEN project.completed=true THEN 1 ELSE 0 END) AS completed
            FROM project
            WHERE project.parent=%s;
            """,
            (projid,),

        )
        proj_remaining = db_cursor.fetchall()

    if proj_remaining[0]["totalproj"] == 0:
        proj_remaining[0]["completed"] = 0

    db_conn.commit()
    return jsonify(proj_remaining)
