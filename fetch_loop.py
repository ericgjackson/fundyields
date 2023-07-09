import sys
import argparse
import redis
import time
from driver import get_driver
from scrape import scrape_all_funds_with_retries

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', help='The host where the fundyields server is running')
    args = parser.parse_args()
    remote_host = args.host
    while True:
        driver = get_driver()
        if remote_host:
            r = None
        else:
            r = redis.Redis(host='localhost', port=6379, db=5)
        failures = scrape_all_funds_with_retries(driver, remote_host, r, 3)
        print(f'Failures: {failures}')
        sys.stdout.flush()
        driver.close()
        time.sleep(86400)

if __name__ == '__main__':
    main()
