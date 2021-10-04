import getDistance from 'geolib/es/getDistance'
import convertDistance from 'geolib/es/convertDistance'

const isEmpty = require('../server/validation/is-empty')

const computeDistanceKm = (latlon1, latlon2) => {
  if (isEmpty(latlon1) || isEmpty(latlon2)) {
    return null
  }
  if (isEmpty(latlon1.lat) || isEmpty(latlon1.lng)) {
    return null
  }
  if (isEmpty(latlon2.lat) || isEmpty(latlon2.lng)) {
    return null
  }
  try {
    return convertDistance(
      getDistance(
        {latitude: latlon1.lat, longitude: latlon1.lng},
        {latitude: latlon2.lat, longitude: latlon2.lng},
      ),
      'km',
    )
  }
  catch (error) {
    console.error(error)
    return null
  }
}

const computeAverageNotes = notes => {
  let res = {}
  if (isEmpty(notes)) {
    return res
  }
  Object.keys(notes[0]).forEach(k => {
    const value = notes.reduce((prev, next) => prev + next[k], 0) / notes.length
    res[k] = value
  })
  return res
}

const computeSumSkills = skills => {
  let res = {}
  if (isEmpty(skills)) {
    return res
  }
  Object.keys(skills[0]).forEach(k => {
    const value = skills.reduce((prev, next) => prev + next[k], 0)
    res[k] = value
  })
  return res
}

const checkCssClasses = customClasse => {
  /* return new Promise(resolve => {
    const xhttp = new XMLHttpRequest()
    xhttp.onload = function() {
      resolve(this.responseText)
    }
    xhttp.open('GET', '../static/assets/css/custom.css')
    xhttp.send()
  }).then(res => {
    return res.includes(customClasse)
  })*/


  function load() {
    const xhttp = new XMLHttpRequest()
    xhttp.onload = function coucou() {
      return this.responseText
    }
    xhttp.open('GET', '../static/assets/css/custom.css')
    xhttp.send()
  }

  async function execute() {
    let result = await load().then(res => console.log(res, 'resexecute'))
    console.log(result, 'result')
    return result
  }

  execute().then(res => {
    console.log(res, 'res')
    return res.includes(customClasse)
  }).catch(e => { console.log(e, 'error') })
  
}

const roundCurrency = amount => {
  if (!amount) {
    return amount
  }
  return Math.round(amount*100)/100
}

module.exports = {
  computeDistanceKm, computeAverageNotes, computeSumSkills, roundCurrency, checkCssClasses,
}
