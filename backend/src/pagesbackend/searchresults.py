import psycopg2
from flask import jsonify, request

from ..core import db_conn
from . import pages_blueprint


# Converts the user's query into a regex string for searching
def convert_search_to_regex(query):
    query = query.lower()
    regex = ''
    for word in query.split(' '):
        regex += "%"+word
    regex += "%"

    return regex


# Gets the list of projects matching the user's query
@pages_blueprint.route("/api/search-for-projects", methods=["GET"])
def search_for_projects():
    title_query = request.args.get('search_query', '')
    regex = convert_search_to_regex(title_query)

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        # Retrieves the project search results
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
                ON (people_to_project.user_id = profile.id)

            WHERE LOWER(project.title) LIKE %s
            AND
            people_to_project.user_role='O'
            AND
            project.private = false;
            """,
            (regex,),
        )
        project_search_results = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(project_search_results)


# Gets the user profile fields for display given an id
@pages_blueprint.route("/api/search-for-people", methods=["GET"])
def search_for_people():
    user_query = request.args.get('search_query', '')
    regex = convert_search_to_regex(user_query)

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        # Retrieves the user from the query
        db_cursor.execute(
            """
            SELECT profile.id AS id,
            profile.first_name AS first_name,
            profile.last_name AS last_name,
            profile_info.bio AS bio,
            profile_info.education AS education

            FROM profile INNER JOIN profile_info
            ON (profile.id = profile_info.user_id)

            WHERE LOWER(profile.first_name) LIKE %s
            OR
            LOWER(profile.last_name) LIKE %s
            OR
            LOWER(profile.first_name)||' '||LOWER(profile.last_name) LIKE %s;
            """,
            (regex, regex, regex,),
        )
        people_search_results = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(people_search_results)


# Gets the user profile fields for display given an id
@pages_blueprint.route("/api/search-for-people-in-project", methods=["GET"])
def search_for_people_in_project():
    data = request.args

    try:
        user_query = data["search_query"]
        projid = data["projid"]
    except KeyError:
        raise KeyError("Missing required fields")

    regex = convert_search_to_regex(user_query)

    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        db_cursor.execute(
            """
            SELECT profile.id AS id,
            profile.first_name AS first_name,
            profile.last_name AS last_name,
            profile_info.bio AS bio,
            profile_info.education AS education

            FROM profile INNER JOIN profile_info
                ON (profile.id = profile_info.user_id)
            INNER JOIN people_to_project
                ON (profile.id = people_to_project.user_id)

            WHERE people_to_project.project_id = %s
            AND
            (LOWER(profile.first_name) LIKE %s
            OR
            LOWER(profile.last_name) LIKE %s
            OR
            LOWER(profile.first_name)||' '||LOWER(profile.last_name) LIKE %s);
            """,
            (projid, regex, regex, regex,),
        )
        people_search_results = db_cursor.fetchall()

    db_conn.commit()
    return jsonify(people_search_results)
