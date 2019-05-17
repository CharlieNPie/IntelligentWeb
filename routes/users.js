var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const UserObject = require("../models/user");
const passport = require("passport");;

/** Function to check if user has logged in */
function checkLoggedIn(req) {
  if (req) {
    return true;
  } else {
    return false;
  }
}

/** USERS */
router.get("/login", function(req, res, next){
  loggedInBool = checkLoggedIn(req.user)
  res.render("login", {loggedIn: loggedInBool});
})

router.get("/register", function(req, res, next){
  loggedInBool = checkLoggedIn(req.user)
  res.render("register", {loggedIn: loggedInBool});
})

router.post("/create_user", function(req, res, next){
  const newUser = new UserObject({
    _id: req.body._id,
    username: req.body._id,
    email: req.body.email,
    password: req.body.password,
    avatar: req.body.avatar,
    rank: req.body.status
  });
  newUser
  .save()
  .then(() => {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({newUser}));
  })
  .catch(() => res.status(500).json({ error: "Could not create user" }));
})

router.post('/login', passport.authenticate('local', { failureRedirect: '/users/login' }),
    function(req, res) 
    { 
      // If this function gets called, authentication was successful. 
      // `req.user` contains the authenticated user. 
      res.redirect('/');
   });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;
