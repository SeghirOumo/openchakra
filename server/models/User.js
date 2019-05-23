const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const year = new Date().getFullYear()-16;
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        max: `${year}-01-01`,
        required: true
    },
    phone: {
        type: String
    },
    billing_address: {
        address: {
            type: String
        },
        city: {
            type: String
        },
        zip_code: {
            type: String
        },
        country: {
            type: Number
        }
    },
    service_address: {
        address: {
            type: String
        },
        city: {
            type: String
        },
        zip_code: {
            type: String
        },
        country: {
            type: Number
        }
    },
    picture: {
        type: String
    },
    creation_date: {
        type: Date,
        default: Date.now
    },
    job: {
        type: String
    },
    account: {
        bank_code: {
            type: String
        },
        guichet_code: {
            type: String
        },
        account_number: {
            type: String
        },
        rib_key: {
            type: String
        },
        iban: {
            type: String
        },
        bic: {
            type: String
        }
    },
    score: {
        type: Number,
        default: 0
    },
    number_of_reviews: {
        type: Number,
        default: 0
    },
    number_of_views: {
        type: Number,
        default : 0
    },
    active: {
        type: Boolean,
        default: true
    },
    is_alfred: {
        type: Boolean,
        default: false
    },
    super_alfred: {
        type: Boolean,
        default: false
    },
    is_admin: {
        type: Boolean,
        default: false
    }



});

module.exports = User = mongoose.model('users',UserSchema);
