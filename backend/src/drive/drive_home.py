from typing import Dict, List, Text, Union
import json
import psycopg2

# flake8: noqa
from flask import Blueprint, jsonify, request, Response
from flask_jwt_extended import jwt_required

from ..core import db_conn, s3, config

drive_blueprint = Blueprint("drive_blueprint", __name__)

# Helpers
# -----------------------------------------------------------------------------
class IncorrectUrlParameterError(Exception):
    pass


def _get_folder_items(is_home: bool, userid: int, parent_uuid: Union[Text, None]) -> List[Dict]:
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        if is_home:
            if parent_uuid:
                query = """
                    SELECT * FROM drive_item
                    WHERE parent_uuid
                """
                query += " = %s"
                db_cursor.execute(
                    query,
                    (parent_uuid,),
                )
            else:
                query = """
                    SELECT * FROM drive_item
                    WHERE owner_id = %s AND parent_uuid
                """
                query += " is %s"

                db_cursor.execute(
                    query,
                    (userid, parent_uuid),
                )
        else:
            if parent_uuid:
                query = """
                    SELECT * FROM drive_item
                    JOIN people_to_drive_item on uuid = drive_item_id
                    WHERE user_id=%s AND parent_uuid = %s
                """
                db_cursor.execute(
                    query,
                    (
                        userid,
                        parent_uuid,
                    ),
                )
            else:
                query = """
                    SELECT * FROM drive_item
                    JOIN people_to_drive_item on uuid = drive_item_id
                    WHERE user_id = %s AND owner_id <> %s
                """

                db_cursor.execute(
                    query,
                    (userid, userid),
                )

        # Should we perform validations on the cursor?
        return db_cursor.fetchall()


def _get_folder_info(parent_uuid: Union[Text, None]) -> Dict:
    if not parent_uuid:
        return {}

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
                SELECT * FROM drive_item WHERE uuid = %s LIMIT 1;
            """,
            (parent_uuid,),
        )

        # Should we perform more validations on the cursor?
        return db_cursor.fetchone()


# -----------------------------------------------------------------------------


@drive_blueprint.route("/api/get-profile-by-email", methods=["GET"])
def get_profile():
    try:
        email = request.args["email"]
    except KeyError as e:
        raise KeyError(e)
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
                SELECT *
                FROM profile 
                WHERE email = %s;
            """,
            (email,),
        )
        result = db_cursor.fetchone()
        return {"profile": result}


@drive_blueprint.route("/api/get-drive-items-in-folder", methods=["GET"])
def get_drive_items_in_folder():
    try:
        userid = request.args["userid"]
        is_home = request.args["is_home"]
        parent_uuid = request.args["parent_uuid"]
        if not parent_uuid:
            parent_uuid = None
    except KeyError as e:
        raise KeyError(e)

    try:
        userid = int(userid)
    except ValueError as e:
        raise (e)

    # Is there a way to avoid doing this?
    if is_home == "true":
        is_home = True
    elif is_home == "false":
        is_home = False
    else:
        # Uh oh
        raise IncorrectUrlParameterError(is_home)

    folder_items = _get_folder_items(is_home, userid, parent_uuid)
    folder_info = _get_folder_info(parent_uuid)
    return {"folder_items": folder_items, "folder_info": folder_info}, 200


@drive_blueprint.route("/api/create-drive-item", methods=["POST"])
def create_drive_item():
    data = request.get_json()
    response = {}
    try:
        uuid = data["params"]["uuid"]
        item_type = data["params"]["item_type"]
        name = data["params"]["name"]
        userid = data["params"]["userid"]
        parent_owner_id = data["params"]["parent_owner_id"]
        contents = data["params"]["contents"]
        parent_uuid = data["params"]["parent_uuid"]
        is_home = data["params"]["is_home"]
        is_file_url = data["params"]["is_file_url"]
        if not parent_uuid:
            parent_uuid = None
    except KeyError as e:
        response['message'] = f"Missing field in request - {e}"
        response["status_code"] = 400
        return response, 400

    # Is there a way to avoid doing this?
    if is_home == "true":
        is_home = True
    elif is_home == "false":
        is_home = False

    print(is_home)
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        db_cursor.execute(
            """
                INSERT INTO drive_item (uuid, item_type, name, owner_id, contents, parent_uuid, is_file_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (uuid, item_type, name, userid, contents, parent_uuid,is_file_url),
        )
        db_cursor.execute(
            """
                INSERT INTO people_to_drive_item (user_id, drive_item_id, user_role)
                VALUES (%s, %s, 'Owner')
            """,
            (
                userid,
                uuid,
            ),
        )
        if not is_home and parent_owner_id != userid:
            db_cursor.execute(
                """
                    INSERT INTO people_to_drive_item (user_id, drive_item_id, user_role)
                    VALUES (%s, %s, 'Viewer')
                """,
                (
                    parent_owner_id,
                    uuid,
                ),
            )

        db_conn.commit()

        response['message'] = "The document was successfully created"
        response["status_code"] = 201
        return response, 201


@drive_blueprint.route("/api/rename-drive-item", methods=["PUT"])
def rename_drive_item():
    data = request.get_json()

    try:
        uuid = data["uuid"]
        new_name = data["new_name"]
    except KeyError as e:
        raise KeyError(e)

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
                UPDATE drive_item
                SET name = %s
                WHERE uuid = %s;
            """,
            (new_name, uuid),
        )

        return "The drive item's name was updated sucessfully", 200


@drive_blueprint.route("/api/delete-drive-item", methods=["POST"])
def delete_drive_item():
    data = request.get_json()

    try:
        uuid = data["uuid"]
    except KeyError as e:
        raise KeyError(e)

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
                WITH RECURSIVE uuids_to_delete (uuid) AS (
                    SELECT uuid
                    FROM drive_item
                    WHERE uuid = %s

                    UNION ALL

                    SELECT D.uuid
                    FROM uuids_to_delete U
                    JOIN drive_item D on U.uuid = D.parent_uuid
                )
                DELETE FROM people_to_drive_item
                WHERE drive_item_id IN (SELECT uuid AS drive_item_id FROM uuids_to_delete);
            """,
            (uuid,),
        )
        db_cursor.execute(
            """
                WITH RECURSIVE uuids_to_delete (uuid) AS (
                    SELECT uuid
                    FROM drive_item
                    WHERE uuid = %s

                    UNION ALL

                    SELECT D.uuid
                    FROM uuids_to_delete U
                    JOIN drive_item D on U.uuid = D.parent_uuid
                )
                DELETE FROM drive_item
                WHERE uuid in (SELECT uuid FROM uuids_to_delete);
            """,
            (uuid,),
        )

        return "The drive item was successfully deleted", 200


@drive_blueprint.route("/api/move-drive-item", methods=["PUT"])
def move_drive_item():
    data = request.get_json()

    try:
        drive_item_uuid = data["drive_item_uuid"]
        new_parent_uuid = data["new_parent_uuid"]
    except KeyError as e:
        raise KeyError(e)

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            UPDATE drive_item
            SET parent_uuid = %s
            WHERE uuid = %s;
        """,
            (new_parent_uuid, drive_item_uuid),
        )

        return "The drive item was successfully moved", 200


@drive_blueprint.route("/api/get-document-data", methods=["GET"])
def get_document_data():
    uuid = request.args["uuid"]
    result = None

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
                SELECT * FROM drive_item 
                WHERE drive_item.uuid = %s
                LIMIT 1;
            """,
            (uuid,),
        )
        result = db_cursor.fetchone()
    if result:
        return result, 200
    else:
        return "The document doesn't exist", 400


@drive_blueprint.route("/api/save-document", methods=["POST"])
def save_document():
    # TODO: Check if document exists, otherwise send a response indicating this
    # to the frontend
    data = request.get_json()

    try:
        uuid = data["params"]["uuid"]
        contents = data["params"]["contents"]
        doc_name = data["params"]["name"]
    except KeyError as e:
        raise KeyError(e)

    if not doc_name and not contents:
        return "The document wasn't saved as it doesn't have any content.", 400

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
                UPDATE drive_item set name=%s, contents=%s
                WHERE uuid=%s
            """,
            (
                doc_name,
                contents,
                uuid,
            ),
        )
        db_conn.commit()

    return "The document was successfully saved", 201

# Upload file to s3 bucket
def upload_file_to_s3(file):
    try:
        s3.upload_fileobj(
            file,
            config['s3']['AWS_BUCKET_NAME'],            
            file.filename,
            ExtraArgs={
                "ContentType": file.content_type
            }
        )

    except Exception as e:
        # Handle error while upload to s3
        print("Something Happened: ", e)
        return e, 400
    

    # after upload file to s3 bucket, return filename of the uploaded file
    return file.filename, 200

# Validate allowed extension for upload file
def allowed_file(filename):
    ALLOWED_EXTENSIONS = ['txt', 'doc', 'docx']
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@drive_blueprint.route("/api/upload", methods=["POST"])
def upload():
    response = {'message':''}
    files = request.files
    try:
        file = files['file_data']
    except KeyError as e:
        response['message'] = f"Missing field in form data - {e}"
        response["status_code"] = 400
        return response, 400

    file = request.files['file_data']
    if file.filename == '':
        response['message'] = "No file exists"
        response["status_code"] = 400
        return response, 400

    if file and allowed_file(file.filename):
        output, output_code = upload_file_to_s3(file) 
        if output and output_code == 200:
            response['message'] = "File uploaded Successfully"
            response["status_code"] = 200
            response['data'] = output
            return response, 200
        else:
            response['message'] = "Error While Uploading File to s3"
            response["status_code"] = 400
            return response, 400
    # if file extension not allowed
    else:
        response['message'] = "File type is not valid"
        response["status_code"] = 400
        return response, 400