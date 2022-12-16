"use strict"
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var adm = new Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    review:{
        type:String
    },
    rating:{
        type:String
    },
    Analysis:{
        type:String
    }
});
var rev = mongoose.model('reviews', adm);
module.exports= rev;