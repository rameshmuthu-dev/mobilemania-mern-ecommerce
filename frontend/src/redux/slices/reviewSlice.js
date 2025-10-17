import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api'; 
import { toast } from 'react-toastify';

const initialState = {
    reviews: [], 
    allReviews: [], 
    isLoading: false,
    isError: false,
    message: '',
    hasUserOrdered: false, 
};

// ====================================================================
// Async Thunks (User & Admin Functions)
// ====================================================================

// 1. Fetch all reviews for a specific product (USER)
export const getProductReviews = createAsyncThunk(
    'review/getProductReviews', 
    async (productId, thunkAPI) => {
        try {
            const { data } = await API.get(`/reviews?productId=${productId}`); 
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
});

// 1A. NEW: Fetch ALL reviews for Admin Management
export const listAllReviewsForAdmin = createAsyncThunk(
    'review/listAllReviewsForAdmin',
    async (_, thunkAPI) => {
        const userInfoFromStorage = JSON.parse(localStorage.getItem('user')); 
        const token = userInfoFromStorage?.token; 
        
        if (!token) {
             return thunkAPI.rejectWithValue("Authentication token missing. Please sign in.");
        }

        try {
            // NOTE: Use the new admin-specific endpoint created previously (e.g., /api/admin/reviews)
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await API.get('/reviews/admin', config); 
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);


// 2. Create a new review (User function)
export const createNewReview = createAsyncThunk(
    'review/createReview', 
    async (reviewData, thunkAPI) => {
        
        const userInfoFromStorage = JSON.parse(localStorage.getItem('user')); 
        const token = userInfoFromStorage?.token; 

        if (!token) {
             return thunkAPI.rejectWithValue("Authentication token missing. Please sign in.");
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, 
                },
            };
            
            const { data } = await API.post('/reviews', reviewData, config);
            
            toast.success("Review submitted successfully!");
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
});

// 3. Check if the user has purchased the product
export const checkIfUserOrderedProduct = createAsyncThunk(
    'review/checkOrder',
    async (productId, thunkAPI) => {
        const userInfoFromStorage = JSON.parse(localStorage.getItem('user')); 
        const token = userInfoFromStorage?.token; 
        
        if (!token) {
            return thunkAPI.rejectWithValue({ hasPurchased: false }); 
        }
        
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await API.get(`/orders/has-purchased/${productId}`, config); 
            return data; // Expected: { hasPurchased: true/false }
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// 4. Delete a review (Used by both User (own review) and Admin)
export const deleteReview = createAsyncThunk(
    'review/deleteReview',
    async (reviewId, thunkAPI) => {
        const userInfoFromStorage = JSON.parse(localStorage.getItem('user')); 
        const token = userInfoFromStorage?.token; 

        if (!token) {
             return thunkAPI.rejectWithValue("Authentication token missing. Please sign in.");
        }
        
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            
            // NOTE: The backend logic for this endpoint must check if the user is the owner OR an Admin.
            await API.delete(`/reviews/${reviewId}`, config); 
            
            toast.success("Review deleted successfully!");
            return reviewId; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// 5. Update a review (For User Edit or Admin Management)
export const updateReview = createAsyncThunk(
    'review/updateReview',
    async ({ reviewId, rating, comment }, thunkAPI) => {
        const userInfoFromStorage = JSON.parse(localStorage.getItem('user')); 
        const token = userInfoFromStorage?.token; 

        if (!token) {
             return thunkAPI.rejectWithValue("Authentication token missing. Please sign in.");
        }
        
        try {
            const config = {
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
            };
            
            const { data } = await API.put(`/reviews/${reviewId}`, { rating, comment }, config);
            
            toast.success("Review updated successfully!");
            return data; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);


// ====================================================================
// Review Slice Definition
// ====================================================================

export const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        resetReviewState: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            // ====================================================================
            // GET REVIEWS FOR SINGLE PRODUCT (USER)
            // ====================================================================
            .addCase(getProductReviews.pending, (state) => { state.isLoading = true; })
            .addCase(getProductReviews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reviews = action.payload;
                state.isError = false;
            })
            .addCase(getProductReviews.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.reviews = [];
            })

            // ====================================================================
            // GET ALL REVIEWS (ADMIN) - NEW
            // ====================================================================
            .addCase(listAllReviewsForAdmin.pending, (state) => { 
                state.isLoading = true; 
                state.allReviews = [];
            })
            .addCase(listAllReviewsForAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allReviews = action.payload;
                state.isError = false;
            })
            .addCase(listAllReviewsForAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.allReviews = []; // Clear list on error
            })
            
            // ====================================================================
            // CREATE REVIEW (USER)
            // ====================================================================
            .addCase(createNewReview.fulfilled, (state, action) => {
                state.reviews.unshift(action.payload); 
                state.isLoading = false;
            })
            .addCase(createNewReview.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createNewReview.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })

            // ====================================================================
            // CHECK IF USER ORDERED PRODUCT
            // ====================================================================
            .addCase(checkIfUserOrderedProduct.fulfilled, (state, action) => {
                state.hasUserOrdered = action.payload.hasPurchased; 
            })
            .addCase(checkIfUserOrderedProduct.rejected, (state, action) => {
                state.hasUserOrdered = false; 
            })

            // ====================================================================
            // DELETE REVIEW (USER/ADMIN)
            // ====================================================================
            .addCase(deleteReview.fulfilled, (state, action) => {
                // action.payload contains the reviewId
                
                // 1. Filter out from product-specific list
                state.reviews = state.reviews.filter(review => review._id !== action.payload);
                
                // 2. Filter out from admin list (if available)
                state.allReviews = state.allReviews.filter(review => review._id !== action.payload);
                
                state.isLoading = false;
                state.isError = false;
            })
            .addCase(deleteReview.pending, (state) => { state.isLoading = true; })
            .addCase(deleteReview.rejected, (state) => { state.isLoading = false; })


            // ====================================================================
            // UPDATE REVIEW (USER/ADMIN)
            // ====================================================================
            .addCase(updateReview.fulfilled, (state, action) => {
                const updatedReview = action.payload;
                
                // 1. Update in product-specific list
                state.reviews = state.reviews.map(review => 
                    review._id === updatedReview._id ? updatedReview : review
                );

                // 2. Update in admin list (if available)
                state.allReviews = state.allReviews.map(review => 
                    review._id === updatedReview._id ? updatedReview : review
                );
                
                state.isLoading = false;
            })
            .addCase(updateReview.pending, (state) => { state.isLoading = true; })
            .addCase(updateReview.rejected, (state, action) => { 
                state.isLoading = false; 
                toast.error(`Update failed: ${action.payload}`);
            });
    },
});

export const { resetReviewState } = reviewSlice.actions;

export default reviewSlice.reducer;