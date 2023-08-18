import json
import os

with open("config.json") as config_file:
    config = json.load(config_file)

# for gunicorn
# with open("backend/config.json") as config_file:
#     config = json.load(config_file)