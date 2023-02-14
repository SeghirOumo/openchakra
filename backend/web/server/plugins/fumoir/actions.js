const {
  getEventGuestsCount,
  inviteGuest,
  registerToEvent,
  removeOrderItem,
  setOrderItem,
} = require('./functions')
const lodash=require('lodash')
const Payment = require('../../models/Payment')
const Event = require('../../models/Event')
const Booking = require('../../models/Booking')
const UserSessionData = require('../../models/UserSessionData')
const {addAction, setAllowActionFn} = require('../../utils/studio/actions')
const {
  FUMOIR_MANAGER,
  FUMOIR_MEMBER,
  PAYMENT_SUCCESS,
} = require('./consts')

const inviteGuestAction=({parent, email, phone}, user) => {
  return inviteGuest({eventOrBooking: parent, email, phone}, user)
}


const registerToEventAction=({context}, user) => {
  return registerToEvent({event: context, user})
}

const removeOrderItemAction=({context, parent}) => {
  return removeOrderItem({order: context, item: parent})
}

const setOrderItemAction=({context, parent, quantity}) => {
  return setOrderItem({order: context, product: parent, quantity})
}

addAction('inviteGuest', inviteGuestAction)
addAction('registerToEvent', registerToEventAction)
addAction('removeOrderItem', removeOrderItemAction)
addAction('setOrderItem', setOrderItemAction)

const isActionAllowed = ({action, dataId, user}) => {
  if (action=='payEvent') {
    return Promise.all([
      Event.findOne({_id: dataId, members: user}),
      Payment.find({event: dataId, event_member: user, status: PAYMENT_SUCCESS}),
    ])
      .then(([ev, payments]) => {
        if (!ev) { return false }
        return getEventGuestsCount(user, {}, {_id: dataId})
          .then(guests_count => {
            const already_paid=lodash(payments).map('amount').sum()
            const reminingToPay=ev.price*guests_count-already_paid
            return reminingToPay>0
          })
      })
  }
  if (action=='payOrder') {
    if (user.role!=FUMOIR_MEMBER) {
      return Promise.resolve(false)
    }
    return Booking.findById(dataId)
      .populate('items')
      .populate('payments')
      .then(o => o?.paid==false)
  }
  if (action=='cashOrder') {
    if (user.role!=FUMOIR_MANAGER) {
      return Promise.resolve(false)
    }
    return Booking.findById(dataId)
      .populate('items')
      .populate('payments')
      .then(o => o.remaining_total>0)
  }
  return Promise.resolve(true)
}

setAllowActionFn(isActionAllowed)
