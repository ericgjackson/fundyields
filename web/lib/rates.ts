import {
  filingStatuses,
  states,
} from '@/constants';

export const getNIIT = (
  filingStatus: string,
  investmentIncomeStr: string,
) => {
  if (! investmentIncomeStr) {
    return 0;
  }
  const investmentIncome = investmentIncomeStr ? parseInt(investmentIncomeStr, 10) : 0;
    // Do we need a filing status for "qualifying widower with dependent child"?
    let niit_threshold: number;
    if (filingStatus === 'married_joint') {
	niit_threshold = 250000;
    } else if (filingStatus === 'married_separate') {
	niit_threshold = 125000;
    } else if (filingStatus === 'single') {
	niit_threshold = 200000;
    } else if (filingStatus === 'head_of_household') {
	niit_threshold = 250000;
    } else {
        // No good choice here
	niit_threshold = 250000;
    }
    if (investmentIncome >= niit_threshold) {
	// TODO: is this correct?  We are interested in new investments at the margin.  So 100%
	// of the income will be subject to NIIT if you qualify.
	// TODO: I guess in theory we would need to see if this marginal investment brings you
	// over the qualifying threshold for NIIT?  Meh.
	return 0.038;
    } else {
        return 0;
    }
};

// Returns the marginal federal and state tax rates for the user.
export const getRates = (
  filingStatus: string,
  state: string|null,
  taxableIncomeStr: string,
  investmentIncomeStr: string,
) => {
    // Check that taxableIncome non-negative?  And is a number?
    let valid = taxableIncomeStr !== null && state && states.includes(state) &&
      filingStatuses.includes(filingStatus)
    if (! valid) return [null, null];
    const taxableIncome = taxableIncomeStr ? parseInt(taxableIncomeStr, 10) : 0;
    const investmentIncome = investmentIncomeStr ? parseInt(investmentIncomeStr, 10) : 0;

    let federalRate = 0;
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

    // Increase the federal rate to account for the NIIT, if anny.
    federalRate += getNIIT(filingStatus, investmentIncomeStr);

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

    const roundedFederalRate = Math.round(federalRate * 10000) / 10000;
    const roundedStateRate = Math.round(stateRate * 10000) / 10000;
    return [roundedFederalRate, roundedStateRate];
};
