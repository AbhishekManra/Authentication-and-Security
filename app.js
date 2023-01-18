//jshint esversion:6
require('dotenv').config();
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
// modules which we installed for our passport framework
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

app.set("view engine" , "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

// adding the session
app.use(session({
    secret: process.env.SECRET2,
    saveUninitialized:false,
    resave: false 
}));

app.use(passport.initialize()); // initalizing passport

app.use(passport.session()); // launching the session



mongoose.connect('mongodb://127.0.0.1:27017/AuthDB2');

// creating a full mongoose schema
const userSchema = new mongoose.Schema({
    email : String,
    password : String,
    googleId : String,
    Secret : String
}); 

userSchema.plugin(passportLocalMongoose);

userSchema.plugin(findOrCreate);

const User = new mongoose.model("User" , userSchema); // our mongoose model alike which we will create new documents.

passport.use(User.createStrategy()); // creating the strategy from our userschema

passport.serializeUser(function(user,done){ // serialsation of the cookie
    done(null,user.id);
}); 
passport.deserializeUser(function(id,done){ // serialsation of the cookie
    User.findById(id,function(err,user){
        done(err,user);
    });
});  

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL : "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/",function(req,res){
    res.render("home");
});
app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"] })
   
  );
app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: "/" }),
  function(req, res) {
    // after a sucessful authentication we will redirect our user to the secrets page.
    res.redirect("/secrets");
  });
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});
app.get("/secrets",function(req,res){
    User.find({"secret": {$ne : null}},function(err,result){
        if(err){
            console.log(err);
        }else{
            if(result){
                res.render("secrets",{data : result});
            }
        }
    });
});
app.get("/submit",function(req,res){
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.redirect("/login");
    }
});

app.post("/submit",function(req,res){
    const newSecret = req.body.secret;
    User.findById(req.user.id,function(err,result){
        if(err){
            console.log(err);
        }else{
            result.Secret = newSecret;
            result.save(function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/register",function(req,res){

    User.register({username:req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
        }else{
            //checking if there exists an existing entry in our db if no redirected to secrets page with a cookie stored in the store.
            // and the new session created.
            passport.authenticate('local')(req,res,function(){ 
                res.redirect("/secrets");
            });
        }
    });

});

app.post("/login",function(req,res){
    
    const newuser = new User({
        username : req.body.username,
        password : req.body.password
    });
    req.logIn(newuser,function(err){
        if(err){
            console.log(err);
        }else{
            //checking if there exists an existing entry in our db if yes then redirected to secrets page.
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.listen(3000 , function(){
    console.log("Sever ON");
});