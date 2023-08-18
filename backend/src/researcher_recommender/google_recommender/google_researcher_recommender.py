from flask import  request, jsonify


from .google_recommender_funcs import *

import json

from keybert import KeyBERT


from googleapiclient.discovery import build

import psycopg2
from ...core import db_conn

from .. import researcher_recommender_blueprint



print("Setting up recommender")
kw_model = KeyBERT()
print("KeyBERT loaded")
GOOGLE_API_KEY = ""
SEARCH_ENGINE_ID = ""
ORG_PROFILE_SITES = ""

with open("src/researcher_recommender/google_recommender/keys/google_search_keys.json") as f:
    keys = json.load(f)
    GOOGLE_API_KEY = keys['api_key']
    SEARCH_ENGINE_ID = keys['search_engine_id']

with open("src/researcher_recommender/google_recommender/org_profile_links.json") as f:
    ORG_PROFILE_SITES = json.load(f)

profile_details = pd.read_csv("src/researcher_recommender/profile_details.csv")

print("Keys and profile sites loaded")
print("Recommender ready")



@researcher_recommender_blueprint.route('/api/get-top-researchers', methods=['GET'])
def get_top_researchers():
    # data = request.get_json()
    title = request.args.get('name', '')
    short_desc = request.args.get('shortDesc', '')
    long_desc = request.args.get('longDesc', '')
    user_id = request.args.get('userId', '')
    date_created = request.args.get('date', '')
    # has_keywords = request.args.get('hasKeywords', '')
    # has_keywords = True if has_keywords == "true" else False

    desc = title + short_desc + long_desc
    
    
    researchers, keywords = recommend_researchers(kw_model, desc, ORG_PROFILE_SITES, 
                                        GOOGLE_API_KEY, SEARCH_ENGINE_ID, 
                                        # has_keywords, 
                                        profile_details, 
                                        n_keywords=1, n_results=20)

    researcher_names = [x['title'] for x in researchers]
    researcher_names = "|".join(researcher_names)
                                    
    with db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as db_cursor:
        # Store expert search query results
        db_cursor.execute(
            """
            INSERT INTO expert_search (user_id, date_created, raw_query,
                keywords_query, results)
            VALUES (%s, %s, %s, %s, %s)""",
            (user_id, date_created, desc, keywords, researcher_names),
        )
      

    db_conn.commit()
    
    return jsonify(researchers)
