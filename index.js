const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const {body,validationResult} = require('express-validator');

const mailVerifier = require('./services/mailSender');
const { verifyToken } = require('./services/authentication');
const myuser = require('./models/user');

const todoRoutes = require('./routes/todo');
const userRoutes = require('./routes/user');
const certificateRoutes = require('./routes/certificate')

dotenv.config();

// const PORT = 8006;
const app = express();

app.use(cors({
    origin: process.env.CORS_FRONTEND,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.resolve('./public/certi-images')));

mongoose.connect(process.env.DATABASE) //'mongodb://127.0.0.1:27017/CertiGen'
    .then(() => console.log('conn success'))
    .catch((err) => console.log('conn fails',err));


app.get('/', (req, res) => {
    const token = req?.cookies['token'];

    if (token) {
        // console.log(token);
        try {
            const payload = verifyToken(token);
            if (payload) {
                req.user = payload;
                return res.json(payload);
            }
            else {
                return res.json({ msg: 'user not valid' });
            }
        }
        catch (err) {
            return res.json({ msg: 'fails' });
        }
    }
    return res.json({ msg: 'fails' });
});


app.get('/:email/verify/:token', async (req, res) => {
    const { email, token } = req.params;

    try {
        const data = await jwt.verify(token, '$$#key%maiLSeNder!@');

        if (data.payload.email === email) {
            await myuser.updateOne({ email }, { $set: { verified: true } });
            return res.json({ msg: 'success' });
        }
        return res.json({ msg: 'fail' });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: 'fail' });
    }
});

app.post('/sendEmail',body('email').exists().trim().isEmail().withMessage('Email must be valid').escape(),async (req, res) => {

    const email=req.body.email;

    const errs = validationResult(req);

    // console.log(errs);
    
    if(!errs.isEmpty()){
        return res.json({msg:'Invalid email'});
    }

    try{
        const find = await myuser.findOne({email});
        if(!find){
            return res.json({msg:'user not registered'});
        }

        if(find.verified){
            return res.json({msg:'user already verified'});   
        }
        
    }
    catch(err){
        console.log(err);
    }

    const verifyPayload = {
        email: email,
        name:'temp',
    }
    console.log(verifyPayload);

    try {
        const status = await mailVerifier(verifyPayload);
        console.log(status);

        if (status) return res.json({ msg: 'success' });
        else return res.json({ msg: 'fail' });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: 'fail' });
    }
    return res.json({msg:'ok'});
});


app.use('/todo', todoRoutes);
app.use('/user', userRoutes);
app.use('/certificate', certificateRoutes);

app.listen(process.env.PORT, () => console.log('Server started'));



// const crypto = require('crypto');
// const task = require('./models/task');
// const certiTemplate = require('./models/certiTemplate');
// const multer = require('multer');
// const bcrypt = require('bcrypt');
// const { title } = require('process');
// const certificateValidation = require('./models/certificateValidation');
// app.post('/user/signup', async (req, res) => {

//     const findUser = await myuser.findOne({
//         email: req.body.email,
//     });

//     if (findUser) {
//         return res.json({ msg: 'user already exisist' });
//     }

//     const password = req.body.password;
//     const salt = await bcrypt.genSalt(10);

//     const hashedPassword = await bcrypt.hash(password, salt);

//     const verifyPayload = {
//         name: req.body.uname,
//         email: req.body.email,
//     }

//     await mailVerifier(verifyPayload);

//     try {
//         const state = await myuser.create({
//             name: req.body.uname,
//             email: req.body.email,
//             password: hashedPassword,
//         });

//         if (!state) return res.status(501).json({ msg: 'fail' });
//         return res.status(201).json({ msg: 'success' });
//     }
//     catch (err) {
//         console.log(err);
//     }

//     return res.status(501).json({ msg: 'fail' });

// });


// app.post('/user/login', async (req, res) => {

//     const findUser = await myuser.findOne({
//         email: req.body.email,
//     });

//     if (!findUser) return res.status(401).json({ msg: 'fail' });

//     if(findUser.verified === false) {
//         return res.json({ msg: 'Not verified' });
//     }
//     const password = req.body.password;

//     const isValid = await bcrypt.compare(password, findUser.password);

//     if (!isValid) return res.status(401).json({ msg: 'fail' });

//     else {
//         const token = generateToken(findUser);
//         return res.status(200).cookie('token', token, { httpOnly: false, secure: false }).json({ msg: 'success', token: token });
//     }

// });

// app.get('/user/logout', (req, res) => {

//     // res.clearCookie('token');
//     // console.log(req.cookies.token);
//     return res.json({ msg: 'success' });
// });

// const imageUploadPath = path.resolve('./public/certi-images')//'/Users/aman/Desktop/MERN/backend/public/certi-images';

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, imageUploadPath)
//     },
//     filename: function (req, file, cb) {
//         cb(null, `${Date.now()}_${file.originalname}`)
//     }
// })

// const imageUpload = multer({ storage: storage })

// app.post('/image-upload', imageUpload.single("image-file"), async (req, res) => {

//     console.log('POST request received to /image-upload.');

//     const state = await certiTemplate.create({
//         title: req.body.title,
//         imgUrl: req.file.filename,
//     });

//     if (!state) return res.json({ msg: 'fail' });
//     else return res.status(201).json({ msg: 'success' });

// });

// app.get('/card', async (req, res) => {
//     const item = await certiTemplate.find({});
//     res.json(item);
// })


// app.delete('/deleteCertiTemplate/:id',async(req,res)=>{
//     try{
//         const id = req.params.id;

//         const status = await certiTemplate.findByIdAndDelete(id);
//         console.log(status);

//         return res.json({msg:'success'});
//     }
//     catch(err){
//         console.log(err);
//         return res.json({msg:'fails'});
//     }
// });

// app.post('/todo', async (req, res) => {

//     if (req.body.task) {

//         const t = await task.create({
//             task: req.body.task,
//         });

//         if (!t) {
//             res.json({ msg: 'error' });
//         }
//         else {
//             res.json({ msg: 'task added' });
//         }

//     }
// });

// const certiValidationUploadPath=path.resolve('./public/certi-images')//'/Users/aman/Desktop/MERN/backend/public/certi-images';

// const storageCertiVal = multer.diskStorage({
//     destination: function(req, file, cb) {
//       cb(null, imageUploadPath)
//     },
//     filename: function(req, file, cb) {
//       cb(null,`${Date.now()}_${file.originalname}`)
//     }
//   })

// const certiValidationUpload = multer({storage: storage})

// app.post('/certiVal', async (req, res) => {

//     const token = req?.cookies['token'];

//     try {

//         const payload = verifyToken(token);

//         const holderName = req.body.pname;
//         const date = req.body.date;
//         const issuerName = payload.email;
//         const body = req.body.body;

//         const data = await certificateValidation.create({ holderName, date,body, issuerName });

//         return res.json(data);

//     }
//     catch (err) {

//     }
// });

// app.get('/certiAuthentication/:id',async(req,res)=>{
//     const id=req.params.id;

//    try{
//     const certi =await certificateValidation.findById(id);
//     // console.log(certi);
//     return res.json(certi);
//    }
//    catch(err){
//     return res.json({msg:'error'});
//    }
// });

// app.get('/todo', async (req, res) => {

//     const t = await task.find({});
//     res.json(t);

// });

// app.post('/todo/delete', async (req, res) => {

//     //    console.log(req.body.id);

//     try {
//         const stts = await task.findByIdAndDelete(req.body.id);
//         res.send(stts, 'hi');
//     }
//     catch (err) {

//     }


// });

// app.get('/todo/deleteAll', async (req, res) => {


//     try {
//         const stts = await task.deleteMany();
//         res.send(stts, 'hi');
//     }
//     catch (err) {

//     }
// });

// mongodb+srv://aman9429578116:Am@n111@@cluster0.y1diaqq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0