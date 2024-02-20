import json
import os
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

# Load bird names from file
with open("devfiles/birds.txt") as f:
    birds = f.read().splitlines()

# Initialize WebDriver
driver = webdriver.Chrome()
driver.get("https://www.iucnredlist.org/")

# Load existing species data if available
species = {}
species_file_path = "./devfiles/species.json"
if os.path.exists(species_file_path):
    with open(species_file_path) as f:
        species = json.load(f)

# Function to update species data
def update_species(bird_name, category):
    species[bird_name] = category
    print(bird_name, category)

# Scrape data for birds not already in the species data
for bird in birds:
    if bird in species:
        continue
    try:
        # Search for the bird on the IUCN Red List website
        search_input = driver.find_element(By.CSS_SELECTOR, "input[type='search'].search.search--site")
        search_input.clear()
        search_input.send_keys(bird + Keys.RETURN)
        time.sleep(2)
        
        # Extract category information if found
        result = driver.find_element(By.CSS_SELECTOR, ".species-category.-icon")
        classes = result.get_attribute("class")
        for c in classes.split():
            if c.startswith("species-category--"):
                update_species(bird, c.split("--")[1])
                break
        else:
            update_species(bird, "unknown")
    except Exception as e:
        print("Error:", bird, e)
        update_species(bird, "unknown")
    
    # Save updated species data
    with open(species_file_path, "w") as f:
        json.dump(species, f)

# Close the WebDriver
driver.quit()
