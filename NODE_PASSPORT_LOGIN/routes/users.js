const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//user model
const User = require('../models/User')

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

//Rsgister handle
router.post('/register', (req,res) => {
    const {name, email, password, password2 } = req.body;
    let errors = [];
// Check required fields
if(!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
}

// Check Passwords match
if(password !== password2) {
    errors.push({ msg: 'Password do not match' });
}

// Check pass length
if(errors.length > 0) {
res.render('register', {
errors,
name,
email,
password,
password2
});
} else {
User.findOne({ email: email })
.then(user => {
    if(user) {
        // User exists
        errors.push({ msg: 'Email is already registered '});
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        const newUser = new User({
            name,
            email,
            password
        });

        // Hash Password
        bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            // set password to hashed
            newUser.password = hash;
            //Save user
            newUser.save()
            .then(user => {
                req.flash('succes_msg', 'You are now registered and can log in');
                res.redirect('users/login');
            })
            .catch(err => console.log(err));
        }))
    }
});
}
});

//Login Handle
router.post('/login', (req, res, next) => {
passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
})(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
})

module.exports = router;