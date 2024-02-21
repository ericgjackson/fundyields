import store2 from 'store2';

const store = store2.namespace('fundyields');

export const loadState = () => {
  return store.get('state');
};

export const storeState = (state: string) => {
  store.set('state', state, true);
};

export const loadFilingStatus = () => {
  return store.get('filingStatus');
};

export const storeFilingStatus = (filingStatus: string) => {
  store.set('filingStatus', filingStatus, true);
};

export const loadTaxableIncome = () => {
  return store.get('taxableIncome');
};

export const storeTaxableIncome = (taxableIncome: string) => {
  store.set('taxableIncome', taxableIncome, true);
};

export const loadInvestmentIncome = () => {
  return store.get('investmentIncome');
};

export const storeInvestmentIncome = (investmentIncome: string) => {
  store.set('investmentIncome', investmentIncome, true);
};
