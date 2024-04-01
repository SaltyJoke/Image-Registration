import axios from 'axios';
import { RequestAlignPayload } from './types';

const registrationEngineAPI = axios.create({
  baseURL: 'http://localhost:8989',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

export const requestAlignImages = async (payLoad: any) => {
  try {
    const response = await registrationEngineAPI.post('/align', payLoad);
    console.log('Response', { responseData: response.data });
  } catch (error) {
    console.error({ error });
  }
};
