import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api'; 

const CATEGORY_API_PATH = '/categories';

export const getCategories = createAsyncThunk(
    'category/getCategories',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get(CATEGORY_API_PATH); 
            return data; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    list: [],       
    loading: false, 
    error: null,    
};

const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {}, 
    extraReducers: (builder) => {
        builder
            .addCase(getCategories.pending, (state) => { 
                state.loading = true; 
                state.error = null; 
            })
            .addCase(getCategories.fulfilled, (state, action) => {
                state.loading = false; 
                state.list = action.payload; 
            })
            .addCase(getCategories.rejected, (state, action) => { 
                state.loading = false; 
                state.error = action.payload; 
            });
    },
});

export default categorySlice.reducer;