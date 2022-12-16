"use strict"
var mongodb = require('mongodb');
var mongoose = require('mongoose');
//var dburl = "mongodb://localhost:27017/moms";
var dburl = "mongodb+srv://konlanz:VZq7lsyidGOGAyhq@kodelan-hwvti.mongodb.net/test?retryWrites=true&w=majority";

mongoose.Promise = global.Promise;
mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true}).then(
  () => {console.log('Database is connected') },
  err => { console.log('Can not connect to the database'+ err)}
);