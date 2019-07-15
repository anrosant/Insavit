# UKU
## Requirements

* Python +2.7.x
* [pip](https://pip.pypa.io/en/stable/installing/)
* [virtualenv](https://virtualenv.pypa.io/en/stable/installation/)
* [virtualenvwrapper](http://virtualenvwrapper.readthedocs.io/en/latest/install.html) (optional)
* [nodejs] (https://nodejs.org/en/)
* brew/postgresql or download [Postgres.app](https://postgresapp.com/)

## Install Dependences
```
pip install -r requirements.txt
npm install --save-dev babel-core babel-loader babel-preset-env babel-preset-react webpack webpack-bundle-tracker webpack-cli
npm install --save react react-dom
npm install create-react-class --save
```
## Compile bundles
```
./node_modules/.bin/webpack --config webpack.config.js
```
## Run the application
```
npm run watch
python manage.py runserver
```
