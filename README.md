TODO: 
- How to rebuild node sass automatically?

## Setup
You'll need a few things:


1. **Local instance of MongoDB** running on port `27017` (yes, this should be configurable, but it's not [yet])
  This instance should allow a database called "bank_analyzer" to be created without any auth. However, if it does
  require auth, it can probably be added to the "restore.sh" script fairly easily. 
      - If you're running on MacOS it's fairly straightforward to install using `brew install mongodb/brew/mongodb-community`.
        You may need to tap it first like so: `brew tap mongodb/brew`
        

2. Run the `./restore.sh` script to seed the small bank_analyzer database table. In a more-perfect world, it would just
  allow you to actually sign in, via Plaid, and test with your actual bank records. ¯\\\_(ツ)_/¯
   

3. `cp .env.example .env`

The latter-two steps can be run simultaneously via the `npm run init:project` script.

### Required ENV Vars to run locally:
- USERNAME — Username for the default local user
- PASSWORD — Password for the default local user
- PLAID_CLIENT_ID — Client ID to access Plaid dummy data
- PLAID_SECRET — Secret to access Plaid dummy data
- BANK_ANALYZER_TOKEN_SECRET — Used to sign/verify JWTs for auth
- USER_HASH — Used to determine if the decrypted cookie was valid
- DB_URI — Defaults to `mongodb://127.0.0.1:27017` which is the default, local MongoDB host/port config
- DB_NAME — The database name for the project

## ** NOTE: These env vars are all configured correctly out of the box for demo purposes and don't need to be configured **