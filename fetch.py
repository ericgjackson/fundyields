import argparse
import redis
from driver import get_driver
from scrape import scrape_all_funds_with_retries

kRedisDB = 5;

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', help='The host where the fundyields server is running')
    args = parser.parse_args()
    remote_host = args.host
    driver = get_driver()
    if remote_host:
        r = None
    else:
        r = redis.Redis(host='localhost', port=6379, db=5)
    failures = scrape_all_funds_with_retries(driver, remote_host, r, 3)
    print(f'Failures: {failures}')
    driver.close()

if __name__ == '__main__':
    main()
