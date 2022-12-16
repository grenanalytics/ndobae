"use strict";
var express = require("express");
const aposToLexForm = require('apos-to-lex-form');
const natural = require('natural');
const SpellCorrector = require('spelling-corrector');
const SW = require('stopword');
const {spawn} = require('child_process');
const { WordTokenizer } = natural;
const { SentimentAnalyzer, PorterStemmer } = natural;
var router = express.Router();
var products = require("../schema/products");
var orders = require("../schema/orders");
var reviews = require("../schema/reviews");


router.get("/", (req, res, next) => {
  var cart = req.session.cart;
  var displayCart = { items: [], total: 0 };
  var total = 0;
  req.session.discart = displayCart;
  for (var item in cart) {
    displayCart.items.push(cart[item]);
    var qr = cart[item].qty;
    var pri = cart[item].price;
    total += qr * pri;
  }
  displayCart.total = total;
  products.find({}, function (err, dat) {
    if (err) throw err;
    res.render("index", { dat: dat, cart: displayCart.items, total });
  });
});

router.get("/events", (req, res) => {
  res.render("events");
});
router.post("/addevent", (req, res) => {
  res.redirect("/");
});
router.post("/add_Checkout", (req, res) => {
  req.session.cart = req.session.cart || {};
  var cart = req.session.cart;
  var prodname = req.body.prodname;
  var prodimage = req.body.prodimage;
  var prodprice = req.body.prodprice;

  if (cart[prodname]) {
    cart[prodname].qty++;
  } else {
    cart[prodname] = {
      name: prodname,
      price: prodprice,
      qty: 1,
      photo: prodimage,
    };
  }
  res.redirect("/");
});
router.get("/checkout", (req, res, next) => {
  var cart = req.session.discart;
  let item = cart.items;
  let total = cart.total;
  res.render("checkout1", { data: item, total });
});

router.get("/details/:id", (req, res) => {
  var prod = req.params.id;
  var cart = req.session.discart;
  let item = cart.items;
  let total = cart.total;
  products.findOne({ prodname: prod }, (err, dat) => {
    if (err) {
      res.redirect("/");
    }
    res.render("product", { data: dat, dataT: item, Total: total });
  });
});

router.get("/category/:uid", (req, res) => {
  var Cate = req.params.uid;
  var cart = req.session.discart;
  let item = cart.items;
  let total = cart.total;
  if (Cate == "Breakfast") {
    products.find({ category: Cate }, (err, data) => {
      if (err) throw err;
      res.render("store", { data: data, dataT: item, Total: total });
    });
  } else if (Cate == "Lunch") {
    products.find({ category: Cate }, (err, data) => {
      if (err) throw err;
      res.render("store", { data: data, dataT: item, Total: total });
    });
  } else if (Cate == "Supper") {
    products.find({ category: Cate }, (err, data) => {
      if (err) throw err;
      res.render("store", { data: data, dataT: item, Total: total });
    });
  } else {
    res.send("404 Not Found");
  }
});

router.post("/checkout", (req, res) => {
  var name = req.body.fname;
  var address = req.body.address;
  var city = req.body.city;
  var phone = req.body.phone;
  var prod = req.body.mprod;
  var qty = req.body.mqty;
  var cart = req.session.discart;
  let total = cart.total;

  var forder = {
    Fname: name,
    Address: address,
    City: city,
    Phone: phone,
    Prodname: prod.toString(),
    Prodqty: qty.toString(),
    Total: total,
  };
  //this is for saving the others/
  var prd = new orders(forder);
  prd.save();

  delete req.session;
  res.redirect("/");
});
//ths for securing the the routes;
function secur(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
}
router.post("/rating", (req, res) => {
  var bdy = req.body;  
  console.log(bdy)
  var name = req.body.name;
  var rating = req.body.rating;
  var email = req.body.email;
  var coments = req.body.coments;
  var rate = {
    name: name,
    email: email,
    review: coments,
    rating: rating,
  };
  new reviews(rate).save();
  res.redirect("/");
});
const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

router.post('/anylizer', (req, res)=>{
  var review = req.body.coments;
  console.log(review)
  const lexedReview = aposToLexForm(review);
  const casedReview = lexedReview.toLowerCase();
  const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');
  
  const { WordTokenizer } = natural;
  const tokenizer = new WordTokenizer();
  const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);
  tokenizedReview.forEach((word, index) => {
    tokenizedReview[index] = spellCorrector.correct(word);
  })
  const filteredReview = SW.removeStopwords(tokenizedReview);
  const { SentimentAnalyzer, PorterStemmer } = natural;
  const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
  const analysis = analyzer.getSentiment(filteredReview);
  console.log(analysis)
  var bdy = req.body;  
  var name = req.body.name;
  var rating = req.body.rating;
  var email = req.body.email;
  var coments = req.body.coments;
  var lab 
  if(analysis < 0){
    lab = "Bad"
    var rate = {
      name: name,
      email: email,
      review: coments,
      rating: rating,
      Analysis: lab,
    };
    new reviews(rate).save();
  }else if(analysis == 0){
    lab = "Good"
    var rate = {
      name: name,
      email: email,
      review: coments,
      rating: rating,
      Analysis: lab,
    };
    new reviews(rate).save();
  }else{
    lab = "Great"
    var rate = {
      name: name,
      email: email,
      review: coments,
      rating: rating,
      Analysis: lab,
    };
    new reviews(rate).save();
  }


  res.redirect('/')
})

router.post("/shop", (req, res, next) => {
  req.session.mainp = req.session.mainp || {};
  var mainp = req.session.mainp;
  var prod = req.body.prod;
  var items = "items";
  products.findOne({ prodname: prod }, function (err, result) {
    if (err) {
      throw err;
    }
    if (mainp[items]) {
      mainp[items].qty++;
    } else {
      mainp[items] = {
        item: result._id,
        name: result.prodname,
        price: result.prodprice,
        qty: 1,
        photo: result.prodimage,
      };
    }

    req.flash("success", "You Selected a product please slect your add ons");
    res.redirect("/");
  });
});

router.get("/logout", (req, res, next) => {
  delete req.session;
  res.redirect("/");
});
router.get("/empty_cart", (req, res) => {
  delete req.session;
  res.redirect("/");
});

module.exports = router;
