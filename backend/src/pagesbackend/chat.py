import psycopg2
from flask import jsonify, request

from ..core import db_conn
from . import pages_blueprint

from datetime import datetime


def get_pretty_date(ugly_date):
    date_words = str(ugly_date).split(' ')
    days = date_words[0].split('-')
    time = date_words[1].split(':')

    days = days[2]+'-'+days[1]+'-'+days[0]
    time = time[0]+':'+time[1]

    friendly_date = time+' '+days
    return friendly_date


# Gets all the chats related to the current user for the sidebar
@pages_blueprint.route("/api/get-all-chats", methods=["GET"])
def get_all_chats():
    userid = request.args.get('uid', '')
    chats = []

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT chat.id AS id, chat.title AS name,
            '' AS lastmessage, chat.date_created AS date
            FROM chat INNER JOIN people_to_chat
                ON chat.id = people_to_chat.chat_id
            WHERE people_to_chat.user_id = %s
            ORDER BY chat.date_created::timestamptz DESC;
            """,
            (userid,),
        )

        for chat in db_cursor:
            with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor_2:
                # Gets the last message sent
                db_cursor_2.execute(
                    """
                    SELECT messages.message AS lastmessage,
                    messages.date_sent AS date
                    FROM messages INNER JOIN chat
                        ON messages.chat_id = chat.id
                    WHERE chat.id = %s
                    ORDER BY messages.date_sent::timestamptz DESC
                    LIMIT 1;
                    """,
                    (chat["id"],),
                )
                lastthings = db_cursor_2.fetchone()
                if lastthings != None:
                    chat["lastmessage"] = lastthings["lastmessage"]
                    chat["date"] = lastthings["date"]

                # Get the date in a nicer way
                if chat != None:
                    friendly_date = get_pretty_date(chat["date"])
                    chat["date"] = friendly_date

                chats.append(chat)
                
    chats = sorted(chats, key = lambda k: datetime.strptime(k["date"], '%H:%M %d-%m-%Y'), reverse=True)

    db_conn.commit()
    return jsonify(chats)


# Creates a new chat given a title and user id
@pages_blueprint.route("/api/create-new-chat", methods=["POST"])
def create_new_chat():
    data = request.get_json()

    try:
        uid = data["params"]["uid"]
        title = data["params"]["name"]
        date = data["params"]["date"]
    except KeyError:
        raise KeyError("Missing required fields")

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        db_cursor.execute(
            """
            INSERT INTO chat (date_created, title, creator)
            VALUES (%s, %s, %s)
            RETURNING id;
            """,
            (date, title, uid,),
        )
        chat_id = db_cursor.fetchone()["id"]

        db_cursor.execute(
            """
            INSERT INTO people_to_chat (user_id, chat_id)
            VALUES (%s, %s);
            """,
            (uid, chat_id,),
        )

    db_conn.commit()
    return jsonify({"id": chat_id})


# Gets info about the current chat
@pages_blueprint.route("/api/get-chat-by-id", methods=["GET"])
def get_chat_by_id():
    chatid = request.args.get('chatid', '')

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT chat.id AS id, chat.title AS name
            FROM chat
            WHERE chat.id = %s;
            """,
            (chatid,),
        )
        chatman = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(chatman)


# Gets the message history for the current chat
@pages_blueprint.route("/api/get-all-messages", methods=["GET"])
def get_all_messages():
    chatid = request.args.get('chatid', '')
    chatman = []

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT messages.id AS id, messages.user_id AS authorid,
            profile.first_name||' '||profile.last_name AS author,
            'PFP' AS pfp, messages.message AS message, messages.date_sent AS date
            FROM messages INNER JOIN profile
                ON messages.user_id = profile.id
            INNER JOIN chat
                ON messages.chat_id = chat.id
            WHERE chat.id = %s
            ORDER BY messages.date_sent ASC;
            """,
            (chatid,),
        )

        for chat in db_cursor:
            if chat != None:
                friendly_date = get_pretty_date(chat["date"])
                chat["date"] = friendly_date

            chatman.append(chat)

    db_conn.commit()
    return jsonify(chatman)


# Adds a new message
@pages_blueprint.route("/api/add-chat-message", methods=["POST"])
def add_chat_message():
    data = request.get_json()

    try:
        uid = data["params"]["uid"]
        chatid = data["params"]["chatid"]
        message = data["params"]["message"]
        date = data["params"]["date"]
    except KeyError:
        raise KeyError("Missing required fields")

    new_message = []
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            INSERT INTO messages (user_id, chat_id, date_sent, message)
            VALUES (%s, %s, %s, %s)
            RETURNING user_id AS authorid, chat_id AS chatid, date_sent AS date,
            messages.message AS message;
            """,
            (uid, chatid, date, message,),
        )

        for message in db_cursor:
            with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor_2:
                # Gets the sender's name
                db_cursor_2.execute(
                    """
                    SELECT profile.first_name||' '||profile.last_name AS author
                    FROM messages INNER JOIN profile
                        ON messages.user_id = profile.id
                    WHERE messages.user_id = %s;
                    """,
                    (message["authorid"],),
                )
                author = db_cursor_2.fetchone()
                message["author"] = author["author"]

            new_message.append(message)

    db_conn.commit()
    return jsonify(new_message[0])


# Adds a user to the group
@pages_blueprint.route("/api/add-user-to-chat", methods=["POST"])
def add_user_to_chat():
    data = request.get_json()

    try:
        uid = data["params"]["uid"]
        chatid = data["params"]["chatid"]
    except KeyError:
        raise KeyError("Missing required fields")

    return_dict = {"msg": "Successfully added user to the chat."}
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        try:
            db_cursor.execute(
                """
                INSERT INTO people_to_chat (user_id, chat_id)
                VALUES (%s, %s);
                """,
                (uid, chatid,),
            )

        except:
            return_dict["msg"] = "User has already been added to this chat."

    db_conn.commit()
    return jsonify(return_dict)


# Gets the users in the current chat
@pages_blueprint.route("/api/get-users-in-chat", methods=["GET"])
def get_users_in_chat():
    chatid = request.args.get('chatid', '')
    chatbois = {}

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT profile.id AS id,
            profile.first_name||' '||profile.last_name AS name
            FROM chat INNER JOIN people_to_chat
                ON chat.id = people_to_chat.chat_id
            INNER JOIN profile
                ON people_to_chat.user_id = profile.id
            WHERE chat.id = %s;
            """,
            (chatid,),
        )
        chatppl = db_cursor.fetchall()

    chatbois["numpeople"] = len(chatppl)
    chatbois["people"] = chatppl

    db_conn.commit()
    return jsonify(chatbois)


# Creates a chat with a user after clicking Chat in their profile
@pages_blueprint.route("/api/create-chat-with-user", methods=["POST"])
def create_chat_with_user():
    data = request.get_json()

    try:
        uid = data["params"]["uid"]
        friend = data["params"]["friend"]
        title = data["params"]["name"]
        date = data["params"]["date"]
    except KeyError:
        raise KeyError("Missing required fields")

    return_dict = {"msg": "Successfully created chat."}
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:

        # Counts the number of conversations with just the two users
        db_cursor.execute(
            """
            SELECT people_to_chat.chat_id
            FROM people_to_chat
            GROUP BY people_to_chat.chat_id
            HAVING SUM(
                CASE WHEN
                    (people_to_chat.user_id NOT IN (%s, %s))=true THEN 1
                    ELSE 0
                END) = 0;
            """,
            (uid, friend,),
        )
        chat_id = db_cursor.fetchall()

        if chat_id == []:
            db_cursor.execute(
                """
                INSERT INTO chat (date_created, title, creator)
                VALUES (%s, %s, %s)
                RETURNING id;
                """,
                (date, title, uid,),
            )
            chat_id = db_cursor.fetchone()["id"]

            # Puts the user and their friend into the chat together
            db_cursor.execute(
                """
                INSERT INTO people_to_chat (user_id, chat_id)
                VALUES (%s, %s), (%s, %s);
                """,
                (uid, chat_id, friend, chat_id,),
            )

        else:
            return_dict["msg"] = "Already have a chat with this user."

    db_conn.commit()
    return jsonify(return_dict)
