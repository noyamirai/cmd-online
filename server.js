/* eslint-disable no-undef */
require('dotenv').config();
const express = require(`express`);
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const compression = require('compression');
const port = process.env.PORT || 3000;
const EXPsession = process.env.SecretSESSION;

const db = require(`./config/db`);

app.set(`view engine`, `ejs`);
app.set('views', 'views');
app.use(`/public`, express.static(`public`));
app.use('/public', express.static(__dirname + '/public/'));

db.connectDb();

require('./config/verifyUser')(passport);

app.use(compression({
    level: 6,
    threshold: 1000
}));

//EXPRESS MIDDLEWARE
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: EXPsession,
    resave: false,
    saveUninitialized: false
})
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.use('/profile', require('./routes/profile'));
app.use('/', require('./routes/dashboard'));
app.use('/users', require('./routes/users'));
app.use('/:username', require('./routes/overviews'));
app.use('/settings', require('./routes/settings'));
app.use('/maintenance', require('./routes/maintenance'));
app.use('/skills', require('./routes/skills'));
app.use('/teams', require('./routes/teams'));


app.get(`*`, (req, res) => {
    res.status(404).send(`Page not found!`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});