import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api'; 
import { toast } from 'react-toastify'; 
import { getMyOrders } from './orderSlice';

const initialState = {
    orders: [], 
    order: {}, 
    isLoading: false,
    isError: false,
    message: '',
    page: 1,
    pages: 1,
    totalOrders: 0,
};

export const getOrders = createAsyncThunk(
    'adminOrders/getOrders',
    async (filterParams = {}, thunkAPI) => {
        try {
            const query = new URLSearchParams(filterParams).toString(); 
            const response = await API.get(`/orders?${query}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getOrderDetails = createAsyncThunk(
    'adminOrders/getOrderDetails',
    async (orderId, thunkAPI) => {
        try {
            const response = await API.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);


export const updateOrderToPaid = createAsyncThunk(
    'adminOrders/updateOrderToPaid',
    async (orderId, thunkAPI) => {
        try {
            const response = await API.put(`/orders/${orderId}/pay`, {}); 
            
            return response.data; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const updateOrderToDelivered = createAsyncThunk(
    'adminOrders/updateOrderToDelivered',
    async (orderId, thunkAPI) => {
        try {
            const response = await API.put(`/orders/${orderId}/deliver`, {}); 
            return response.data; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const deleteOrder = createAsyncThunk(
    'adminOrders/deleteOrder',
    async (orderId, thunkAPI) => {
        try {
            const response = await API.delete(`/orders/${orderId}`); 
            return response.data; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const adminOrderSlice = createSlice({
    name: 'adminOrders',
    initialState,
    reducers: {
        resetAdminOrders: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.message = '';
            state.orders = [];
            state.page = 1;
            state.pages = 1;
            state.totalOrders = 0;
        },
        resetOrderDetails: (state) => { 
            state.isLoading = false;
            state.isError = false;
            state.message = '';
            state.order = {};
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getOrders.pending, (state) => { 
                state.isLoading = true; 
                state.isError = false; 
            })
            .addCase(getOrders.fulfilled, (state, action) => { 
                state.isLoading = false; 
                state.orders = action.payload.orders; // Updated to use action.payload.orders
                state.page = action.payload.page;     // New Pagination Field
                state.pages = action.payload.pages;   // New Pagination Field
                state.totalOrders = action.payload.totalOrders; // New Pagination Field
            })
            .addCase(getOrders.rejected, (state, action) => { 
                state.isLoading = false; 
                state.isError = true; 
                state.message = action.payload; 
                state.orders = []; 
                state.page = 1;      // Reset on error
                state.pages = 1;     // Reset on error
                state.totalOrders = 0; // Reset on error
            })
            
            .addCase(getOrderDetails.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(getOrderDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.order = action.payload;
            })
            .addCase(getOrderDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.order = {};
            })
            
            .addCase(updateOrderToPaid.pending, (state) => { 
                state.isLoading = true; 
                state.isError = false; 
            })
            .addCase(updateOrderToPaid.rejected, (state, action) => { 
                state.isLoading = false; 
                state.isError = true; 
                state.message = action.payload; 
            })
            .addCase(updateOrderToPaid.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = state.orders.map(order => 
                    order._id === action.payload._id ? action.payload : order
                );
            })

            .addCase(updateOrderToDelivered.pending, (state) => { 
                state.isLoading = true; 
                state.isError = false; 
            })
            .addCase(updateOrderToDelivered.rejected, (state, action) => { 
                state.isLoading = false; 
                state.isError = true; 
                state.message = action.payload; 
            })
            .addCase(updateOrderToDelivered.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = state.orders.map(order => 
                    order._id === action.payload._id ? action.payload : order
                );
            })
            
            .addCase(deleteOrder.pending, (state) => { 
                state.isLoading = true; 
                state.isError = false; 
            })
            .addCase(deleteOrder.rejected, (state, action) => { 
                state.isLoading = false; 
                state.isError = true; 
                state.message = action.payload; 
            })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = state.orders.filter(order => order._id !== action.meta.arg);
            });
    },
});

export const { resetAdminOrders, resetOrderDetails } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;