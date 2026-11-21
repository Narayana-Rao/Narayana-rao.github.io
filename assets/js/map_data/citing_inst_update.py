# -*- coding: utf-8 -*-
"""
Optimized Geocoding and Citation Engine
Features: OpenAlex cursor paging & Photon fuzzy geocoding fallback loop.
"""

import requests,os
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
    "10.1109/LGRS.2026.3718772",

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
    "10.30420/456729146",
    
]
def norm_name(s):
    return " ".join(str(s or "").strip().split()).casefold()


def parse_coord(val):
    if val is None or val == "":
        return None
    try:
        num = float(str(val).strip())
        return num if num == num else None  # excludes NaN
    except (ValueError, TypeError):
        return None


def get_fallback_queries(name, country):
    queries = []
    base = f"{name}, {country}" if country else name
    queries.append(base)

    parts = [p.strip() for p in name.split(",")]
    while len(parts) > 1:
        parts.pop(0)
        simplified = ", ".join(parts)
        queries.append(f"{simplified}, {country}" if country else simplified)

    if country and country not in queries:
        queries.append(country)
    return queries


####################################################
# Step 1: Get all affiliations from all citing works
####################################################
unique_affiliations = set()

for doi in doi_list:
    try:
        resp = requests.get(
            f"https://api.openalex.org/works/doi:{doi}?mailto=your_email@domain.com",
            timeout=15,
        ).json()
        work_id = resp.get("id")
        if not work_id:
            print(f"Could not resolve DOI: {doi}")
            continue

        print(f"Fetching citations for {doi}...")
        cursor = "*"
        while cursor:
            url = f"https://api.openalex.org/works?filter=cites:{work_id}&per-page=200&cursor={cursor}"
            citing_resp = requests.get(url, timeout=15).json()
            results = citing_resp.get("results", [])

            if not results:
                break

            for work in results:
                for author in work.get("authorships", []):
                    for inst in author.get("institutions", []):
                        name = inst.get("display_name")
                        country = inst.get("country_code")
                        if name:
                            unique_affiliations.add((name, country))

            cursor = citing_resp.get("meta", {}).get("next_cursor")

    except Exception as e:
        print(f"Error processing {doi}: {e}")

print(f"Found {len(unique_affiliations)} unique institutions.")

#######################################
# Step 2: Load Manual Overrides & Existing Data
#######################################

# 1. Load manual coordinate overrides
MANUAL_OVERRIDES = {}

if os.path.exists("manual_coords.csv"):
    print("Loading manual coordinate overrides from 'manual_coords.csv'...")

    with open("manual_coords.csv", "r", encoding="utf-8-sig", newline="") as f:

        reader = csv.DictReader(f)

        for row_num, row in enumerate(reader, start=2):

            # Detect malformed CSV rows
            if None in row:
                extra_values = row.pop(None)
                print(f"Warning row {row_num}: extra CSV columns detected: {extra_values}")

            col_map = {
                str(k).strip().lower(): k
                for k in row if k
            }

            aff_col = next(
                (orig for norm, orig in col_map.items()
                 if "affil" in norm or "name" in norm),
                None
            )

            country_col = next(
                (orig for norm, orig in col_map.items()
                 if "country" in norm or "code" in norm),
                None
            )

            lat_col = next(
                (orig for norm, orig in col_map.items()
                 if "lat" in norm),
                None
            )

            lon_col = next(
                (orig for norm, orig in col_map.items()
                 if "lon" in norm or "lng" in norm),
                None
            )

            if not aff_col or not lat_col or not lon_col:
                continue

            raw_name = (row.get(aff_col) or "").strip()
            country = (row.get(country_col) or "").strip() if country_col else ""

            lat_raw = (row.get(lat_col) or "").strip()
            lon_raw = (row.get(lon_col) or "").strip()

            if not raw_name or not lat_raw or not lon_raw:
                continue

            lat = parse_coord(lat_raw)
            lon = parse_coord(lon_raw)

            if lat is None or lon is None:
                print(
                    f"Skipping row {row_num} ({raw_name}): "
                    f"invalid coordinates ({lat_raw}, {lon_raw})"
                )
                continue

            if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                print(f"Skipping row {row_num} ({raw_name}): coordinates out of range")
                continue

            MANUAL_OVERRIDES[norm_name(raw_name)] = {
                "country_code": country,
                "latitude": lat,
                "longitude": lon,
            }

    print(f"Successfully loaded {len(MANUAL_OVERRIDES)} manual overrides.")

else:
    print("No 'manual_coords.csv' found.")

# 2. Load existing geocoded data from 'inst_update.geojson'
# Keep entries that already have valid coordinates; allow empty ones to be retried
geocoded_by_norm = {}
unmatched_existing = []

if os.path.exists("inst_update.geojson"):
    print("Loading existing geocoded data from 'inst_update.geojson'...")
    with open("inst_update.geojson", "r", encoding="utf-8") as f:
        try:
            geojson_data = json.load(f)
            for feature in geojson_data.get("features", []):
                props = feature.get("properties", {})
                geom = feature.get("geometry") or {}
                coords = geom.get("coordinates") or []

                name = props.get("affiliation")
                country = props.get("country_code")
                lon = parse_coord(coords[0]) if len(coords) >= 1 else None
                lat = parse_coord(coords[1]) if len(coords) >= 2 else None

                if not name:
                    continue

                key = norm_name(name)
                if lat is not None and lon is not None:
                    geocoded_by_norm[key] = {
                        "affiliation": name,
                        "country_code": country,
                        "latitude": lat,
                        "longitude": lon,
                    }
                else:
                    unmatched_existing.append((name, country))

            print(f"Found {len(geocoded_by_norm)} valid existing geocoded affiliations.")
        except json.JSONDecodeError:
            print("Existing GeoJSON file is empty or malformed. Starting fresh.")

# 3. Determine affiliations to process:
#    - Any unique affiliation not yet validly geocoded
#    - Any previously unmatched existing affiliation that now has a manual override
candidate_map = {}
for name, country in unique_affiliations:
    key = norm_name(name)
    if key not in geocoded_by_norm:
        candidate_map[key] = (name, country)

for name, country in unmatched_existing:
    key = norm_name(name)
    if key not in geocoded_by_norm and key in MANUAL_OVERRIDES:
        candidate_map.setdefault(key, (name, country))

affiliations_to_process = list(candidate_map.values())

print(f"Total unique affiliations: {len(unique_affiliations)}")
print(f"Remaining to process: {len(affiliations_to_process)}")

# 4. Process affiliations (Checking MANUAL OVERRIDES first, then Photon API)
for name, country in tqdm(affiliations_to_process, desc="Processing affiliations"):
    key = norm_name(name)

    # --- CHECK MANUAL OVERRIDES FIRST ---
    if key in MANUAL_OVERRIDES:
        override = MANUAL_OVERRIDES[key]
        geocoded_by_norm[key] = {
            "affiliation": name,
            "country_code": override["country_code"] if override["country_code"] else country,
            "latitude": override["latitude"],
            "longitude": override["longitude"],
        }
        continue  # Skip API call completely for this item!

    # --- FALL BACK TO PHOTON API GEOLOCATOR ---
    candidate_queries = get_fallback_queries(name, country)
    location = None

    for query in candidate_queries:
        try:
            location = geolocator.geocode(query, timeout=8)
            if location:
                break
        except Exception:
            pass

    if location:
        geocoded_by_norm[key] = {
            "affiliation": name,
            "country_code": country,
            "latitude": location.latitude,
            "longitude": location.longitude,
        }
    else:
        geocoded_by_norm[key] = {
            "affiliation": name,
            "country_code": country,
            "latitude": "",
            "longitude": "",
        }
        tqdm.write(f"Geocode completely failed for: {name}")

    time.sleep(0.3)

# 5. Final combined dataset
all_geocoded_data = list(geocoded_by_norm.values())

######################################
# Step 3: Export Data
######################################
with open("inst_update_new.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["affiliation", "country_code", "latitude", "longitude"])
    writer.writeheader()
    writer.writerows(all_geocoded_data)

features = []
for entry in all_geocoded_data:
    lat = parse_coord(entry["latitude"])
    lon = parse_coord(entry["longitude"])
    if lat is not None and lon is not None:
        features.append({
            "type": "Feature",
            "properties": {
                "affiliation": entry["affiliation"],
                "country_code": entry["country_code"],
            },
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat],
            },
        })

geojson = {
    "type": "FeatureCollection",
    "features": features,
}

with open("inst_update_new.geojson", "w", encoding="utf-8") as f:
    json.dump(geojson, f, indent=2)

print("Files successfully updated: inst_update_new.csv and inst_update_new.geojson")