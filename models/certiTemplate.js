const mongoose = require('mongoose');

const certiTemplateSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },

    imgUrl:{
        type:String,
        required:true,
    }
},
{timestamps:true}
);

const certiTemplate = new mongoose.model('certiTemplate',certiTemplateSchema);

module.exports = certiTemplate;