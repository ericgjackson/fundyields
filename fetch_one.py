import sys
from driver import get_driver
from scrape import scrape_fund

def main():
    arguments = sys.argv[1:]
    if len(arguments) == 0:
        print('Supply (lower-case) ticker as the first argument to the script')
        sys.exit(-1)
    ticker = arguments[0]
    driver = get_driver()
    sec_yield = scrape_fund(driver, ticker)
    print(f'SEC yield: {sec_yield}')
    driver.close()

if __name__ == '__main__':
    main()
