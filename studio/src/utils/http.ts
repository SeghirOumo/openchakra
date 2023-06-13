import zlib from 'zlib'
import config from '../../env.json'
import axios from 'axios'
import { API_PATH } from '~dependencies/utils/consts'

export const copyFile = ({ contents, filePath }) => {
  const zippedContents=zlib.deflateSync(contents).toString('base64')
  const body = { contents:zippedContents, projectName: config.projectName, filePath }
  return axios.post(`${process.env.NEXT_PUBLIC_BACKEND}${API_PATH}/studio/file`, body)
}

export const install = () => {
  const body = { projectName: config.projectName }
  return axios.post(`${process.env.NEXT_PUBLIC_BACKEND}${API_PATH}/studio/install`, body)
}

export const build = () => {
  const body = { projectName: config.projectName }
  return axios.post(`${process.env.NEXT_PUBLIC_BACKEND}${API_PATH}/studio/build`, body)
}

export const start = () => {
  const body = { projectName: config.projectName }
  return axios.post(`${process.env.NEXT_PUBLIC_BACKEND}${API_PATH}/studio/start`, body)
}

export const clean = (fileNames:string[]) => {
  const body = { projectName: config.projectName , fileNames}
  return axios.post(`${process.env.NEXT_PUBLIC_BACKEND}${API_PATH}/studio/clean`, body)
}
