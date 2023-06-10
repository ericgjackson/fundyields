import sys
import copy
from datetime import datetime
import json
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
from funds import funds

def parse_percentage(str):
    if not str:
        return -1.0
    if str[-1] != '%':
        return -1.0
    return float(str[0:len(str)-1])

def get_sec_yield_vanguard(driver, ticker):
    # Navigate to the specified URL
    url = 'https://investor.vanguard.com/investment-products/mutual-funds/profile/' + ticker
    try:
        driver.get(url)
    except TimeoutException:
        print(f'Timeout trying to fetch URL: {url}')
        return -1

    try:
        element21216111 = driver.find_element(By.XPATH, "//*[@id='price_section']/div[2]/app-closing-price[1]/div[2]/div[1]/div[6]/div[1]/h4[1]/h4[1]")
    except NoSuchElementException:
        print(f'Could not find SEC yield in scraped web page for ticker {ticker}')
        return -1

    # For example: 1.44%
    yield_text = element21216111.get_attribute('innerHTML').strip()
    if '<a' in yield_text:
        a_element = element21216111.find_element(By.XPATH, './a[1]')
        yield_text = a_element.get_attribute('innerHTML').strip()
    
    try:
        yield_pct = parse_percentage(yield_text)
        if yield_pct == -1.0:
            print(f'Could not parse SEC yield {yield_text} for {ticker}')
        return yield_pct
    except ValueError:
        print(f'Could not parse SEC yield {yield_text} for {ticker}')
        return -1

def get_sec_yield_fidelity(driver, id, fund):
    url = f'https://fundresearch.fidelity.com/mutual-funds/performance-and-risk/{id}'
    try:
        driver.get(url)
    except TimeoutException:
        print(f'Timeout trying to fetch URL: {url}')
        return -1

    cards = driver.find_elements(By.TAG_NAME, 'mfl-yield-card')
    if len(cards) != 1:
        print(f'Unexpected number of card elements: {len(cards)}')
        return -1
    card = cards[0]
    tbodies = card.find_elements(By.TAG_NAME, 'tbody')
    if len(tbodies) != 1:
        print(f'Unexpected number of tbody elements: {len(tbodies)}')
        return -1
    tbody = tbodies[0]
    trs = tbody.find_elements(By.TAG_NAME, 'tr')
    if len(trs) < 2:
        print(f'Unexpected number of tr elements: {len(trs)}')
        return -1
    # For Money Market funds, the second row contains the 7-day yield.  For Bond funds, the
    # first row contains the 30-day yield.
    if fund['asset_class'] == 'money_market':
        tr = trs[1]
    else:
        tr = trs[0]
    tds = tr.find_elements(By.TAG_NAME, 'td')
    if len(tds) < 2:
        print(f'Unexpected number of td elements: {len(tds)}')
        return -1
    # Want the second item
    td = tds[1]
    yield_text = td.get_attribute('innerHTML').strip()
    try:
        return parse_percentage(yield_text)
    except ValueError:
        print(f'Could not parse SEC yield {yield_text} for id {id}')
        return -1

def old_get_sec_yield_fidelity(driver, id):
    # Navigate to the specified URL
    # url = f'https://fundresearch.fidelity.com/mutual-funds/summary/{id}'
    url = f'https://fundresearch.fidelity.com/mutual-funds/performance-and-risk/{id}'
    try:
        driver.get(url)
    except TimeoutException:
        print(f'Timeout trying to fetch URL: {url}')
        return -1
    
    tr_elements = driver.find_elements(By.XPATH, "//*[@class='yield-table']/tbody[1]/tr[*]");
    for tr_element in tr_elements:
        lig_element = tr_element.find_element(By.XPATH, ".//line-item-glossary[1]")
        value = lig_element.get_attribute('value')
        label = json.loads(value)['label'].strip()
        if (label == '7-Day Yield' or label == '30-Day Yield'):
            td_element = tr_element.find_element(By.XPATH, "./td[2]")
            yield_text = td_element.text.strip()
            try:
                return parse_percentage(yield_text)
            except ValueError:
                print(f'Could not parse SEC yield {yield_text} for id {id}')
                return -1

    return -1

def get_sec_yield_schwab(driver, ticker):
    url = f'https://www.schwabassetmanagement.com/products/{ticker}'
    
    try:
        driver.get(url)
    except TimeoutException:
        print(f'Timeout trying to fetch URL: {url}')
        return -1

    div = driver.find_element(By.ID, 'sfm-table--yields')
    tr_elements = div.find_elements(By.XPATH, './/tr[*]')
    for tr_element in tr_elements:
        th_element = tr_element.find_element(By.XPATH, './th[1]')
        try:
            span_element = th_element.find_element(By.XPATH, './/span[1]')
            span_text = span_element.get_attribute('innerHTML').strip()
            if span_text == '7-Day Yield (with waivers)' or span_text == 'SEC Yield (30 Day)':
                td_element = tr_element.find_element(By.XPATH, './td[2]')
                yield_text = td_element.get_attribute('innerHTML').strip()
                try:
                    return parse_percentage(yield_text)
                except ValueError:
                    print(f'Could not parse SEC yield {yield_text} for {ticker}')
                    return -1
        except NoSuchElementException:
            continue
    
    return -1

def get_sec_yield(driver, fund):
    tail = fund.get('tail', fund['ticker'])
    company = fund['company']
    if company == 'vanguard':
        sec_yield = get_sec_yield_vanguard(driver, tail)
    elif company == 'fidelity':
        sec_yield = get_sec_yield_fidelity(driver, tail, fund)
    elif company == 'schwab':
        sec_yield = get_sec_yield_schwab(driver, tail)
    else:
        print(f'Unknown company: {company}')
        sec_yield = -1
    print(f'{fund["name"]} ({fund["ticker"].upper()}): {sec_yield}%')
    sys.stdout.flush()
    return sec_yield

def get_url(fund, tail):
    if fund['company'] == 'vanguard':
        return f'https://investor.vanguard.com/investment-products/mutual-funds/profile/{tail}'
    elif fund['company'] == 'fidelity':
        return f'https://fundresearch.fidelity.com/mutual-funds/summary/{tail}'
    elif fund['company'] == 'schwab':
        return f'https://www.schwabassetmanagement.com/products/{tail}'
    else:
        print(f'Unknown company {fund["company"]} for ticker {fund["ticker"]}')
        return ''

def scrape_fund(driver, ticker):
    matching = [fund for fund in funds if fund['ticker'] == ticker]
    if len(matching) == 0:
        print(f'No fund with ticker {ticker}')
        return -1
    return get_sec_yield(driver, matching[0])

def scrape_all_funds(driver, r, scrape_funds):
    failures = []

    for fund in scrape_funds:
        try:
            sec_yield = get_sec_yield(driver, fund)
        except Exception:
            print(f'Caught exception processing {fund["ticker"]}')
            sys.stdout.flush()
            sec_yield = -1
        if sec_yield == -1:
            failures.append(fund['ticker'])
            continue
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        record = copy.deepcopy(fund)
        record['sec_yield'] = sec_yield
        tail = fund.get('tail', fund['ticker'])
        record['url'] = get_url(fund, tail)
        record['updated'] = now
        json_record = json.dumps(record)
        print(record)
        r.set(fund['ticker'], json_record)

    return failures

def scrape_all_funds_with_retries(driver, r, attempts):
    attempt_funds = funds
    failures = []
    for attempt in range(0, attempts):
        print(f'Trying to scrape data for {len(attempt_funds)} funds')
        sys.stdout.flush()
        failures = scrape_all_funds(driver, r, attempt_funds)
        if not failures:
            return []
        attempt_funds = [f for f in funds if f['ticker'] in failures]
    return failures
