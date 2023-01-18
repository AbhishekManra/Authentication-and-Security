//jshint esversion:6
require('dotenv').config();
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const md5 = require("md5"); // we installed the package naem md5 for [ Hashing of the passwords that can not be reverted back to orignal password ]

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
    const newuser = new User({
        email : req.body.username,
        password : md5(req.body.password) // we converted the password into a hash 
    });
    newuser.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.render("secrets");
        }
    });
});

app.post("/login",function(req,res){
    const a = req.body.username;
    const b = md5(req.body.password);
    User.findOne({email : a},function(err,result){
        if(err){
            console.log(err);
        }else{
            if(result.password === b){
                res.render("secrets");
            }else{
                res.send("Wrong Password");
            }
        }
    });
});

app.listen(3000 , function(){
    console.log("Sever ON");
});