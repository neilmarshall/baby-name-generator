from selenium import webdriver

driver = webdriver.Chrome(r"C:\Program Files (x86)\chromedriver_win32\chromedriver.exe")
driver.implicitly_wait(10)
driver.get("http://localhost:3000")

driver.find_element_by_id("usernameInput").send_keys("Neil")
driver.find_element_by_id("passwordInput").send_keys("test")
driver.find_element_by_class_name("btn").click()

driver.quit()