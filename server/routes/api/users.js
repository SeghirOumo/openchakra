const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');


const validateRegisterInput = require('../../validation/register');
const validateSimpleRegisterInput = require('../../validation/simpleRegister');
const validateLoginInput = require('../../validation/login');

const User = require('../../models/User');
const ResetToken = require('../../models/ResetToken');
const crypto = require('crypto');
const multer = require("multer");
const nodemailer = require("nodemailer");

const { config } = require('../../../config/config');
const url = config.apiUrl;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/profile/')
    },
    filename: function (req, file, cb) {
        let datetimestamp = Date.now();
        let key = crypto.randomBytes(5).toString('hex');
        cb(null, datetimestamp+'_'+key+ '_'+file.originalname )
    }
});
const upload = multer({ storage: storage,
    fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    }});

const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/profile/idCard/')
    },
    filename: function (req, file, cb) {
        let datetimestamp = Date.now();
        let key = crypto.randomBytes(5).toString('hex');
        cb(null, datetimestamp+'_'+key+ '_'+file.originalname )
    }
});
const upload2 = multer({ storage: storage2,fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.pdf' && ext !== '.jpeg') {
            return callback(new Error('Error extension'))
        }
        callback(null, true)
    } });


router.get('/test',(req, res) => res.json({msg: 'Users Works!'}) );

// @Route POST /myAlfred/api/users/register
// Register
router.post('/register',(req,res) =>{
    const {errors, isValid} = validateSimpleRegisterInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({email: req.body.email})
        .then(user => {
            if (user) {
                errors.email = 'L\'email existe déjà';
                return res.status(400).json(errors);
            } else {
                const userFields = {};
                userFields.name = req.body.name;
                userFields.gender = req.body.gender;
                userFields.firstname = req.body.firstname;
                userFields.email = req.body.email;
                userFields.password = req.body.password;
                userFields.birthday = req.body.birthday;

                userFields.billing_address = {};
                userFields.billing_address.address = req.body.address;
                userFields.billing_address.zip_code = req.body.zip_code;
                userFields.billing_address.city = req.body.city;
                userFields.billing_address.country = req.body.country;



                userFields.billing_address.gps = {};
                userFields.billing_address.gps.lat = req.body.lat;
                userFields.billing_address.gps.lng = req.body.lng;
                userFields.service_address = [];
                userFields.last_login = [];

                const newUser = new User(userFields);
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                res.json(user);
                                let transporter = nodemailer.createTransport({
                                    host: 'smtp.ethereal.email',
                                    port: 587,
                                    auth: {
                                        user: 'kirstin85@ethereal.email',
                                        pass: '1D7q6PCENKSX5cj622'
                                    }
                                });

                                let info = transporter.sendMail({
                                    from: 'kirstin85@ethereal.email', // sender address
                                    to: `${user.email}`, // list of receivers
                                    subject: "Valider votre compte", // Subject line
                                    text: `${url}/validateAccount?user=${user._id}`, // plain text body
                                    html: '<a href='+url+'validateAccount?user='+user._id+'>Cliquez içi</a>' // html body
                                });
                            })
                            .catch(err => console.log(err));
                    })
                })



            }
        })
});

// @Route GET /myAlfred/api/users/sendMailVerification
// Send email
// @access private
router.get('/sendMailVerification',passport.authenticate('jwt',{session:false}),(req,res) => {
    User.findById(req.user.id)
        .then(user => {
            let transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: 'kirstin85@ethereal.email',
                    pass: '1D7q6PCENKSX5cj622'
                }
            });

            let info = transporter.sendMail({
                from: 'kirstin85@ethereal.email', // sender address
                to: `${user.email}`, // list of receivers
                subject: "Valider votre compte", // Subject line
                text: `${url}validateAccount?user=${user._id}`, // plain text body
                html: '<a href='+url+'validateAccount?user='+user._id+'>Cliquez içi</a>' // html body
            });
        })
        .catch(err => {
            console.log(err)
        })
});

// @Route PUT /myAlfred/api/users/validateAccount
// Validate account after register
router.post('/validateAccount',(req,res) => {
    User.findByIdAndUpdate(mongoose.Types.ObjectId(req.body.id), {
        is_confirmed: true
    },{new:true})
        .then(user => {
            res.json(user)
        })
        .catch(err => {
            console.log(err)
        })
});

// @Route PUT /myAlfred/api/users/profile/billingAddress
// Add an address in the profile
// @Access private
router.put('/profile/billingAddress',passport.authenticate('jwt',{session: false}), (req,res) => {

    User.findById(req.user.id)
        .then(user => {
            user.billing_address = {};
            user.billing_address.address = req.body.address;
            user.billing_address.zip_code = req.body.zip_code;
            user.billing_address.city = req.body.city;

            if (req.body.country === 'France') {
                user.billing_address.country = 'France';
            } else {
                user.billing_address.country = 'Maroc';
            }

            user.billing_address.gps = {};

            let address = req.body.address;
            let city = req.body.city;
            let zip = req.body.zip_code;

            let newAddress = address.replace(/ /g, '+');

            const url = newAddress + '%2C+' + city + ',+'+zip+'&format=geojson&limit=1';

            axios.get(`https://nominatim.openstreetmap.org/search?q=${url}`)
                .then(response => {

                    let result = response.data.features;

                    result.forEach(function (element) {
                        user.billing_address.gps.lat = element.geometry.coordinates[1];
                        user.billing_address.gps.lng = element.geometry.coordinates[0];
                    });

                    user.save().then(user => res.json(user)).catch(err => console.log(err));

                })
                .catch(error => {
                    console.log(error)
                });
        })
});

// @Route PUT /myAlfred/api/users/profile/serviceAddress
// Add an other address in the profile
// @Access private
router.put('/profile/serviceAddress',passport.authenticate('jwt',{session: false}), (req,res) => {

    User.findById(req.user.id)
        .then(user => {
            const address = {
                address: req.body.address,
                city: req.body.city,
                zip_code: req.body.zip_code,
                lat: req.body.lat,
                lng: req.body.lng,
                label: req.body.label,
                floor: req.body.floor,
                note: req.body.note,
                phone_address: req.body.phone,
            };
            user.service_address.push(address);


            user.save().then(user => res.json(user)).catch(err => console.log(err));


        })
});

// @Route GET /myAlfred/api/users/profile/address/:id
// Get service address by id
// @Access private
router.get('/profile/address/:id',passport.authenticate('jwt',{session:false}),(req,res)=> {
    User.findById(req.user.id)
        .then(user => {
            const index = req.params.id;
            const address = user.service_address;
            const selected = address.map(item => item.id)
                .indexOf(index);
            const obj = address[selected];
            res.json(obj);
        })
        .catch(err => console.log(err))
});

// @Route PUT /myAlfred/api/users/profile/address/:id
// Edit service address by id
// @Access private
router.put('/profile/address/:id',passport.authenticate('jwt',{session:false}),(req,res)=> {
    User.findById(req.user.id)
        .then(user => {
            const index = user.service_address
                .map(item => item.id)
                .indexOf(req.params.id);
            user.service_address[index].label = req.body.label;
            user.service_address[index].address = req.body.address;
            user.service_address[index].zip_code = req.body.zip_code;
            user.service_address[index].city = req.body.city;
            user.service_address[index].floor = req.body.floor;
            user.service_address[index].note = req.body.note;
            user.service_address[index].phone_address = req.body.phone;
            user.service_address[index].lat = req.body.lat;
            user.service_address[index].lng = req.body.lng;

            user.save().then(address => res.json(address)).catch(err => console.log(err));
        })
        .catch(err => console.log(err))
});

// @Route DELETE /myAlfred/api/users/profile/address/:id
// Delete service address by id
// @Access private
router.delete('/profile/address/:id',passport.authenticate('jwt',{session:false}),(req,res)=> {
    User.findById(req.user.id)
        .then(user => {
            const index = user.service_address
                .map(item => item.id)
                .indexOf(req.params.id);
            user.service_address.splice(index,1);

            user.save().then(address => res.json(address)).catch(err => console.log(err));
        })
        .catch(err => console.log(err))
});

// @Route PUT /myAlfred/api/users/profile/phone
// Add phone number in profile
// @Access private
router.put('/profile/phone',passport.authenticate('jwt',{session:false}),(req,res) => {
    User.findByIdAndUpdate(req.user.id, {
        phone: req.body.phone
    },{new:true})
        .then(user => {
            res.json(user)
        })
        .catch(err => {
            console.log(err)
        })
});

// @Route PUT /myAlfred/api/users/profile/job
// Add job in profile
// @Access private
router.put('/profile/job',passport.authenticate('jwt',{session:false}),(req,res) => {
    User.findByIdAndUpdate(req.user.id, {
        job: req.body.job
    },{new:true})
        .then(user => {
            res.json(user)
        })
        .catch(err => {
            console.log(err)
        })
});

// @Route PUT /myAlfred/api/users/profile/picture
// Add a picture profile
// @Access private
router.post('/profile/picture',upload.single('myImage'),passport.authenticate('jwt',{session:false}),(req,res) => {
    User.findByIdAndUpdate(req.user.id, {
        picture: req.file.path
    },{new:true})
        .then(user => {
            res.json(user)
        })
        .catch(err => {
            console.log(err)
        })
});

// @Route PUT /myAlfred/api/users/profile/idCard
// Add an identity card
// @Access private
router.post('/profile/idCard',upload2.fields([{name: 'myCardR',maxCount: 1}, {name:'myCardV',maxCount:1}]),passport.authenticate('jwt',{session:false}),(req,res) => {
    User.findById(req.user.id)
        .then(user => {
            user.id_card = {};
            user.id_card.recto = req.files['myCardR'][0].path;
            let verso = 'myCardV';
            if (verso in req.files) {
                user.id_card.verso = req.files['myCardV'][0].path;
            }

            user.save().then(user => res.json(user)).catch(err => console.log(err));
        })
        .catch(err => {
            console.log(err)
        })
});

// @Route PUT /myAlfred/api/users/profile/idCard
// Add an identity card
// @Access private
router.post('/profile/idCard/addVerso',upload2.single('myCardV'),passport.authenticate('jwt',{session:false}),(req,res) => {
    User.findById(req.user.id)
        .then(user => {
            user.id_card.verso = req.file.path;


            user.save().then(user => res.json(user)).catch(err => console.log(err));
        })
        .catch(err => {
            console.log(err)
        })
});

// @Route POST /myAlfred/api/users/register/alfred
// Register an alfred
router.post('/register/alfred', (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({email: req.body.email})
        .then(user => {
            if(user) {
                errors.email = 'Email already exist';
                return res.status(400).json({errors});
            } else {
                const alfredFields = {};
                alfredFields.name = req.body.name;
                alfredFields.gender = req.body.gender;
                alfredFields.firstname = req.body.firstname;
                alfredFields.email= req.body.email;
                alfredFields.password = req.body.password;
                alfredFields.birthday = req.body.birthday;
                alfredFields.phone =  req.body.phone;
                alfredFields.is_alfred = true;

                alfredFields.billing_address = {};
                if(req.body.address) alfredFields.billing_address.address = req.body.address;
                if(req.body.city) alfredFields.billing_address.city = req.body.city;
                if(req.body.zip_code) alfredFields.billing_address.zip_code = req.body.zip_code;
                if(req.body.country) alfredFields.billing_address.country = req.body.country;

                alfredFields.service_address = {};
                if(req.body.service_address) alfredFields.service_address.address = req.body.service_address;
                if(req.body.service_city) alfredFields.service_address.city = req.body.service_city;
                if(req.body.service_zip_code) alfredFields.service_address.zip_code = req.body.service_zip_code;
                if(req.body.service_country) alfredFields.service_address.country = req.body.service_country;

                alfredFields.picture = req.body.picture;
                if(req.body.job) alfredFields.job = req.body.job;
                if(req.body.siret) alfredFields.siret = req.body.siret;
                if(req.body.vat_number) alfredFields.vat_number = req.body.vat_number;

                alfredFields.account = {};
                if(req.body.bank_code) alfredFields.account.bank_code = req.body.bank_code;
                if(req.body.guichet_code) alfredFields.account.guichet_code = req.body.guichet_code;
                if(req.body.account_number) alfredFields.account.account_number = req.body.account_number;
                if(req.body.rib_key) alfredFields.account.rib_key = req.body.rib_key;
                if(req.body.iban) alfredFields.account.iban = req.body.iban;
                if(req.body.bic) alfredFields.account.bic = req.body.bic;
                const newUser = new User (alfredFields);
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }


        })
});

// @Route POST /myAlfred/api/users/login
// Login
router.post('/login',(req, res)=> {
    const {errors, isValid} = validateLoginInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.username;
    const password = req.body.password;

    // Find user by email
    User.findOne({email})
        .then(user => {
            // Check for user
            if(!user) {
                errors.username = 'Mot de passe ou email incorrect';
                return res.status(400).json(errors);
            }

            // Check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch && user.active === true) {
                        // User matched

                        const payload = {id: user.id, name: user.name, firstname: user.firstname, is_admin: user.is_admin, is_alfred: user.is_alfred}; // Create JWT payload

                        // Sign token
                        jwt.sign(payload, keys.secretOrKey, {expiresIn: '1d'}, (err, token) => {
                            res.json({success: true, token: 'Bearer ' + token});
                        });
                    } else {
                        errors.password = 'Mot de passe ou email incorrect';
                        return res.status(400).json(errors);
                    }
                });
        });
});


// @Route GET /myAlfred/api/users/logout
// logout
router.get('/logout', function(req, res) {
    res.status(200).send({ success: false, token: null });
});

// @Route GET /myAlfred/api/users/all
// List all users
router.get('/all',(req,res) => {

    User.find({is_admin: false})
        .then(user => {
            if(!user) {
                res.status(400).json({msg: 'No users found'});
            }
            res.json(user);
        })
        .catch(err => res.status(404).json({ user: 'No users found' }))
});

// @Route GET /myAlfred/api/users/users
// List all simple users
router.get('/users',(req,res) => {
    User.find({is_admin: false, is_alfred: false})
        .then(user => {
            if(!user) {
                res.status(400).json({msg: 'No users found'});
            }
            res.json(user);
        })
        .catch(err => res.status(404).json({ users: 'No billing found' }))
});

// @Route GET /myAlfred/api/users/users/:id
// Get one user
router.get('/users/:id',(req,res) => {
    User.findById(req.params.id)
        .then(user => {
            if(!user){
                return res.status(400).json({msg: 'No user found'});
            }
            res.json(user);

        })
        .catch(err => res.status(404).json({ user: 'No user found' }));
});

// @Route PUT /myAlfred/api/users/users/becomeAlfred
// Update one user is_alfred's status
router.put('/users/becomeAlfred',passport.authenticate('jwt',{session:false}),(req,res) => {
    User.findByIdAndUpdate(req.user.id,{is_alfred: true},{new: true})
        .then(user => {
            if(!user){
                return res.status(400).json({msg: 'No user found'});
            }
            res.json(user);

        })
        .catch(err => res.status(404).json({ user: 'No user found' }));
});

// @Route PUT /myAlfred/api/users/users/deleteAlfred
// Update one user is_alfred's status
router.put('/users/deleteAlfred',passport.authenticate('jwt',{session:false}),(req,res) => {
    User.findByIdAndUpdate(req.user.id,{is_alfred: false},{new: true})
        .then(user => {
            if(!user){
                return res.status(400).json({msg: 'No user found'});
            }
            res.json(user);

        })
        .catch(err => res.status(404).json({ user: 'No user found' }));
});

// @Route PUT /myAlfred/api/users/alfredViews/:id
// Update number of views for an alfred
router.put('/alfredViews/:id',(req,res) => {
    User.findByIdAndUpdate(req.params.id,{$inc: {number_of_views: 1}},{new:true})
        .then(user => {
            if(!user){
                return res.status(400).json({msg: 'No user found'});
            }
            res.json(user);

        })
        .catch(err => res.status(404).json({ user: 'No user found' }));
});

// @Route GET /myAlfred/api/users/home/alfred
// List alfred homepage
router.get('/home/alfred',(req,res) => {
    User.find({is_alfred: true})
        .sort({creation_date: -1})
        .limit(10)
        .then(user => {
            if(!user) {
                res.status(400).json({msg: 'No alfred found'});
            }
            res.json(user);
        })
        .catch(err => res.status(404).json({ alfred: 'No alfred found' }))
});

// @Route GET /myAlfred/api/users/alfred
// List all alfred
router.get('/alfred',(req,res) => {
    User.find({is_alfred: true})
        .then(user => {
            if(!user) {
                res.status(400).json({msg: 'No alfred found'});
            }
            res.json(user);
        })
        .catch(err => res.status(404).json({ alfred: 'No alfred found' }))
});

// @Route GET /myAlfred/api/users/current
// Get the current user
// @Access private
router.get('/current',passport.authenticate('jwt',{session:false}),(req,res) => {
    User.findById(req.user.id)
        .populate('resetToken')
        .then(user => {

            res.json(user);
        })
        .catch(err => res.status(404).json({ alfred: 'No alfred found' }))
});

// @Route POST /myAlfred/api/users/email/check
//  email
router.post('/email/check',(req,res) => {

    User.findOne({email: req.body.email})
        .then(user => {
            let transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: 'kirstin85@ethereal.email',
                    pass: '1D7q6PCENKSX5cj622'
                }
            });

            let info = transporter.sendMail({
                from: 'kirstin85@ethereal.email', // sender address
                to: `${user.email}`, // list of receivers
                subject: "Valider votre compte", // Subject line
                text: `${url}validateAccount?user=${user._id}`, // plain text body
                html: '<a href='+url+'validateAccount?user='+user._id+'>Cliquez içi</a>' // html body
            });
        })
        .catch(err => {
            console.log(err);
        })

});

// @Route POST /myAlfred/api/users/forgotPassword
// Send email with link for reset password
router.post('/forgotPassword',(req,res) => {
    const email = req.body.email;

    User.findOne({email: email})
        .then(user => {
            if(user === null) {
                res.json('email not in the database')
            } else {
                const token = crypto.randomBytes(20).toString('hex');
                const newToken = new ResetToken({token:token});
                newToken.save().then(token =>{
                    user.update({resetToken: token._id}).catch(err => console.log(err));
                });

                let transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    auth: {
                        user: 'kirstin85@ethereal.email',
                        pass: '1D7q6PCENKSX5cj622'
                    }
                });

                let info = transporter.sendMail({
                    from: 'kirstin85@ethereal.email', // sender address
                    to: `${user.email}`, // list of receivers
                    subject: "Reset password", // Subject line
                    text: `http://localhost:3000/resetPassword?token=${token}`, // plain text body
                    html: '<a href='+url+'resetPassword?token='+token+'>Cliquez içi</a>' // html body
                });
            }
        })
});

// @Route POST /myAlfred/api/users/resetPassword
// Reset the password
router.post('/resetPassword',(req,res) => {
   const password = req.body.password;
   const token = req.body.token;
   const email = req.body.email;
    //console.log(token);
   User.findOne({email: email})
       .populate('resetToken')
       .then(user => {

           if(user.resetToken.token === token) {
               bcrypt.genSalt(10, (err, salt) => {
                   bcrypt.hash(password, salt, (err, hash) => {
                       if (err) throw err;
                       user.updateOne({password: hash})
                           .then(user => res.json({success: 'password update'}))
                           .catch(err => console.log(err));
                   })
               })
           } else {
               res.json({msg: 'Invalid token'})
           }
       })
});

// @Route PUT /myAlfred/api/users/profile/editProfile
// Edit email, job and phone
// @Access private
router.put('/profile/editProfile',passport.authenticate('jwt',{session:false}),(req,res) => {


    User.findOne({email: req.body.email})
        .then(user => {
            if(user && req.body.email != req.user.email) {
                return res.status(400).json({error: "This email already exist"})
            } else {
                User.findByIdAndUpdate(req.user.id, {
                    email: req.body.email, name: req.body.name, firstname: req.body.firstname, gender: req.body.gender, description:req.body.description,
                    birthday: req.body.birthday,phone: req.body.phone,diplomes: req.body.diplomes,school: req.body.school,job: req.body.job,languages:req.body.languages,
                    emergency_phone: req.body.emergency_phone
                }, {new: true})
                    .then(user => {
                        res.json({success: "Profile updated !"})
                    })
                    .catch(err => console.log(err))
            }
        })
        .catch(err => console.log(err))
});

// @Route PUT /myAlfred/api/users/profile/editPassword
// Edit password
// @Access private
router.put('/profile/editPassword',passport.authenticate('jwt',{session:false}),(req,res) => {
    const password = req.body.password;
    const newPassword = req.body.newPassword;

    if(newPassword.length < 8) {
        return res.status(400).json({error: '8 characters minimum'})
    } else {
        User.findById(req.user.id)
            .then(user => {
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(newPassword, salt, (err, hash) => {
                                    if (err) throw err;
                                    user.password = hash;
                                    user.save()
                                        .then(user => res.json({success: 'Password update'}))
                                        .catch(err => console.log(err));
                                })
                            })


                        } else {
                            return res.status(400).json({error: 'Incorrect password'});
                        }
                    });
            })
    }
});

// @Route PUT /myAlfred/api/users/account/notifications
// Edit notifications preferences
// @Access private
router.put('/account/notifications',passport.authenticate('jwt',{session:false}),(req,res) => {

        User.findById(req.user.id)
            .then(user => {
                //user.notifications_message = {};
                user.notifications_message.email = req.body.messages_email;
                user.notifications_message.push = req.body.messages_push;
                user.notifications_message.sms = req.body.messages_sms;

                //user.notifications_rappel = {};
                user.notifications_rappel.email = req.body.rappel_email;
                user.notifications_rappel.push = req.body.rappel_push;
                user.notifications_rappel.sms = req.body.rappel_sms;

                //user.notifications_promotions = {};
                user.notifications_promotions.email = req.body.promotions_email;
                user.notifications_promotions.push = req.body.promotions_push;
                user.notifications_promotions.sms = req.body.promotions_sms;
                user.notifications_promotions.phone = req.body.promotions_phone;

                //user.notifications_community = {};
                user.notifications_community.email = req.body.community_email;
                user.notifications_community.push = req.body.community_push;
                user.notifications_community.sms = req.body.community_sms;

                //user.notifications_assistance = {};
                user.notifications_assistance.push = req.body.assistance_push;
                user.notifications_assistance.sms = req.body.assistance_sms;

                user.save().then(result => res.json(result)).catch(err => console.log(err));
            })
            .catch(err => console.log(err));
});

// @Route PUT /myAlfred/api/users/account/rib
// Edit rib
// @Access private
router.put('/account/rib',passport.authenticate('jwt',{session:false}),(req,res) => {

    User.findById(req.user.id)
        .then(user => {
            user.account= {};
            user.account.name = req.body.name;
            user.account.bank = req.body.bank;
            user.account.bic = req.body.bic;
            user.account.iban = req.body.iban;



            user.save().then(result => res.json(result)).catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

// @Route PUT /myAlfred/api/users/account/lastLogin
// Push current datetime in array last_login for the user
// @Access private
router.put('/account/lastLogin',passport.authenticate('jwt',{session: false}),(req,res) => {
    User.findById(req.user.id)
        .then(user => {
            const arrayLogin = user.last_login;
            if(arrayLogin.length === 2) {
                arrayLogin.unshift(Date.now());
                arrayLogin.pop();
            } else {
                arrayLogin.unshift(Date.now());
            }

            user.save().then(result => res.json(result)).catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

// @Route PUT /myAlfred/api/users/account/indexGoogle
// Define preference for indexing account
// @Access private
router.put('/account/indexGoogle',passport.authenticate('jwt',{session: false}),(req,res) => {
    User.findByIdAndUpdate(req.user.id,{index_google: req.body.index_google})
        .then(user => {
            res.json(user);
        })
        .catch(err => console.log(err));
});

// @Route DELETE /myAlfred/api/users/profile/picture/delete
// Delete the picture profile
// @Access private
router.delete('/profile/picture/delete',passport.authenticate('jwt',{session:false}),(req,res)=> {
    User.findByIdAndUpdate(req.user.id,{
        picture: 'static/basicavatar.png'
    },{new:true})
        .then(user => {
            res.json(user)
        })
        .catch(err => console.log(err));
});

// @Route PUT /myAlfred/api/users/current/delete
// Delete the current user
// @Access private
router.put('/current/delete',passport.authenticate('jwt',{session:false}),(req,res)=> {
    const hash = crypto.randomBytes(10).toString('hex');
    User.findByIdAndUpdate(req.user.id,{active: false,is_alfred:false,email:hash})
        .then(() => {
             res.json({msg:'Compte désactivé'});
        })
        .catch(err => console.log(err));
});

// @Route DELETE /myAlfred/api/users/profile/idCard/recto
// Delete recto identity card
// @Access private
router.delete('/profile/idCard/recto',passport.authenticate('jwt',{session:false}),(req,res) => {
    User.findById(req.user.id)
        .then(user => {
            user.id_card = undefined;

            user.save().then(user => res.json(user)).catch(err => console.log(err));
        })
        .catch(err => {
            console.log(err)
        })
});


module.exports = router;

/*

router.put('/profile/serviceAddress',passport.authenticate('jwt',{session: false}), (req,res) => {

    User.findById(req.user.id)
        .then(user => {
            user.service_address = {};
            user.service_address.address = req.body.address;
            user.service_address.zip_code = req.body.zip_code;
            user.service_address.city = req.body.city;

            if (req.body.country === 'France') {
                user.service_address.country = 'France';
            } else {
                user.service_address.country = 'Maroc';
            }

            user.service_address.gps = {};

            let address = req.body.address;
            let city = req.body.city;
            let zip = req.body.zip_code;

            let newAddress = address.replace(/ /g, '+');

            const url = newAddress + '%2C+' + city + ',+'+zip+'&format=geojson&limit=1';

            axios.get(`https://nominatim.openstreetmap.org/search?q=${url}`)
                .then(response => {

                    let result = response.data.features;

                    result.forEach(function (element) {
                        user.service_address.gps.lat = element.geometry.coordinates[1];
                        user.service_address.gps.lng = element.geometry.coordinates[0];
                    });

                    user.save().then(user => res.json(user)).catch(err => console.log(err));

                })
                .catch(error => {
                    console.log(error)
                });
        })
});
 */
