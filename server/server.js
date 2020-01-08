const express = require('express');
const next = require('next');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dev = process.env.NODE_DEV !== 'production'; //true false
const prod = process.env.NODE_DEV === 'production'; //true false
const nextApp = next({ dev });
const routes = require('./routes');
const routerHandler = routes.getRequestHandler(nextApp);
const passport = require('passport');
const glob = require('glob');
const cors = require('cors');
const { config } = require('../config/config');
const http = require('http')
const https = require('https')
const fs = require('fs')
const users = require('./routes/api/users');
const category = require('./routes/api/category');
const billing = require('./routes/api/billing');
const booking = require('./routes/api/booking');
const calculating = require('./routes/api/calculating');
const equipment= require('./routes/api/equipment');
const favoris = require('./routes/api/favoris');
const filterPresentation = require('./routes/api/filterPresentation');
const job = require('./routes/api/job');
const message = require('./routes/api/message');
const newsletter= require('./routes/api/newsletter');
const searchFilter = require('./routes/api/searchFilter');
const tags= require('./routes/api/tags');
const service = require('./routes/api/service');
const prestation= require('./routes/api/prestation');
const serviceUser = require('./routes/api/serviceUser');
const shop = require('./routes/api/shop');
const calendar = require('./routes/api/calendar');
const reviews = require('./routes/api/reviews');
const shopBanner = require('./routes/api/shopBanner');
const options = require('./routes/api/options');
const availability = require('./routes/api/availability');

const admin = require('./routes/api/admin/dashboard');
const path = require('path');
const app = express();
nextApp.prepare().then(() => {


// Body parser middleware
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

    /*app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        next()
    });*/


// DB config
   // const db = require('./config/keys').mongoUri;

// Connect to MongoDB
    mongoose.connect(config.databaseUrl,{useNewUrlParser: true})
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.log(err));

// Passport middleware
    app.use(passport.initialize());





// Passport config
    require('./config/passport')(passport);

    app.use(cors());


    app.use('/myAlfred/api/users',users);
    app.use('/myAlfred/api/category',category);
    app.use('/myAlfred/api/billing',billing);
    app.use('/myAlfred/api/booking',booking);
    app.use('/myAlfred/api/calculating',calculating);
    app.use('/myAlfred/api/equipment',equipment);
    app.use('/myAlfred/api/favoris',favoris);
    app.use('/myAlfred/api/filterPresentation',filterPresentation);
    app.use('/myAlfred/api/job',job);
    app.use('/myAlfred/api/message',message);
    app.use('/myAlfred/api/newsletter',newsletter);
    app.use('/myAlfred/api/searchFilter',searchFilter);
    app.use('/myAlfred/api/tags',tags);
    app.use('/myAlfred/api/service',service);
    app.use('/myAlfred/api/prestation',prestation);
    app.use('/myAlfred/api/serviceUser',serviceUser);
    app.use('/myAlfred/api/shop',shop);
    app.use('/myAlfred/api/calendar',calendar);
    app.use('/myAlfred/api/admin',admin);
    app.use('/myAlfred/api/reviews',reviews);
    app.use('/myAlfred/api/shopBanner',shopBanner);
    app.use('/myAlfred/api/options',options);
    app.use('/myAlfred/api/availability',availability);

    //const port = process.env.PORT || 5000;
    const rootPath = require('path').join(__dirname, '/..')
    glob.sync(rootPath + '/server/api/*.js').forEach(controllerPath => {
        if (!controllerPath.includes('.test.js')) require(controllerPath)(app)
    })
    app.use(function(req, res, next) {
            console.log("In redirection, req:"+JSON.stringify(req.secure));
            console.log("In redirection, host+originalUrl:"+req.hostname+","+req.originalUrl);
    if (!req.secure ) {
            console.log("Redirecting to"+JSON.stringify(req.originalUrl));
            res.redirect (301, 'https://' + req.hostname);
    }
    next();
    });
    app.get('*', routerHandler);
    // HTTP only handling redirect to HTTPS
    http.createServer(app).listen(80);
    // HTTPS server using certificates
    https.createServer({
        cert: fs.readFileSync('/home/ec2-user/.ssh/Main-Certificate-x509.txt'),
        key: fs.readFileSync('/home/ec2-user/.ssh/www_my-alfred_io.key'),
      },
      app).listen(443, () => console.log(`${config.appName} running on http://localhost:${config.serverPort}/`))    
});

