import bibtexparser
import pandas as pd
import json
from itertools import combinations

# Function to process BibTeX file and generate co-author matrix
def process_bibtex(bibtex_file):
    # Parse the BibTeX file
    with open(bibtex_file) as bibtex_file:
        bib_database = bibtexparser.load(bibtex_file)
    
    # Extract all authors from the entries
    all_authors = []
    author_count = {}
    
    for entry in bib_database.entries:
        if 'author' in entry:
            authors = [author.strip() for author in entry['author'].replace('\n', ' ').split(' and ')]
            all_authors.append(authors)
            
            # Update author count
            for author in authors:
                if author in author_count:
                    author_count[author] += 1
                else:
                    author_count[author] = 1
    
    # Create a list of all unique authors sorted by their article count (descending)
    unique_authors = sorted(author_count.keys(), key=lambda x: author_count[x], reverse=True)
    
    # Initialize a co-authorship matrix
    co_author_matrix = pd.DataFrame(0, index=unique_authors, columns=unique_authors)

    # Fill the co-authorship matrix
    for authors in all_authors:
        for author1, author2 in combinations(authors, 2):
            co_author_matrix.loc[author1, author2] += 1
            co_author_matrix.loc[author2, author1] += 1
    
    # Convert matrix to a list of lists
    matrix_list = co_author_matrix.values.tolist()

    # Prepare data for JSON output
    data = {
        "matrix": matrix_list,
        "authors": unique_authors,
        "author_counts": author_count  # Optionally include author counts in output
    }
    
    return data

# Function to save the data into a JSON file
def save_to_json(data, output_file):
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=4)

# Example usage
bibtex_file = 'articles.bib'
output_file = 'coauthor_data.json'

# Process the BibTeX file and generate the co-author network
data = process_bibtex(bibtex_file)

# Save the data to a JSON file
save_to_json(data, output_file)

print(f"Data has been successfully saved to {output_file}")
