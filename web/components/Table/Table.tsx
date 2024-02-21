import { FunctionComponent, memo, useCallback, useState } from 'react';
import { getRates, getAfterTaxYield, getTaxEquivalentYield } from '@/lib';

interface Props {
  funds: any;
  title: string;
  state: string;
  filingStatus: string;
  federalRate: number|null;
  stateRate: number|null;
};

// const Table: FunctionComponent<Props> = ({
//   funds,
//   title,
//   state,
//   filingStatus,
//   federalRate,
//   stateRate
// }) => {

const Table: FunctionComponent<Props> = memo(function Table({
  funds,
  title,
  state,
  filingStatus,
  federalRate,
  stateRate
}) {
  const [hovering, setHovering] = useState('');

  const mouseEnter = (prefix: string, ticker: string) => {
    setHovering(prefix + ticker);
  };
  
  const mouseLeave = () => {
    setHovering('');
  };
  
  const tableBody = useCallback(() => {
    let numTE = 0;
    funds.forEach(function(fund: any) {
        const {afterTaxYield, atExplanation} =
	  getAfterTaxYield(fund, state, federalRate, stateRate);
	fund['at_yield'] = afterTaxYield;
	fund['at_explanation'] = atExplanation;
        const {taxEquivalentYield, teExplanation} =
	  getTaxEquivalentYield(fund, state, federalRate, stateRate);
	fund['te_yield'] = taxEquivalentYield;
	fund['te_explanation'] = teExplanation;
	if (fund['te_yield'] !== null) {
	  ++numTE;
	}
    });
    let sortField: string;
    if (numTE === funds.length) {
      sortField = 'te_yield';
    } else {
      sortField = 'sec_yield';
    }
    const sortDirection = 'down';
    if (sortDirection === 'down') {
      funds.sort(function(a: any, b: any) {
        if (a[sortField] > b[sortField]) return -1;
        if (a[sortField] < b[sortField]) return 1;
        return 0;
      });
    } else {
      funds.sort(function(a: any, b: any) {
        if (a[sortField] > b[sortField]) return 1;
        if (a[sortField] < b[sortField]) return -1;
        return 0;
      });
    }

    return (funds.map((fund: any, index: number) => {
      const atYield = fund['at_yield'];
      const roundedATYield = atYield === null ? null : Math.round(atYield * 100) / 100;
      const teYield = fund['te_yield'];
      const roundedTEYield = teYield === null ? null : Math.round(teYield * 100) / 100;
      // transform: 'translateX(-50%)',
      return (
        <tr key={'row' + index}>
          <td className='pr-5'>
	    <a
              href={fund['url']}
	    >
	      <span
	        className='underline'
	      >
                {fund['name']}
	      </span>
	    </a>
	  </td>
          <td className='pr-5'>{fund['ticker'].toUpperCase()}</td>
          <td className='pr-5'>{fund['sec_yield'] + '%'}</td>
          {roundedATYield === null ?
	     <td>-</td> :
             <td>
               <div
                 onMouseEnter={() => mouseEnter('at', fund['ticker'])}
                 onMouseLeave={() => mouseLeave()}
                 style={{position: 'relative'}}
               >
                 <span>{roundedATYield + '%'}</span>
                 {hovering === 'at' + fund['ticker'] &&
                  <div
	            style={{
	              position: 'absolute',
	              marginTop: '-5px',
	              bottom: '100%',
	              left: '0%',
	              backgroundColor: '#7393B3',
		      width: 'max-content',
		      pointerEvents: 'none',
	            }}
                    className='rounded-full px-2'
	          >
                    <span
	              className="text-white font-serif text-lg"
	            >
	              {fund['at_explanation']}
	            </span>
	          </div>
                 }
               </div>
             </td>
	  }
          {roundedTEYield === null ?
	     <td>-</td> :
             <td>
               <div
                 onMouseEnter={() => mouseEnter('te', fund['ticker'])}
                 onMouseLeave={() => mouseLeave()}
                 style={{position: 'relative'}}
               >
                 <span>{roundedTEYield + '%'}</span>
                 {hovering === 'te' + fund['ticker'] &&
                  <div
	            style={{
	              position: 'absolute',
	              marginTop: '-5px',
	              bottom: '100%',
	              left: '0%',
	              backgroundColor: '#7393B3',
		      width: 'max-content',
		      pointerEvents: 'none',
	            }}
                    className='rounded-full px-2'
	          >
                    <span
	              className="text-white font-serif text-lg"
	            >
	              {fund['te_explanation']}
	            </span>
	          </div>
                 }
               </div>
             </td>
	  }
        </tr>
      );
    }));
  }, [funds, state, federalRate, stateRate, hovering]);

  if (! funds) return;

  return (
    <div
      className='flex flex-col justify-center items-center mb-10'
    >
      <span
        className='font-bold text-xl mb-10'
      >
        {title}
      </span>
      <table>
        <thead>
          <tr>
            <th className='pr-5 underline'>Name</th>
            <th className='pr-5 underline'>Ticker</th>
            <th className='pr-5 underline'>7-Day Yield</th>
            <th className='pr-5 underline'>After-Tax Yield</th>
            <th className='pr-5 underline'>Tax-Equivalent Yield</th>
          </tr>
	</thead>
	<tbody>
          {tableBody()}
	</tbody>
      </table>
    </div>
  );
});

export default Table;
