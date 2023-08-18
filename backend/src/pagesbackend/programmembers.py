import psycopg2
from flask import jsonify, request

from ..core import db_conn
from . import pages_blueprint


@pages_blueprint.route("/api/get-project-members-list", methods=["GET"])
def get_project_members_list():
    # Gets the full list of members
    projid = request.args.get('projid', '')
    status = request.args.get('status', '')

    project_members = []
    response = {}
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        if status:
            status = tuple(value.strip().lower() for value in status.split(','))

        # Gets the list of members for a particular project
        query_string = f"""
            SELECT profile.id AS id,
            profile.first_name || ' ' || profile.last_name AS name,
            people_to_project.user_role AS role,
            people_to_project.status AS status,
            array[]::varchar[] AS streams, '{{}}'::jsonb AS organization,
            '' AS pfp
            FROM (profile INNER JOIN people_to_project
            ON (profile.id = people_to_project.user_id))
            INNER JOIN project
            ON (people_to_project.project_id = project.id)
            WHERE project.id=%(projid)s 
            {'AND people_to_project.status IN %(status)s' if status else ''};
        """

        params = {"projid": projid, "status": status}

        db_cursor.execute(
            query_string, params,
        )

        for human in db_cursor:
            with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor_2:

                # Gets the list of active tasks for each user
                query_string = """
                    SELECT task.id AS id, task.title AS name
                    FROM project INNER JOIN task
                    ON (task.proj = project.id)
                    WHERE project.id=%(projid)s AND task.responsible=%(uid)s;
                """
                params = {"projid": projid, "uid": human["id"]}
                
                db_cursor_2.execute(
                    query_string, params,
                )
                tasks = db_cursor_2.fetchall()

            human["streams"] = tasks

            with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor_3:
                # Gets the organization for project member
                query_string = """
                   SELECT org.*
                    FROM profile_info pi JOIN organization org 
                    ON pi.org_id = org.id
                    WHERE pi.user_id=%(uid)s;
                """
                params = {"uid": human["id"]}
                
                db_cursor_3.execute(
                    query_string, params,
                )
                organization = db_cursor_3.fetchone()

            if organization: 
                human["organization"] = organization

            if human not in project_members:
                project_members.append(human)

    db_conn.commit()
    response['message'] = "Project Members Fetched Successfully"
    response["status_code"] = 200
    response['data'] = project_members
    return response, 200


@pages_blueprint.route("/api/invite-member-to-project", methods=["POST"])
def invite_member_to_project():
    # Adds the user with their role to the project

    data = request.get_json()
    response = {}
    try:
        uid = data["params"]["uid"]
        projid = data["params"]["projid"]
        role = data["params"]["role"]
    except KeyError as e:
        response['message'] = f"Missing field in request - {e}"
        response["status_code"] = 400
        return response, 400

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            SELECT * FROM people_to_project pp WHERE
            pp.user_id=%(uid)s AND pp.project_id=%(projid)s;
        """
        params = {"uid": uid, "projid": projid}
        db_cursor.execute(
            query_string, params,
        )
        member = db_cursor.fetchone()

        if member:
            response['message'] = "Member has already been part of this project."
            response["status_code"] = 400
            return response, 200

        try:
            query_string = """
                INSERT INTO people_to_project (user_id, project_id, user_role, status)
                VALUES (%(uid)s, %(projid)s, %(role)s, %(status)s);
            """
            params = {"uid": uid, "projid": projid, "role": role, "status": "invited"}
            db_cursor.execute(
                query_string, params,
            )

            db_conn.commit()
        except:
            response['message'] = "Error in inviting Member"
            response["status_code"] = 400
            return response, 400

    response['message'] = "Member Invited Successfully"
    response["status_code"] = 200
    return response, 200


# Checks if the current user is in the program or project
@pages_blueprint.route("/api/check-user-and-role", methods=["GET"])
def check_user_and_role():
    data = request.args

    try:
        uid = data["uid"]
        pid = data["pid"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT people_to_project.user_role
            FROM people_to_project
            WHERE people_to_project.user_id = %s
                AND people_to_project.project_id = %s;
            """,
            (uid, pid,),
        )
        res = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(res)


@pages_blueprint.route("/api/update-invite-member-to-project", methods=["PUT"])
def update_invite_member_to_project():
    # Update user status to project

    data = request.get_json()
    response = {}
    try:
        uid = data["params"]["uid"]
        projid = data["params"]["projid"]
        status = data["params"]["status"]
    except KeyError as e:
        response['message'] = f"Missing field in request - {e}"
        response["status_code"] = 400
        return response, 400

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        try:
            query_string = """
                UPDATE people_to_project SET status = %(status)s
                WHERE user_id = %(uid)s and project_id=%(projid)s;
            """
            params = {"status": status, "uid": uid ,"projid": projid}
            db_cursor.execute(
                query_string, params,
            )
            db_conn.commit()
        except:
            response['message'] = f"Error in update member status - {status}"
            response["status_code"] = 400
            return response, 400

    response['message'] = f"Member {status} Successfully"
    response["status_code"] = 200
    return response, 200


@pages_blueprint.route("/api/get-project-invitations", methods=["GET"])
def get_project_invitations():
    # Fetch project invitation for current user

    uid = request.args.get('uid', '')
    response = {}
    invitations = []

    if not uid:
        response['message'] = "Missing field in Args - uid"
        response["status_code"] = 400
        return response, 400
    
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            SELECT pp1.project_id AS project_id, project.title AS project_name, 
            pp1.user_role AS role, profile.first_name||' '||profile.last_name AS owner_name,
            pp1.user_id AS user_id
            FROM people_to_project pp1 
            JOIN  people_to_project pp2 ON pp1.project_id = pp2.project_id
            JOIN project ON pp1.project_id = project.id
            JOIN profile ON profile.id = pp2.user_id 
            WHERE pp1.user_id=%(uid)s AND pp1.status = 'invited' AND pp2.user_role='O';
        """
        params = {"uid": uid}
        db_cursor.execute(
            query_string, params,
        )
        invitations = db_cursor.fetchall()
    response['message'] = "Project Invitation Fetched Successfully"
    response["status_code"] = 200
    response["data"] = invitations
    return response, 200