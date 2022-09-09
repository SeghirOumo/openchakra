import lodash from 'lodash'
import { build, copyFile, install } from './http'
import { generateCode } from './code'
import { validate } from './validation'
import config from '../../env.json'

const copyApp = (contents: Buffer) => {
  console.log(`Code:${contents}`)
  return copyFile({ contents: contents, filePath: 'App.js' })
}

export const deploy = (components: IComponents) => {
  console.log(`deployingCode for components:${Object.keys(components)}`)
  return validate(components)
    .then(() => {
      return generateCode(components)
    })
    .then(code => {
      return copyApp(code)
    })
    .then(() => {
      return install()
    })
    .then(() => {
      return build()
    })
}
