from driver import get_driver
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By

def main():
    driver = get_driver()
    # url = 'https://www.schwab.com/client-home'
    # url = 'https://bogleheads.org'
    # url = 'https://moneymarket.fun/d/snsxx'
    url = 'https://moneymarket.fun/d/flgxx'
    
    try:
        driver.get(url)
    except TimeoutException:
        print(f'Timeout trying to fetch URL: {url}')
        return -1

    # page_source = driver.page_source
    # print(page_source)

    # div = driver.find_element(By.ID, 'stat-value')
    try:
        div = driver.find_element(By.CLASS_NAME, 'stat-value')
    except NoSuchElementException:
        print("Could not find stat-value div");
        return -1
    
    print(div.text)

    driver.close()

if __name__ == '__main__':
    main()
