import sys
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
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
        sys.exit(-1)
    # card_elements = driver.find_elements_by_tag_name('mfl-yield-card')
    cards = driver.find_elements(By.TAG_NAME, 'mfl-yield-card')
    if len(cards) != 1:
        print(f'Unexpected number of card elements: {len(cards)}')
        sys.exit(-1)
    card = cards[0]
    tbodies = card.find_elements(By.TAG_NAME, 'tbody')
    if len(tbodies) != 1:
        print(f'Unexpected number of tbody elements: {len(tbodies)}')
        sys.exit(-1)
    tbody = tbodies[0]
    trs = tbody.find_elements(By.TAG_NAME, 'tr')
    if len(trs) < 2:
        print(f'Unexpected number of tr elements: {len(trs)}')
        sys.exit(-1)
    # For Money Market funds, the second row contains the 7-day yield.  For Bond funds, the
    # first row contains the 30-day yield.
    if fund['asset_class'] == 'money_market':
        tr = trs[1]
    else:
        tr = trs[0]
    tds = tr.find_elements(By.TAG_NAME, 'td')
    if len(tds) < 2:
        print(f'Unexpected number of td elements: {len(tds)}')
        sys.exit(-1)
    # Note: want the second item
    td = tds[1]
    yield_text = td.get_attribute('innerHTML').strip()
    print(yield_text)
    driver.close()

if __name__ == '__main__':
    main()
