import psycopg2
from flask import jsonify, request

from ..core import db_conn
from . import proj_blueprint

@proj_blueprint.route("/api/new-task", methods=["POST"])
def new_task():
    """
    Creates a new task

    Receives user id, project id, title and description in the request payload.
    """
    data = request.get_json()
    try:
        title = data["data"]["title"]
        description = data["data"]["description"]
        start = data["data"]["s_date"]
        end = data["data"]["e_date"]
        responsible = data["data"]["responsible"]
        projid = data["projid"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            INSERT INTO task (proj, title, task_desc, s_date, e_date, responsible, completed)
            VALUES (%s, %s, %s, %s, %s, %s, false)""",
            (projid, title, description, start, end, responsible),
        )
    db_conn.commit()

    return jsonify({"msg": "success"})

@proj_blueprint.route("/api/new-subtask", methods=["POST"])
def new_subtask():
    """
    Creates a new subtask

    Receives user id, task id, title and description in the request payload.
    """
    data = request.get_json()
    try:
        uid = data["uid"]
        title = data["data"]["title"]
        description = data["data"]["description"]
        taskid = data["taskid"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        # Create subtask
        db_cursor.execute(
            "insert into subtask (parent_task, title, sub_task_desc, responsible) values(%s, %s, %s, %s)",
            (taskid, title, description, uid),
        )
    db_conn.commit()

    return jsonify({"msg": "success"})


@proj_blueprint.route("/api/edit-task", methods=["PUT"])
def edit_task():
    """
    Updates Task Details
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
        response['message'] = "No fields for update in task"
        response["status_code"] = 400
        return response, 400

    update_fields = ', '.join(['{} = %({})s'.format(key, key) for key in params])

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        query_string = f"""
            UPDATE task SET {update_fields} WHERE id = %(id)s;
        """
        params['id'] = id

        try:
            db_cursor.execute(
                query_string,
                params,
            )
        except BaseException as e:
            response['message'] = f"Error while updating task - {e}"
            response["status_code"] = 400
            return response, 400
    db_conn.commit()

    response['message'] = "Task Updated Successfully"
    response["status_code"] = 200
    return response, 200

@proj_blueprint.route("/api/delete-task", methods=["DELETE"])
def delete_task():
    """
    Delete Task
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
            DELETE FROM task WHERE id = %(id)s;
        """
        params = { "id": id}

        try:
            db_cursor.execute(
                query_string,
                params,
            )
        except BaseException as e:
            response['message'] = f"Error while deleting task - {e}"
            response["status_code"] = 400
            return response, 400
    db_conn.commit()

    response['message'] = "Task Deleted Successfully"
    response["status_code"] = 200
    return response, 200