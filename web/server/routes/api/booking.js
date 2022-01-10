const express = require('express')
const ics=require('ics')
const {googleCalendarEventUrl} = require('google-calendar-url')
const router = express.Router()
const passport = require('passport')
const mongoose = require('mongoose')
const crypto = require('crypto')
const moment = require('moment')
const {BOOK_STATUS, EXPIRATION_DELAY, AVOCOTES_COMPANY_NAME} = require('../../../utils/consts')
const {getKeyDate} = require('../../utils/booking')
const {invoiceFormat} = require('../../../utils/converters')
const {payBooking} = require('../../utils/mangopay')
const CronJob = require('cron').CronJob
const {
  sendBookingConfirmed, sendBookingExpiredToAlfred, sendBookingExpiredToClient, sendBookingInfosRecap,
  sendBookingDetails, sendNewBooking, sendBookingRefusedToClient, sendBookingRefusedToAlfred, sendBookingCancelledByClient,
  sendBookingCancelledByAlfred, sendAskInfoPreapproved, sendAskingInfo, sendNewBookingManual,
  sendLeaveCommentForClient, sendLeaveCommentForAlfred, sendAlert,
} = require('../../utils/mailing')
const {getRole, get_logged_id} = require('../../utils/serverContext')
const {connectionPool}=require('../../utils/database')
const {serverContextFromPartner}=require('../../utils/serverContext')
const {validateAvocotesCustomer}=require('../../validation/simpleRegister')
const {computeBookingReference, formatAddress}=require('../../../utils/text')
const {createMangoClient}=require('../../utils/mangopay')
const {computeUrl}=require('../../../config/config')
const uuidv4 = require('uuid/v4')
const {inspect} = require('util')
const {stateMachineFactory} = require('../../../utils/BookingStateMachine')
moment.locale('fr')

router.get('/test', (req, res) => res.json({msg: 'Booking Works!'}))

// @Route GET /myAlfred/api/booking/alfredBooking
router.get('/alfredBooking', passport.authenticate('jwt', {session: false}), (req, res) => {
  const userId = mongoose.Types.ObjectId(req.user.id)
  req.context.getModel('Booking').find({alfred: userId})
    .sort([['date', -1]])
    .populate('user', ['name', 'firstname', 'picture', 'company'])
    .populate('chatroom')
    .then(alfred => {
      if (!alfred) {
        res.status(404).json({msg: 'No booking found'})
      }

      if (alfred) {
        res.json(alfred)
      }
    })
})

router.get('/userBooking', passport.authenticate('jwt', {session: false}), (req, res) => {
  const userId = mongoose.Types.ObjectId(req.user.id)
  req.context.getModel('Booking').find({user: userId})
    .sort([['date', -1]])
    .populate('alfred', '-id_card')
    .populate({
      path: 'chatroom',
      populate: {path: 'emitter'},
    })
    .populate({
      path: 'chatroom',
      populate: {path: 'recipient'},
    })
    .then(alfred => {
      if (!alfred) {
        res.status(404).json({msg: 'No booking found'})
      }

      if (alfred) {
        res.json(alfred)
      }
    })
})

router.get('/confirmPendingBookings', passport.authenticate('jwt', {session: false}), (req, res) => {
  const userId = mongoose.Types.ObjectId(req.user.id)
  req.context.getModel('Booking').find({
    $and: [
      {
        $or: [
          {
            user: userId,
          },
          {
            alfred: userId,
          },
        ],
      },
      {
        status: BOOK_STATUS.PREAPPROVED,
      },
    ],
  })
    .then(booking => {
      booking.forEach(b => {
        if (!moment(b.date).isBetween(moment(b.date), moment(b.date).add(1, 'd'))) {
          req.context.getModel('Booking').findByIdAndUpdate(b._id, {status: BOOK_STATUS.EXPIRED}, {new: true})
            .then(newB => {
              res.json(newB)
            })
        }
      })
    })
    .catch(err => console.error(err))
})

router.post('/add', passport.authenticate('jwt', {session: false}), (req, res) => {

  const random = crypto.randomBytes(Math.ceil(5 / 2)).toString('hex').slice(0, 5)

  const bookingFields = {}
  bookingFields.reference = `${req.body.reference}_${random}`
  bookingFields.service = req.body.service
  if (req.body.option) {
    bookingFields.option = req.body.option
  }
  bookingFields.address = req.body.address
  bookingFields.equipments = req.body.equipments
  bookingFields.amount = req.body.amount
  bookingFields.company_amount = req.body.company_amount
  bookingFields.alfred = mongoose.Types.ObjectId(req.body.alfred)
  bookingFields.user = mongoose.Types.ObjectId(req.body.user)
  bookingFields.chatroom = mongoose.Types.ObjectId(req.body.chatroom)
  bookingFields.date_prestation = req.body.date_prestation
  bookingFields.time_prestation = moment(req.body.time_prestation)
  bookingFields.prestations = req.body.prestations
  bookingFields.fees = req.body.fees
  bookingFields.travel_tax = req.body.travel_tax
  bookingFields.pick_tax = req.body.pick_tax
  bookingFields.status = req.body.customer_booking ? BOOK_STATUS.TO_CONFIRM : req.body.status
  bookingFields.serviceUserId = req.body.serviceUserId
  bookingFields.cesu_amount = req.body.cesu_amount
  bookingFields.user_role = getRole(req) || null
  bookingFields.customer_booking = req.body.customer_booking

  req.context.getModel('Booking').create(bookingFields)
    .then(booking => {
      if (booking.status === BOOK_STATUS.INFO || booking.status === BOOK_STATUS.TO_CONFIRM) {
        // Reload to get user,alfred,service
        req.context.getModel('Booking').findById(booking._id)
          .populate('alfred')
          .populate('user')
          .then(book => {
            if (booking.status === BOOK_STATUS.INFO) {
              sendBookingInfosRecap(book)
              sendAskingInfo(book, req)
            }
            if (booking.status === BOOK_STATUS.TO_CONFIRM) {
              sendBookingDetails(book)
              sendNewBookingManual(book, req)
            }
            if (booking.status === BOOK_STATUS.CONFIRMED) {
              sendNewBooking(book, req)
            }
            // Si user et alfred définis, ajouter un message dans le chatroom
            if (book.user && book.alfred) {
              const filter={
                $and: [
                  {emitter: {$in: [book.alfred._id, book.user._id]}},
                  {recipient: {$in: [book.alfred._id, book.user._id]}},
                ],
              }
              const message={
                user: book.user.firstname,
                content: `Service ${book.service} de ${book.alfred.firstname} pour ${book.user.firstname}`,
                date: moment(),
                idsender: book.user._id,
              }
              const update={
                $setOnInsert: {name: `room-${uuidv4()}`},
                $set: {booking: book._id, emitter: book.user._id, recipient: book.alfred._id},
                $addToSet: {messages: message},
              }
              const options={new: true, upsert: true}
              req.context.getModel('ChatRoom').findOneAndUpdate(filter, update, options)
                .then(() => console.log('Chatroom maj'))
                .catch(err => console.error(err))
            }
          })
          .catch(err => {
            console.error(err)
          })
      }
      console.log(`New booking:${booking}`)
      res.json(booking)
    })
    .catch(err => {
      console.error(err)
      res.status(404)
    })
})

// @Route GET /myAlfred/api/booking/all
// View all booking
// @Access private
router.get('/all', passport.authenticate('jwt', {session: false}), (req, res) => {

  req.context.getModel('Booking').find()
    .populate('alfred')
    .populate('user')
    .populate('prestation')
    .populate({path: 'customer_booking', populate: {path: 'user'}})
    .then(booking => {
      if (typeof booking !== 'undefined' && booking.length > 0) {
        res.json(booking)
      }
      else {
        return res.status(400).json({msg: 'No booking found'})
      }
    })
    .catch(() => {
      res.status(404).json({booking: 'No booking found'})
    })
})

// @Route GET /myAlfred/api/booking/currentAlfred
// View all the booking for the current alfred
// @Access private
router.get('/currentAlfred', passport.authenticate('jwt', {session: false}), (req, res) => {
  req.context.getModel('Booking').find({alfred: req.user.id})
    .populate('alfred', {path: 'picture'})
    .populate('user')
    .populate('prestation')
    .then(booking => {
      if (booking) {
        res.json(booking)
      }
      else {
        return res.status(400).json({msg: 'No booking found'})
      }
    })
    .catch(err => console.error(err))

})

// @Route GET /myAlfred/api/booking/avocotes
// Returns all bookings from avocotes customer not already handled
// @Access private
router.get('/avocotes', passport.authenticate('admin', {session: false}), (req, res) => {
  req.context.getModel('Booking').find({
    company_customer: {$exists: true, $ne: null},
    status: {$nin: [BOOK_STATUS.TO_PAY, BOOK_STATUS.FINISHED, BOOK_STATUS.CANCELLED]},
  })
    .populate('user')
    .then(customer_bookings => {
      req.context.getModel('Booking').find({
        customer_booking: {$in: customer_bookings.map(b => b._id)},
        status: {$in: [BOOK_STATUS.CONFIRMED, BOOK_STATUS.FINISHED, BOOK_STATUS.TO_CONFIRM, BOOK_STATUS.PREAPPROVED, BOOK_STATUS.TO_PAY]},
      },
      {'customer_booking': 1})
        .then(admin_bookings => {
          let pending_customer_bookings=customer_bookings.filter(b => !admin_bookings.map(a => a.customer_booking.toString()).includes(b._id.toString()))
          res.json(pending_customer_bookings)
        })
    })
})

// @Route GET /myAlfred/booking/:id
// View one booking
// @Access public
router.get('/:id', (req, res) => {

  // Si utilisateur non connecté, on ne retourne le booking que si c'est un AvoCotés (i.e. company_customer)
  const filter=get_logged_id(req) ? {} : {company_customer: {$ne: null}}
  req.context.getModel('Booking').findOne({...filter, _id: req.params.id})
    .populate('alfred', '-id_card')
    .populate('user', '-id_card')
    .populate('prestation')
    .populate('equipments')
    .populate({path: 'customer_booking', populate: {path: 'user'}})
    .then(booking => {
      if (booking) {
        res.json(booking)
      }
      else {
        return res.status(400).json({msg: 'No booking found'})
      }
    })
    .catch(err => {
      console.error(err)
      res.status(500)
    })
})

router.get('/:id/ics', (req, res) => {
  let title
  req.context.getModel('Booking').findById(req.params.id)
    .populate({path: 'user', select: 'firstname'})
    .populate({path: 'alfred', select: 'firstname'})
    .then(booking => {
      title=`${booking.service} par ${booking.alfred.firstname} pour ${booking.user.firstname}`
      const start=booking.date_prestation_moment
      const end=booking.end_prestation_moment
      return ics.createEvent({
        uid: booking._id.toString(),
        title: title,
        start: [start.year(), start.month()+1, start.date(), start.hour(), start.minute(), start.second()],
        end: end && [end.year(), end.month()+1, end.date(), end.hour(), end.minute(), end.second()],
        location: formatAddress(booking.address),
        geo: {lat: booking.address.gps.lat, lon: booking.address.gps.lng},
        status: booking.status==BOOK_STATUS.CANCELLED ? 'CANCELLED' : booking.status==BOOK_STATUS.TO_CONFIRM ? 'TENTATIVE' : 'CONFIRMED',
        busyStatus: 'BUSY',
        url: new URL(`/reservations/reservations?id=${booking._id}`, computeUrl(req)).toString(),
      })
    })
    .then(result => {
      if (result.error) {
        console.error(result.error)
        return res.status(400).json(result.error)
      }
      res.setHeader('Content-Type', 'text/calendar')
      res.setHeader('Content-Disposition', `attachment; filename="${title}.ics"`)
      return res.send(result.value)
    })
    .catch(err => {
      console.error(err)
      res.status(400).json(err)
    })
})

router.get('/:id/google_calendar', (req, res) => {
  let title
  req.context.getModel('Booking').findById(req.params.id)
    .populate({path: 'user', select: 'firstname'})
    .populate({path: 'alfred', select: 'firstname'})
    .then(booking => {
      title=`${booking.service} par ${booking.alfred.firstname} pour ${booking.user.firstname}`
      const start=booking.date_prestation_moment.toISOString().replace(/[-:]/g, '').replace(/\.\d\d\dZ/, 'Z')
      const end=booking.end_prestation_moment ? booking.end_prestation_moment.toISOString().replace(/[-:]/g, '').replace(/\.\d\d\dZ/, 'Z') : start
      console.log(start)
      const url=googleCalendarEventUrl({
        uid: booking._id.toString(),
        title: title,
        start: start,
        end: end,
        location: formatAddress(booking.address),
        geo: {lat: booking.address.gps.lat, lon: booking.address.gps.lng},
        status: booking.status==BOOK_STATUS.CANCELLED ? 'CANCELLED' : booking.status==BOOK_STATUS.TO_CONFIRM ? 'TENTATIVE' : 'CONFIRMED',
        busyStatus: 'BUSY',
        details: new URL(`/reservations/reservations?id=${booking._id}`, computeUrl(req)).toString(),
      })
      res.redirect(url)
    })
    .catch(err => {
      console.error(err)
      res.status(400).json(err)
    })
})

// @Route DELETE /myAlfred/booking/:id
// Delete one booking
// @Access private
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  req.context.getModel('Booking').findById(req.params.id)
    .then(message => {
      message.remove().then(() => res.json({success: true}))
    })
    .catch(() => {
      res.status(404).json({bookingnotfound: 'No booking found'})
    })
})

router.put('/modifyBooking/:id', (req, res) => {
  const obj = {status: req.body.status}
  const canceller_id = req.body.user
  if (req.body.end_date) {
    obj.end_date = req.body.end_date
  }
  if (req.body.end_time) {
    obj.end_time = req.body.end_time
  }

  console.log(`Setting booking status:${req.params.id} to ${JSON.stringify(obj)}, req is ${req.originalUrl}`)
  req.context.getModel('Booking').findById(req.params.id)
    .populate('alfred')
    .populate('user')
    .populate('prestation')
    .populate('equipments')
    .populate({path: 'customer_booking', populate: {path: 'user'}})
    .then(booking => {
      if (!booking) {
        return res.status(404).json('No booking #${req.params.id}')
      }
      const machine=stateMachineFactory(booking.status)
      machine.checkAllowed(obj.status)
      booking.status=obj.status
      booking.end_date = obj.end_date || booking.end_date
      booking.end_time = obj.end_time || booking.end_time

      booking.save()
        .then(booking => {
          if (booking.user.company_customer && status==BOOK_STATUS.CUSTOMER_PAID) {
            // Prévenir les admins d'une nouvelle résa
            req.context.getModel('User').find({is_admin: true}, 'firstname email phone')
              .then(admins => {
                const search_link = new URL('/search', computeUrl(req))
                const prestations=booking.prestations.map(p => p.name).join(',')
                const msg=`Chercher les prestations '${prestations}' pour le compte ${booking.user.email} via ${search_link}`
                const subject=`Nouvelle réservation Avocotés pour ${booking.user.email}`
                admins.forEach(admin => {
                  sendAlert(admin, subject, msg)
                })
              })
              .catch(err => {
                console.error(err)
              })
          }
          else {
            if (booking.status === BOOK_STATUS.TO_CONFIRM) {
              sendBookingDetails(booking)
              sendNewBookingManual(booking, req)
            }
            if (booking.status === BOOK_STATUS.CONFIRMED) {
              sendBookingConfirmed(booking)
            }
            if (booking.status === BOOK_STATUS.REFUSED) {
              if (canceller_id === booking.user._id) {
                sendBookingRefusedToAlfred(booking, req)
              }
              else {
                sendBookingRefusedToClient(booking, req)
              }
            }
            if (booking.status === BOOK_STATUS.PREAPPROVED) {
              sendAskInfoPreapproved(booking, req)
            }
            if (booking.status === BOOK_STATUS.CANCELLED) {
              if (canceller_id === booking.user._id) {
                sendBookingCancelledByClient(booking)
              }
              else {
                sendBookingCancelledByAlfred(booking, req)
              }
            }
          }
          return res.json(booking)
        })
        .catch(err => {
          console.error(err)
          res.status(500).json(err.toString())
        })
    })
    .catch(err => {
      console.error(err)
      res.status(400).json(err.toString())
    })
})

// @Route POST /myAlfred/api/booking/avocotes
// Create user, mango accounbt and booking for avocotes
// @Access public
router.post('/avocotes', (req, res) => {
  const {errors, isValid} = validateAvocotesCustomer(req.body)
  if (!isValid) {
    return res.status(400).json(errors)
  }

  req.context.getModel('Company').findOne({name: AVOCOTES_COMPANY_NAME})
    .then(company => {
      const userData={
        firstname: req.body.firstname,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        billing_address: req.body.address,
        company_customer: company,
        birthday: '01/01/1980',
        password: 'tagada',
      }
      return req.context.getModel('User').findOneAndUpdate({email: req.body.email}, userData, {upsert: true, new: true})
    })
    .then(user => {
      console.log(`Created/updated DB user:${JSON.stringify(user)}`)
      if (user.id_mangopay) {
        return Promise.resolve(user)
      }
      console.log(`Creating Mango user:${JSON.stringify(user)}`)
      return createMangoClient(user)
    })
    .then(user => {
      return user.save()
    })
    .then(user => {
      let bookData={
        user: user, address: user.billing_address,
        service: req.body.service._id, amount: req.body.totalPrice, fees: 0,
        prestations: req.body.prestations, reference: computeBookingReference(user, user),
        company_customer: user.company_customer, status: BOOK_STATUS.TO_PAY,
      }
      return req.context.getModel('Booking').create(bookData)
    })
    .then(booking => {
      return res.json(booking)
    })
    .catch(err => {
      console.error(err)
      res.json(err)
    })
})

new CronJob('0 */15 * * * *', (() => {
  console.log('Checking terminated bookings')
  const getNextNumber = (context, type, key) => {
    return new Promise((resolve, reject) => {
      const updateObj = {type: type, key: key, $inc: {value: 1}}
      context.getModel('Count').updateOne({type: type, key: key}, updateObj, {upsert: true})
        .then(() => {
          context.getModel('Count').findOne({type: type, key: key}).then(res => {
            resolve(res)
          }).catch(err => {
            console.error(err)
          })
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  const date = moment().startOf('day')

  connectionPool.databases.map(d => serverContextFromPartner(d)).forEach(context => {
    console.log(`Checking for database ${context.getDbName()}`)
    context.getModel('Booking').find({status: BOOK_STATUS.CONFIRMED, paid: false})
      .populate('user')
      .populate('alfred')
      .then(booking => {
        booking.forEach(b => {
          const end_date = moment(b.end_date, 'DD-MM-YYYY').add(1, 'days').startOf('day')
          if (moment(date).isSameOrAfter(end_date)) {
            /**
            const type = ['billing', 'receipt', 'myalfred_billing']
            const key = getKeyDate()
            Promise.all([getNextNumber(type[ 0 ], key), getNextNumber(type[ 1 ], key), getNextNumber(type[ 2 ], key)]).then(
              values => {
                values.map((res, i) => {
                  const attribute = `${type[ i ]}_number`
                  b[ attribute ] = `${type[ i ].charAt(0).toUpperCase()}${key}${invoiceFormat(res.value, 5)}`
                })
              },
            )
            */
            console.log(`Booking #${b._id} terminated`)
            b.status = BOOK_STATUS.FINISHED
            b.save()
              .then(bo => {
                sendLeaveCommentForAlfred(bo)
                sendLeaveCommentForClient(bo)
              })
              .catch(err => console.error(err))
          }
        },
        )
      })
      .catch(err => console.error(err))
  })

}), null, true, 'Europe/Paris')

// Handle terminated but not paid bookings
new CronJob('0 0 0 * * *', (() => {
  console.log('Checking bookings to pay')
  connectionPool.databases.map(d => serverContextFromPartner(d)).forEach(context => {
    context.getModel('Booking').find({status: BOOK_STATUS.FINISHED, paid: false})
      .populate('user')
      .populate('alfred')
      .populate({path: 'customer_booking', populate: {path: 'user'}})
      .then(bookings => {
        bookings.forEach(booking => {
          console.log(`Booking #${booking._id} to pay`)
          payBooking(booking)
        })
      }).catch(err => {
        console.error(err)
      })
  })
}), null, true, 'Europe/Paris')

// Expiration réervation en attente de confirmation :
// - soit EXPIRATION_DELAY jours après la date de création de la réservation
// - soit après la date de prestation
new CronJob('0 */15 * * * *', (() => {
  console.log('Checking expired bookings')
  const currentDate = moment().startOf('day')
  connectionPool.databases.map(d => serverContextFromPartner(d)).forEach(context => {
    context.getModel('Booking').find({$or: [{status: BOOK_STATUS.TO_CONFIRM}, {status: BOOK_STATUS.TO_PAY}]})
      .populate('user')
      .populate('alfred')
      .then(booking => {
        booking.forEach(b => {
          const expirationDate = moment(b.date).add(EXPIRATION_DELAY, 'days').startOf('day')
          // Expired because Alfred did not answer
          const answerExpired = moment(currentDate).isSameOrAfter(expirationDate)
          // Expired because prestation date passed
          const prestaDateExpired = moment().isSameOrAfter(b.date_prestation_moment)
          if (answerExpired || prestaDateExpired) {
            const reason = answerExpired ? `Alfred did not confirm within ${EXPIRATION_DELAY} days` : 'prestation date passed'
            console.log(`Booking ${b._id} expired : ${reason}`)
            b.status = BOOK_STATUS.EXPIRED
            b.save()
              .then(bo => {
                sendBookingExpiredToAlfred(bo)
                sendBookingExpiredToClient(bo)
              })
              .catch(err => {
                console.error(err)
              })
          }
        })
      })
  })
}), null, true, 'Europe/Paris')

// pattern reference
// premiere lettre nom user +  premiere lettre prenom user + premiere lettre nom alfred +  premiere lettre prenom alfred + date + 5 random
// LJBG_2242019_a5fr1


module.exports = router
