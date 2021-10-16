import axios from 'axios'
import { config } from '../../config'

const api = axios.create({
	baseURL: config.API_URL || 'http://localhost:3001'
})

export {
	api,
}