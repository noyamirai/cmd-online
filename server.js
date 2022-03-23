/* eslint-disable no-undef */
<<<<<<< HEAD
require('dotenv').config();
=======
require('dotenv').config()
>>>>>>> 12a8803fa6747635c565c9b63b9d9bece8597425
const express = require(`express`);
const app = express();

const session = require('express-session');
const passport = require('passport');

const port = process.env.PORT || 3000;
const EXPsession = process.env.SecretSESSION;

const db = require(`./config/db`);

app.set(`view engine`, `ejs`);
app.set('views', 'views');
app.use(`/public`, express.static(`public`));
app.use('/public', express.static(__dirname + '/public/'));

db.connectDb();

require('./config/verifyUser')(passport);

//EXPRESS MIDDLEWARE
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: EXPsession,
    resave: false,
    saveUninitialized: false
<<<<<<< HEAD
})
=======
  })
>>>>>>> 12a8803fa6747635c565c9b63b9d9bece8597425
);

// PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.use('/', require('./routes/home'));
<<<<<<< HEAD
app.use('/profile', require('./routes/profile'));
=======
>>>>>>> 12a8803fa6747635c565c9b63b9d9bece8597425
app.use('/users', require('./routes/users'));
app.use('/:username', require('./routes/overviews'));

app.get(`*`, (req, res) => {
    res.status(404).send(`Page not found!`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});