import psycopg2
from flask import jsonify, request

from ..core import db_conn
from . import proj_blueprint

@proj_blueprint.route("/api/new-milestone", methods=["POST"])
def new_milestone():
    """
    Creates a new milestone

    Receives user id, project id, title and description in the request payload.
    """
    data = request.get_json()
    try:
        title = data["data"]["title"]
        description = data["data"]["description"]
        s_date = data["data"]["s_date"]
        responsible = data["data"]["responsible"]
        projid = data["projid"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        # Create milestone
        db_cursor.execute(
            """
            INSERT INTO milestone (proj, title, mile_desc, s_date, responsible, completed)
            VALUES (%s, %s, %s, %s, %s, false)
            """,
            (projid, title, description, s_date, responsible),
        )
    db_conn.commit()

    return jsonify({"msg": "success"})


@proj_blueprint.route("/api/edit-milestone", methods=["PUT"])
def edit_milestone():
    """
    Updates Milestone Details
    """
    data = request.get_json()
    response = {}

    try:
        id = data["id"]
        params = data["data"]
    except KeyError as e:
        response['message'] = f"Missing field in request - {e}"
        response["status_code"] = 400
        return response, 400
    
    if not params.keys():
        response['message'] = "No fields for update in milestone"
        response["status_code"] = 400
        return response, 400
    
    update_fields = ', '.join(['{} = %({})s'.format(key, key) for key in params])

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = f"""
            UPDATE milestone SET {update_fields} WHERE id = %(id)s;
        """
        params['id'] = id

        try:
            db_cursor.execute(
                query_string,
                params,
            )
        except BaseException as e:
            response['message'] = f"Error while updating milestone - {e}"
            response["status_code"] = 400
            return response, 400
    db_conn.commit()

    response['message'] = "Milestone Updated Successfully"
    response["status_code"] = 200
    return response, 200


@proj_blueprint.route("/api/delete-milestone", methods=["DELETE"])
def delete_milestone():
    """
    Delete Milestone
    """
    data = request.get_json()
    response = {}
    try:
        id = data["id"]
    except KeyError as e:
        response['message'] = f"Missing field in request - {e}"
        response["status_code"] = 400
        return response, 400
    
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = """
            DELETE FROM milestone WHERE id = %(id)s;
        """
        params = { "id": id}

        try:
            db_cursor.execute(
                query_string,
                params,
            )
        except BaseException as e:
            response['message'] = f"Error while deleting milestone - {e}"
            response["status_code"] = 400
            return response, 400
    db_conn.commit()

    response['message'] = "Milestone Deleted Successfully"
    response["status_code"] = 200
    return response, 200