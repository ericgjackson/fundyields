'use client'

import { FunctionComponent, createRef, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { Tooltip } from 'react-tooltip';
import {
  HelpModal,
  Table,
} from '@/components';
import { callGet } from '@/api';
import {
  getNIIT,
  getRates,
  loadFilingStatus,
  loadState,
  loadInvestmentIncome,
  loadTaxableIncome,
  storeFilingStatus,
  storeState,
  storeInvestmentIncome,
  storeTaxableIncome,
} from '@/lib';

interface Props {
};

const Main: FunctionComponent<Props> = ({
}) => {
  const [updated, setUpdated] = useState('');
  const [moneyMarket, setMoneyMarket] = useState<any []>([]);
  const [fixedIncome, setFixedIncome] = useState<any []>([]);
  const [state, setState] = useState<string>('');
  const [filingStatus, setFilingStatus] = useState('');
  const [taxableIncome, setTaxableIncome] = useState('');
  const [investmentIncome, setInvestmentIncome] = useState('');
  const [federalRate, setFederalRate] = useState<number|null>(null);
  const [stateRate, setStateRate] = useState<number|null>(null);
  const [niitRate, setNIITRate] = useState<number|null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const inputRef1 = useMemo(() => createRef<HTMLInputElement>(), []);
  const inputRef2 = useMemo(() => createRef<HTMLInputElement>(), []);
  const deferredTaxableIncome = useDeferredValue(taxableIncome);
  const deferredInvestmentIncome = useDeferredValue(investmentIncome);

  const getStateLabel = (value: string|null) => {
    if (value === 'california')    return 'California';
    else if (value === 'new_york') return 'New York';
    else if (value === 'other')    return 'Other';
    else                           return null;
  };
  const getFilingStatusLabel = (value: string|null) => {
    if (value === 'single')                 return 'Single';
    else if (value === 'married_separate')  return 'Married, Filing Separately';
    else if (value === 'married_joint')     return 'Married, Filing Jointly';
    else if (value === 'head_of_household') return 'Head of Household';
    else                                    return null;
  };
  
  const stateOptions = [
    { value: 'california', label: getStateLabel('california') },
    { value: 'new_york', label: getStateLabel('new_york') },
    { value: 'other', label: getStateLabel('other') }
  ];
  const stateLabel = getStateLabel(state);
  
  const filingStatusOptions = [
    { value: 'single', label: getFilingStatusLabel('single') },
    { value: 'married_separate', label: getFilingStatusLabel('married_separate') },
    { value: 'married_joint', label: getFilingStatusLabel('married_joint') },
    { value: 'head_of_household', label: getFilingStatusLabel('head_of_household') },
  ];
  const filingStatusLabel = getFilingStatusLabel(filingStatus);

  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      setState(savedState);
    }

    const savedFilingStatus = loadFilingStatus();
    if (savedFilingStatus) {
      setFilingStatus(savedFilingStatus);
    }
  }, []);

  useEffect(() => {
    const savedTaxableIncome = loadTaxableIncome();
    if (savedTaxableIncome) {
      setTaxableIncome(savedTaxableIncome);
    }
  }, []);

  useEffect(() => {
    const savedInvestmentIncome = loadInvestmentIncome();
    if (savedInvestmentIncome) {
      setInvestmentIncome(savedInvestmentIncome);
    }
  }, []);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    const [fr, sr] = getRates(filingStatus, state, deferredTaxableIncome, deferredInvestmentIncome);
    setFederalRate(fr);
    setStateRate(sr);
    const niit = getNIIT(filingStatus, deferredInvestmentIncome);
    setNIITRate(niit);
  }, [state, filingStatus, deferredInvestmentIncome, deferredTaxableIncome]);

  // Without the , [] at the end the Home component will rerender each time we set state
  // (setMoneyMarket and setFixedIncome).  What's the best way to fix?
  useEffect(() => {
    callGet()
    .then((results) => {
      let mm : any[] = [];
      let fi : any[] = [];
      let funds = results['funds'];
      for (let f of funds) {
        if (f['asset_class'] === 'money_market') {
          mm.push(f);
	} else if (f['asset_class'] === 'fixed_income') {
          fi.push(f);
	} else {
	  console.error('Unknown asset class: ' + f['asset_class']);
	}
      }
      setMoneyMarket(mm);
      setFixedIncome(fi);
      setUpdated(results['updated']);
    })
    .catch((error) => {
      // dispatch(messageSlice.actions.set('Server error'));
      console.error('Server error');
    });
  }, []);

  // Do we need to set the state variable (taxable income)?  It's a controlled component.
  const handleChange1 = (event: any) => {
    if (inputRef1.current) {
      if (inputRef1.current.value) {
	setTaxableIncome(inputRef1.current.value);
	storeTaxableIncome(inputRef1.current.value);
      } else {
	setTaxableIncome('');
	storeTaxableIncome('');
      }
    }
  };

  const handleChange2 = (event: any) => {
    if (inputRef2.current) {
      if (inputRef2.current.value) {
	setInvestmentIncome(inputRef2.current.value);
	storeInvestmentIncome(inputRef2.current.value);
      } else {
	setInvestmentIncome('');
	storeInvestmentIncome('');
      }
    }
  };
  
  const handleHelpClick = () => {
    setShowHelpModal(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-start justify-start m-10">
      <div>
        <span
	  className="font-serif text-lg"
	>
	  This site displays yields for numerous money market and bond funds.
          Optionally enter your tax data below to see after-tax yields.  Click
        </span>
        <span
	  className="font-serif text-lg font-bold cursor-pointer"
	  onClick={handleHelpClick}
	>
	  {" "}Help{" "}
        </span>
        <span
	  className="font-serif text-lg"
	>
	  for more information.
        </span>

        <div
	  className="mt-5"
	>
          <span
            className="font-serif text-lg"
          >
            Last updated: <span id="updated">{updated}</span>
          </span>
        </div>

        <div
	  className="flex flex-col justify-left border border-black p-5 mt-5"
	>
          <div
	    className="flex flex-row justify-left items-center"
	  >
            <span className="mr-2">State:</span>

            <div style={{width: '150px'}}>
              <Select
                value={state ? { value: state, label: stateLabel } : null}
                instanceId={'select1'}
                options={stateOptions}
                onChange={(v) => {if (v && v.value) {setState(v.value); storeState(v.value);} else {setState(''); storeState('');}}}
              />
            </div>
	  
            <span className="ml-5 mr-2">Filing Status:</span>

            <div style={{width: '200px'}}>
              <Select
                value={filingStatus ? { value: filingStatus, label: filingStatusLabel } : null}
                instanceId={'select2'}
                options={filingStatusOptions}
                onChange={(v) => {if (v && v.value) {setFilingStatus(v.value); storeFilingStatus(v.value);} else {setFilingStatus(''); storeFilingStatus('');}}}
              />
            </div>

            <span className="ml-5 mr-2">Taxable Income:</span>

            <input
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              onChange={handleChange1}
              ref={inputRef1}
              style={{height: 30, width: 200, padding: 10}}
	      value={taxableIncome}
            />

            <span className="ml-5 mr-2">Investment Income:</span>

            <input
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              onChange={handleChange2}
              ref={inputRef2}
              style={{height: 30, width: 200, padding: 10}}
	      value={investmentIncome}
            />
	  </div>

          <div className="flex flex-row justify-left items-center mt-5">
	    <table>
	      <tbody>
	        <tr>
		  <td className='pr-2'>Federal Marginal Tax Rate:</td>
		  <td>
                    {federalRate === null ?
                      '-' :
	              Math.round(federalRate * 10000) / 100 + '%' +
	              (niitRate && niitRate > 0 ?
	               ' (includes ' + Math.round(niitRate * 10000) / 100 + '% NIIT)' :
		       '') + '.'
                    }
		  </td>
	        </tr>
	        <tr>
		  <td className='pr-2'>State Marginal Tax Rate:</td>
		  <td>
                    {stateRate === null ? '-' : Math.round(stateRate * 10000) / 100 + '%.'}
		  </td>
	        </tr>
	      </tbody>
	    </table>
          </div>
	</div>

        <div className="mt-5">
          <Table
            funds={moneyMarket}
	    title={'Money Market'}
	    state={state}
	    filingStatus={filingStatus}
	    federalRate={federalRate}
	    stateRate={stateRate}
          />

	  <Table
	    funds={fixedIncome}
	    title={'Fixed Income'}
	    state={state}
	    filingStatus={filingStatus}
	    federalRate={federalRate}
	    stateRate={stateRate}
	  />
        </div>

      </div>

      <HelpModal
        dim={Math.floor(Math.max(500, Math.min(windowHeight, windowWidth) * 0.9))}
        isOpen={showHelpModal}
	onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
};

      
export default Main;
