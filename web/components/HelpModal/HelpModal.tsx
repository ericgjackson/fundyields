'use client'

import { FunctionComponent } from 'react';
import Image from 'next/image';
import Modal from 'react-modal';
import { cross_fill } from '@/public';

interface Props {
  dim: number;
  isOpen: boolean;
  onClose: () => void;
};

const HelpModal: FunctionComponent<Props> = ({
  dim,
  isOpen,
  onClose,
}) => {
  const closeModal = () => {
    onClose();
  };

  const textSize = dim < 1000 ? 'text-base' : 'text-lg';

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: 0,
      backgroundColor: 'rgb(226 232 240)'
    },
    overlay: {
      zIndex: 60,
    },
  };

  const closeBoxDim = Math.floor(dim / 25);

  return (
    <Modal
      style={customStyles}
      contentLabel={'Help'}
      isOpen={isOpen}
      onRequestClose={closeModal}
      ariaHideApp={false}
    >
      <div
        className='bg-slate-200 relative select-none'
        style={{height: dim, width: dim}}
      >
        <div
          className='flex flex-row justify-end w-full absolute'
        >
	  <div
	    className='z-[70] cursor-pointer'
            onClick={closeModal}
	  >
            <Image
              alt='Close button'
	      src={cross_fill}
	      style={{height: closeBoxDim, width: closeBoxDim}}
	    />
          </div>
        </div>
        <div
          className='flex flex-col justify-start items-start'
          style={{height: dim, top: 0}}
        >
	  <div
	    className='ml-10 mr-10 mt-10'
          >
            <span
	      className='font-bold text-lg'
	    >
	      Basics
	    </span>
            <ul className={'list-disc space-y-2 ' + textSize}>
  
              <li>This site aggregates data on certain money market and bond funds from Fidelity,
	          Schwab and Vanguard.  Most importantly, it displays standardized measures of
		  yields, including after-tax and tax-equivalent yields.</li>

              <li>The 7-day yield is a standard measure of the yield of a money market fund.  It
	          takes the gain of the fund over the last seven days and annualizes it; i.e., it
		  extrapolates the gains of the last seven days to what you would see over an entire
		  year.  It is net of expenses.</li>
  
              <li>The 30-day yield is very similar to the 7-day yield, except instead of using the
	          last seven days, it uses the last 30 days.  It is a standard measure of the yield
		  of a bond fund.</li>
            </ul>
          </div>
	  
	  <div
	    className='ml-10 mr-10 mt-5'
          >
            <span
	      className='font-bold text-lg'
	    >
              After-Tax Yield
	    </span>
            <ul className={'list-disc space-y-2 ' + textSize}>
	      <li>The after-tax yield column shows the yield you earn after taxes are applied,
	          both state and federal.  Since the after-tax yield measures &quot;what you
		  keep&quot;, you may find it a more relevant measure than the raw yield.</li>

              <li>You will need to supply your state, filing status and taxable income to see this
	          column.  Investment income is optional (it is assumed to be zero if you don&apos;t
		  provide it).</li>

              <li>As an example, suppose you are a Califonia taxpayer in the 37% federal tax bracket
	          and the 10.3% state tax bracket.  Suppose the 7-day yield of the Vanguard Federal
		  Money Market Fund is 5%.  We can calculate the after-tax yield as 0.05 *
		  (1.0 - 0.37 - 0.103).  This is 0.02635, or, expressed as a percentage,
		  2.635%.</li>

              <li>Different funds are taxed differently.  For example, the Vanguard California Money
	          Market Fund is free of state and federal taxes if you are a California taxpayer.
		  In contrast, the Vanguard Treasury Money Market fund is free of state taxes, but
		  fully taxable at the federal level.  And other funds are fully taxable both
		  federally and at the state level.</li>

              <li>Funds with US government obligations (e.g., treasuries) may be fully or partially
	          exempt from state tax.  It depends on the laws of your state and how much the fund
		  is invested in US government obligations.</li>

              <li>The federal rate we estimate for you is based on your taxable income, and
	          includes the impact of the Net Investment Income Tax (NIIT) which depends on your
		  investment income.</li>
	    </ul>
          </div>

	  <div
	    className='ml-10 mr-10 mt-5'
          >
            <span
	      className='font-bold text-lg'
	    >
              Tax-Equivalent Yield
	    </span>
            <ul className={'list-disc space-y-2 ' + textSize}>

              <li>The tax-equivalent yield of a fund is the yield you would need to earn on a fully
	          taxable fund, in order to get the same after-tax yield as the given fund.</li>

              <li>If you are in the 37% federal tax bracket and the 10.3% state tax bracket,
	          and the after-tax yield on a fund is 3%, then the tax-equivalent yield is
		  approximately 5.7%.  The calculation is 0.03 / (1.0 - 0.37 - 0.103).</li>

            </ul>
          </div>
    
	  <div
	    className='ml-10 mr-10 mt-5'
          >
            <span
	      className='font-bold text-lg'
	    >
              User Interface
            </span>
            <ul className={'list-disc space-y-2 ' + textSize}>
              <li>You must fill in the form at the top to see after-tax or tax-equivalent
	          yields.</li>

              <li>If we can calculate after-tax yields, we sort by that column, with the highest
	          yielding funds at the top.  If we cannot, we sort by the raw (7-day or 30-day)
		  yields.</li>

              <li>Hover over an after-tax or tax-equivalent yield to see how it is calculated.</li>
            </ul>
          </div>
    
	  <div
	    className='ml-10 mr-10 mt-5'
          >
            <span
	      className='font-bold text-lg'
	    >
              Limitations
            </span>
            <ul className={'list-disc space-y-2 ' + textSize}>
              <li>We are using the 2023 tax brackets for our calculations.</li>

              <li>Yields are scraped from the websites of Fidelity, Schwab and Vanguard.</li>

              <li>We can only calculate state taxes for California and New York currently.</li>
  
              <li>We do not take account of the federal tax deduction you may be entitled to
	          for state and local taxes (which is limited to $10,000 in any case).</li>

              <li>We do not take the Alternative Minimum Tax (AMT) into account.</li>
            </ul>
    
          </div>
    
	  <div
	    className='ml-10 mr-10 mt-5'
          >
            <span
	      className='font-bold text-lg'
	    >
              Privacy
            </span>

            <ul className={'list-disc space-y-2 ' + textSize}>
              <li>The data you enter into the website is kept in your browser and never sent to our
	          servers.</li>
            </ul>

          </div>
        </div>
      </div>
    </Modal>
  );
};

export default HelpModal;
