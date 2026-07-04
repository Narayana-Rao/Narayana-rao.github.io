import bibtexparser
import pandas as pd
import json
from itertools import combinations
import re

def process_bibtex(bibtex_filepath):
    with open(bibtex_filepath, 'r', encoding='utf-8') as f:
        bib_database = bibtexparser.load(f)
    
    all_authors = []
    author_count = {}
    
    for entry in bib_database.entries:
        if 'author' in entry:
            raw_authors = entry['author'].replace('\n', ' ').replace('\t', ' ').split(' and ')
            
            cleaned_authors = []
            for author in raw_authors:
                name = re.sub(r'\s+', ' ', author).strip()
                if name:
                    cleaned_authors.append(name)
            
            if len(cleaned_authors) > 0:
                all_authors.append(cleaned_authors)
                
                # Update author count
                for author in cleaned_authors:
                    author_count[author] = author_count.get(author, 0) + 1
    unique_authors = sorted(
        author_count.keys(), 
        key=lambda author: (-author_count[author], author)
    )
    
    sorted_author_counts = {author: author_count[author] for author in unique_authors}
    co_author_matrix = pd.DataFrame(0, index=unique_authors, columns=unique_authors)
    for authors in all_authors:
        if len(authors) > 1:
            for author1, author2 in combinations(authors, 2):
                co_author_matrix.loc[author1, author2] += 1
                co_author_matrix.loc[author2, author1] += 1
    matrix_list = co_author_matrix.values.tolist()
    data = {
        "matrix": matrix_list,
        "authors": unique_authors,
        "author_counts": sorted_author_counts  
    }
    
    return data

def save_to_json(data, output_file):
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)

if __name__ == "__main__":

    bibtex_file = 'articles.bib'
    output_file = 'coauthor_data.json'
    data = process_bibtex(bibtex_file)
    save_to_json(data, output_file)

    print(f"Data has been successfully saved to {output_file}")