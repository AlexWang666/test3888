from flask import Flask, request, jsonify, render_template, send_file, make_response

import requests
import pandas as pd
import json
from datetime import datetime
import sys
# import os
import base64
from time import strftime, localtime

# UNCOMMENT FOR RECOMMENDER
from .recommender_funcs import *
import spacy


# import matplotlib.pyplot as plt
# import io
# import time
from keybert import KeyBERT
# import statistics as stats

from .. import researcher_recommender_blueprint
# from . import researcher_recommender_blueprint, nlp, kw_model, profiles


print("Setting up recommender")
nlp = spacy.load("en_core_web_lg")
print("Spacy language model loaded")
kw_model = KeyBERT()
print("KeyBERT loaded")
profiles = pd.read_pickle("src/researcher_recommender/data/profiles_keywords_nlp_all_clean_wsl")
print("Profiles loaded")
print("Recommender ready")


@researcher_recommender_blueprint.route('/api/get-project-fingerprint', methods=['GET'])
def get_project_fingerprint():
    title = request.args.get('name', '')
    short_desc = request.args.get('shortDesc', '')
    long_desc = request.args.get('longDesc', '')

    threshold = 0.4
    fingerprint = extract_keywords_from_project(
        nlp, kw_model, title, short_desc, long_desc, threshold)
    fingerprint_ls_dict = convert_fingerprint_ls_dict(
        fingerprint, threshold)

    return jsonify(fingerprint_ls_dict)

@researcher_recommender_blueprint.route('/api/get-top-researchers', methods=['GET'])
def get_top_researchers():
    # data = request.get_json()
    title = request.args.get('name', '')
    short_desc = request.args.get('shortDesc', '')
    long_desc = request.args.get('longDesc', '')
    n = 40

    # print(title, short_desc, long_desc)

    threshold = 0.4
    fingerprint = extract_keywords_from_project(
        nlp, kw_model, title, short_desc, long_desc, threshold)

    researchers = get_top_N_researchers_fingerprint_method(n, nlp, kw_model, fingerprint, profiles, title,
                                                            short_desc, long_desc, data_format="json")
    # print(researchers)
    return researchers










############### OLD ###########################
# def create_app():
#     app = Flask(__name__, instance_relative_config=True)

#     nlp = spacy.load("en_core_web_lg")
#     kw_model = KeyBERT()
#     profiles = pd.read_pickle("data/profiles_keywords_nlp_all_clean_wsl")

#     print("RECOMMENDER READY")

#     # app.add_url_rule("/", endpoint="index")

#     @app.route('/hello', methods=['GET'])
#     def hello():
#         return jsonify("hello")


#     @app.route('/get-project-fingerprint', methods=['GET'])
#     def get_project_fingerprint():
#         title = request.args.get('name', '')
#         short_desc = request.args.get('shortDesc', '')
#         long_desc = request.args.get('longDesc', '')

#         threshold = 0.4
#         fingerprint = extract_keywords_from_project(
#             nlp, kw_model, title, short_desc, long_desc, threshold)
#         fingerprint_ls_dict = convert_fingerprint_ls_dict(
#             fingerprint, threshold)

#         return jsonify(fingerprint_ls_dict)

#     @app.route('/get-top-researchers', methods=['GET'])
#     def get_top_researchers():
#         # data = request.get_json()
#         title = request.args.get('name', '')
#         short_desc = request.args.get('shortDesc', '')
#         long_desc = request.args.get('longDesc', '')
#         n = 20

#         # print(title, short_desc, long_desc)

#         threshold = 0.4
#         fingerprint = extract_keywords_from_project(
#             nlp, kw_model, title, short_desc, long_desc, threshold)

#         researchers = get_top_N_researchers_fingerprint_method(n, nlp, kw_model, fingerprint, profiles, title,
#                                                                short_desc, long_desc, data_format="json")

#         return researchers

#     return app



# if __name__ == "__main__":
    
    
    

#     app = create_app()
#     app.run(debug=True)