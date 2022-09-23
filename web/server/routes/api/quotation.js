const express = require('express')
const CronJob = require('cron').CronJob
const passport = require('passport')
const moment = require('moment')
const xlsx=require('node-xlsx')
const lodash=require('lodash')
const {QUOTATION_LIFETIME_HOURS}=require('../../../utils/feurst/consts')
const {
  COMPLETE,
  CONVERT,
  CREATE,
  CREATED,
  CUSTOMER_ADMIN,
  DELETE,
  EXPORT,
  EXPRESS_SHIPPING,
  FEURST_ADV,
  FEURST_SALES,
  GROUP_SHIPPING,
  HANDLED,
  QUOTATION,
  REWRITE,
  STANDARD_SHIPPING,
  UPDATE,
  UPDATE_ALL,
  VALID,
  VALIDATE,
  VIEW,
} = require('../../../utils/feurst/consts')
const {BadRequestError, HTTP_CODES} = require('../../utils/errors')
const {generateExcel} = require('../../utils/feurst/generateExcel')
const {
  sendDataNotification,
} = require('../../utils/mailing')
const {
  filterOrderQuotation,
  getStatusLabel,
  isActionAllowed,
  isFeurstUser,
} = require('../../utils/userAccess')
const {
  addItem,
  computeCarriagePaidDelta,
  computeShippingFee,
  getProductPrices,
  updateCompanyAddresses,
  updateShipFee,
} = require('../../utils/commands')
const Quotation = require('../../models/Quotation')
const Product = require('../../models/Product')
const {lineItemsImport} = require('../../utils/import')
const {XL_FILTER, createMemoryMulter} = require('../../utils/filesystem')

const router = express.Router()
const Order = require('../../models/Order')
const {validateOrder, validateOrderItem}=require('../../validation/order')
const validateAddress=require('../../validation/address')
const feurstfr=require('../../../translations/fr/feurst')
moment.locale('fr')

const DATA_TYPE=QUOTATION
const MODEL=Quotation

// PRODUCTS
const uploadItems = createMemoryMulter(XL_FILTER)

router.get('/:order_id/addresses', passport.authenticate('jwt', {session: false}), (req, res) => {
  const order_id=req.params.order_id

  MODEL.findById(order_id)
    .populate('company')
    .then(order => {
      if (!order) {
        return res.status(HTTP_CODES.NOT_FOUND).json()
      }
      return res.json(order.company.addresses)
    })
})


// @Route GET /myAlfred/api/orders/template
// Returns an order xlsx template for import
// @Access private
router.get('/template', passport.authenticate('jwt', {session: false}), (req, res) => {
  const data = [
    ['Référence', 'Quantité'],
    ['AAAXXXZ', 6],
  ]
  let buffer = xlsx.build([{data: data}])
  res.setHeader('Content-Type', 'application/vnd.openxmlformats')
  res.setHeader('Content-Disposition', 'attachment; filename=order_template.xlsx')
  res.end(buffer, 'binary')
})

// @Route POST /myAlfred/api/orders/import
// Imports products from csv
router.post('/:order_id/import', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, UPDATE)) {
    return res.status(403).json()
  }

  uploadItems.single('buffer')(req, res, err => {
    if (err) {
      console.error(err)
      return res.status(HTTP_CODES.NOT_FOUND).json({errors: err.message})
    }

    const order_id=req.params.order_id
    const options=JSON.parse(req.body.options)

    MODEL.findById(order_id)
      .populate('company')
      .populate('items.product')
      .then(data => {
        if (!data) {
          console.error(`${DATA_TYPE} #${order_id} not found`)
          return res.status(HTTP_CODES.NOT_FOUND).json()
        }
        return lineItemsImport(data, req.file.buffer, options)
      })
      .then(result => {
        res.json(result)
      })
      .catch(err => {
        console.error(err)
        return res.status(500).json(err)
      })
  })
})


// @Route POST /myAlfred/api/quotations/
// Add a new order
// @Access private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, CREATE)) {
    return res.status(403).json()
  }

  const {errors, isValid}=validateOrder(req.body)
  if (!isValid) {
    return res.status(500).json(errors)
  }

  let attributes=req.body
  // Feurst user: require company and contact(s)
  if (isFeurstUser(req.user)) {
    if (!attributes?.company) {
      return res.status(HTTP_CODES.BAD_REQUEST).json('La compagnie est obligatoire')
    }
    if (!(attributes?.contacts?.length>0)) {
      return res.status(HTTP_CODES.BAD_REQUEST).json('Au moins un contact est obligatoire')
    }
  }

  attributes={...attributes, company: req.body.company || req.user.company, created_by_company: req.user.company?._id}

  MODEL.create(attributes)
    .then(data => {
      return res.json(data)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route PUT /myAlfred/api/orders/:id/rewrite
// Resets address && shipping_mode to allow edition
// @Access private
router.put('/:id/rewrite', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, UPDATE)) {
    return res.status(401).json()
  }

  const order_id=req.params.id
  MODEL.findByIdAndUpdate(order_id, {validation_date: null, handled_date: null}, {new: true})
    .then(result => {
      if (!result) {
        return res.status(HTTP_CODES.NOT_FOUND).json(`${DATA_TYPE} #${order_id} not found`)
      }
      // TODO Fix i18n import
      // const t=i18n.default.getFixedT(null, 'feurst')
      const feurstActor=isFeurstUser(req.user)
      const destinee= feurstActor ? CUSTOMER_ADMIN : FEURST_SALES
      const msg=feurstfr[feurstActor ? 'EDI.QUOTATION_REWRITE_2_CUSTOMER' : 'EDI.QUOTATION_REWRITE_2_FEURST']
      sendDataNotification(req.user, destinee, result, msg)
      return res.json(result)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})
// @Route PUT /myAlfred/api/orders/:id
// Set attributes(s) of an order {address_id?, reference?}
// @Access private
router.put('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, UPDATE)) {
    return res.status(401).json()
  }

  const order_id=req.params.id

  MODEL.findByIdAndUpdate(order_id, req.body, {new: true})
    .populate('items.product')
    .populate('company')
    .then(result => {
      if (!result) {
        return res.status(HTTP_CODES.NOT_FOUND).json(`${DATA_TYPE} #${order_id} not found`)
      }
      if (req.body.address) {
        const {isValid, errors}=validateAddress(req.body.address)
        if (!isValid) {
          throw new BadRequestError(Object.values(errors).join(','))
        }
        if (!req.body.address._id && result.company?.addresses?.some(a => a.match(req.body.address))) {
          throw new BadRequestError('Cette adresse existe déjà')
        }
      }
      return MODEL.findByIdAndUpdate(order_id, req.body, {new: true})
        .populate('items.product')
        .populate('company')
    })
    .then(result => {
      return updateShipFee(result)
    })
    .then(result => {
      return result.save()
    })
    .then(result => {
      return updateCompanyAddresses(result)
    })
    .then(result => {
      return res.json(result)
    })
    .catch(err => {
      console.error(err)
      return res.status(err.status || 500).json(err.message || err)
    })
})

// @Route PUT /myAlfred/api/orders/:id/item
// Add item to a order {product_id, quantity, discount?, replace}
// Adds quantity if replace is false else sets quantity
// @Access private
router.put('/:id/items', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, UPDATE)) {
    return res.status(401).json()
  }

  const {errors, isValid}=validateOrderItem(req.body)
  if (!isValid) {
    return res.status(500).json(errors)
  }

  const order_id=req.params.id
  const {product, quantity, net_price, replace=false}=req.body

  if (net_price && !isActionAllowed(req.user.roles, DATA_TYPE, UPDATE_ALL)) {
    return res.status(401).json(`Droits insuffisants pour modifier le prix de l'article`)
  }

  MODEL.findById(order_id)
    .populate('items.product')
    .populate('company')
    .then(data => {
      if (!data) {
        console.error(`No order #${order_id}`)
        return res.status(HTTP_CODES.NOT_FOUND).json()
      }
      return addItem({data, product_id: product, quantity, net_price, replace})
    })
    .then(data => {
      return updateShipFee(data)
    })
    .then(data => {
      return data.save()
    })
    .then(data => {
      return res.json(data)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route DELETE /myAlfred/api/orders/:id/item
// Removes item from a order
// @Access private
router.delete('/:order_id/items/:item_id', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, UPDATE)) {
    return res.status(401).json()
  }

  const order_id=req.params.order_id
  const item_id=req.params.item_id

  MODEL.findOneAndUpdate({_id: order_id}, {$pull: {items: {_id: item_id}}}, {new: true})
    .populate('items.product')
    .populate('company')
    .then(result => {
      if (!result) {
        return res.status(HTTP_CODES.NOT_FOUND).json(`${DATA_TYPE} #${order_id} not found`)
      }
      return updateShipFee(result)
    })
    .then(result => {
      return result.save()
    })
    .then(result => {
      return res.json(result)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route GET /myAlfred/api/orders
// View all orders
// @Access private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, VIEW)) {
    return res.status(401).json()
  }

  MODEL.find()
    .sort({creation_date: -1})
    .populate('items.product')
    .populate({path: 'company', populate: 'sales_representative'})
    .lean({virtuals: true})
    .then(orders => {
      orders=filterOrderQuotation(orders, DATA_TYPE, req.user, VIEW)
      orders.forEach(o => {
        o.status_label=getStatusLabel(o, DATA_TYPE, req.user)
      })
      return res.json(orders)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json(err)
    })
})

// @Route GET /myAlfred/api/orders
// View all orders
// @Access private
router.post('/:quotation_id/convert', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, CONVERT)) {
    return res.status(HTTP_CODES.FORBIDDEN).json()
  }

  const quotation_id=req.params.quotation_id
  const reference=req.body.reference?.trim()

  if (!reference) {
    return res.status(HTTP_CODES.BAD_REQUEST).json(`Indiquez la référence pour la commande`)
  }

  let quotation=null
  let order = null

  MODEL.findById(quotation_id)
    .populate('company')
    .then(result => {
      if (!result) {
        return res.status(HTTP_CODES.NOT_FOUND).json(`${DATA_TYPE} #${quotation_id} not found`)
      }
      quotation=result
      const order={...lodash.omit(quotation, ['_id', 'contacts']),
        reference: reference,
        items: quotation.items.map(item => lodash.omit(item, '_id')),
        validation_date: moment(),
        handled_date: null,
        creator: req.user._id,
      }
      return Order.create(order)
    })
    .then(result => {
      order=result
      return Quotation.findByIdAndUpdate(quotation_id, {linked_order: order._id})
    })
    .then(() => {
      // const t=i18n.default.getFixedT(null, 'feurst')
      const msg=feurstfr['EDI.QUOTATION_CONVERT_2_FEURST']
      sendDataNotification(req.user, FEURST_ADV, order, msg)
      return res.json(order)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route GET /myAlfred/api/orders/:id
// View one booking
// @Access public
router.get('/:order_id', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, VIEW)) {
    return res.status(401).json()
  }

  const order_id=req.params.order_id
  MODEL.findById(order_id)
    .populate('items.product')
    .populate({path: 'company', populate: 'sales_representative'})
    .populate('creator')
    .then(order => {
      if (order) {
        return res.json(order)
      }
      return res.status(HTTP_CODES.NOT_FOUND).json({msg: 'No order found'})
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route DELETE /myAlfred/orders/:id
// Delete one order
// @Access private
router.delete('/:order_id', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, DELETE)) {
    return res.status(403).json()
  }

  MODEL.findOneAndDelete({_id: req.params.order_id})
    .then(() => {
      return res.json()
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route GET /myAlfred/api/products/:product_id
// View one product
// @Access private
router.get('/:order_id/products/:product_id', passport.authenticate('jwt', {session: false}), (req, res) => {

  const order_id=req.params.order_id
  const product_id=req.params.product_id
  let product=null
  let data=null

  MODEL.findById(order_id)
    .populate('company')
    .then(result => {
      data=result
      return Product.findById(product_id)
        .populate('components')
        .lean({virtuals: true})
    })
    .then(result => {
      if (!result) {
        return res.status(HTTP_CODES.NOT_FOUND).json()
      }
      product=result
      return getProductPrices(product.reference, data.company)
    })
    .then(prices => {
      product.catalog_price=prices.catalog_price
      product.net_price=prices.net_price
      return product.components?.length>0 ?
        Promise.allSettled(product.components.map(comp => getProductPrices(comp.reference, data.company)))
        :Promise.resolve([])
    })
    .then(results => {
      if (product.components) {
        product.components=product.components.filter((_, idx) => results[idx].status=='fulfilled')
      }
      return res.json(product)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json(err)
    })
})

// @Route DELETE /myAlfred/orders/:id
// Delete one order
// @Access private
router.post('/:order_id/validate', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, VALIDATE)) {
    return res.status(401).json()
  }

  const order_id=req.params.order_id

  let attrs={validation_date: new Date()}
  if (isFeurstUser(req.user)) {
    attrs.handled_date=new Date()
  }

  MODEL.findByIdAndUpdate(order_id, attrs, {new: true})
    .populate({path: 'company', populate: {path: 'sales_representative', select: 'email'}})
    .then(data => {
      if (!data) {
        return res.status(HTTP_CODES.NOT_FOUND).json(`Order ${order_id} not found`)
      }
      // const t=i18n.default.getFixedT(null, 'feurst')
      const feurstActor = isFeurstUser(req.user)
      const destinee= feurstActor ? CUSTOMER_ADMIN : FEURST_SALES
      const msg=feurstfr[feurstActor ?'EDI.QUOTATION_VALID_2_CUSTOMER':'EDI.QUOTATION_VALID_2_FEURST']
      sendDataNotification(req.user, destinee, data, msg)
      return res.json()
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route GET /myAlfred/api/orders/:id/shipping-fee?zipcode
// Computes shipping fees
// @Access private
router.get('/:id/shipping-fee', passport.authenticate('jwt', {session: false}), (req, res) => {

  if (!isActionAllowed(req.user.roles, DATA_TYPE, VIEW)) {
    return res.status(401).json()
  }

  const address=JSON.parse(req.query.address)

  const fee={[EXPRESS_SHIPPING]: 0, [STANDARD_SHIPPING]: 0, [GROUP_SHIPPING]: 0}
  let order=null
  MODEL.findById(req.params.id)
    .populate('items.product')
    .populate('company')
    .then(result => {
      if (!result) {
        return res.status(HTTP_CODES.NOT_FOUND).json()
      }
      order=result
      // Simulate address
      return computeShippingFee(order, address, false)
    })
    .then(standard => {
      fee[STANDARD_SHIPPING]=standard
      return computeShippingFee(order, address, true)
    })
    .then(express => {
      fee[EXPRESS_SHIPPING]=express
      return res.json(fee)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route GET /myAlfred/api/orders/:id/shipping-fee?zipcode
// Computes shipping fees
// @Access private
router.put('/:id/shipping-fee', passport.authenticate('jwt', {session: false}), (req, res) => {
  if (!isActionAllowed(req.user.roles, DATA_TYPE, UPDATE_ALL)) {
    return res.status(401).json()
  }

  const order_id = req.params.id
  const shipping_fee=parseFloat(req.body.shipping_fee)

  if (isNaN(parseFloat(shipping_fee))) {
    return res.status(400).json(`Missing parameter shipping_fee`)
  }

  MODEL.findByIdAndUpdate(order_id, {shipping_fee: shipping_fee}, {new: true})
    .then(result => {
      if (!result) {
        return res.status(HTTP_CODES.NOT_FOUND).json(`${DATA_TYPE} #${order_id} not found`)
      }
      return res.json(result)
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json(err)
    })
})

// @Route GET /myAlfred/api/quotations/:id/export
// Export quotation as XL file
// @Access private
router.get('/:id/export', passport.authenticate('jwt', {session: false}), (req, res) => {
  MODEL.findById(req.params.id)
    .populate({path: 'company', populate: {path: 'sales_representative'}})
    .populate('items.product')
    .then(model => {
      const title=model.filename
      const buffer=generateExcel(model)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats')
      res.setHeader('Content-Disposition', `attachment; filename="${title}"`)
      res.end(buffer, 'binary')
    })
})

router.get('/:id/actions', passport.authenticate('jwt', {session: false}), (req, res) => {
  let result=[]
  const user=req.user
  if (!req.user.cgv_valid) {
    return res.json([])
  }
  MODEL.findById(req.params.id)
    .then(model => {
      if (!model) {
        return res.status(HTTP_CODES.NOT_FOUND).json()
      }
      if (isActionAllowed(req.user.roles, DATA_TYPE, UPDATE) && [CREATED, COMPLETE].includes(model.status)) {
        result.push(UPDATE)
      }
      if (isActionAllowed(req.user.roles, DATA_TYPE, UPDATE) &&
      (model.status==COMPLETE || (model.status==VALID && isFeurstUser(user)))) {
        result.push(VALIDATE)
      }
      if (isActionAllowed(req.user.roles, DATA_TYPE, REWRITE) && [VALID, HANDLED].includes(model.status)) {
        result.push(REWRITE)
      }
      if (isActionAllowed(req.user.roles, DATA_TYPE, CONVERT) && model.status==HANDLED) {
        result.push(CONVERT)
      }
      // delete mine only
      if (isActionAllowed(req.user.roles, DATA_TYPE, DELETE)
        && [CREATED, COMPLETE].includes(model.status)
        && req.user.company?._id.toString()==model.created_by_company?._id.toString()) {
        result.push(DELETE)
      }
      if (isActionAllowed(req.user.roles, DATA_TYPE, EXPORT)) {
        result.push(EXPORT)
      }
      return res.json(result)
    })
})
router.get('/:id/carriage-paid-delta', passport.authenticate('jwt', {session: false}), (req, res) => {
  return computeCarriagePaidDelta(MODEL, req.params.id)
    .then(value => {
      res.json(value)
    })
    .catch(err => {
      return res.status(err.status||500).json(err.message)
    })
})

// Checking every hour quotations to remove after QUOTATION_LIMIT days
new CronJob('0 0 * * * *', (() => {
  const oldestCreationDate=moment().subtract(QUOTATION_LIFETIME_HOURS, 'hours')
  console.log(`Removing non submitted quotations (${QUOTATION_LIFETIME_HOURS} hours, created before ${oldestCreationDate.format('L LT')})`)
  MODEL.find(({creation_date: {$lt: oldestCreationDate}}))
    .lean({virtuals: true})
    .then(quotations => {
      const nonSubmitted=quotations.filter(q => [CREATED, COMPLETE].includes(q.status))
      return MODEL.remove({_id: {$in: nonSubmitted.map(q => q._id)}})
    })
    .then(res => {
      console.log(`Removed:${JSON.stringify(res)} non-submitted quotations`)
    })
    .catch(err => {
      console.error(err)
    })
}), null, true, 'Europe/Paris')

module.exports = router
