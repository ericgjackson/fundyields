# Try to fetch every day around 3:00 PM UTC which is 7:00 AM or 8:00 AM in the Pacific Time Zone,
# I think.  (It varies due to Daylight Savings Time.)
#
# Another way to compare date differences:
#   delta = now - last_date
#   print(delta.days)

import sys
import argparse
from datetime import datetime, timezone
# import redis
import time
from driver import get_driver
from scrape import scrape_all_funds_with_retries

def fetch(remote_host):
    driver = get_driver()
    if remote_host:
        r = None
    else:
        # r = redis.Redis(host='localhost', port=6379, db=5)
        print('No remote host not supported yet; need to install Redis module')
        sys.exit(-1)
    failures = scrape_all_funds_with_retries(driver, remote_host, r, 3)
    print(f'Failures: {failures}')
    sys.stdout.flush()
    driver.close()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', help='The host where the fundyields server is running')
    args = parser.parse_args()
    remote_host = args.host
    last_day_of_month = -1
    last_hour = -1
    while True:
        now = datetime.now(timezone.utc)
        # Complicated logic to decide whether or not to fetch
        # 1) If we have just started the program, then fetch.  Do this no matter what time of day
        #    it is.
        # 2) If we have already fetched on the current day at an hour >= 15 (UTC time), then we are
        #    up to date.  Do not fetch.
        # 3) If the hour is >= 15, then fetch.  Otherwise don't.
        # So, for example, if we fetched on 7/15 at 9:00 PM and it's now 10:00 AM on 7/16, do not
        # fetch (yet).
        if last_day_of_month == -1 and last_hour == -1:
            do_fetch = True
        elif last_day_of_month == now.day and last_hour >= 15:
            do_fetch = False
        elif now.hour >= 15:
            do_fetch = True
        else:
            do_fetch = False
        if do_fetch:
            fetch(remote_host)
            last_day_of_month = now.day
            last_hour = now.hour
        time.sleep(60)

if __name__ == '__main__':
    main()
