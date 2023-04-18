import sys
from driver import get_driver
from funds import funds

def main():
    arguments = sys.argv[1:]
    if len(arguments) == 0:
        print('Supply (lower-case) ticker as the first argument to the script')
        sys.exit(-1)
    ticker = arguments[0]
    driver = get_driver()
    matching = [fund for fund in funds if fund['ticker'] == ticker]
    if len(matching) == 0:
        print(f'No fund with ticker {ticker}')
        sys.exit(-1)
    fund = matching[0]
    tail = fund.get('tail', fund['ticker'])
    url = f'https://fundresearch.fidelity.com/mutual-funds/performance-and-risk/{tail}'
    try:
        driver.get(url)
    except TimeoutException:
        print(f'Timeout trying to fetch URL: {url}')
        return -1
    print(driver.page_source)
    driver.close()

if __name__ == '__main__':
    main()
