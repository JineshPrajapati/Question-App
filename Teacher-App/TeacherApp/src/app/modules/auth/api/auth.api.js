import axios from 'axios'
import {APP_CONFIG} from '../../../../../project.config'

export const registerUser = async (userData) => {
  const response = await axios.post(`${APP_CONFIG.API_URL}/account/register`, userData)
  return response.data
} 