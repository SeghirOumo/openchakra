const fs=require('fs')
const lodash=require('lodash')
const {importData, extractData}=require('../../../utils/import')
const {XL_TYPE } = require('../../../utils/consts')
const job=require('../../../server/models/Job')

const loadRecords = async (path, tab_name, from_line) =>  {
  const msg=`Loading records from ${path}`
  console.time(msg)
  const contents=fs.readFileSync(path)
  const {records} = await extractData(contents, {format: XL_TYPE, tab: tab_name, from_line})
  console.timeEnd(msg)
  return records
}

const JOB_MAPPING={
  name: `Métiers : à étendre avec France compténces pour avoir "IA", "Intelligence articifielle"`,
  code: 'code Fiche Métiers',
}

const JOB_KEY='name'
const JOB_MIGRATION_KEY='name'

const importJobs = async (input_file) => {
  const records=await loadRecords(input_file, `1 - Métiers`, 2)
  const selectedRecords=records.filter(r => !lodash.isEmpty(r['SO SYNPL à garder']))
  return importData({model: 'job', data:selectedRecords, mapping:JOB_MAPPING, identityKey: JOB_KEY, 
      migrationKey: JOB_MIGRATION_KEY})
}

module.exports={
  importJobs
}

