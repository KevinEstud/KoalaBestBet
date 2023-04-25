import axios from 'axios';

export default axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    headers: {
        "Content-type": "application/json",
    },
    withCredentials: true,
    credentials: 'include'
},
);

export const axiosPrivate = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL, 
    headers: { 'Content-Type': 'application/json' }, 
    withCredentials: true,
    credentials: 'include'
});