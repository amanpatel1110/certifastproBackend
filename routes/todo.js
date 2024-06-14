const express = require('express');
const task = require('../models/task');

const router = express.Router();

router.post('/', async (req, res) => {

    if (req.body.task) {

        const t = await task.create({
            task: req.body.task,
        });

        if (!t) {
            res.json({ msg: 'error' });
        }
        else {
            res.json({ msg: 'task added' });
        }

    }
});

router.get('/', async (req, res) => {

    const t = await task.find({});
    res.json(t);

});

router.post('/delete', async (req, res) => {

    try {
        const stts = await task.findByIdAndDelete(req.body.id);
        res.json({stts:'success'});
    }
    catch (err) {

    }
});

router.get('/deleteAll', async (req, res) => {


    try {
        const stts = await task.deleteMany();
        res.send(stts, 'hi');
    }
    catch (err) {

    }
});

module.exports = router;
