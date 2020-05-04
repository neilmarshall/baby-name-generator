import os
from dotenv import load_dotenv
from selenium import webdriver

load_dotenv()

driver = webdriver.Chrome(os.getenv("CHROME_DRIVER"))
driver.implicitly_wait(10)
driver.get("http://localhost:3000")

driver.find_element_by_id("usernameInput").send_keys("Neil")
driver.find_element_by_id("passwordInput").send_keys("test")
driver.find_element_by_class_name("btn").click()

driver.quit()
