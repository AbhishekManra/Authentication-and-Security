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
    password : String
}); 

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User" , userSchema); // our mongoose model alike which we will create new documents.

passport.use(User.createStrategy()); // creating the strategy from our userschema

passport.serializeUser(User.serializeUser()); // serialsation of the cookie
passport.deserializeUser(User.deserializeUser());  // serialsation of the cookie


app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});
app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/");
    }
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