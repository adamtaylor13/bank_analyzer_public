# Preface
This app was built quickly / haphazardly across a year time-span. 
The goal was two-fold: Learn React/Redux, and build a useful tool that I actually needed.

As I built and learned, I usually refactored things, but inevitably other pieces would fall
through the cracks. Furthermore, this app was never built to be run on another machine, by another developer, so I've 
hacked together a way to "seed" some data into the app, but in an ideal world this probably be handled by a container
of some sort, or a more robust seeding script.

This app has a ton of shortcomings—I am under no delusion here. I can offer pretty much a few hours worth of commentary 
on how I would've done things differently or improved certain parts of the app.

### Lessons Learned
1. Redux is probably overkill for your first react app. React Context would be far easier to run with.
2. Starting with Electron and migrating to a webapp is a weird / bad product life-cycle.
3. Use Typescript sooner—your later-self will thank you.
4. Start with future developers in mind. Make a system that can be replicated anywhere, easily.
5. Starting to learn React is fun! Starting to learn MaterialUI simultaneously—is decidedly NOT fun. 
   (I was in the process of replacing as many MUI components as I could with the more-lightweight, simpler-to-use: Rebass.
   I never finished that endeavor.)
6. ...?
7. Profit
8. (Actually, no profit made, but much knowledge gained)

Now then.. Let's begin!

## Setup
You'll need a few things:


1. **Local instance of MongoDB** running on port `27017`. This instance should allow a database called "bank_analyzer" 
   to be created without any auth. However, if it does require auth, the `restor.sh` script should be easily modified
   to include auth in the `mongorestore` command.
      - If you're running on MacOS it's fairly straightforward to install using `brew install mongodb/brew/mongodb-community`.
        You may need to tap it first like so: `brew tap mongodb/brew`


2. Run the `./restore.sh` script to seed the small bank_analyzer database table. In a more-perfect world, it would just
  allow you to actually sign in, via Plaid, and test with your actual bank records. ¯\\\_(ツ)_/¯


3. `cp .env.example .env`

#### **The latter-two steps can be run simultaneously via the `npm run init:project` script.**

4. Access `localhost:8081` and you should be prompted for a login. Utilize the `USERNAME` and `PASSWORD` fields in your .env file.

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

---

## Troubleshooting

- **Screen goes blank**
    - Unfortunately, this app hasn't seen the light of day in over a year. I was in the middle of some major changes 
      to the navigation system and the data-loading system and refreshing the page is the best bet here.


- **No data shows up**
    - Have you run the `restore.sh` script to load the database data?
    
    
- **What do I use to login?**
    - Use the USERNAME and PASSWORD vars set up in your `.env` file
    
    
- **I can't get the filters to work?**
    - Yes, those were in the middle of getting an amazing makeover when this project was dropped. For demoing purposes, 
      it was easier just to disable them.
      
      
- **My mind is blown**
    - Unfortunately, this happens to many who view this code. I haven't found a reliable solution yet.