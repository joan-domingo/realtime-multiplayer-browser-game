# Server
# cd server && yarn && yarn build
# cp package.json lib
# cp -R lib ../web

# Client
# cd ../client && yarn && yarn build
# cp -R dist ../web/build

# Push Web directory to Heroku
git subtree push --prefix server heroku master
