const { CONTENTS_TYPE, EVENT_TYPE, HOME_STATUS } = require('./consts')
const lodash=require('lodash')
const moment = require('moment')
const User = require('../../models/User')
const {
  declareEnumField,
  declareVirtualField,
  setPreCreateData,
  setPreprocessGet,
} = require('../../utils/database')

const preprocessGet = ({model, fields, id, user}) => {
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }

  return Promise.resolve({model, fields, id})

}
setPreprocessGet(preprocessGet)

const USER_MODELS=['user', 'loggedUser']
USER_MODELS.forEach(m => {
  declareVirtualField({model: m, field: 'fullname', instance: 'String', requires: 'firstname,lastname'})
  declareVirtualField({model: m, field: 'password2', instance: 'String'})
  declareEnumField({model: m, field: 'home_status', enumValues:HOME_STATUS})
  declareVirtualField({model: m, field: 'scores', instance: 'Array', requires: 'viewed_contents,registered_events', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'keyscore'}}
  })
  declareVirtualField({model: m, field: 'viewed_contents', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'contents'}}
  })
  declareVirtualField({model: m, field: 'registered_events', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'event'}}
  })
})

declareEnumField({model: 'contents', field: 'type', enumValues:CONTENTS_TYPE})

declareEnumField({model: 'event', field: 'type', enumValues:EVENT_TYPE})

module.exports={
}
