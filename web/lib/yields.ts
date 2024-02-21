const getStateRateExplanation = (
  stateRate: number,
  stateExempt: boolean,
  usgoDiscount: boolean,
  usGovtObligations: number,
) => {
  if (stateExempt) {
    return '';
  } else if (usgoDiscount && usGovtObligations > 0) {
    return '(' + stateRate + ' * (1.0 - ' + usGovtObligations + '))';
  } else {
    return '' + stateRate;
  }
};
export const getAfterTaxYield = (
  fund: any,
  state: string,
  federalRate: number|null,
  stateRate: number|null,
) => {
  // Should we proceed if federalRate is non-null and stateRate is null?
  // Perhaps for users in a state for which we don't have data?  Maybe not.
  if (federalRate === null || stateRate === null) {
    return {'afterTaxYield': null, 'explanation' : null};
  }
  let rawYield = fund['sec_yield'];
  const exempt = fund['exempt'] || [];
  let usGovtObligations = fund['us_govt_obligations'] || 0.0;

  let federalExempt = exempt.includes('federal');
  // You are exempt from state taxes if the fund is exempt from *all* state taxes
  // (exempt.includes('state')) or if the fund is exempt from *your* state taxes
  // (exempt.includes(state)).
  let stateExempt = exempt.includes('state') || exempt.includes(state);

  let applicableFederalRate = federalExempt ? 0.0 : federalRate;

  let applicableStateRate;
  let usgoDiscount = false;
  if (stateExempt) {
    applicableStateRate = 0.0;
  } else {
    if (usGovtObligations > 0) {
      if (state === 'california' || state === 'connecticut' || state === 'new_york') {
	if (fund['cactny_qualified']) {
	  usgoDiscount = true;
	  applicableStateRate = stateRate * (1.0 - usGovtObligations);
	} else {
	  applicableStateRate = stateRate;
	}
      } else {
        usgoDiscount = true;
  	applicableStateRate = stateRate * (1.0 - usGovtObligations);
      }
    } else {
      applicableStateRate = stateRate;
    }
  }

  // This assumes we are not itemizing deductions.  If we were we might do something like this
  // instead:
  //   let afterTaxYield = rawYield * (1.0 - applicableFederalRate) * (1.0 - applicableStateRate);

  let afterTaxYield = rawYield * (1.0 - applicableFederalRate - applicableStateRate);
  let explanation = rawYield + '';
  let stateExplanation =
    getStateRateExplanation(stateRate, stateExempt, usgoDiscount, usGovtObligations);
  if (applicableFederalRate > 0 && stateExplanation) {
    explanation += ' * (1.0 - ' + applicableFederalRate + ' - ' + stateExplanation + ')';
  } else if (applicableFederalRate > 0) {
    explanation += ' * (1.0 - ' + applicableFederalRate + ')';
  } else if (stateExplanation) {
    explanation += ' * (1.0 - ' + stateExplanation + ')';
  }
  return {'afterTaxYield': afterTaxYield, 'atExplanation' : explanation};
};

export const getTaxEquivalentYield = (
  fund: any,
  state: string,
  federalRate: number|null,
  stateRate: number|null,
) => {
  // Should we proceed if federalRate is non-null and stateRate is null?
  // Perhaps for users in a state for which we don't have data?  Maybe not.
  if (federalRate === null || stateRate === null) {
    return {'taxEquivalentYield': null, 'explanation' : null};
  }
  let rawYield = fund['sec_yield'];
  const exempt = fund['exempt'] || [];
  let usGovtObligations = fund['us_govt_obligations'] || 0.0;

  let federalExempt = exempt.includes('federal');
  // You are exempt from state taxes if the fund is exempt from *all* state taxes
  // (exempt.includes('state')) or if the fund is exempt from *your* state taxes
  // (exempt.includes(state)).
  let stateExempt = exempt.includes('state') || exempt.includes(state);

  // Calculate the tax equivalent yield in two steps:
  // 1) Calculate the after-tax yield of this fund;
  // 2) Work backwards to the pre-tax yield of a fully taxable fund that would have the same
  //    after-tax yield calculated in step (1).

  // This is step (1) from above.
  const {afterTaxYield} = getAfterTaxYield(fund, state, federalRate, stateRate);
  if (afterTaxYield === null) {
    return {'taxEquivalentYield': null, 'explanation' : null};
  }

  // This is step (2) from above.
  // Same comment about itemizing deductions applies here.
  let taxEquivalentYield = afterTaxYield / (1.0 - federalRate - stateRate);
    
  let explanation = 'AfterTaxYield / (1.0 - ' + federalRate + ' - ' + stateRate + ')';
  
  return {'taxEquivalentYield': taxEquivalentYield, 'teExplanation' : explanation};
};
