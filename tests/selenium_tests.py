import os
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

load_dotenv()
CHROME_DRIVER = os.getenv("CHROME_DRIVER")
URL = os.getenv("URL")
BABYNAMES_USERNAME = os.getenv("BABYNAMES_USERNAME")
BABYNAMES_PASSWORD = os.getenv("BABYNAMES_PASSWORD")

def convert_table_to_dict(driver, table_id):
    map_score = lambda s: (s.split()[0], 0 if s.split()[1] == '-' else int(s.split()[1]))
    try:
        scores = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, table_id))
        )
        scores = tuple(map(str.strip, scores.text.split('\n')))[2:]
        return {name: score for name, score in map(map_score, scores)}
    except Exception as e:
        print(e)


if __name__ == '__main__':

    driver = webdriver.Chrome(CHROME_DRIVER)

    try:
        driver.implicitly_wait(10)
        driver.get(URL)

        driver.find_element_by_id("usernameInput").send_keys(BABYNAMES_USERNAME)
        driver.find_element_by_id("passwordInput").send_keys(BABYNAMES_PASSWORD)
        driver.find_element_by_class_name("btn").click()

        results_table_1_A = convert_table_to_dict(driver, "results-table-1-A")
        results_table_2_A = convert_table_to_dict(driver, "results-table-2-A")

    finally:
        driver.quit()
