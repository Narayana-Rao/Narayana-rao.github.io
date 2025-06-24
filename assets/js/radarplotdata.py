# -*- coding: utf-8 -*-
"""
Created on Thu Mar 27 14:58:35 2025

@author: nbhogapurapu
"""

import json
from scholarly import scholarly
import math
# from scholarly import ProxyGenerator
# # Set up a ProxyGenerator object to use free proxies
# # This needs to be done only once per session
# pg = ProxyGenerator()
# pg.FreeProxies()
# scholarly.use_proxy(pg)

# search_query = scholarly.search_author('Narayana rao Bhogapurapu')
# author = next(search_query)
# author_details = scholarly.fill(author )
author = scholarly.search_author_id('-OryAUsAAAAJ')
author_details = scholarly.fill(author )

#%%

data = {
    "maxValues": {
        "Citations": math.floor((int(author_details['citedby'])+100) / 10) * 10 ,
        "h-index": math.ceil((int(author_details['hindex'])+5) / 5) * 5,
        "i10-index": math.ceil((int(author_details['i10index'])+5) / 5) * 5,
        "Journal articles": 20,
        "Conference articles": 30,
        "Conference abstracts": 30,
        "Book chapters": 5,
        "Preprints": 5,
        "Co-authors": 70,
        "Co-institutions": 30
    },
    "rawData": {
        "Citations": int(author_details['citedby']),
        "h-index":  int(author_details['hindex']),
        "i10-index": int(author_details['i10index']),
        "Journal articles": 13,
        "Conference articles": 23,
        "Conference abstracts": 16,
        "Book chapters": 1,
        "Preprints": 3,
        "Co-authors": 44,
        "Co-institutions": 18
    }
}

with open("radarplotdata.json", "w") as file:
    json.dump(data, file, indent=4)


