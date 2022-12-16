var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Order=new Schema({
    Fname:{
        type:String
        
    },
    Address:{
        type:String

    },
    City:{
        type:String
        
    },
    Phone:{
        type:String
        
    },
    Prodname:{
        type:String   
    },
    Prodqty:{
        type:String  
    },

    Total:{
        type:Number  
    },
    Date:{
        type:Date,
        default: Date.now
    }

});

var order = mongoose.model('oders', Order);
module.exports=order;
