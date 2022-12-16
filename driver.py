from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def get_driver():
    # Create a ChromeOptions object to configure the headless browser
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    # This is needed.  Fidelity doesn't want to accept bot requests and just times out.
    chrome_options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36")

    # Create a Chrome driver with the options we just created
    driver = webdriver.Chrome(options=chrome_options)
    driver.set_page_load_timeout(10)
    
    # Not sure if we need this.  Better would be to wait for the value we care about.
    driver.implicitly_wait(10) # seconds
    return driver
