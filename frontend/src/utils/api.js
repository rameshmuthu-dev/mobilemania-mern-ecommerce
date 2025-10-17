import axios from 'axios';

export const BASE_URL = 'https://mobilemania-mern-ecommerce.onrender.com/api'; 

const API = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

API.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


API.interceptors.response.use(
    (response) => response, 
    
    async (error) => {
        try {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                
                localStorage.removeItem('user');
            }
        } catch (cleanupError) {
            console.error("Error during token expiry cleanup:", cleanupError);
        }
        
        return Promise.reject(error); 
    }
);


export default API;