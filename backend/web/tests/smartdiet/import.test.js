const mongoose = require('mongoose')
const moment = require('moment')
const lodash = require('lodash')
const path = require('path')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { forceDataModelSmartdiet } = require('../utils')
forceDataModelSmartdiet()
const User = require('../../server/models/User')
const Quizz = require('../../server/models/Quizz')
require('../../server/models/QuizzQuestion')
const Company = require('../../server/models/Company')
require('../../server/models/Content')
require('../../server/models/Comment')
const Appointment=require('../../server/models/Appointment')
const { COMPANY_ACTIVITY_BANQUE, ROLE_EXTERNAL_DIET, ROLE_CUSTOMER } = require('../../server/plugins/smartdiet/consts')
const bcrypt = require('bcryptjs')
const Coaching = require('../../server/models/Coaching')
const { importUsers, importDiets, importDietsAgenda, importCoachings, importAppointments, importCompanies, importContents, importPatientContents, importMeasures, fixFiles, importQuizz, importQuizzQuestions, importQuizzQuestionAnswer, importUserQuizz, importKeys, importProgressQuizz, importUserProgressQuizz, importOffers } = require('../../server/plugins/smartdiet/import')
const { prepareCache, getCacheKeys, displayCache } = require('../../utils/import')
const Content = require('../../server/models/Content')
const Measure = require('../../server/models/Measure')
const fs=require('fs')
const QuizzQuestion = require('../../server/models/QuizzQuestion')
const Key = require('../../server/models/Key')
const Offer = require('../../server/models/Offer')
require('../../server/models/Item')

const ROOT = path.join(__dirname, './data/migration')

jest.setTimeout(60000000)

const ORIGINAL_DB=true
const DBNAME=ORIGINAL_DB ? 'smartdiet' : 'smartdiet-migration'
const DROP=!ORIGINAL_DB

describe('Test imports', () => {

  beforeAll(async () => {
    console.log('Before opening database', DBNAME)
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
    console.log('Opened database', DBNAME)
    await prepareCache()
    await fixFiles(ROOT)
  })
  
  afterAll(async () => {
    if (DROP) {
      await mongoose.connection.dropDatabase()
    }
    await mongoose.connection.close()
  })

  const ensureNbError = (result, count=0) => {
    const errors=result.filter(r => !r.success)
    if (errors.length>count) {
      console.log(JSON.stringify(errors.slice(0,10), null, 2))
    }
    expect(errors.length).toEqual(count)
  }
  it('must import companies', async () => {
    const res = await importCompanies(path.join(ROOT, 'smart_project.csv'))
    ensureNbError(res)
    const companies=await Company.find()
    expect(companies).toHaveLength(12)
  })

  it('must import offers', async () => {
    const res = await importOffers(path.join(ROOT, 'smart_project.csv'))
    ensureNbError(res)
    const offersCount=await Offer.countDocuments({migration_id: {$ne:null}})
    expect(offersCount).toEqual(5)
  })

  it('must import users', async () => {
    const res = await importUsers(path.join(ROOT, 'smart_patient.csv'))
    ensureNbError(res, 6)
    const users=await User.find({role: ROLE_CUSTOMER})
    expect(users.length).toEqual(12778)
  })

  it('must upsert diets', async () => {
    let res = await importDiets(path.join(ROOT, 'smart_diets.csv'))
    ensureNbError(res)
    const diets=await User.find({role: ROLE_EXTERNAL_DIET})
    expect(diets.length).toEqual(863)
  })

  it('must upsert coachings', async () => {
    let res = await importCoachings(path.join(ROOT, 'smart_coaching.csv'))
    ensureNbError(res, 6)
    const coachings=await Coaching.countDocuments()
    expect(coachings).toEqual(76)
  })

  it('must upsert appointments', async () => {
    let res = await importAppointments(path.join(ROOT, 'smart_consultation.csv'))
    ensureNbError(res, 7)
    const appts=await Appointment.countDocuments()
    expect(appts).toEqual(28470)
  })

  it('must upsert measures', async () => {
    let res = await importMeasures(path.join(ROOT, 'smart_measure.csv'))
    ensureNbError(res)
    const measures=await Measure.find()
    expect(measures).toHaveLength(21986)
  })

  it('must upsert quizz', async () => {
    const before=await Quizz.countDocuments()
    let res = await importQuizz(path.join(ROOT, 'smart_quiz.csv'))
    ensureNbError(res)
    const quizz=await Quizz.find()
    console.log('before', before, 'after', quizz.length)
    expect(quizz).toHaveLength(62)
  })

  it('must upsert quizz questions', async () => {
    let res = await importQuizzQuestions(path.join(ROOT, 'smart_question.csv'))
    ensureNbError(res)
    const questions=await QuizzQuestion.find({migration_id: {$ne:null}})
    expect(questions).toHaveLength(217)
    const quizz=await Quizz.find()
    expect(quizz.some(q => q.questions.length>0)).toBe(true)
  })

  it('must upsert keys', async () => {
    let res = await importKeys(path.join(ROOT, 'smart_criteria.csv'))
    ensureNbError(res)
    const keys=await Key.count({migration_id: {$ne: null}})
    expect(keys).toEqual(7)
  })

  it('must upsert progress quizz', async () => {
    let res = await importProgressQuizz(path.join(ROOT, 'smart_criteria.csv'))
  })

  it('must upsert user progress quizz', async () => {
    let res = await importUserProgressQuizz(path.join(ROOT, 'smart_consultation_progress.csv'), 24000)
  })

  it('must upsert quizz questions answers', async () => {
    let res = await importQuizzQuestionAnswer(path.join(ROOT, 'smart_question.csv'))
    ensureNbError(res)
    const questions=await QuizzQuestion.find({migration_id: {$ne:null}})
    expect(questions).toHaveLength(217)
    const quizz=await Quizz.find()
    expect(quizz.some(q => q.questions.length>0)).toBe(true)
    await prepareCache()
    console.log(lodash(getCacheKeys()).filter(k => k.split('/')[0]=='user_coaching').uniq().value())
  })

  it('must upsert patients quizzs', async () => {
    let res = await importUserQuizz(path.join(ROOT, 'smart_patient_quiz.csv'))
    console.log(JSON.stringify(res))
    ensureNbError(res)
  })


})

