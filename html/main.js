import Cookies from './js.cookie.mjs';
import {makeAjaxRequest} from './ajax.js';

// This is the raw fund data returned from the server.  It does *not* reflect the user's
// sorting preferences.
var raw_mm_funds = [];
var raw_fi_funds = [];

// The field the user wants to sort on: 'name', 'ticker', 'sec_yield' or 'te_yield' currently.
var moneyMarketSortField = 'sec_yield';
// 'up', 'down' or null
var moneyMarketSortDirection = 'down';
var fixedIncomeSortField = null;
var fixedIncomeSortDirection = null;
// The taxable income of the user.  Used to determine their tax bracket.
let taxableIncome = null;
// The investment income of the user.  Needed to determine the impact of the Net Investment
// Income Tax (NIIT).
let investmentIncome = null;
// The state to which the user pays taxes.
let state = null;
// The filing status of the user: 'single', 'married_joint', 'married_separate' or
// 'head_of_household'.
let filingStatus = null;

// Determines what the sort order becomes when you click on the sort icon.  It cycles through
// "no sort", "up" and "down" in that order.
let nextSortDirection = function(d) {
    if (! d)            return 'up';
    else if (d == 'up') return 'down';
    else                return null;
};

// Handle a click on the sort icon.  Determines the new sort parameters and then calls
// renderPage().
let iconClick = function() {
    let clickedIcon = $(this);
    let clickedID = clickedIcon.attr('id');
    let cur;
    if (clickedID === 'mm-name-sort') {
	if (moneyMarketSortField === 'name') {
	    moneyMarketSortDirection = nextSortDirection(moneyMarketSortDirection);
	} else {
	    moneyMarketSortDirection = nextSortDirection(null);
	}
	moneyMarketSortField = 'name';
    } else if (clickedID === 'mm-ticker-sort') {
	if (moneyMarketSortField === 'ticker') {
	    moneyMarketSortDirection = nextSortDirection(moneyMarketSortDirection);
	} else {
	    moneyMarketSortDirection = nextSortDirection(null);
	}
	moneyMarketSortField = 'ticker';
    } else if (clickedID === 'mm-yield-sort') {
	if (moneyMarketSortField === 'sec_yield') {
	    moneyMarketSortDirection = nextSortDirection(moneyMarketSortDirection);
	} else {
	    moneyMarketSortDirection = nextSortDirection(null);
	}
	moneyMarketSortField = 'sec_yield';
    } else if (clickedID === 'mm-te-yield-sort') {
	if (moneyMarketSortField === 'te_yield') {
	    moneyMarketSortDirection = nextSortDirection(moneyMarketSortDirection);
	} else {
	    moneyMarketSortDirection = nextSortDirection(null);
	}
	moneyMarketSortField = 'te_yield';
    } else if (clickedID === 'fi-name-sort') {
	if (fixedIncomeSortField === 'name') {
	    fixedIncomeSortDirection = nextSortDirection(fixedIncomeSortDirection);
	} else {
	    fixedIncomeSortDirection = nextSortDirection(null);
	}
	fixedIncomeSortField = 'name';
    } else if (clickedID === 'fi-ticker-sort') {
	if (fixedIncomeSortField === 'ticker') {
	    fixedIncomeSortDirection = nextSortDirection(fixedIncomeSortDirection);
	} else {
	    fixedIncomeSortDirection = nextSortDirection(null);
	}
	fixedIncomeSortField = 'ticker';
    } else if (clickedID === 'fi-yield-sort') {
	if (fixedIncomeSortField === 'sec_yield') {
	    fixedIncomeSortDirection = nextSortDirection(fixedIncomeSortDirection);
	} else {
	    fixedIncomeSortDirection = nextSortDirection(null);
	}
	fixedIncomeSortField = 'sec_yield';
    } else if (clickedID === 'fi-te-yield-sort') {
	if (fixedIncomeSortField === 'te_yield') {
	    fixedIncomeSortDirection = nextSortDirection(fixedIncomeSortDirection);
	} else {
	    fixedIncomeSortDirection = nextSortDirection(null);
	}
	fixedIncomeSortField = 'te_yield';
    } else {
	console.log("Unknown clickedID: " + clickedID);
	return;
    }

    renderPage();
};

// TODO: make this a set
let states = [
    'california',
    'massachusetts',
    'new_jersey',
    'new_york'
];

// TODO: make this a set?
let filingStatuses = [
    'single',
    'married_separate',
    'married_joint',
    'head_of_household'
];

// fund is an object containing all the fund information from the server
// federalRate and stateRate are the user's marginal tax rates
// TODO: handle separately the cases where the user is itemizing deductions vs. not
let taxEquivalentYield = function(fund, federalRate, stateRate) {
    // Should we proceed if federalRate is non-null and stateRate is null?
    // Perhaps for users in a state for which we don't have data?  Maybe not.
    if (federalRate === null || stateRate === null) return null;
    // let debug = (fund['ticker'] === 'vyfxx');
    let debug = false;
    let rawYield = fund['sec_yield'];
    let exempt = fund['exempt'] || [];
    let usGovtObligations = fund['us_govt_obligations'] || 0.0;
    if (debug) {
	console.log('ticker ' + fund['ticker'] + ' fr ' + federalRate);
	console.log('sr ' + stateRate);
	console.log('ry ' + rawYield);
	console.log('usgo ' + usGovtObligations);
    }

    let federalExempt = exempt.includes('federal');
    // You are exempt from state taxes if the fund is exempt from *all* state taxes
    // (exempt.includes('state')) or if the fund is exempt from *your* state taxes
    // (exempt.includes(state)).
    let stateExempt = exempt.includes('state') || exempt.includes(state);

    // Calculate the tax equivalent yield in two steps:
    // 1) Calculate the after-tax yield of this fund;
    // 2) Work backwards to the pre-tax yield of a fully taxable fund that would have the same
    //    after-tax yield calculated in step (1).

    let applicableFederalRate = federalExempt ? 0.0 : federalRate;
    let applicableStateRate;
    if (stateExempt) {
	applicableStateRate = 0.0;
    } else {
	if (usGovtObligations > 0) {
	    if (state === 'california' || state === 'connecticut' || state === 'new_york') {
		if (fund['cactny_qualified']) {
		    applicableStateRate = stateRate * (1.0 - usGovtObligations);
		} else {
		    applicableStateRate = stateRate;
		}
	    } else {
		applicableStateRate = stateRate * (1.0 - usGovtObligations);
	    }
	} else {
	    applicableStateRate = stateRate;
	}
    }

    // This is step (1) from above.
    // This assumes we are not itemizing deductions.  If we were we might do something like this
    // instead:
    //   let afterTaxYield = rawYield * (1.0 - applicableFederalRate) * (1.0 - applicableStateRate);
    let afterTaxYield = rawYield * (1.0 - applicableFederalRate - applicableStateRate);

    // This is step (2) from above.
    // Same comment about itemizing deductions applies here.
    let taxEquivalentYield = afterTaxYield / (1.0 - federalRate - stateRate);
    
    if (debug) {
	console.log('se ' + stateExempt);
	console.log('afr ' + applicableFederalRate + ' asr ' + applicableStateRate);
	console.log('aty ' + afterTaxYield);
	console.log('tey ' + taxEquivalentYield);
    }
    
    return taxEquivalentYield;
};

// Returns the marginal federal and state tax rates for the user.
let getRates = function() {
    // Check that taxableIncome non-negative?  And is a number?
    let valid = taxableIncome !== null && taxableIncome != NaN &&
	states.includes(state) && filingStatus.includes(filingStatus)
    if (! valid) return [null, null];

    let federalRate;
    // Source: https://www.forbes.com/advisor/taxes/taxes-federal-income-tax-bracket
    if (filingStatus === 'married_joint') {
	if (taxableIncome <= 22000)       federalRate = 0.1;
	else if (taxableIncome <= 89450)  federalRate = 0.12;
	else if (taxableIncome <= 190750) federalRate = 0.22;
	else if (taxableIncome <= 364200) federalRate = 0.24;
	else if (taxableIncome <= 462500) federalRate = 0.32;
	else if (taxableIncome <= 693750) federalRate = 0.35;
	else                              federalRate = 0.37;
    } else if (filingStatus === 'married_separate') {
	if (taxableIncome <= 11000)       federalRate = 0.1;
	else if (taxableIncome <= 44725)  federalRate = 0.12;
	else if (taxableIncome <= 95375)  federalRate = 0.22;
	else if (taxableIncome <= 182100) federalRate = 0.24;
	else if (taxableIncome <= 231250) federalRate = 0.32;
	else if (taxableIncome <= 346875) federalRate = 0.35;
	else                              federalRate = 0.37;
    } else if (filingStatus === 'single') {
	if (taxableIncome <= 10275)       federalRate = 0.1;
	else if (taxableIncome <= 41775)  federalRate = 0.12;
	else if (taxableIncome <= 89075)  federalRate = 0.22;
	else if (taxableIncome <= 170050) federalRate = 0.24;
	else if (taxableIncome <= 215950) federalRate = 0.32;
	else if (taxableIncome <= 539900) federalRate = 0.35;
	else                              federalRate = 0.37;
    } else if (filingStatus === 'head_of_household') {
	if (taxableIncome <= 14650)       federalRate = 0.1;
	else if (taxableIncome <= 55900)  federalRate = 0.12;
	else if (taxableIncome <= 89050)  federalRate = 0.22;
	else if (taxableIncome <= 170050) federalRate = 0.24;
	else if (taxableIncome <= 215950) federalRate = 0.32;
	else if (taxableIncome <= 539900) federalRate = 0.35;
	else                              federalRate = 0.37;
    }
    
    // Do we need a filing status for "qualifying widower with dependent child"?
    let niit_threshold;
    if (filingStatus === 'married_joint') {
	niit_threshold = 250000;
    } else if (filingStatus === 'married_separate') {
	niit_threshold = 125000;
    } else if (filingStatus === 'single') {
	niit_threshold = 200000;
    } else if (filingStatus === 'head_of_household') {
	niit_threshold = 250000;
    }
    if (investmentIncome >= niit_threshold) {
	// TODO: is this correct?  We are interested in new investments at the margin.  So 100%
	// of the income will be subject to NIIT if you qualify.
	// TODO: I guess in theory we would need to see if this marginal investment brings you
	// over the qualifying threshold for NIIT?  Meh.
	federalRate += 0.038;
    }

    let stateRate = 0;
    if (state === 'california') {
	if (filingStatus === 'single') {
	    if (taxableIncome <= 10099)       stateRate = 0.01;
	    else if (taxableIncome <= 23942)  stateRate = 0.02;
	    else if (taxableIncome <= 37788)  stateRate = 0.04;
	    else if (taxableIncome <= 52455)  stateRate = 0.06;
	    else if (taxableIncome <= 66295)  stateRate = 0.08;
	    else if (taxableIncome <= 338639) stateRate = 0.093;
	    else if (taxableIncome <= 406364) stateRate = 0.103;
	    else if (taxableIncome <= 677275) stateRate = 0.113;
	    else                              stateRate = 0.123;
	} else if (filingStatus === 'married_joint') {
	    if (taxableIncome <= 20198)        stateRate = 0.01;
	    else if (taxableIncome <= 47884)   stateRate = 0.02;
	    else if (taxableIncome <= 75576)   stateRate = 0.04;
	    else if (taxableIncome <= 104910)  stateRate = 0.06;
	    else if (taxableIncome <= 132590)  stateRate = 0.08;
	    else if (taxableIncome <= 677278)  stateRate = 0.093;
	    else if (taxableIncome <= 812728)  stateRate = 0.103;
	    else if (taxableIncome <= 1354550) stateRate = 0.113;
	    else                               stateRate = 0.123;
	} else if (filingStatus === 'married_separate') {
	    if (taxableIncome <= 10099)        stateRate = 0.01;
	    else if (taxableIncome <= 23942)   stateRate = 0.02;
	    else if (taxableIncome <= 37788)   stateRate = 0.04;
	    else if (taxableIncome <= 52455)   stateRate = 0.06;
	    else if (taxableIncome <= 66295)   stateRate = 0.08;
	    else if (taxableIncome <= 338639)  stateRate = 0.093;
	    else if (taxableIncome <= 406364)  stateRate = 0.103;
	    else if (taxableIncome <= 677275)  stateRate = 0.113;
	    else                               stateRate = 0.123;
	} else if (filingStatus === 'head_of_household') {
	    if (taxableIncome <= 20212)        stateRate = 0.01;
	    else if (taxableIncome <= 47887)   stateRate = 0.02;
	    else if (taxableIncome <= 61730)   stateRate = 0.04;
	    else if (taxableIncome <= 76397)   stateRate = 0.06;
	    else if (taxableIncome <= 90240)   stateRate = 0.08;
	    else if (taxableIncome <= 460547)  stateRate = 0.093;
	    else if (taxableIncome <= 552658)  stateRate = 0.103;
	    else if (taxableIncome <= 921095)  stateRate = 0.113;
	    else                               stateRate = 0.123;
	}
    } else if (state === 'new_york') {
	if (filingStatus === 'single') {
	    if (taxableIncome <= 8500)          stateRate = 0.04;
	    else if (taxableIncome <= 11700)    stateRate = 0.045;
	    else if (taxableIncome <= 13900)    stateRate = 0.0525;
	    else if (taxableIncome <= 80650)    stateRate = 0.0585;
	    else if (taxableIncome <= 215400)   stateRate = 0.0625;
	    else if (taxableIncome <= 1077550)  stateRate = 0.0685;
	    else if (taxableIncome <= 5000000)  stateRate = 0.0965;
	    else if (taxableIncome <= 25000000) stateRate = 0.103;
	    else                                stateRate = 0.109;
	} else if (filingStatus === 'married_joint') {
	    if (taxableIncome <= 17150)         stateRate = 0.04;
	    else if (taxableIncome <= 23600)    stateRate = 0.045;
	    else if (taxableIncome <= 27900)    stateRate = 0.0525;
	    else if (taxableIncome <= 161550)   stateRate = 0.0585;
	    else if (taxableIncome <= 323200)   stateRate = 0.0625;
	    else if (taxableIncome <= 2155350)  stateRate = 0.0685;
	    else if (taxableIncome <= 5000000)  stateRate = 0.0965;
	    else if (taxableIncome <= 25000000) stateRate = 0.103;
	    else                                stateRate = 0.109;
	} else if (filingStatus === 'married_separate') {
	    if (taxableIncome <= 8500)          stateRate = 0.04;
	    else if (taxableIncome <= 11700)    stateRate = 0.045;
	    else if (taxableIncome <= 13900)    stateRate = 0.0525;
	    else if (taxableIncome <= 80650)    stateRate = 0.0585;
	    else if (taxableIncome <= 215400)   stateRate = 0.0625;
	    else if (taxableIncome <= 1077550)  stateRate = 0.0685;
	    else if (taxableIncome <= 5000000)  stateRate = 0.0965;
	    else if (taxableIncome <= 25000000) stateRate = 0.103;
	    else                                stateRate = 0.109;
	} else if (filingStatus === 'head_of_household') {
	    if (taxableIncome <= 12800)         stateRate = 0.04;
	    else if (taxableIncome <= 17650)    stateRate = 0.045;
	    else if (taxableIncome <= 20900)    stateRate = 0.0525;
	    else if (taxableIncome <= 107650)   stateRate = 0.0585;
	    else if (taxableIncome <= 269300)   stateRate = 0.0625;
	    else if (taxableIncome <= 1616450)  stateRate = 0.0685;
	    else if (taxableIncome <= 5000000)  stateRate = 0.0965;
	    else if (taxableIncome <= 25000000) stateRate = 0.103;
	    else                                stateRate = 0.109;
	}
    }

    return [federalRate, stateRate];
};

let renderPage = function() {
    let row, cell;
    let sortIcon;

    // Render the table header of each table first
    
    row = $('<tr>');
    $('#money_market_table_head').empty();
    $('#money_market_table_head').append(row);
    
    cell = $('<th>');
    if (moneyMarketSortField == 'name' && moneyMarketSortDirection) {
	if (moneyMarketSortDirection == 'up') sortIcon = 'fa-sort-up';
	else                                  sortIcon = 'fa-sort-down';
    } else {
	sortIcon = 'fa-sort';
    }
    cell.html('NAME <i id="mm-name-sort" class="fas ' + sortIcon + '"></i>');
    row.append(cell);
    
    cell = $('<th>');
    if (moneyMarketSortField == 'ticker' && moneyMarketSortDirection) {
	if (moneyMarketSortDirection == 'up') sortIcon = 'fa-sort-up';
	else                                  sortIcon = 'fa-sort-down';
    } else {
	sortIcon = 'fa-sort';
    }
    cell.html('TICKER <i id="mm-ticker-sort" class="fas ' + sortIcon + '"></i>');
    row.append(cell);
    
    cell = $('<th>');
    if (moneyMarketSortField == 'sec_yield' && moneyMarketSortDirection) {
	if (moneyMarketSortDirection == 'up') sortIcon = 'fa-sort-up';
	else                                  sortIcon = 'fa-sort-down';
    } else {
	sortIcon = 'fa-sort';
    }
    cell.html('<div title="The 7-day yield is the annualized yield calculated from the income earned by the fund over the last seven days.">7-DAY YIELD <i id="mm-yield-sort" class="fas ' + sortIcon + '"></i></div>');
    row.append(cell);
    
    if (moneyMarketSortField == 'te_yield' && moneyMarketSortDirection) {
	if (moneyMarketSortDirection == 'up') sortIcon = 'fa-sort-up';
	else                                  sortIcon = 'fa-sort-down';
    } else {
	sortIcon = 'fa-sort';
    }
    cell = $('<th>');
    let html = '<div title="The tax-equivalent yield is the yield of a fully taxable fund that would have the same after-tax yield as this fund.">TAX EQUIVALENT YIELD <i id="mm-te-yield-sort" class="fas ' + sortIcon + '"></i></div>'
    // let html = 'TAX EQUIVALENT YIELD <i class="fas fa-question-circle"></i> <i id="mm-te-yield-sort" class="fas ' + sortIcon + '"></i>'
    // let html = 'TAX EQUIVALENT YIELD <i id="mm-te-yield-sort" class="fas ' + sortIcon + '"></i>'
    // html += ' <div class="help_icon" title="Help text goes here."></div>'
    cell.html(html);
    row.append(cell);
    

    row = $('<tr>');
    $('#fixed_income_table_head').empty();
    $('#fixed_income_table_head').append(row);
    
    cell = $('<th>');
    if (fixedIncomeSortField == 'name' && fixedIncomeSortDirection) {
	if (fixedIncomeSortDirection == 'up') sortIcon = 'fa-sort-up';
	else                                  sortIcon = 'fa-sort-down';
    } else {
	sortIcon = 'fa-sort';
    }
    cell.html('NAME <i id="fi-name-sort" class="fas ' + sortIcon + '"></i>');
    row.append(cell);
    
    cell = $('<th>');
    if (fixedIncomeSortField == 'ticker' && fixedIncomeSortDirection) {
	if (fixedIncomeSortDirection == 'up') sortIcon = 'fa-sort-up';
	else                                  sortIcon = 'fa-sort-down';
    } else {
	sortIcon = 'fa-sort';
    }
    cell.html('TICKER <i id="fi-ticker-sort" class="fas ' + sortIcon + '"></i>');
    row.append(cell);
    
    cell = $('<th>');
    if (fixedIncomeSortField == 'sec_yield' && fixedIncomeSortDirection) {
	if (fixedIncomeSortDirection == 'up') sortIcon = 'fa-sort-up';
	else                                  sortIcon = 'fa-sort-down';
    } else {
	sortIcon = 'fa-sort';
    }
    cell.html('30-DAY YIELD <i id="fi-yield-sort" class="fas ' + sortIcon + '"></i>');
    row.append(cell);

    cell = $('<th>');
    if (fixedIncomeSortField == 'te_yield' && fixedIncomeSortDirection) {
	if (fixedIncomeSortDirection == 'up') sortIcon = 'fa-sort-up';
	else                                  sortIcon = 'fa-sort-down';
    } else {
	sortIcon = 'fa-sort';
    }
    cell.html('TAX EQUIVALENT YIELD <i id="fi-te-yield-sort" class="fas ' + sortIcon + '"></i>');
    row.append(cell);

    let federalRate, stateRate;
    [federalRate, stateRate] = getRates();
    let summaryText = "Federal Marginal Tax Rate: " + 100.0 * federalRate + "%.  State Marginal Tax Rate: " + 100.0 * stateRate + "%.";
    if (federalRate !== null && stateRate !== null) {
	$('#summary').text(summaryText);
    } else {
	$('#summary').text('');
    }
    
    raw_mm_funds.forEach(function(fund) {
	fund['te_yield'] = taxEquivalentYield(fund, federalRate, stateRate);
    });
    raw_fi_funds.forEach(function(fund) {
	fund['te_yield'] = taxEquivalentYield(fund, federalRate, stateRate);
    });
    
    let mm_funds = raw_mm_funds.map(function(fund) {return fund;});
    // Sort the funds as needed
    if (moneyMarketSortField && moneyMarketSortDirection) {
	mm_funds.sort(function(a, b) {
	    if (moneyMarketSortDirection === 'up') {
		if (a[moneyMarketSortField] > b[moneyMarketSortField]) return 1;
		if (a[moneyMarketSortField] < b[moneyMarketSortField]) return -1;
		return 0;
	    } else {
		if (a[moneyMarketSortField] > b[moneyMarketSortField]) return -1;
		if (a[moneyMarketSortField] < b[moneyMarketSortField]) return 1;
		return 0;
	    }
	});
    }
    
    let fi_funds = raw_fi_funds.map(function(fund) {return fund;});
    if (fixedIncomeSortField && fixedIncomeSortDirection) {
	fi_funds.sort(function(a, b) {
	    if (fixedIncomeSortDirection === 'up') {
		if (a[fixedIncomeSortField] > b[fixedIncomeSortField]) return 1;
		if (a[fixedIncomeSortField] < b[fixedIncomeSortField]) return -1;
		return 0;
	    } else {
		if (a[fixedIncomeSortField] > b[fixedIncomeSortField]) return -1;
		if (a[fixedIncomeSortField] < b[fixedIncomeSortField]) return 1;
		return 0;
	    }
	});
    }

    // Render the table bodies
    
    $('#money_market_table_body').empty();
    mm_funds.forEach(function(fund) {
	let ticker = fund['ticker'];
	let name = fund['name'];
	let secYield = fund['sec_yield']
	let teYield = fund['te_yield']
	let assetClass = fund['asset_class']
	let url = fund['url']
	let row = $('<tr>');
	let cell;
	cell = $('<td>');
	cell.html('<a href=' + url + '>' + name + '</a>')
	row.append(cell);
	cell = $('<td>');
	cell.html(ticker.toUpperCase())
	row.append(cell);
	cell = $('<td>');
	cell.html(secYield.toFixed(2) + '%')
	row.append(cell);
	cell = $('<td>');
	if (teYield === null) cell.html('-')
	else                  cell.html(teYield.toFixed(2) + '%')
	row.append(cell);
	$('#money_market_table_body').append(row)
    })

    $('#fixed_income_table_body').empty();
    fi_funds.forEach(function(fund) {
	let ticker = fund['ticker'];
	let name = fund['name'];
	let secYield = fund['sec_yield']
	let teYield = fund['te_yield']
	let assetClass = fund['asset_class']
	let url = fund['url']
	let row = $('<tr>');
	let cell;
	cell = $('<td>');
	cell.html('<a href=' + url + '>' + name + '</a>')
	row.append(cell);
	cell = $('<td>');
	cell.html(ticker.toUpperCase())
	row.append(cell);
	cell = $('<td>');
	cell.html(secYield.toFixed(2) + '%')
	row.append(cell);
	cell = $('<td>');
	if (teYield === null) cell.html('-')
	else                  cell.html(teYield.toFixed(2) + '%')
	row.append(cell);
	$('#fixed_income_table_body').append(row)
    })

    // Set up click handlers for the sort icons
    // I think I need to redo this every time renderPage() is called
    $('#mm-name-sort').click(iconClick);
    $('#mm-ticker-sort').click(iconClick);
    $('#mm-yield-sort').click(iconClick);
    $('#mm-te-yield-sort').click(iconClick);
    $('#fi-name-sort').click(iconClick);
    $('#fi-ticker-sort').click(iconClick);
    $('#fi-yield-sort').click(iconClick);
    $('#fi-te-yield-sort').click(iconClick);
};

let getResponse = function(data) {
    console.log(data);

    raw_mm_funds = [];
    raw_fi_funds = [];
    data.forEach(function(fund) {
	if (fund['asset_class'] === 'money_market') {
	    raw_mm_funds.push(fund);
	} else if (fund['asset_class'] === 'fixed_income') {
	    raw_fi_funds.push(fund);
	} else {
	    console.log('Unknown asset class: ' + assetClass + '; ticker: ' + fund['ticker']);
	}
    })
    
    renderPage();
};

let stateChange = function(event, ui) {
    state = $(this).val();
    Cookies.set('state', state)
    renderPage();
};

let filingStatusChange = function(event, ui) {
    filingStatus = $(this).val();
    Cookies.set('filingStatus', filingStatus)
    renderPage();
};

var taxableTimerID;

// Based on: https://stackoverflow.com/questions/6153047/detect-changed-input-text-box
// TODO: does this work when we clear the text box?
let taxableIncomeChange = function(event) {
    var value = $(this).val();
    if ($(this).data('lastval') != value) {
	$(this).data('lastval', value);
	clearTimeout(taxableTimerID);
	taxableTimerID = setTimeout(function() {
	    // your change action goes here 
	    let cleanValue = value.replaceAll(',', '')
	    // TODO: need to check for NaN?
	    taxableIncome = parseFloat(cleanValue);
	    Cookies.set('taxableIncome', taxableIncome.toFixed(0));
	    renderPage();
	}, 500);
    };
};

var investmentTimerID;

// Based on: https://stackoverflow.com/questions/6153047/detect-changed-input-text-box
let investmentIncomeChange = function(event) {
    var value = $(this).val();
    if ($(this).data('lastval') != value) {
	$(this).data('lastval', value);
	clearTimeout(investmentTimerID);
	investmentTimerID = setTimeout(function() {
	    // your change action goes here 
	    let cleanValue = value.replaceAll(',', '')
	    // TODO: need to check for NaN?
	    investmentIncome = parseFloat(cleanValue);
	    Cookies.set('investmentIncome', investmentIncome.toFixed(0));
	    renderPage();
	}, 500);
    };
};

var activateTab = function(event, ui) {
    if (ui.newPanel.selector === "#tabs-min-data") {
	// ?
    } else if (ui.newPanel.selector === "#tabs-min-help") {
	// ?
    }
};

var main = function() {
    $("#tabs-min").on("tabsactivate", function(event, ui) {
	activateTab(event, ui);
    });

    $("#tabs-min").tabs();
    
    $('#state').selectmenu({
	width: 200,
	change: stateChange
    });
    $('#filing_status').selectmenu({
	width: 200,
	change: filingStatusChange
    });
    $('#taxable_income').on('input', taxableIncomeChange);
    $('#investment_income').on('input', investmentIncomeChange);

    state = Cookies.get('state');
    if (state) {
	// Can I do this when the selectmenu is initialized above?
	$('#state').val(state).selectmenu("refresh");
    }
    filingStatus = Cookies.get('filingStatus');
    if (filingStatus) {
	// Can I do this when the selectmenu is initialized above?
	$('#filing_status').val(filingStatus).selectmenu("refresh");
    }

    let taxableIncomeStr = Cookies.get('taxableIncome');
    let ti = parseFloat(taxableIncomeStr);
    if (! isNaN(ti)) {
	taxableIncome = ti;
	$('#taxable_income').val(taxableIncome.toFixed(0));
    }
    
    let investmentIncomeStr = Cookies.get('investmentIncome');
    let ii = parseFloat(investmentIncomeStr);
    if (! isNaN(ii)) {
	investmentIncome = ii;
	$('#investment_income').val(investmentIncome.toFixed(0));
    }
    
    makeAjaxRequest('get', {}, getResponse);
};

$(document).ready(main);
