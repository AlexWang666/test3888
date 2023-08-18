from typing import Dict, List, Text, Union

import psycopg2

# flake8: noqa
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..core import db_conn

drive_sharing_blueprint = Blueprint("drive_sharing_blueprint", __name__)


@drive_sharing_blueprint.route("/api/get-user-role", methods=["GET"])
def get_user_role():
    try:
        userid = request.args["userid"]
        uuid = request.args["uuid"]
    except KeyError as e:
        raise KeyError(e)

    try:
        userid = int(userid)
    except ValueError as e:
        raise ValueError(e)

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
                SELECT *
                FROM drive_item
                LEFT JOIN people_to_drive_item on uuid = drive_item_id
                WHERE uuid = %s AND (user_id = %s OR owner_id = %s);
            """,
            (
                uuid,
                userid,
                userid,
            ),
        )

        result = db_cursor.fetchone()
        return {"user_role": result["user_role"]}


@drive_sharing_blueprint.route("/api/check-drive-item-authorization", methods=["GET"])
def check_drive_item_authorization():
    """
    Check that a user has permission to view a drive item.
    """

    try:
        userid = request.args["userid"]
        uuid = request.args["uuid"]
    except KeyError as e:
        raise KeyError(e)

    try:
        userid = int(userid)
    except ValueError as e:
        raise ValueError(e)

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
                SELECT *
                FROM drive_item
                LEFT JOIN people_to_drive_item on uuid = drive_item_id
                WHERE uuid = %s AND (user_id = %s OR owner_id = %s);
            """,
            (
                uuid,
                userid,
                userid,
            ),
        )

        result = db_cursor.fetchone()
        if result:
            return {
                "authorized": True,
            }
        else:
            return {
                "authorized": False,
            }


@drive_sharing_blueprint.route("/api/get-role-in-folder", methods=["GET"])
def get_user_role_in_folder():
    try:
        userid = request.args["userid"]
        uuid = request.args["uuid"]
    except KeyError as e:
        raise KeyError(e)

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT user_role FROM people_to_drive_item
            WHERE user_id = %s AND drive_item_id = %s
            LIMIT 1;
        """,
            (userid, uuid),
        )
        result = db_cursor.fetchone()
        if not result:
            # Should an error be raised instead?
            result = {"user_role": ""}
        return result


@drive_sharing_blueprint.route("/api/get-existing-contributors", methods=["GET"])
def get_existing_contributors():
    try:
        uuid = request.args["uuid"]
    except KeyError as e:
        raise KeyError(e)

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
                SELECT *
                FROM drive_item
                LEFT JOIN people_to_drive_item on uuid = drive_item_id
                JOIN profile on id = user_id
                WHERE uuid = %s;
            """,
            (uuid,),
        )
        result = db_cursor.fetchall()
        return {"existing_contributors": result}


@drive_sharing_blueprint.route("/api/upsert-contributors", methods=["POST"])
def upsert_contributors():
    data = request.get_json()
    try:
        contributors = data["contributors"]
        uuid = data["uuid"]
    except KeyError as e:
        raise KeyError(e)

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        for c in contributors:
            db_cursor.execute(
                """
                    INSERT INTO people_to_drive_item(user_id, drive_item_id, user_role)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (user_id, drive_item_id) DO UPDATE
                    SET user_role = EXCLUDED.user_role
                """,
                (
                    # c["id"] here is referring to the id column in the
                    # profile table. Rename this column to be more explicit?
                    c["id"],
                    uuid,
                    c["user_role"],
                ),
            )
        return {"message": "successfully upserted contributors"}


@drive_sharing_blueprint.route("/api/delete-contributors", methods=["POST"])
def delete_contributors():
    data = request.get_json()
    try:
        contributors = data["contributors"]
        uuid = data["uuid"]
    except KeyError as e:
        raise KeyError(e)

    query = """
    """
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        for c in contributors:
            db_cursor.execute(
                """
                    DELETE FROM people_to_drive_item
                    WHERE user_id = %s AND drive_item_id = %s;
                """,
                (
                    # c["id"] here is referring to the id column in the
                    # profile table. Rename this column to be more explicit?
                    c["id"],
                    uuid,
                ),
            )
        return {"message": "successfully deleted contributors"}
