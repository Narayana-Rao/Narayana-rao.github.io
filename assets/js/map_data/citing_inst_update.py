# -*- coding: utf-8 -*-
"""
Optimized Geocoding and Citation Engine
Features: OpenAlex cursor paging & Photon fuzzy geocoding fallback loop.
"""

import requests
import time
import csv
import json
from tqdm import tqdm
from geopy.geocoders import Photon

# Initialize the zero-key Photon geolocator (highly tolerant of messy strings)
geolocator = Photon(user_agent="geo-citation-mapper-ultimate")


doi_list = [
    
    "10.21105/joss.02970",
    "10.1080/01431161.2021.1921876",
    "10.1016/j.isprsjprs.2021.05.013",
    "10.1109/JSTARS.2021.3103911",
    "10.3390/rs13214412",
    "10.1016/j.rse.2022.112900",
    "10.3390/rs14040934",
    "10.1016/j.asr.2022.03.019",
    "10.1109/TGRS.2022.3224280",
    "10.1016/j.rsase.2023.101130",
    "10.1109/LGRS.2024.3434653",
    "10.1109/JSTARS.2024.3470956",
    "10.3390/s25103065",
    "10.3390/land14112105",
    "10.1016/j.softx.2025.102490",
    "10.1109/MGRS.2026.3685674",

    "10.20944/preprints201911.0393.v1",
    "10.1007/978-981-13-7067-0_36",
    "10.2139/ssrn.5029813", 
    
    "10.1109/IGARSS39084.2020.9324157",
    "10.1109/InGARSS48198.2020.9358940",
    "10.1109/IGARSS39084.2020.9323699",
    "10.1109/IGARSS47720.2021.9553979",
    "10.1109/IGARSS47720.2021.9553040",
    "10.1109/IGARSS47720.2021.9554351",
    "10.1109/APSAR52370.2021.9688528",
    "10.1109/APSAR52370.2021.9688426",
    "10.1109/APSAR52370.2021.9688350",
    "10.1109/InGARSS51564.2021.9792130",
    "10.1109/InGARSS51564.2021.9791986",
    "10.1109/InGARSS51564.2021.9791910",
    "10.1109/M2GARSS52314.2022.9839744",
    "10.1109/M2GARSS52314.2022.9840171",
    "10.1109/IGARSS46834.2022.9883708",
    "10.23919/URSI-RCRS56822.2022.10118450",
    "10.1109/MIGARS57353.2023.10064591",
    "10.1109/IGARSS52108.2023.10281845",
    "10.1109/APSAR58496.2023.10388965",
    "10.1109/InGARSS59135.2023.10490336",
    "10.1109/IGARSS53475.2024.10642521",
    "10.1109/IGARSS53475.2024.10640881",
    "10.1109/InGARSS61818.2024.11105067",
    "10.1109/IGARSS55030.2025.11313983",
    "10.1109/IGARSS55030.2025.11313971",

]


def get_fallback_queries(name, country):
    """Generates simplified query variants by stripping leading sub-departments comma-by-comma."""
    queries = []
    base = f"{name}, {country}" if country else name
    queries.append(base)
    
    parts = [p.strip() for p in name.split(',')]
    while len(parts) > 1:
        parts.pop(0)  # Strip the highly specific element (e.g., 'Dept of Radar')
        simplified = ", ".join(parts)
        queries.append(f"{simplified}, {country}" if country else simplified)
        
    if country and country not in queries:
        queries.append(country)
    return queries

####################################################
# Step 1: Get all affiliations from all citing works (Robust API Retrieval)
####################################################
unique_affiliations = set()

for doi in doi_list:
    try:
        # Include mailto parameter as requested by OpenAlex guidelines for better performance
        resp = requests.get(f"https://api.openalex.org/works/doi:{doi}?mailto=your_email@domain.com").json()
        work_id = resp.get('id')
        if not work_id:
            print(f"Could not resolve DOI: {doi}")
            continue

        print(f"Fetching citations for {doi}...")
        
        # Use OpenAlex cursor to fetch ALL citations across multiple pages if necessary
        cursor = '*'
        while cursor:
            url = f"https://api.openalex.org/works?filter=cites:{work_id}&per-page=200&cursor={cursor}"
            citing_resp = requests.get(url).json()
            results = citing_resp.get('results', [])
            
            if not results:
                break
                
            for work in results:
                for author in work.get('authorships', []):
                    for inst in author.get('institutions', []):
                        name = inst.get('display_name')
                        country = inst.get('country_code')
                        if name:
                            unique_affiliations.add((name, country))
            
            cursor = citing_resp.get('meta', {}).get('next_cursor')
            
    except Exception as e:
        print(f"Error processing {doi}: {e}")
        
print(f"Found {len(unique_affiliations)} unique institutions.")

#######################################
# Step 2: High-Hit Geocoding with Fallback String Truncation
#######################################
geocoded_data = []

for name, country in tqdm(unique_affiliations, desc="Geocoding affiliations"):
    candidate_queries = get_fallback_queries(name, country)
    location = None
    
    # Try each query variation from most specific to least specific
    for query in candidate_queries:
        try:
            location = geolocator.geocode(query, timeout=8)
            if location:
                break  # Successful match found! Exit loop.
        except Exception:
            pass
            
    if location:
        geocoded_data.append({
            "affiliation": name,
            "country_code": country,
            "latitude": location.latitude,
            "longitude": location.longitude
        })
    else:
        # Only appends empty values if all structural fallbacks completely fail
        geocoded_data.append({
            "affiliation": name,
            "country_code": country,
            "latitude": '',
            "longitude": ''
        })
        tqdm.write(f"Geocode completely failed for: {name}")
        
    time.sleep(0.3)  # Safe delay between calls

######################################
# Step 3: Export Data (Clean Data Filtering for GeoJSON Validation)
######################################
with open("inst_update.csv", "w", newline='', encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["affiliation", "country_code", "latitude", "longitude"])
    writer.writeheader()
    writer.writerows(geocoded_data)

features = []
for entry in geocoded_data:
    # Validate coordinate items exist to avoid writing malformed GeoJSON files
    if entry["latitude"] != '' and entry["longitude"] != '':
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

with open("inst_update.geojson", "w", encoding="utf-8") as f:
    json.dump(geojson, f, indent=2)

print("Files successfully updated: inst_update.csv and inst_update.geojson")