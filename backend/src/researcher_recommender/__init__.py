# flake8: noqa
from flask import Blueprint
#import spacy
from keybert import KeyBERT
import pandas as pd

researcher_recommender_blueprint = Blueprint("researcher_recommender_blueprint", __name__)

# #### for unicorm
# print("Setting up recommender")

# nlp = spacy.load("en_core_web_lg")
# print("Spacy language model loaded")
# kw_model = KeyBERT()
# print("KeyBERT loaded")
# # profiles = pd.read_pickle("backend/src/researcher_recommender/data/profiles_keywords_nlp_all_clean_wsl")
# profiles = pd.read_pickle("src/researcher_recommender/data/profiles_keywords_nlp_all_clean_wsl")
# print("Profiles loaded")

# print("Recommender ready")

# from .spacy_recommender import researcher_recommender
from .google_recommender import google_researcher_recommender


