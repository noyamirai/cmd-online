const localStrategy = require('passport-local').Strategy;
const argon2 = require('argon2')
const {User} = require('../models/schemas');


module.exports = function (passport) {

    passport.use(
        new localStrategy({ usernameField: 'username' }, (username, password, done) => {
            // Match user
            User.findOne({
                username: username
            }).then(async user => {
                if (!user) {
                    console.log('username not found')
                    return done(null, false, { message: 'That username is not registered' });
                }

                const match = await argon2.verify(user.password, password)
                if (match) {
                    return done(null, user)
                } else {
                    console.log('password incorrect')
                    return done(null, false, { message: 'Password is incorrect' })
                }
            });
        })
    );

    passport.serializeUser((user, done) =>{
        done(null, user.id);
    });

    passport.deserializeUser((id, done) =>{
        User.findById(id,  (err, user) =>{
            done(err, user);
        });
    });
};