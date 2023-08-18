import pandas as pd
import copy
import numpy as np
import re
from itertools import chain
from urllib.parse import urlparse
from googleapiclient.discovery import build





## remove all numbers from a string
def remove_numbers(string):
    return ''.join([s for s in string if not s.isdigit()])

## removes specfic words that show up in publications titles


def remove_specific_words(string):
    strings_to_remove = ['pp']

    return ''.join([s for s in string if s not in strings_to_remove])


# removes any white spacing from a string
def remove_unwanted_spacing(doc):
    doc_str = str(doc)
    # doc_ls = doc_str.split(" ")
    doc_ls = doc_str.split()

    doc_ls_clean = [word.strip(' ') for word in doc_ls]
#     print(doc_ls_clean)

    empty_str = ''
    while empty_str in doc_ls_clean:
        doc_ls_clean.remove(empty_str)

    clean_str = ' '.join(doc_ls_clean)

    return clean_str


def process_text_for_tdidf(string):
    funcs = [remove_unwanted_spacing, remove_numbers, remove_specific_words]

    for f in funcs:
        string = f(string)

    return string


def google_search(search_term, api_key, cse_id, max_results, **kwargs):
    '''
    Uses Google's Custom Search API to return search results

    :param search_term: search keywords with all advanced search operators (eg site:)
    :param cse_id: programmable search engine id
    :param max_results: Number of results to return from search 
                        Cannot be higher than 100
    :param kwargs: additional params for search
    :return: List of dictionary results 

    '''
    if max_results > 100:
        return {"error": "max_results cannot be greater than 100"}

    n_results_left = max_results 
    start = 1
    all_results = []

    while n_results_left > 0:
        n_results = min(n_results_left, 10) # 10 is the max number of results sent by Google

        params = {"num": n_results, "start": start}
        params = {**params, **kwargs}

        service = build("customsearch", "v1", developerKey=api_key)
        res = service.cse().list(q=search_term, cx=cse_id, **params).execute()
        # res = service.cse().siterestrict().list(q=search_term, cx=cse_id, **params).execute()

        if not('items' in res): # no more results
            break
        
        n_results_left -= len(res['items'])
        start += (len(res['items']))
        
        all_results.append(res)

    return all_results


# def extract_profiles_features(google_search_results, org_profile_sites):
#     '''
#     Extracts relevant features from the raw data provided by Google's API

#     :param google_search_results: list of dictionaries from google_search function
#     :return: list of dictionaries of extracted fields for each result item - 
#              title, link, snippet, image
#     '''
#     clean_results = []

#     for search_results in google_search_results:

#         for result in search_results['items']:
#             clean_result =  {"title": result['title'], 
#                             "link": result['link'], # or  use formatted url?
#                             "snippet": result['snippet']}
#             try:
#                 clean_result["image"] = result['pagemap']['cse_image'][0]['src'] 
#             except Exception as e:
#                 print("No profile image associated with profile")
#                 pass

#             clean_results.append(clean_result)

#     return clean_results

def clean_researcher_name(name):
    
    temp_ls = name.split("|")

    clean_name = temp_ls[0].strip()

    substring_to_remove = ["Grants", "Profile", "Teaching Activities", "Professional Activities", 
                            "Publications"]
    clean_name = re.sub(r'|'.join(map(re.escape, substring_to_remove)), '', clean_name)


    return clean_name.strip()

def get_profile_email(url, name, profile_details):
    '''
    :param url: Profile url
    :param profile_details: Pandas dataframe of profile details (scrapped before hand)

    :return: email of researcher
    '''

    rows = profile_details[[url.startswith(x) for x in profile_details.Url]]

    # for UTS profiles (urls match up)
    
    if len(rows) != 0 and str(rows.iloc[0]['Email']) != "nan" and \
        str(rows.iloc[0]['Email']) != np.nan: 
        return rows.iloc[0]['Email']

    # for USYD profiles urls don't match up but the names do 
    rows = profile_details.query('Name.str.contains(@name)')

    if len(rows) != 0 and str(rows.iloc[0]['Email']) != "nan" and \
        str(rows.iloc[0]['Email']) != np.nan: 
        return rows.iloc[0]['Email']
    
    return ""


    


def extract_profiles_features(google_search_results, org_profile_sites, profile_details):
    '''
    Extracts relevant features from the raw data provided by Google's API

    :param google_search_results: list of dictionaries from google_search function
    :param org_profile_sites: dictionaries containing organisations and its profile sites
    :return: list of dictionaries of extracted fields for each result item - 
             title, link, snippet, image
    '''
    # inverting dictionary
    site_to_org = {}
    for org in org_profile_sites:
        for site in org['profile_sites']:
            hostname = urlparse(site).hostname
            site_to_org[hostname] = org['short_name']
    

    clean_results = []
    researchers_found_set = set()

    for search_results in google_search_results:

        for result in search_results['items']:
            hostname = urlparse(result['link']).hostname

            try:
                researcher_name = clean_researcher_name(result['title'])
                # researcher_name = result['title']
                
                if researcher_name in researchers_found_set:
                    continue

                researchers_found_set.add(researcher_name)

                clean_result =  {"title": researcher_name, 
                                "org": site_to_org[hostname],
                                "link": result['link'], # or  use formatted url?
                                "email": get_profile_email(result['link'],
                                             researcher_name, profile_details),
                                "snippet": result['snippet']}

                # print(researcher_name, clean_result['email'])
            except KeyError as e:
                print(e)
                continue

            
            try:
                clean_result["image"] = result['pagemap']['cse_image'][0]['src'] 
            except Exception as e:
                print("No profile image associated with profile")
                pass

            clean_results.append(clean_result)

    
    return clean_results


#
# Threshold parameter is used to filter out irrelevant keyphrases (is compared against the
# relevance score generated by keyBERT model)
def extract_keywords(kw_model, desc, threshold):
    '''
    Uses keyBERT model to extract keywords from a project's description

    :param kw_model: keyBERT() class object
    :param desc: project description
    :param threshold: parameter is used to filter out irrelevant keyphrases 
                    (is compared against therelevance score generated by keyBERT model)
    :return 
    '''
    project_keywords = kw_model.extract_keywords(process_text_for_tdidf(desc),
                                              keyphrase_ngram_range=(1, 2), stop_words='english',
                                              use_mmr=True, diversity=0.6,
                                              top_n=10)

    project_keywords.sort(key=lambda tup: tup[1], reverse=True) 


    if len(project_keywords) == 0:
        return project_keywords

    
    # standardised the keyphrase weightings by setting the top keyphrase to 100
    max_val = project_keywords[0][1]
    project_keywords_perc = []

    for words, val in project_keywords:
        if val/max_val > threshold: # filter by threshold parameter
            project_keywords_perc.append((words, val, val/max_val))


    return project_keywords_perc


def recommend_researchers(kw_model, desc, org_profile_sites, api_key, search_engine_id, 
                          profile_details, n_keywords=1, n_results=10):
    """
    Returns researchers based on on keyword searches on Google's Search API

    :param kw_model: keyBERT() class object
    :param desc: project description
    :param org_profile_sites: dictionaries containing organisations and its profile sites
    :param api_key: Google's API key
    :param search_engine_id: programmable search engine id
    :param profile_details: Pandas dataframe of profile details (scrapped before hand)
    :param n_keywords: number of extracted keywords to use in Google search
    :param n_results: number of Google search results to return

    :return: returns tuple (dictionary of researcher recommendations, clean keywords used for search)
    """
    print("Description:", desc)
    clean_desc = process_text_for_tdidf(desc)
    keywords = ""

    keywords_tuples = extract_keywords(kw_model, clean_desc, 0.4)
    print("keywords tuples:\n", keywords_tuples)

    # Check if keywords are already given or if we need to extract them
    if len(keywords_tuples) != 0:
        keywords_ls = [x[0] for x in keywords_tuples[0:n_keywords]]
        keywords = " ".join(keywords_ls)
    else:
        keywords = clean_desc
  
    
    if len(keywords) == 0:
        print("no keywords")
        return None

    profile_sites = [org['profile_sites'] for org in org_profile_sites]
    profile_sites = list(chain.from_iterable(profile_sites))

    
    site_filter = " OR ".join([f"site:{site}" for site in profile_sites])

    search_terms = f"{keywords} + {site_filter}"
    print("Google search terms:\n", search_terms)

    all_results = google_search(search_terms, api_key, search_engine_id, n_results)

    
    clean_results = extract_profiles_features(all_results, org_profile_sites, profile_details)

    return (clean_results, keywords)