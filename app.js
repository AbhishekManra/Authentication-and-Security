//jshint esversion:6
require('dotenv').config();
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); 
// we installed yet another package namely 'bcrypt' which will allow us to hash our passwords
// We salt our password so that it will become more back-breaking for the any hacker.
const saltrounds = 10;
// salting mean adding a random hash to our orignal hash
// bcrypt allow us to use salting rounds.

app.set("view engine" , "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect('mongodb://127.0.0.1:27017/AuthDB2');

// creating a full mongoose schema
const userSchema = new mongoose.Schema({
    email : String,
    password : String
}); 

const User = new mongoose.model("User" , userSchema); // our mongoose model alike which we will create new documents.

app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    bcrypt.hash(req.body.password, saltrounds, function(err, hash) { // hash = it is our new hash key after 10 rounds of salting
        const newuser = new User({
            email : req.body.username,
            password : hash 
        });
        newuser.save(function(err){
            if(err){
                console.log(err);
            }else{
                res.render("secrets");
            }
        });
    });
});

app.post("/login",function(req,res){
    User.findOne({email : req.body.username},function(err,result){
        if(err){
            console.log(err);
        }else{
            bcrypt.compare(req.body.password, result.password, function(err, result1) {
               if(result1 === true){ 
                res.render("secrets");
               }else{
                console.log(err);
               }
            });
        }
    });
});

app.listen(3000 , function(){
    console.log("Sever ON");
});