# This does not run currently.
I haven't updated the PlaidAPI integration in a few months and recently they'ved deprecated a few security features I was using such as PUBLIC_KEY which is now a LINK_KEY.
So I need to update that eventually to get this working again. I've also considered simply using LunchMoney's API since I now use that as my defacto budgeting tool.

## Required ENV Vars to run locally:

- USERNAME
- PASSWORD
- PLAID_CLIENT_ID
- PLAID_SECRET
- PLAID_PUBLIC_KEY
- PLAID_ACCESS_TOKEN
- PLAID_CHECKING_ACCOUNT_ID
- PLAID_CREDIT_CARD_ACCOUNT_ID
- PLAID_SINKING_FUND_ACCOUNT_ID
- BANK_ANALYZER_TOKEN_SECRET
- USER_HASH
- DB_NAME
- DB_URI
