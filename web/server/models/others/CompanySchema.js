const mongoose = require('mongoose')
const AddressSchema = require('../AddressSchema')
const {hideIllegal} = require('../../../utils/text')

const Schema = mongoose.Schema

const CompanySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la société est requis'],
  },
  website: {
    type: String,
  },
  siret: {
    type: String,
  },
  // Main adress is always the first one
  addresses: [AddressSchema],
  vat_subject: {
    type: Boolean,
    default: false,
  },
  vat_number: {
    type: String,
  },
  activity: {
    type: String,
    required: false,
  },
  size: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    set: text => hideIllegal(text),
  },
  // Legal repesentative
  representative: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  // Mangopay as client
  id_mangopay: {
    type: String,
    default: null,
  },
  // Standard prices list name (cf. PriceList)
  catalog_prices: {
    type: String,
    set: v => (v ? v.toString().trim() : v),
    get: v => (v ? v.toString().trim() : v),
  },
  // Discount prices list name (cf. PriceList)
  net_prices: {
    type: String,
    set: v => (v ? v.toString().trim() : v),
    get: v => (v ? v.toString().trim() : v),
  },
  // Min amount for carriage_paid
  carriage_paid: {
    type: Number,
    required: false,
  },
  delivery_zip_codes: [Number],
  sales_representative: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Le nom du délégué est requis'],
  },
}, {toJSON: {virtuals: true, getters: true}})

CompanySchema.virtual('full_name').get(function() {
  return this.name
})

CompanySchema.virtual('mangopay_provider_id').get(function() {
  return this.id_mangopay
})

// TODO Use justOne to return the shop or null
CompanySchema.virtual('users', {
  ref: 'user', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'company', // is equal to foreignField
})

module.exports=CompanySchema
