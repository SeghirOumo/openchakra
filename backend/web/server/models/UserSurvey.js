const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let UserSurveySchema=null

try {
  UserSurveySchema=require(`../plugins/${getDataModel()}/schemas/UserSurveySchema`)
  UserSurveySchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = UserSurveySchema ? mongoose.model('userSurvey', UserSurveySchema) : null
