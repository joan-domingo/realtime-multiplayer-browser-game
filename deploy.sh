# Build client
cd client && yarn && yarn build


# Push Server directory to Heroku
git subtree push --prefix server heroku master
