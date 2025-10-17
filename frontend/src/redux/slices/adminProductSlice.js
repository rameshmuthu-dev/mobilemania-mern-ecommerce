import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api'; 

const PRODUCTS_API_PATH = '/products';

// --- ASYNC THUNKS (Actions) ---

// 1. Get All Admin Products (Read List)
export const getAdminProducts = createAsyncThunk(
    'adminProduct/getAdminProducts',
    async ({ page = 1, limit = 25 }, { rejectWithValue }) => {
        try {
            const { data } = await API.get(`${PRODUCTS_API_PATH}?page=${page}&limit=${limit}`); 
            return data; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return rejectWithValue(message);
        }
    }
);

// 2. CREATE Product
export const createProduct = createAsyncThunk(
    'adminProduct/createProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const { data } = await API.post(PRODUCTS_API_PATH, productData); 
            return data; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return rejectWithValue(message);
        }
    }
);

// 3. DELETE Product
export const deleteProduct = createAsyncThunk(
    'adminProduct/deleteProduct',
    async (productId, { rejectWithValue }) => {
        try {
            await API.delete(`${PRODUCTS_API_PATH}/${productId}`);
            return productId; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return rejectWithValue(message);
        }
    }
);

// 4. UPDATE Product
export const updateProduct = createAsyncThunk(
    'adminProduct/updateProduct',
    async ({ productId, productData }, { rejectWithValue }) => {
        try {
            const { data } = await API.put(`${PRODUCTS_API_PATH}/${productId}`, productData);
            return data; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return rejectWithValue(message);
        }
    }
);

// 5. Get Details for Admin Edit Form (Read Details)
export const getAdminProductDetails = createAsyncThunk(
    'adminProduct/getAdminProductDetails',
    async (productId, { rejectWithValue }) => {
        try {
            const { data } = await API.get(`${PRODUCTS_API_PATH}/${productId}`); 
            return data; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return rejectWithValue(message);
        }
    }
);

// 🔑 6. Get Product IDs and Names (for Carousel Select/Admin Utility)
export const getProductIdsAndNames = createAsyncThunk(
    'adminProduct/getProductIdsAndNames',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get(`${PRODUCTS_API_PATH}/ids`); 
            return data; 
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            return rejectWithValue(message);
        }
    }
);


// --- INITIAL STATE & SLICE ---

const initialState = {
    // List State
    products: [], 
    loading: false, 
    error: null,
    
    // Pagination Metadata 
    page: 1, totalPages: 1, totalProducts: 0, 
    
    // Read Details State (for Edit Form)
    productDetails: null, 
    detailsLoading: false,
    detailsError: null,
    
    // 🔑 New State for Product IDs/Names
    productIds: [],
    productIdsLoading: false,
    productIdsError: null,

    // CRUD Status States
    isCreating: false, createSuccess: false, createError: null,
    isDeleting: false, deleteSuccess: false, deleteError: null,
    isUpdating: false, updateSuccess: false, updateError: null,
};

const adminProductSlice = createSlice({
    name: 'adminProduct',
    initialState,
    reducers: {
        clearAdminProductStatus: (state) => {
            state.createSuccess = false; state.createError = null;
            state.deleteSuccess = false; state.deleteError = null;
            state.updateSuccess = false; state.updateError = null;
            state.productDetails = null; 
            state.detailsError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Get Admin Products (Read List) ---
            .addCase(getAdminProducts.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(getAdminProducts.fulfilled, (state, action) => {
                state.loading = false; state.products = action.payload.products;
                state.page = action.payload.page; state.totalPages = action.payload.totalPages;
                state.totalProducts = action.payload.totalProducts;
            })
            .addCase(getAdminProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // --- Get Admin Product Details (Read Details) ---
            .addCase(getAdminProductDetails.pending, (state) => {
                state.detailsLoading = true; state.detailsError = null; state.productDetails = null;
            })
            .addCase(getAdminProductDetails.fulfilled, (state, action) => {
                state.detailsLoading = false; state.productDetails = action.payload;
            })
            .addCase(getAdminProductDetails.rejected, (state, action) => {
                state.detailsLoading = false; state.detailsError = action.payload; state.productDetails = null;
            })
            
            // 🔑 --- Get Product IDs and Names (NEW) ---
            .addCase(getProductIdsAndNames.pending, (state) => { 
                state.productIdsLoading = true; state.productIdsError = null; 
            })
            .addCase(getProductIdsAndNames.fulfilled, (state, action) => {
                state.productIdsLoading = false; state.productIds = action.payload;
            })
            .addCase(getProductIdsAndNames.rejected, (state, action) => { 
                state.productIdsLoading = false; state.productIdsError = action.payload; 
                state.productIds = [];
            })

            // --- CREATE Product ---
            .addCase(createProduct.pending, (state) => { state.isCreating = true; state.createError = null; state.createSuccess = false; })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.isCreating = false; state.createSuccess = true;
                state.products.unshift(action.payload); 
                state.totalProducts += 1;
            })
            .addCase(createProduct.rejected, (state, action) => { state.isCreating = false; state.createError = action.payload; })

            // --- DELETE Product ---
            .addCase(deleteProduct.pending, (state) => { state.isDeleting = true; state.deleteError = null; state.deleteSuccess = false; })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.isDeleting = false; state.deleteSuccess = true;
                state.products = state.products.filter((product) => product._id !== action.payload);
                state.totalProducts -= 1;
            })
            .addCase(deleteProduct.rejected, (state, action) => { state.isDeleting = false; state.deleteError = action.payload; })

            // --- UPDATE Product ---
            .addCase(updateProduct.pending, (state) => { state.isUpdating = true; state.updateError = null; state.updateSuccess = false; })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.isUpdating = false; state.updateSuccess = true;
                const updatedProduct = action.payload;
                const index = state.products.findIndex(p => p._id === updatedProduct._id);
                if (index !== -1) { state.products[index] = updatedProduct; }
            })
            .addCase(updateProduct.rejected, (state, action) => { state.isUpdating = false; state.updateError = action.payload; });
    },
});

export const { clearAdminProductStatus } = adminProductSlice.actions;

export default adminProductSlice.reducer;