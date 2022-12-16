import redis
import time
from driver import get_driver
from scrape import scrape_all_funds

def main():
    while True:
        driver = get_driver()
        r = redis.Redis(host='localhost', port=6379, db=5)
        failures = scrape_all_funds_with_retries(driver, r, 3)
        print(f'Failures: {failures}')
        driver.close()
        time.sleep(86400)

if __name__ == '__main__':
    main()
