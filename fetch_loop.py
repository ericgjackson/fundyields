# Try to fetch every day around 4:00 PM UTC which is roughly 8:00 AM in the Pacific Time Zone.
# (Could vary a bit due to Daylight Savings Time.)
#
# Another way to compare date differences:
#   delta = now - last_date
#   print(delta.days)

import sys
import argparse
from datetime import datetime
import redis
import time
from driver import get_driver
from scrape import scrape_all_funds_with_retries

def fetch(remote_host):
    driver = get_driver()
    if remote_host:
        r = None
    else:
        r = redis.Redis(host='localhost', port=6379, db=5)
    failures = scrape_all_funds_with_retries(driver, remote_host, r, 3)
    print(f'Failures: {failures}')
    sys.stdout.flush()
    driver.close()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', help='The host where the fundyields server is running')
    args = parser.parse_args()
    remote_host = args.host
    last_day = ''
    while True:
        now = datetime.utcnow()
        day = now.strftime('%Y-%m-%d')
        # Process if:
        # 1) We have just started the program.  Do this no matter what time of day it is.
        # 2) We are on a different date (in UTC time) from the last time we fetched and the hour is
        #    >= 15.
        do_fetch = last_day == '' or (day != last_day and now.hour >= 15)
        if do_fetch:
            fetch(remote_host)
            last_day = now.strftime('%Y-%m-%d')
        time.sleep(60)

if __name__ == '__main__':
    main()
