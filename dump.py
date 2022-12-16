from datetime import datetime
import json
import redis
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import sys
import time

def fidelity():
    # 316203835
    # 31617H201
    url = f'https://fundresearch.fidelity.com/mutual-funds/performance-and-risk/31617H201'
    # url = f'https://fundresearch.fidelity.com/mutual-funds/performance-and-risk/316203835'
    try:
        driver.get(url)
    except TimeoutException:
        print(f'Timeout trying to fetch URL: {url}')
        return -1
    
    # element = driver.find_element(By.XPATH, "//*[@class='yield-table']/tbody[1]/tr[2]/td[2]");
    # element = driver.find_element(By.XPATH, "//*[@class='yield-table']/tbody[1]");
    # element = driver.find_element(By.XPATH, "//*[@class='yield-table']/tbody[1]/tr[3]");
    yield_text = ''
    tr_elements = driver.find_elements(By.XPATH, "//*[@class='yield-table']/tbody[1]/tr[*]");
    for tr_element in tr_elements:
        lig_element = tr_element.find_element(By.XPATH, ".//line-item-glossary[1]")
        html = lig_element.get_attribute('outerHTML')
        # print(html)
        value = lig_element.get_attribute('value')
        # print(value)
        json_value = json.loads(value)
        # Catch exception here?
        label = json_value['label'].strip()
        # print(label)
        if (label == '7-Day Yield' or label == '30-Day Yield'):
            td_element = tr_element.find_element(By.XPATH, "./td[2]")
            # print(td_element.get_attribute('outerHTML'))
            yield_text = td_element.text
            break
    print(yield_text)
    

def main():
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

    # url = 'https://www.schwabassetmanagement.com/products/sutxx'
    url = 'https://www.schwabassetmanagement.com/products/swcax'
    
    try:
        driver.get(url)
    except TimeoutException:
        print(f'Timeout trying to fetch URL: {url}')
        return

    # print(driver.page_source)
    div = driver.find_element(By.ID, 'sfm-table--yields')
    # print(div.get_attribute('outerHTML'))
    tr_elements = div.find_elements(By.XPATH, './/tr[*]')
    for tr_element in tr_elements:
        print(tr_element.get_attribute('outerHTML'))
        print('------------')
        th_element = tr_element.find_element(By.XPATH, './th[1]')
        print(th_element.get_attribute('outerHTML'))
        print('------------')
        try:
            span_element = th_element.find_element(By.XPATH, './/span[1]')
            span_text = span_element.get_attribute('innerHTML').strip()
            print(span_text)
            print('------------')
            if span_text == '7-Day Yield (with waivers)' or span_text == 'SEC Yield (30 Day)':
                td_element = tr_element.find_element(By.XPATH, './td[2]')
                td_text = td_element.get_attribute('innerHTML').strip()
                print(td_text)
                print('------------')
        except NoSuchElementException:
            print('No span')
            print('------------')
        print('-----------------------------')

if __name__ == '__main__':
    main()
