const { sendUserNotification } = require('./firebase')
const {
  getDataModel,
  getHostUrl,
  isProduction,
  isValidation,
} = require('../../config/config')
const lodash=require('lodash')
const {fillSms} = require('../../utils/sms')
const {SIB} = require('./sendInBlue')

let SMS_CONTENTS = {}

const setSmsContents = data => {
  SMS_CONTENTS = data
}

let NOTIFICATIONS_CONTENTS = {}

const setNotificationsContents = data => {
  NOTIFICATIONS_CONTENTS = data
}

const sendNotification = ({notification, destinee, ccs, params, attachment}) => {

  /** TEST purpose */
  const isWappizyMember = /wappizy/.test(destinee.email)

  let enable_mails = isProduction() || isValidation() || isWappizyMember
  let enable_sms = isProduction() || isValidation() || isWappizyMember
  let enable_notifications = isProduction() || isValidation() || isWappizyMember

  const prefix=(!enable_sms && !enable_mails && !enable_notifications) ? '***** DISABLED:':''
  console.log(`${prefix}send notification #${notification} to ${destinee.email} with params ${JSON.stringify(params)}`)

  if (!enable_sms && !enable_mails) {
    return Promise.resolve(true)
  }

  let resultMail = true, resultSms = true

  if (enable_mails) {
    resultMail = SIB.sendMail({index:notification, email:destinee.email, ccs, data:params, attachment})
  }

  // Send SMS
  if (enable_sms && destinee.phone && SMS_CONTENTS[notification.toString()]) {
    const smsContents = fillSms(SMS_CONTENTS[notification.toString()], params)
    if (!smsContents) {
      console.error(`Error creating SMS ${notification} to ${destinee.phone} with params ${JSON.stringify(params)}`)
      result = false
    }
    else {
      resultSms = SIB.sendSms(destinee.phone, smsContents)
    }
  }

  // Send Notification
  if (enable_notifications && destinee._id && NOTIFICATIONS_CONTENTS[notification.toString()]) {
    const notif=NOTIFICATIONS_CONTENTS[notification.toString()]
    const notifMessage = fillSms(notif.message, params)
    if (!notifMessage) {
      console.error(`Error creating notification ${notification} to ${destinee.phone} with params ${JSON.stringify(params)}`)
      result = false
    }
    else {
      resultSms = sendUserNotification({user: destinee, title:notif.title, message: notifMessage})
    }
  }

  return Promise.resolve(resultMail)
}


module.exports = {
  sendNotification,
  setSmsContents,
  setNotificationsContents,
}
