const mongoose = require('mongoose');

const certificateValidationSchema = new mongoose.Schema(
    {
        holderName:{
            type:String,
            required:true,
        },

        date:{
            type:String,
            required:true,
        },

        body:{
            type:String,
            required:true,
        },

        issuerName:{
            type:String,
            required:true,
        },
    },
    {timestamps:true},
);

const certificateValidation = new mongoose.model('certificateValidation',certificateValidationSchema);

module.exports = certificateValidation;