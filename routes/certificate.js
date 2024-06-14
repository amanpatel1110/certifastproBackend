const express = require('express');
const path = require('path');
const multer = require('multer');

const { verifyToken } = require('../services/authentication');
const certiTemplate = require('../models/certiTemplate');
const certificateValidation = require('../models/certificateValidation');


const router = express.Router();

const imageUploadPath = path.resolve('./public/certi-images')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imageUploadPath)
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
})

const imageUpload = multer({ storage: storage })

router.post('/image-upload', imageUpload.single("image-file"), async (req, res) => {

    console.log('POST request received to /image-upload.');

    const state = await certiTemplate.create({
        title: req.body.title,
        imgUrl: req.file.filename,
    });

    if (!state) return res.json({ msg: 'fail' });
    else return res.status(201).json({ msg: 'success' });

});

router.get('/card', async (req, res) => {
    const item = await certiTemplate.find({});
    res.json(item);
})


router.delete('/deleteCertiTemplate/:id',async(req,res)=>{
    try{
        const id = req.params.id;

        const status = await certiTemplate.findByIdAndDelete(id);
        console.log(status);

        return res.json({msg:'success'});
    }
    catch(err){
        console.log(err);
        return res.json({msg:'fails'});
    }
});

router.post('/certiVal', async (req, res) => {

    const token = req?.cookies['token'];

    try {

        const payload = verifyToken(token);

        const holderName = req.body.pname;
        const date = req.body.date;
        const issuerName = payload.email;
        const body = req.body.body;

        const data = await certificateValidation.create({ holderName, date,body, issuerName });

        return res.json(data);

    }
    catch (err) {

    }
});

router.get('/certiAuthentication/:id',async(req,res)=>{
    const id=req.params.id;

   try{
    const certi =await certificateValidation.findById(id);
    return res.json(certi);
   }
   catch(err){
    return res.json({msg:'error'});
   }
});


module.exports = router;



