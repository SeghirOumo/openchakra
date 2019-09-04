const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

const ServiceUser = require('../../models/ServiceUser');
const User = require('../../models/User');
const axios = require('axios');
const multer = require("multer");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/profile/diploma/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname  )
    }
});
const upload = multer({ storage: storage });



router.get('/test',(req, res) => res.json({msg: 'Service user Works!'}) );

// @Route POST /myAlfred/api/serviceUser/add
// Connect an alfred to a service
// @Access private
router.post('/add',upload.fields([{name: 'diploma',maxCount: 1}, {name:'certification',maxCount:1}]),passport.authenticate('jwt',{session: false}),(req,res)=>{
    ServiceUser.findOne({user: req.user.id, service: req.body.service})
        .then(service => {

                if(service) {
                    return res.status(400).json({msg: "Ce service existe déjà"});
                }
                const fields = {};
                fields.user= req.user.id;
                fields.service = mongoose.Types.ObjectId(req.body.service);
                fields.city = req.body.city;
                fields.perimeter = req.body.perimeter;
                fields.minimum_basket = req.body.minimum_basket;
                fields.deadline_before_booking = req.body.deadline_before_booking;
                fields.prestations = JSON.parse(req.body.prestations);
                fields.option = JSON.parse(req.body.option);
                fields.experience_years = req.body.experience_years;
                if(req.body.graduated === 'true') {
                    fields.graduated = true;
                } else {
                    fields.graduated = false;
                }

                const diploma = 'diploma';
                const certification = 'certification';
                if(diploma in req.files) {
                    fields.diploma = {};
                    fields.diploma.name = req.body.diplomaLabel;
                    fields.diploma.year = req.body.diplomaYear;
                    fields.diploma.file = req.files['diploma'][0].path;
                } else {
                    console.log(req.files)
                    console.log('No file uploaded');
                }
            if(req.body.is_certified === 'true') {
                fields.is_certified = true;
            } else {
                fields.is_certified = false;
            }
            if(certification in req.files) {
                fields.certification = {};
                fields.certification.name = req.body.certificationLabel;
                fields.certification.year = req.body.certificationYear;
                fields.certification.file = req.files['certification'][0].path;
            } else {
                console.log('No file uploaded');
            }

                    fields.description = req.body.description;
                    fields.equipments = JSON.parse(req.body.equipments);
                    fields.majoration = {};
                    if(req.body.active === 'true') {
                        fields.majoration.active = true;
                    } else {
                        fields.majoration.active = false;
                    }

            fields.service_address = {};
            fields.service_address.address = req.body.address;
            fields.service_address.zip_code = req.body.zip_code;
            fields.service_address.city = req.body.city;
            fields.service_address.country = req.body.country;



            fields.service_address.gps = {};
            fields.service_address.gps.lat = req.body.lat;
            fields.service_address.gps.lng = req.body.lng;

                    fields.majoration.price = parseInt(req.body.price);
                    const newService = new ServiceUser(fields);
                    console.log(newService);
                    newService.save().then(service => res.json(service)).catch(err => console.log(err));

                })
        .catch(error => {
            console.log(error)
        });
});

// @Route POST /myAlfred/api/serviceUser/myShop/add
// Add service in the shop
// @Access private
router.post('/myShop/add',upload.fields([{name: 'file_diploma',maxCount: 1}, {name:'file_certification',maxCount:1}]),passport.authenticate('jwt',{session: false}),(req,res)=>{
    ServiceUser.findOne({user: req.user.id, service: req.body.service})
        .then(service => {

            if(service) {
                return res.status(400).json({msg: "Ce service existe déjà"});
            }
            const fields = {};
            fields.user= req.user.id;
            fields.service = req.body.service;
            fields.perimeter = req.body.perimeter;
            fields.minimum_basket = req.body.minimum_basket;
            fields.deadline_before_booking = req.body.deadline_before_booking;
            fields.prestations = JSON.parse(req.body.prestations);
            fields.level = req.body.level;

            fields.diploma = {};
            fields.certification = {};
            const diploma = 'file_diploma';
            const certification = 'file_certification';
            if(req.files !== undefined) {
                if (diploma in req.files) {
                    fields.diploma.name = req.body.name_diploma;
                    fields.diploma.year = req.body.year_diploma;
                    fields.diploma.file = req.files['file_diploma'][0].path;
                    fields.graduated = true;
                } else {
                    console.log('No file uploaded');
                }

                if (certification in req.files) {
                    fields.certification.name = req.body.name_certification;
                    fields.certification.year = req.body.year_certification;
                    fields.certification.file = req.files['file_certification'][0].path;
                    fields.is_certified = true;
                } else {
                    console.log('No file uploaded');
                }
            }

            fields.description = req.body.description;
            fields.equipments = JSON.parse(req.body.equipments);


            fields.service_address = {};
            fields.service_address.address = req.body.address;
            fields.service_address.zip_code = req.body.zip_code;
            fields.service_address.city = req.body.city;
            fields.service_address.country = req.body.country;



            fields.service_address.gps = {};
            fields.service_address.gps.lat = req.body.lat;
            fields.service_address.gps.lng = req.body.lng;

            fields.option = JSON.parse(req.body.options);
            const newService = new ServiceUser(fields);
            newService.save().then(service => res.json(service)).catch(err => console.log(err));

        })
        .catch(error => {
            console.log(error)
        });











});

// @Route PUT /myAlfred/api/serviceUser/edit/:id
// Update a serviceUser
// @Access private
router.put('/edit/:id',passport.authenticate('jwt',{session:false}),(req,res) => {
    ServiceUser.findById(req.params.id)
        .then(serviceUser => {

            serviceUser.prestations = req.body.prestations;
            serviceUser.option = req.body.options;
            serviceUser.perimeter= req.body.perimeter;
            serviceUser.minimum_basket= req.body.minimum_basket;
            serviceUser.deadline_before_booking= req.body.deadline_before_booking;
            serviceUser.description = req.body.description;
            serviceUser.level = req.body.level;
            serviceUser.equipments= req.body.equipments;


            serviceUser.save().then(service => res.json(service)).catch(err => console.log(err));

        })
        .catch(err => console.log(err))
});

// @Route PUT /myAlfred/api/serviceUser/editWithCity/:id
// Update a serviceUser
// @Access private
router.put('/editWithCity/:id',passport.authenticate('jwt',{session:false}),(req,res) => {
    ServiceUser.findById(req.params.id)
        .then(serviceUser => {

            serviceUser.prestations = req.body.prestations;
            serviceUser.option = req.body.options;
            serviceUser.service_address.address = req.body.address;
            serviceUser.service_address.zip_code = req.body.zip_code;
            serviceUser.service_address.city = req.body.city;
            serviceUser.service_address.country = req.body.country;
            serviceUser.service_address.gps.lat = req.body.lat;
            serviceUser.service_address.gps.lng = req.body.lng;
            serviceUser.perimeter= req.body.perimeter;
            serviceUser.minimum_basket= req.body.minimum_basket;
            serviceUser.deadline_before_booking= req.body.deadline_before_booking;
            serviceUser.equipments= req.body.equipments;
            serviceUser.description = req.body.description;
            serviceUser.level = req.body.level;


            serviceUser.save().then(service => res.json(service)).catch(err => console.log(err));

        })
        .catch(err => console.log(err))
});

// @Route PUT /myAlfred/api/serviceUser/addPrestation
// Add a prestation for a service
// @Access private
router.put('/addPrestation/:id',passport.authenticate('jwt',{session:false}),(req,res) => {
    ServiceUser.findById(req.params.id)
        .then(serviceUser => {


            const newPrestation = {
                prestation: mongoose.Types.ObjectId(req.body.prestation),
                price: req.body.price
            };
            serviceUser.prestations.unshift(newPrestation);


            serviceUser.save().then(service => res.json(service)).catch(err => console.log(err));

        })
        .catch(err => console.log(err))
});

// @Route PUT /myAlfred/api/serviceUser/editPrestation
// Edit the price of a prestation for a service
// @Access private
router.put('/editPrestation/:id',passport.authenticate('jwt',{session:false}),(req,res) => {
    ServiceUser.findById(req.params.id)
        .then(serviceUser => {


            const index = serviceUser.prestations
                .map(item => item.id)
                .indexOf(req.body.prestation);

            serviceUser.prestations[index].price = req.body.price;


            serviceUser.save().then(service => res.json(service)).catch(err => console.log(err));

        })
        .catch(err => console.log(err))
});

// @Route POST /myAlfred/api/serviceUser/addDiploma/:id
// Add a diploma for a service
// @Access private
router.post('/addDiploma/:id',upload.single('file_diploma'),passport.authenticate('jwt',{session:false}),(req,res) => {
    ServiceUser.findById(req.params.id)
        .then(serviceUser => {
            serviceUser.diploma.name = req.body.name;
            serviceUser.diploma.year = req.body.year;
            const diploma = 'file_diploma';
            if(req.file !== undefined) {
                serviceUser.diploma.file = req.file.path;
            }
            serviceUser.graduated = true;

            serviceUser.save().then(service => res.json(service)).catch(err => console.log(err));
        })
        .catch(err => console.log(err))
});

// @Route POST /myAlfred/api/serviceUser/addCertification/:id
// Add a certification for a service
// @Access private
router.post('/addCertification/:id',upload.single('file_certification'),passport.authenticate('jwt',{session:false}),(req,res) => {
    ServiceUser.findById(req.params.id)
        .then(serviceUser => {
            serviceUser.certification.name = req.body.name;
            serviceUser.certification.year = req.body.year;
            if(req.file !== undefined) {
                serviceUser.certification.file = req.file.path;
            }
            serviceUser.is_certified = true;

            serviceUser.save().then(service => res.json(service)).catch(err => console.log(err));
        })
        .catch(err => console.log(err))
});

// @Route GET /myAlfred/api/serviceUser/all
// View all service per user
// @Access private
router.get('/all',(req,res)=> {

    ServiceUser.find()
        .populate('user')
        .populate('service')
        .populate('prestations.prestation')
        .populate('equipments')
        .then(service => {
            if(typeof service !== 'undefined' && service.length > 0){
                res.json(service);
            } else {
                return res.status(400).json({msg: 'No service found'});
            }

        })
        .catch(err => res.status(404).json({ service: 'No service found' }));
});

// @Route GET /myAlfred/api/serviceUser/category/:id
// Count number of service per category
router.get('/category/:id',(req,res)=> {

    ServiceUser.find()
        .populate('user')
        .populate('service')
        .then(service => {
            if(typeof service !== 'undefined' && service.length > 0){


                    service.forEach(e => {
                        if (e.service.category == req.params.id) {
                            res.json({length: service.length})
                        } else {
                            res.json({length: 0})
                        }
                    });



            } else {
                return res.status(400).json({msg: 'No service found'});
            }

        })
        .catch(err => console.log(err));
});

// @Route GET /myAlfred/api/serviceUser/near
// View all service by city
// @Access private
router.get('/near',passport.authenticate('jwt',{session:false}),(req,res)=> {

    User.findById(req.user.id)
        .then(user => {
            ServiceUser.find({city: user.billing_address.city})
                .populate('user')
                .populate('service')
                .limit(6)
                .then(service => {
                    if(typeof service !== 'undefined' && service.length > 0){
                        res.json(service);
                    } else {
                        return res.status(400).json({msg: 'No service found'});
                    }

                })
                .catch(err => res.status(404).json({ service: 'No service found' }));
        });

});

// @Route GET /myAlfred/api/serviceUser/home
// View service for home
// @Access private
router.get('/home',(req,res)=> {

    ServiceUser.find()
        .populate('user')
        .populate('service')
        .limit(6)
        .then(service => {
            if(typeof service !== 'undefined' && service.length > 0){
                res.json(service);
            } else {
                return res.status(400).json({msg: 'No service found'});
            }

        })
        .catch(err => res.status(404).json({ service: 'No service found' }));
});

// @Route GET /myAlfred/api/serviceUser/currentAlfred
// View all service for the current alfred
// @Access private
router.get('/currentAlfred',passport.authenticate('jwt',{session:false}),(req,res)=> {

    ServiceUser.find({user: req.user.id})
        .populate('service')
        .populate('user')
        .populate({path: 'service', populate: { path: 'category' }})
        .populate('prestations.prestation')
        .populate('equipments')
        .then(service => {
            if(Object.keys(service).length === 0 && service.constructor === Object){
                return res.status(400).json({msg: 'No service found'});
            } else {
                res.json(service);
            }

        })
        .catch(err => res.status(404).json({ service: 'No service found' }));
});



// @Route GET /myAlfred/api/serviceUser/:id
// View one serviceUser
// @Access private
router.get('/:id',passport.authenticate('jwt',{session: false}),(req,res)=> {

    ServiceUser.findById(req.params.id)
        .populate('user')
        .populate('service')
        .populate({path: 'prestations.prestation', populate: { path: 'filter_presentation' }})
        .populate('equipments')
        .populate('service.equipments')
        .then(service => {
            if(Object.keys(service).length === 0 && service.constructor === Object){
                return res.status(400).json({msg: 'No service found'});
            } else {
                res.json(service);
            }

        })
        .catch(err => res.status(404).json({ service: 'No service found' }));
});

// @Route PUT /myAlfred/serviceUser/deletePrestation/:id
// Delete one prestation from the list
// @Access private
router.put('/deletePrestation/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
        ServiceUser.findById(req.params.id)
            .then(serviceUser => {
                const removeIndex = serviceUser.prestations
                    .map(item => item.id)
                    .indexOf(req.body.prestation);

                serviceUser.prestations.splice(removeIndex, 1);


                serviceUser.save().then(list => res.json(list));
            })
            .catch(err => res.status(404).json(err));
    }
);

// @Route DELETE /myAlfred/api/serviceUser/delete/diploma/:id
// Delete diploma for a service
// @Access private
router.delete('/delete/diploma/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    ServiceUser.findById(req.params.id)
        .then(services => {
            services.diploma = undefined;
            services.graduated = false;

            services.save().then(service => res.json(service)).catch(err => console.log(err));

        })
        .catch(err => res.status(404).json({servicenotfound: 'No service found'}));
});

// @Route DELETE /myAlfred/api/serviceUser/delete/certification/:id
// Delete certification for a service
// @Access private
router.delete('/delete/certification/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    ServiceUser.findById(req.params.id)
        .then(services => {
            services.certification = undefined;
            services.is_certified = false;

            services.save().then(service => res.json(service)).catch(err => console.log(err));

        })
        .catch(err => res.status(404).json({servicenotfound: 'No service found'}));
});

// @Route DELETE /myAlfred/api/serviceUser/current/allServices
// Delete all the service for an alfred
// @Access private
router.delete('/current/allServices', passport.authenticate('jwt', { session: false }), (req, res) => {
    ServiceUser.find({user: req.user.id})
        .then(services => {
            services.remove().then(() => res.json({success: true}));

        })
        .catch(err => res.status(404).json({servicenotfound: 'No service found'}));
});

// @Route DELETE /myAlfred/api/serviceUser/:id
// Delete a service for an alfred
// @Access private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    ServiceUser.findById(req.params.id)
        .then(event => {
            event.remove().then(() => res.json({success: true}));
        })
        .catch(err => res.status(404).json({eventnotfound: 'No event found'}));
});




module.exports = router;
