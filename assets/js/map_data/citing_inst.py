# -*- coding: utf-8 -*-
"""
Created on Tue Jun 24 12:43:50 2025

@author: nbhogapurapu
"""

import requests
import time
import csv
import json


doi_list = [
    
    "10.1016/j.isprsjprs.2021.05.013",
    "10.1016/j.rse.2022.112900",
    "10.20944/preprints201911.0393.v1",
    "10.1016/j.asr.2022.03.019",
    "10.3390/rs14040934",
    "10.1080/01431161.2021.1921876",
    "10.3390/rs13214412",
    "10.21105/joss.02970",
    "10.1109/JSTARS.2021.3103911",
    "10.1007/978-981-13-7067-0_36",
    "10.1109/TGRS.2022.3224280",
    
    "10.1109/InGARSS48198.2020.9358940",
    "10.1109/InGARSS51564.2021.9792130",
    "10.1109/IGARSS47720.2021.9554351",
    "10.1109/IGARSS39084.2020.9323699",
    "10.1016/j.rsase.2023.101130",
    "10.1109/IGARSS47720.2021.9553040",
    "10.1109/IGARSS52108.2023.10281845",
    "10.1109/IGARSS39084.2020.9324157",
    "10.1109/InGARSS51564.2021.9791910"
]



####################################################
# Step 1: Get all affiliations from all citing works
####################################################
unique_affiliations = set()
for doi in doi_list:
    try:
        resp = requests.get(f"https://api.openalex.org/works/doi:{doi}").json()
        work_id = resp.get('id')
        if not work_id:
            print(f"Could not resolve DOI: {doi}")
            continue

        print(f"🔍 Fetching citations for {doi}...")

        url = f"https://api.openalex.org/works?filter=cites:{work_id}&per-page=200"
        citing_resp = requests.get(url).json()

        for work in citing_resp.get('results', []):
            for author in work.get('authorships', []):
                for inst in author.get('institutions', []):
                    name = inst.get('display_name')
                    country = inst.get('country_code')
                    if name:
                        unique_affiliations.add((name, country))
    except Exception as e:
        print(f"Error processing {doi}: {e}")
        
print(f"Found {len(unique_affiliations)} institues")
#######################################
# Step 2: Geocode unique affiliations
#######################################

geocoded_data = []

for name, country in unique_affiliations:
    query = f"{name}, {country}" if country else name
    response = requests.get(
        "https://nominatim.openstreetmap.org/search",
        params={"q": query, "format": "json", "limit": 1},
        headers={"User-Agent": "geo-citation-mapper"}
    )
    data = response.json()
    if data:
        lat = float(data[0]['lat'])
        lon = float(data[0]['lon'])
        geocoded_data.append({
            "affiliation": name,
            "country_code": country,
            "latitude": lat,
            "longitude": lon
        })
        
    else:
        geocoded_data.append({
            "affiliation": name,
            "country_code": country,
            "latitude": '',
            "longitude": ''
        })
        print(f"Geocode failed for: {query}")
    time.sleep(1)
######################################
# Step 3: export data
######################################
with open("all_citing_inst_update.csv", "w", newline='', encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["affiliation", "country_code", "latitude", "longitude"])
    writer.writeheader()
    writer.writerows(geocoded_data)

features = []
for entry in geocoded_data:
    features.append({
        "type": "Feature",
        "properties": {
            "affiliation": entry["affiliation"],
            "country_code": entry["country_code"]
        },
        "geometry": {
            "type": "Point",
            "coordinates": [entry["longitude"], entry["latitude"]]
        }
    })

geojson = {
    "type": "FeatureCollection",
    "features": features
}

with open("all_citing_inst_update.geojson", "w", encoding="utf-8") as f:
    json.dump(geojson, f, indent=2)

print("Files created: all_citing_inst.csv and all_citing_inst.geojson")
###########################################################################