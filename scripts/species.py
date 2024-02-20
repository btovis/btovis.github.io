import json
from glob import glob
import os
import time
from tqdm import tqdm

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

# Load species names from file
species_names = []
for filename in glob("scripts/species-lists/*species.txt"):
    with open(filename) as f:
        species_names += f.read().splitlines()

# Initialize WebDriver
driver = webdriver.Chrome()
driver.get("https://www.iucnredlist.org/")

# Load existing species data if available
species = {}
species_file_path = "./devfiles/src/assets/species.json"
if os.path.exists(species_file_path):
    with open(species_file_path) as f:
        species = json.load(f)

# Function to update species data
def update_species(bird_name, category):
    species[bird_name] = category

# Scrape data for birds not already in the species data
for species_name in tqdm(species_names, desc="Scraping species data"):
    species_name = species_name.strip().lower()
    if species_name in species:
        continue
    try:
        # Search for the bird on the IUCN Red List website
        search_input = driver.find_element(By.CSS_SELECTOR, "input[type='search'].search.search--site")
        search_input.clear()
        search_input.send_keys(species_name + Keys.RETURN)
        time.sleep(2)
        
        # Extract category information if found
        result = driver.find_element(By.CSS_SELECTOR, ".species-category.-icon")
        classes = result.get_attribute("class")
        for c in classes.split():
            if c.startswith("species-category--"):
                update_species(species_name, c.split("--")[1])
                break
        else:
            update_species(species_name, "unknown")
    except NoSuchElementException as e:
        update_species(species_name, "unknown")
    
    # Save updated species data
    with open(species_file_path, "w") as f:
        json.dump(species, f)

# Close the WebDriver
driver.quit()
