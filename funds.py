# https://mutualfunds.com/bond-categories/money-market-funds-and-etfs/
# To add:
#   MCDXX (Blackrock)
#   MOFXX (Federated Hermes).  Cannot find 7-day yield.
#   FTXXX (Goldman Sachs)

# Update with information from pages like this:
#   https://www.schwabassetmanagement.com/resource/2023-supplementary-tax-information
schwab_funds = [
    {
        'ticker': 'snsxx',
        'name': 'Schwab U.S. Treasury Money Fund - Investor Shares',
        'company': 'schwab',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.9961,
        'cactny_qualified': True,
    },
    {
        'ticker': 'snoxx',
        'name': 'Schwab Treasury Obligations Money Fund - Investor Shares',
        'company': 'schwab',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.1121,
        'cactny_qualified': False,
    },
    {
        'ticker': 'snvxx',
        'name': 'Schwab Government Money Fund - Investor Shares',
        'company': 'schwab',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.2401,
        'cactny_qualified': False,
    },
    {
        'ticker': 'swvxx',
        'name': 'Schwab Value Advantage Money Fund - Investor Shares',
        'company': 'schwab',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.0005,
        'cactny_qualified': False,
    },
    {
        'ticker': 'swtxx',
        'name': 'Schwab Municipal Money Fund - Investor Shares',
        'company': 'schwab',
        'asset_class': 'money_market',
        'exempt': ['federal'],
    },
    {
        'ticker': 'swwxx',
        'name': 'Schwab AMT Tax-Free Money Fund - Investor Shares',
        'company': 'schwab',
        'asset_class': 'money_market',
        'exempt': ['federal'],
    },
    {
        'ticker': 'swkxx',
        'name': 'Schwab California Municipal Money Fund - Investor Shares',
        'company': 'schwab',
        'asset_class': 'money_market',
        'exempt': ['california', 'federal'],
    },
    {
        'ticker': 'swyxx',
        'name': 'Schwab New York Municipal Money Fund - Investor Shares',
        'company': 'schwab',
        'asset_class': 'money_market',
        'exempt': ['new_york', 'federal'],
    }
]

# Commenting out the bond funds for now.  moneymarket.fun does not support them.
"""
    {
        'ticker': 'swcax',
        'name': 'Schwab California Tax-Free Bond Fund',
        'company': 'schwab',
        'asset_class': 'fixed_income',
        'exempt': ['california', 'federal'],
    },
    {
        'ticker': 'swsbx',
        'name': 'Schwab Short-Term Bond Index Fund',
        'company': 'schwab',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 0.7206,
        'cactny_qualified': True,
    },
    {
        'ticker': 'swagx',
        'name': 'Schwab U.S. Aggregate Bond Index Fund',
        'company': 'schwab',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 0.3821,
        'cactny_qualified': False,
    }
"""

# Update with information from pages like this:
#   https://investor.vanguard.com/content/dam/retail/publicsite/en/documents/taxes/usgoin-2024.pdf
vanguard_funds = [
    {
        'ticker': 'vctxx',
        'name': 'Vanguard California Municipal Money Market Fund',
        'company': 'vanguard',
        'asset_class': 'money_market',
        'exempt': ['california', 'federal'],
    },
    {
        'ticker': 'vmsxx',
        'name': 'Vanguard Municipal Money Market Fund',
        'company': 'vanguard',
        'asset_class': 'money_market',
        'exempt': ['federal'],
    },
    {
        'ticker': 'vmfxx',
        'name': 'Vanguard Federal Money Market Fund',
        'company': 'vanguard',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.4937,
        'cactny_qualified': False,
    },
    {
        'ticker': 'vusxx',
        'name': 'Vanguard Treasury Money Market Fund',
        'company': 'vanguard',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.8006,
        'cactny_qualified': True,
    },
    {
        'ticker': 'vclax',
        'name': 'Vanguard California Long-Term Tax-Exempt Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'exempt': ['california', 'federal'],
    },
    {
        'ticker': 'vcadx',
        'name': 'Vanguard California Intermediate-Term Tax-Exempt Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'exempt': ['california', 'federal'],
    },
    {
        'ticker': 'vlgsx',
        'name': 'Vanguard Long-Term Treasury Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 1.0,
        'cactny_qualified': True,
    },
    {
        'ticker': 'vbtlx',
        'name': 'Vanguard Total Bond Market Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 0.3847,
        'cactny_qualified': False,
    },
    {
        'ticker': 'vbilx',
        'name': 'Vanguard Intermediate-Term Bond Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 0.4821,
        'cactny_qualified': True,
    },
    {
        'ticker': 'vicsx',
        'name': 'Vanguard Intermediate-Term Corporate Bond Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 0.0036,
        'cactny_qualified': False,
    },
    {
        'ticker': 'vsigx',
        'name': 'Vanguard Intermediate-Term Treasury Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 1.0,
        'cactny_qualified': True,
    },
    {
        'ticker': 'vblax',
        'name': 'Vanguard Long-Term Bond Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 0.3747,
        'cactny_qualified': False,
    },
    {
        'ticker': 'vltcx',
        'name': 'Vanguard Long-Term Corporate Bond Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 0.0022,
        'cactny_qualified': False,
    },
    {
        'ticker': 'vmbsx',
        'name': 'Vanguard Mortgage-Backed Securities Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 0.0139,
        'cactny_qualified': False,
    },
    {
        'ticker': 'vbirx',
        'name': 'Vanguard Short-Term Bond Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 0.6157,
        'cactny_qualified': True,
    },
    {
        'ticker': 'vscsx',
        'name': 'Vanguard Short-Term Corporate Bond Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 0.0045,
        'cactny_qualified': False,
    },
    {
        'ticker': 'vsbsx',
        'name': 'Vanguard Short-Term Treasury Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 1.0,
        'cactny_qualified': True,
    },
    {
        'ticker': 'vteax',
        'name': 'Vanguard Tax-Exempt Bond Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'exempt': ['federal'],
    },
    {
        'ticker': 'vtabx',
        'name': 'Vanguard Total International Bond Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 0.003,
        'cactny_qualified': False,
    },
    {
        'ticker': 'vgavx',
        'name': 'Vanguard Emerging Markets Government Bond Index Fund Admiral Shares',
        'company': 'vanguard',
        'asset_class': 'fixed_income',
        'us_govt_obligations': 0.0025,
        'cactny_qualified': False,
    },
    {
        'ticker': 'vyfxx',
        'name': 'Vanguard New York Municipal Money Market Fund',
        'company': 'vanguard',
        'asset_class': 'money_market',
        'exempt': ['new_york', 'federal'],
    }
]

# Update with information from pages like this:
# https://www.fidelity.com/bin-public/060_www_fidelity_com/documents/TY23-GSE-Supplemental-Letter.pdf
fidelity_funds = [
    {
        'ticker': 'flgxx',
        'tail': '31617H888',
        'name': 'Fidelity Flex Government Money Market Fund',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.416,
        'cactny_qualified': False,
    },
    {
        'ticker': 'fgnxx',
        'tail': '31635V778',
        'name': 'Fidelity Series Government Money Market Fund',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.3604,
        'cactny_qualified': False,
    },
    {
        'ticker': 'fzdxx',
        'tail': '31617H805',
        'name': 'Fidelity Money Market Fund - Premium Class',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.0405,
        'cactny_qualified': False,
    },
    {
        'ticker': 'fzcxx',
        'tail': '31617H706',
        'name': 'Fidelity Government Money Market Fund - Premium Class',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.4118,
        'cactny_qualified': False,
    },
    {
        'ticker': 'fdrxx',
        'tail': '316067107',
        'name': 'Fidelity Government Cash Reserves',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.4057,
        'cactny_qualified': False,
    },
    {
        'ticker': 'ftexx',
        'tail': '316048107',
        'name': 'Fidelity Municipal Money Market Fund',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'exempt': ['federal'],
    },
    {
        'ticker': 'fzexx',
        'tail': '316341403',
        'name': 'Fidelity Tax-Exempt Money Market Fund - Premium Class',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'exempt': ['federal'],
    },
    {
        'ticker': 'fdlxx',
        'tail': '31617H300',
        'name': 'Fidelity Treasury Only Money Market Fund',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.9039,
        'cactny_qualified': True,
    },
    {
        'ticker': 'fzfxx',
        'tail': '316341304',
        'name': 'Fidelity Treasury Money Market Fund',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.2419,
        'cactny_qualified': False,
    },
    {
        'ticker': 'fspxx',
        'tail': '316061407',
        'name': 'Fidelity California Municipal Money Market Fund - Premium Class',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'exempt': ['california', 'federal'],
    },
    {
        'ticker': 'fsnxx',
        'tail': '316337500',
        'name': 'Fidelity New York Municipal Money Market Fund - Premium Class',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'exempt': ['new_york', 'federal'],
    },
    {
        'ticker': 'fsjxx',
        'tail': '316048206',
        'name': 'Fidelity New Jersey Municipal Money Market Fund - Premium Class',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'exempt': ['new_jersey', 'federal'],
    },
    {
        'ticker': 'fmsxx',
        'tail': '315902304',
        'name': 'Fidelity Massachusetts Municipal Money Market Fund - Premium Class',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'exempt': ['massachusetts', 'federal'],
    },
    {
        'ticker': 'sprxx',
        'tail': '31617H201',
        'name': 'Fidelity Money Market Fund',
        'company': 'fidelity',
        'asset_class': 'money_market',
        'us_govt_obligations': 0.0405,
        'cactny_qualified': False,
    }
]

# Commenting out the bond funds for now.  moneymarket.fun does not support them.
"""
    {
        'ticker': 'fmndx',
        'tail': '316203843',
        'name': 'Fidelity Conservative Income Municipal Bond Fund',
        'company': 'fidelity',
        'asset_class': 'fixed_income',
        'exempt': ['federal'],
    },
"""

funds = vanguard_funds + schwab_funds + fidelity_funds
