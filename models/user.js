const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        password:{
            type:String,
            required:true,
        },
        verified:{
            type:Boolean,
            default:false
        },
        role:{
            type:String,
            default:'user'
        }
    },
    {timestamps:true},
);

const myuser = mongoose.model('myuser',userSchema);

module.exports = myuser