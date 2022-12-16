from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions

# Chromium can be installed on the arm64 architecture, while Chrome cannot, or at least not
# easily.
def get_chromium_driver():
    # Create a ChromeOptions object to configure the headless browser
    chromium_options = ChromeOptions()
    chromium_options.BinaryLocation = "/usr/bin/chromium-browser"
    chromium_options.add_argument('--headless')
    # This is needed.  Fidelity doesn't want to accept bot requests and just times out.
    chromium_options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36")

    # Create a Chrome driver with the options we just created
    # driver = webdriver.Chrome(options=chrome_options)
    driver = webdriver.Chrome(executable_path="/usr/bin/chromedriver", options=chromium_options)
    driver.set_page_load_timeout(10)
    
    # Not sure if we need this.  Better would be to wait for the value we care about.
    driver.implicitly_wait(10) # seconds

    return driver

def get_firefox_driver():
    options = FirefoxOptions()
    options.add_argument('--headless')
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36")
    print('Creating driver')
    driver = webdriver.Firefox(options=options)
    print('Created driver')
    driver.set_page_load_timeout(10)
    # Not sure if we need this.  Better would be to wait for the value we care about.
    driver.implicitly_wait(10) # seconds
    return driver

def get_driver():
    if 1:
        return get_chromium_driver()
    else:
        return get_firefox_driver()
