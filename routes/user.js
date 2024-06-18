const express = require('express');
const myuser = require('../models/user');
const bcrypt = require('bcrypt');
const { generateToken} = require('../services/authentication');
const mailVerifier = require('../services/mailSender');
const {body,validationResult} = require('express-validator');

const router = express.Router();

router.post('/signup',[

    body('username').exists().trim().matches(/^[a-zA-Z]{3}[a-zA-Z0-9_]*$/).withMessage('username must be in proper format').escape(),

    body('email').exists().trim().isEmail().withMessage('Email must be valid').escape(),

    body('password').exists().trim().isLength({min:6}).withMessage('Password must be min 6 characters').escape()

    ],async (req, res) => {

    const errs = validationResult(req);
    
    if(!errs.isEmpty()){
        return res.status(400).json({errors:errs.array()});
    }

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const findUser = await myuser.findOne({
        email: email,
    });

    if (findUser) {
        return res.json({ msg: 'user already exisist' });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const verifyPayload = {
        name: username,
        email: email,
    }

    await mailVerifier(verifyPayload);

    try {
        const state = await myuser.create({
            name: username,
            email: email,
            password: hashedPassword,
        });

        if (!state) return res.status(501).json({ msg: 'fail' });
        return res.status(201).json({ msg: 'success' });
    }
    catch (err) {
        console.log(err);
    }

    return res.status(501).json({ msg: 'fail' });
});


router.post('/login',
    [
        body('email').exists().trim().isEmail().withMessage('Email must be valid').escape(),

        body('password').exists().trim().isLength({min:6}).withMessage('Password must be min 6 characters').escape(),
    ]
    ,async (req, res) => {

     const errs = validationResult(req);

     if(!errs.isEmpty()){
        return res.status(400).json({errors:errs.array()});
     }

    const findUser = await myuser.findOne({
        email: req.body.email,
    });

    if (!findUser) return res.status(401).json({ msg: 'fail' });

    if(findUser.verified === false) {
        return res.json({ msg: 'Not verified' });
    }
    const password = req.body.password;

    const isValid = await bcrypt.compare(password, findUser.password);

    if (!isValid) return res.status(401).json({ msg: 'fail' });

    else {
        const token = generateToken(findUser);
        return res.status(200).cookie('token', token, { httpOnly: true, secure: true ,sameSite: 'None'}).json({ msg: 'success', token: token });
    }

});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    console.log(req?.cookies['token']);
    return res.json({ msg: 'success' });
});

module.exports=router;
