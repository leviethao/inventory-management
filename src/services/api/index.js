import axios from 'axios'

const api = axios.create({
	baseURL: 'https://a38b-123-21-86-62.ngrok.io'
})

export {
	api,
}