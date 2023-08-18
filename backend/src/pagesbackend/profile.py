import psycopg2
from flask import jsonify, request

from ..core import db_conn
from . import pages_blueprint


@pages_blueprint.route("/api/get-current-user-info", methods=["GET"])
def get_current_user_info():
    # Gets the user profile fields for display given an id

    userid = request.args.get('uid', '')
    response = {}
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        # Retrieves their profile info
        db_cursor.execute(

            """
            SELECT pi.bio as bio, pi.education as education, pi.link as link,
            org.id as org_id, org.name as org_name 
            FROM profile_info pi LEFT JOIN organization org 
            ON pi.org_id = org.id 
            WHERE pi.user_id=%s;
            """,

            (userid,),
        )
        profile_information = db_cursor.fetchall()

    db_conn.commit()
    response['message'] = "Profile Info Fetched Successfully"
    response["status_code"] = 200
    response['data'] = profile_information
    return response, 200


@pages_blueprint.route("/api/get-user-name", methods=["GET"])
def get_user_name():
    # Gets the user profile fields for display given an id

    userid = request.args.get('uid', '')
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        # Retrieves their profile info
        db_cursor.execute(

            """
            SELECT profile.first_name AS firstname, profile.last_name AS lastname

            FROM profile

            WHERE profile.id=%s;
            """,

            (userid,),
        )
        profile_information = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(profile_information)


@pages_blueprint.route("/api/add-current-user-profile-info", methods=["POST"])
def add_current_user_profile_info():
    # Updates the user's profile given the current user id

    data = request.get_json()
    response = {}
    try:
        uid = data["params"]["uid"]
        bio = data["params"]["profileInfo"]["bio"]
        education = data["params"]["profileInfo"]["education"]
        link = data["params"]["profileInfo"]["link"]
        org_id = data["params"]["profileInfo"]["org_id"] if data["params"]["profileInfo"]["org_id"] else None
    except KeyError as e:
        response['message'] = f"Missing field in request - {e}"
        response["status_code"] = 400
        return response, 400
    
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        db_cursor.execute(
            """
            UPDATE profile_info
            SET bio = %s, education = %s, link = %s, org_id = %s
            WHERE user_id = %s
            """,
            (bio, education, link, org_id, uid,),
        )

        db_conn.commit()

    response['message'] = "Profile Info Updated Successfully"
    response["status_code"] = 200
    return response, 200

# Gets all the public projects related to a user for display on the profile
@pages_blueprint.route("/api/get-public-projects", methods=["GET"])
def get_public_projects():
    uid = request.args.get('uid', '')

    projects = []
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT project.id AS id, project.title as name, 0.00 as completion,
                'No milestones' as status, project.private AS private
            FROM project INNER JOIN people_to_project
                ON project.id = people_to_project.project_id
            WHERE people_to_project.user_id = %s AND project.parent = -1
                AND project.private = FALSE;
            """,
            (uid,),
        )

        for proj in db_cursor:
            with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor_2:
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
                    AND project.parent = -1
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

                    WHERE people_to_project.user_id=%s AND project.parent=-1
                    AND milestone.proj=%s;
                    """,
                    (uid, proj["id"], uid, proj["id"]),
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
                    AND project.parent = -1

                    ORDER BY milestone.s_date
                    LIMIT 1;
                    """,
                    (uid, proj["id"],),
                )
                milestone = db_cursor_2.fetchone()

                if milestone != None:
                    proj["status"] = milestone["title"]

                if proj not in projects:
                    projects.append(proj)

    db_conn.commit()
    return jsonify(projects)
