const {buildQuery} = require('../../utils/database')
const path=require('path')
const fs=require('fs').promises
const child_process = require('child_process')
const mongoose=require('mongoose')
const express = require('express')
const lodash=require('lodash')
const {getModels} =require('../../utils/database')
const {HTTP_CODES, NotFoundError}=require('../../utils/errors')
const PRODUCTION_ROOT='/home/ec2-user/studio/'

const router = express.Router()

router.get('/models', (req, res) => {
  const allModels=getModels()
  return res.json(allModels)
})

router.post('/file', (req, res) => {
  const {projectName, filePath, contents}=req.body
  if (!(projectName && filePath && contents)) {
    return res.status(HTTP_CODES.BAD_REQUEST).json()
  }
  const destpath=path.join(PRODUCTION_ROOT, projectName, 'src', filePath)
  console.log(`Copying in ${destpath}`)
  return fs.writeFile(destpath, contents)
    .then(() => {
      return res.json()
    })
    .catch(err => {
      return res.status(HTTP_CODES.SYSTEM_ERROR).json(err)
    })
})

router.post('/install', (req, res) => {
  const {projectName}=req.body
  if (!projectName) {
    return res.status(HTTP_CODES.BAD_REQUEST).json()
  }

  const destpath=path.join(PRODUCTION_ROOT, projectName)
  const result=child_process.execSync('yarn install',
    {
      cwd: destpath,
    }, (error, stdout, stderr) => {
      console.log(`Error:${error}`)
      console.log(`Stdout:${stdout}`)
      console.log(`stderr:${stderr}`)
      if (error) {
        return res.status(HTTP_CODES.SYSTEM_ERROR).json(error)
      }
      return res.json()
    })
  console.log(`Install result:${result}`)
  return res.json(result)
})

router.post('/build', (req, res) => {
  const {projectName}=req.body
  if (!projectName) {
    return res.status(HTTP_CODES.BAD_REQUEST).json()
  }

  const destpath=path.join(PRODUCTION_ROOT, projectName)
  const result=child_process.execSync('yarn build',
    {
      cwd: destpath,
    }, (error, stdout, stderr) => {
      console.log(`Error:${error}`)
      console.log(`Stdout:${stdout}`)
      console.log(`stderr:${stderr}`)
      if (error) {
        return res.status(HTTP_CODES.SYSTEM_ERROR).json(error)
      }
      return res.json()
    })
  console.log(`Build result:${result}`)
  return res.json(result)
})

router.post('/start', (req, res) => {
  const {projectName}=req.body
  if (!projectName) {
    return res.status(HTTP_CODES.BAD_REQUEST).json()
  }

  const destpath=path.join(PRODUCTION_ROOT, projectName)
  const result=child_process.exec('serve -p 4001 build/',
    {
      cwd: destpath,
    }, (error, stdout, stderr) => {
      console.log(`Error:${error}`)
      console.log(`Stdout:${stdout}`)
      console.log(`stderr:${stderr}`)
    })
  console.log(`Start result:${result}`)
  return res.json(result)
})

router.get('/:model/:id?', (req, res) => {
  const model=req.params.model
  const fields=req.query.fields?.split(',') || []
  const id=req.params.id

  const query=buildQuery(model, id, fields)
  query
    .then(data => {
      if (id && data.length==0) {
        throw new NotFoundError(`Can't find ${model}:${id}`)
      }
      res.json(data)
    })
    .catch(err => {
      console.error(err)
      res.status(err.status || HTTP_CODES.SYSTEM_ERROR).json(err.message || err)
    })
})

module.exports=router
