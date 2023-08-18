import psycopg2
from flask import jsonify, request

from ..core import db_conn
from . import pages_blueprint


# Gets all the note titles for display in the notes sidebar
@pages_blueprint.route("/api/get-all-notes", methods=["GET"])
def get_all_notes():
    userid = request.args.get('uid', '')

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT notes.id as id, notes.title as name
            FROM notes
            WHERE notes.user_id=%s;
            """,
            (userid),
        )
        note_titles = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(note_titles)


# Creates a new note given a title and user id
@pages_blueprint.route("/api/create-new-note", methods=["POST"])
def create_new_note():
    data = request.get_json()

    try:
        uid = data["params"]["uid"]
        title = data["params"]["newnotetitle"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            INSERT INTO notes (user_id, title, note_content)
            VALUES (%s, %s, '')
            RETURNING id;
            """,
            (uid, title),
        )
        note_id = db_cursor.fetchone()["id"]

    db_conn.commit()
    return jsonify({"id": note_id})


# Gets all the note content for the current note id
@pages_blueprint.route("/api/get-notes-by-id", methods=["GET"])
def get_notes_by_id():
    data = request.args

    try:
        uid = data["uid"]
        noteid = data["noteid"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT notes.id as id, notes.title as name, notes.note_content as contents
            FROM notes
            WHERE notes.user_id=%s AND notes.id=%s;
            """,
            (uid, noteid),
        )
        note_contents = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(note_contents)


# Creates a new note given a title and user id
@pages_blueprint.route("/api/push-note-content", methods=["POST"])
def push_note_content():
    data = request.get_json()

    try:
        uid = data["params"]["uid"]
        id = data["params"]["id"]
        new_contents = data["params"]["contents"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            UPDATE notes
            SET note_content=%s
            WHERE id=%s AND user_id=%s;
            """,
            (new_contents, id, uid),
        )

    db_conn.commit()
    return jsonify({"msg": "success"})
