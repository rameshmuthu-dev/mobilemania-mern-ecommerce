// src/slices/apiSlice.js

import { createApi } from '@reduxjs/toolkit/query/react';
import API from '../../utils/api'; 

const axiosBaseQuery = ({ baseUrl } = { baseUrl: '' }) => async ({ url, method, data, params }) => {
    try {
        const result = await API({
            url: baseUrl + url,
            method,
            data,
            params,
        });
        return { data: result.data };
    } catch (axiosError) {
        let err = axiosError;
        return {
            error: {
                status: err.response?.status,
                data: err.response?.data || err.message,
            },
        };
    }
};

const baseQuery = axiosBaseQuery({
    baseUrl: API.defaults.baseURL,
});


export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery,
    tagTypes: ['Product', 'Order', 'User', 'Review', 'Carousel', 'Analytics'],
    endpoints: (builder) => ({}),
});