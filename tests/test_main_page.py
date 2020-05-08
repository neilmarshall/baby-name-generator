import os
import time
import unittest
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

class TestMainPageShould(unittest.TestCase):

    @classmethod
    def convert_table_to_dict(cls, table_id):
        map_score = lambda s: (s.split()[0], 0 if s.split()[1] == '-' else int(s.split()[1]))
        try:
            scores = WebDriverWait(cls.driver, 10).until(
                EC.element_to_be_clickable((By.ID, table_id))
            )
            scores = tuple(map(str.strip, scores.text.split('\n')))[2:]
            return {name: score for name, score in map(map_score, scores)}
        except Exception as e:
            print(e)

    @classmethod
    def setUpClass(cls):

        cls.driver = webdriver.Chrome(CHROME_DRIVER)

        try:
            cls.driver.implicitly_wait(10)
            cls.driver.get(URL)
            time.sleep(0.5)

            cls.driver.find_element_by_id("usernameInput").send_keys(BABYNAMES_USERNAME)
            cls.driver.find_element_by_id("passwordInput").send_keys(BABYNAMES_PASSWORD)
            cls.driver.find_element_by_class_name("btn").click()
            time.sleep(0.5)

            cls.results_table_1_A = cls.convert_table_to_dict("results-table-1-A")
            cls.results_table_2_A = cls.convert_table_to_dict("results-table-2-A")
        except:
            cls.driver.quit()

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def test_button_1_on_click_alters_scores(self):
        name1_button = self.driver.find_element_by_id("name1-A")
        name1 = name1_button.text.split()[0]
        name1_score = self.results_table_1_A.get(name1, 0)
        name2_button = self.driver.find_element_by_id("name2-A")
        name2 = name2_button.text.split()[0]
        name2_score = self.results_table_1_A.get(name2, 0)
        name1_button.click()
        time.sleep(1)
        new_results_table = self.convert_table_to_dict("results-table-1-A")
        self.assertEqual(new_results_table.get(name1, 0), name1_score + 1)
        self.assertEqual(new_results_table.get(name2, 0), name2_score - 1)
