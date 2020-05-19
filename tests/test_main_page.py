import os
import time
import unittest
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

load_dotenv()
CHROME_DRIVER = os.getenv("CHROME_DRIVER")
CONNECTION_STRING = os.getenv("CONNECTION_STRING")
URL = os.getenv("URL")
BABYNAMES_USERNAME = os.getenv("BABYNAMES_USERNAME")
BABYNAMES_PASSWORD = os.getenv("BABYNAMES_PASSWORD")

class TestMainPageShould(unittest.TestCase):

    @staticmethod
    def populate_database():

        client = MongoClient(CONNECTION_STRING)
        db = client.babynames
        db.names.drop()
        db.names.insert_one({'names': ['Alaric', 'Benjamin', 'Cillian', 'Darcy', 'Emery']})
        db.favouriteNames.drop()
        db.favouriteNames.insert_many([
            { "preferredName" : "Emery", "unpreferredName" : "Darcy", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 29) },
            { "preferredName" : "Emery", "unpreferredName" : "Darcy", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 29) },
            { "preferredName" : "Emery", "unpreferredName" : "Darcy", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 29) },
            { "preferredName" : "Emery", "unpreferredName" : "Darcy", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 30) },
            { "preferredName" : "Cillian", "unpreferredName" : "Benjamin", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 30) },
            { "preferredName" : "Cillian", "unpreferredName" : "Benjamin", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 31) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Darcy", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 31) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Darcy", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 31) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Darcy", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 31) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Darcy", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 31) },
            { "preferredName" : "Cillian", "unpreferredName" : "Emery", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 31) },
            { "preferredName" : "Alaric", "unpreferredName" : "Darcy", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 32) },
            { "preferredName" : "Alaric", "unpreferredName" : "Darcy", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 32) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Emery", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 32) },
            { "preferredName" : "Cillian", "unpreferredName" : "Darcy", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 32) },
            { "preferredName" : "Cillian", "unpreferredName" : "Darcy", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 32) },
            { "preferredName" : "Alaric", "unpreferredName" : "Cillian", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 32) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Alaric", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 32) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Cillian", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 33) },
            { "preferredName" : "Darcy", "unpreferredName" : "Emery", "username" : "Neil", "date" : datetime(2020, 5, 19, 8, 36, 33) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Alaric", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 5) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Alaric", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 5) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Alaric", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 5) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Alaric", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 6) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Alaric", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 6) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Alaric", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 6) },
            { "preferredName" : "Cillian", "unpreferredName" : "Darcy", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 7) },
            { "preferredName" : "Darcy", "unpreferredName" : "Cillian", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 7) },
            { "preferredName" : "Darcy", "unpreferredName" : "Cillian", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 7) },
            { "preferredName" : "Darcy", "unpreferredName" : "Cillian", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 8) },
            { "preferredName" : "Alaric", "unpreferredName" : "Cillian", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 8) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Emery", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 8) },
            { "preferredName" : "Benjamin", "unpreferredName" : "Emery", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 8) },
            { "preferredName" : "Alaric", "unpreferredName" : "Emery", "username" : "Sam", "date" : datetime(2020, 5, 19, 8, 48, 8) }
        ])

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

        cls.populate_database()

        try:
            cls.driver.implicitly_wait(10)
            cls.driver.get(URL)
            time.sleep(0.5)

            cls.driver.find_element_by_id("usernameInput").send_keys(BABYNAMES_USERNAME)
            cls.driver.find_element_by_id("passwordInput").send_keys(BABYNAMES_PASSWORD)
            cls.driver.find_element_by_class_name("btn").click()
            time.sleep(0.5)

        except:
            cls.driver.quit()

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def test_button_1_on_click_alters_scores(self):
        old_results_table = self.convert_table_to_dict("results-table-1-A")
        name1_button = self.driver.find_element_by_id("name1-A")
        name1 = name1_button.text.split()[0]
        name1_score = old_results_table.get(name1, 0)
        name2_button = self.driver.find_element_by_id("name2-A")
        name2 = name2_button.text.split()[0]
        name2_score = old_results_table.get(name2, 0)
        name1_button.click()
        time.sleep(1)
        new_results_table = self.convert_table_to_dict("results-table-1-A")
        self.assertEqual(new_results_table.get(name1, 0), name1_score + 1)
        self.assertEqual(new_results_table.get(name2, 0), name2_score - 1)

    def test_button_2_on_click_alters_scores(self):
        old_results_table = self.convert_table_to_dict("results-table-1-A")
        name1_button = self.driver.find_element_by_id("name1-A")
        name1 = name1_button.text.split()[0]
        name1_score = old_results_table.get(name1, 0)
        name2_button = self.driver.find_element_by_id("name2-A")
        name2 = name2_button.text.split()[0]
        name2_score = old_results_table.get(name2, 0)
        name2_button.click()
        time.sleep(1)
        new_results_table = self.convert_table_to_dict("results-table-1-A")
        self.assertEqual(new_results_table.get(name1, 0), name1_score - 1)
        self.assertEqual(new_results_table.get(name2, 0), name2_score + 1)
