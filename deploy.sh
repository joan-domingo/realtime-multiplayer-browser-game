# Delete previous client build
cd server && rm -rf lib/dist && cd ..

# Build client
cd client && yarn && yarn build

# Copy client build to backend directory
cp -R dist ../server/lib && cd ..

# Commit and push new changes
git add .
git commit -m "Prepare to deploy"
git push


# Push Server directory to Heroku
git subtree push --prefix server heroku master
