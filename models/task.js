const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    task:{
        type:'string',
    }
})

const task=new mongoose.model('task',taskSchema);

module.exports = task;