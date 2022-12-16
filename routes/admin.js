"use strict"
var express = require('express');
var router = express.Router();
var upload = require("./upload");
var crypto = require('crypto');
var Admin = require('../schema/admin');
var Orders = require('../schema/orders');
var Products = require('../schema/products');
var Userz = require('../schema/user');
var reviews = require('../schema/reviews');



router.get('/', (req, res , next)=>{
    res.render('flogin');
});

function secur(req, res, next){
    if(req.session.admin){
      next();
    }else{
      res.redirect('/');
    }
}


router.post('/admin_login', (req, res, next)=>{
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var passenc = crypto.createHash('md5').update(password).digest('hex');
    Admin.findOne({username:username, email:email, password:passenc},(err, data)=>{
        if(err){
            res.redirect('/admin_login');
        }
        req.session.admin= data; 
        var adminses= req.session.admin;
        res.redirect('/admin/panel');

    });
    
});


router.get('/panel/userz', secur, (req, res )=>{
    Userz.find({}, (err, db)=>{
        if(err) throw err;
        res.render('adpanel', {data:db})
    })
})

router.get('/orders',  secur, (req, res )=>{
    var date = new Date();
    var dete = date.getDate();
    var month = date.getMonth()+1;
    var year = date.getFullYear();

    var query = Orders.find({});
    query.sort({_id:-1}).exec((err, db)=>{
        if(err) throw err;
        res.render('morders',{data:db});
    });


})

router.get('/reviews', (req, res)=>{
    reviews.find({}, (errr, data)=>{
        console.log(data);
        if(errr){ throw errr};
        res.render('lusers', {data:data})
    })
})

router.post('/delete_product',  secur, (req, res)=>{
    var hey = req.body.proddelete;
    Products.findByIdAndRemove({_id:hey}, (err, con)=>{
        if(err) throw err;
        res.redirect('/admin/panel')
    })
})
router.get('/panel', secur,  (req, res, next)=>{
    Orders.find({}, (err, result)=>{
        if(err){
            res.redirect('/');
        }
    res.render('adpanel', {data:result});    
    })
     
});


router.get('/panel/product', secur,  (req, res, next)=>{
    Products.find({}, (err, result)=>{
        res.render('maddproduct', 
        {data:result});
    })
    
});
 router.post('/addme', (req, res)=>{
    var prodname = req.body.product_name;
    var prodprice = req.body.prod_price;
    var category = req.body.Category;
    var proddd = req.body.prodd;

    upload(req, res, (err)=>{
        if(err){
            console.log(err);
            throw err;
        }else{
            var obj = {prodname:req.body.product_name, 
                prodprice:req.body.prod_price, 
                prodimage: req.file.filename,
                category:req.body.Category,
                prod_des: req.body.prodd
            };
            var prd = new Products(obj);
            prd.save();
            res.redirect('/admin/panel') 
        
        }
    })

 })


router.get('/logout', (req, res, next)=>{
    delete req.session.admin;
    res.redirect('/');
  })

router.get('/addadmin', secur, (req, res, next)=>{
    //i will be addd the addmi here late with double encryption
    res.render('register');
});

router.post('/add_admin', secur, (req, res)=>{
    var name = req.body.nam;
    var username = req.body.uname;
    var email = req.body.email;
    var password = req.body.password;
    var passenc = crypto.createHash('md5').update(password).digest('hex');
    console.log(passenc);
    var adde ={
        name:name,
        email:email,
        username:username,
        password:passenc
    } 
    new Admin(adde).save();
    res.redirect('/admin');
});




module.exports = router;
