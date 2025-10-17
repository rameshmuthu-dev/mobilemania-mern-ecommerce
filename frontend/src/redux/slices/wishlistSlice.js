import { createSlice, createAsyncThunk, isPending, isRejected } from '@reduxjs/toolkit';
import API from '../../utils/api'; 
import { toast } from 'react-toastify'; 

// --- ASYNC THUNKS (No changes needed here) ---

/**
 * Thunk to fetch the entire wishlist (on component mount or initialization)
 * GET /api/wishlist
 */
export const getWishlist = createAsyncThunk(
    'wishlist/getWishlist',
    async (_, { rejectWithValue }) => {
        try {
            // GET /api/wishlist
            const { data } = await API.get(`/wishlist`); 
            return data.wishlist; // Expecting an array of wishlist items
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return rejectWithValue(message); 
        }
    }
);

/**
 * Thunk to add a product to the user's wishlist
 * POST /api/wishlist
 */
export const addToWishlist = createAsyncThunk(
    'wishlist/addToWishlist',
    async (productId, { rejectWithValue }) => {
        try {
            // POST /api/wishlist with { productId } in body
            const { data } = await API.post(`/wishlist`, { productId }); 
            toast.success("Product added to your Wishlist!");
            // Backend should return the updated wishlist array
            return data.wishlist; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(`Wishlist Error: ${message}`);
            return rejectWithValue(message); 
        }
    }
);

/**
 * Thunk to remove a product from the user's wishlist
 * DELETE /api/wishlist/:productId
 */
export const removeFromWishlist = createAsyncThunk(
    'wishlist/removeFromWishlist',
    async (productId, { rejectWithValue }) => {
        try {
            // DELETE /api/wishlist/:productId
            const { data } = await API.delete(`/wishlist/${productId}`); 
            toast.info("Product removed from Wishlist.");
            // Backend should return the updated wishlist array
            return data.wishlist; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(`Error removing item: ${message}`);
            return rejectWithValue(message); 
        }
    }
);


// --- SLICE DEFINITION ---

const initialState = {
    items: [], 
    loading: false,
    error: null,
};

export const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        /**
         * Reducer to clear wishlist state on user logout or session end
         */
        clearWishlist: (state) => {
            state.items = [];
            state.error = null;
            state.loading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // 1. FULFILLED CASES (All builder.addCase calls must come first)
            
            // Get Wishlist Fulfilled
            .addCase(getWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload; 
            })
            // Add/Remove Fulfilled 
            .addCase(addToWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload; 
            })
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload; 
            })

            // 2. PENDING CASES (addMatcher - Placed AFTER all addCase calls)
            .addMatcher(
                (action) => isPending(action) && action.type.includes('wishlist/'),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            // 3. REJECTED CASES (addMatcher - Placed AFTER all addCase calls)
            .addMatcher(
                (action) => isRejected(action) && action.type.includes('wishlist/'),
                (state, action) => {
                    state.loading = false;
                    // Clear items only on failed fetch attempt
                    if (action.type === getWishlist.rejected.type) {
                        state.items = []; 
                    }
                    state.error = action.payload;
                }
            );
    },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;