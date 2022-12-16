# Seek for right element.
#   It should be near an anchor element (<a>) with innerHTML "7 day SEC yield".

import redis
from driver import get_driver
from scrape import scrape_all_funds_with_retries

kRedisDB = 5;

def main():
    driver = get_driver()
    r = redis.Redis(host='localhost', port=6379, db=5)
    failures = scrape_all_funds_with_retries(driver, r, 3)
    print(f'Failures: {failures}')
    driver.close()

if __name__ == '__main__':
    main()
