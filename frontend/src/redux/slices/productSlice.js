import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api'; 

const PRODUCTS_API_PATH = '/products'; 
const FILTER_OPTIONS_API_PATH = '/products/filters'; 

const SPEC_KEYS = [
    'ram', 'storage', 'color', 'display', 
    'processor', 'camera', 'battery', 'graphicsCard', 'os'
];

const initialState = {
    products: [],
    loading: false,
    error: null,
    
    productDetails: null, 
    
    isCreating: false,
    createSuccess: false,
    createError: null,
    
    isUpdating: false,
    updateSuccess: false,
    updateError: null,
    
    similarProducts: [],
    similarLoading: false,
    similarError: null,

    filters: {
        keyword: '',
        category: '',
        brand: '',
        sort: 'latest',
        priceRangeString: '', 
        page: 1, 
        limit: 9, 
        processor: '', 
        camera: '',
        battery: '',
        graphicsCard: '',
        os: '',
    },
    
    categories: [],
    brands: [],
    processorOptions: [], 
    ramOptions: [],
    storageOptions: [],
    displayOptions: [],
    cameraOptions: [], 
    batteryOptions: [],
    graphicsCardOptions: [], 
    osOptions: [],
    colorOptions: [],
    highestPrice: 0, 
    
    totalProducts: 0,
    totalPages: 1,
};

// --- ASYNC THUNKS ---

export const createProduct = createAsyncThunk(
    'product/createProduct',
    async (productData, { rejectWithValue, getState }) => {
        try {
            const user = getState().auth.user;

            if (!user || !user.token) {
                return rejectWithValue('Authentication failed. Please login to create a product.'); 
            }
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': undefined, 
                },
            };

            const response = await API.post('/products', productData, config);
            
            return response.data;

        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) 
                            || error.message || error.toString();
            return rejectWithValue(message);
        }
    }
);

export const updateProduct = createAsyncThunk(
    'product/updateProduct',
    async (productData, { rejectWithValue, getState }) => {
        try {
            const user = getState().auth.user;
            if (!user || !user.token) {
                return rejectWithValue('Authentication failed. Please login to update a product.'); 
            }

            const productId = productData.get('_id'); 

            const config = {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': undefined, 
                },
            };
            
            const response = await API.put(
                `${PRODUCTS_API_PATH}/${productId}`, 
                productData,
                config
            );
            
            return response.data;
            
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) 
                             || error.message || 'Error updating product';
            return rejectWithValue(message);
        }
    }
);

export const getProducts = createAsyncThunk(
    'product/getProducts', 
    async (filters = {}, thunkAPI) => {
        let apiFilters = {};
        
        Object.keys(filters).forEach(key => {
            if (filters[key] !== '' && key !== 'keyword' && key !== 'priceRangeString') {
                apiFilters[key] = filters[key];
            }
        });
        
        if (filters.priceRangeString) { apiFilters.price = filters.priceRangeString; }
        if (filters.keyword) { apiFilters.search = filters.keyword; }

        let specs = {};
        SPEC_KEYS.forEach(key => {
            if (filters[key] && filters[key] !== '') { specs[key] = filters[key]; }
        });
        if (Object.keys(specs).length > 0) { apiFilters.specs = specs; }

        try {
            const response = await API.get(PRODUCTS_API_PATH, { params: apiFilters });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching products');
        }
    }
);


export const getAllFilterOptions = createAsyncThunk(
    'product/getAllFilterOptions',
    async (_, thunkAPI) => {
        try {
            const response = await API.get(FILTER_OPTIONS_API_PATH); 
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching filter options');
        }
    }
);


export const getProductDetails = createAsyncThunk(
    'product/getProductDetails',
    async (id, thunkAPI) => {
        try {
            const response = await API.get(`${PRODUCTS_API_PATH}/${id}`); 
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching product details');
        }
    }
);


export const getSimilarProducts = createAsyncThunk(
    'product/getSimilarProducts',
    async (productId, { rejectWithValue }) => {
      try {
        const { data } = await API.get(`${PRODUCTS_API_PATH}/${productId}/similar`); 
        return data.products;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
    }
);


// --- SLICE ---
const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearSimilarProducts: (state) => {
             state.similarProducts = [];
             state.similarError = null;
        },
        clearCreateStatus: (state) => {
            state.isCreating = false;
            state.createSuccess = false;
            state.createError = null;
        },
        clearUpdateStatus: (state) => {
            state.isUpdating = false;
            state.updateSuccess = false;
            state.updateError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- getProducts Reducers ---
            .addCase(getProducts.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(getProducts.fulfilled, (state, action) => { 
                state.loading = false; 
                state.products = action.payload.products; 
                state.totalProducts = action.payload.totalProducts; 
                state.totalPages = action.payload.totalPages;     
            })
            .addCase(getProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            
            // --- getProductDetails Reducers ---
            .addCase(getProductDetails.pending, (state) => { 
                state.loading = true; 
                state.error = null; 
                state.productDetails = null;
            })
            .addCase(getProductDetails.fulfilled, (state, action) => { 
                state.loading = false; 
                state.productDetails = action.payload; 
            })
            .addCase(getProductDetails.rejected, (state, action) => { 
                state.loading = false; 
                state.error = action.payload; 
                state.productDetails = null;
            })
            
            // --- getSimilarProducts Reducers ---
            .addCase(getSimilarProducts.pending, (state) => {
                state.similarLoading = true;
                state.similarError = null;
                state.similarProducts = [];
            })
            .addCase(getSimilarProducts.fulfilled, (state, action) => {
                state.similarLoading = false;
                state.similarProducts = action.payload;
            })
            .addCase(getSimilarProducts.rejected, (state, action) => {
                state.similarLoading = false;
                state.similarError = action.payload;
            })

            // --- getAllFilterOptions Reducers ---
            .addCase(getAllFilterOptions.fulfilled, (state, action) => {

                const deduplicateOptions = (options) => {
                    if (!options) return [];
                    
                    const uniqueMap = options.reduce((map, item) => {
                        const trimmedItem = String(item).trim(); 
                        if (!trimmedItem) return map; 
                        const lowerCaseKey = trimmedItem.toLowerCase();
                        
                        if (!map.has(lowerCaseKey)) {
                            map.set(lowerCaseKey, trimmedItem); 
                        }
                        return map;
                    }, new Map());

                    return Array.from(uniqueMap.values());
                };
                
                state.categories = deduplicateOptions(action.payload.categories);
                state.brands = deduplicateOptions(action.payload.brands);

                state.processorOptions = deduplicateOptions(action.payload.processorOptions);
                state.ramOptions = deduplicateOptions(action.payload.ramOptions);
                state.storageOptions = deduplicateOptions(action.payload.storageOptions);
                state.displayOptions = deduplicateOptions(action.payload.displayOptions);
                state.cameraOptions = deduplicateOptions(action.payload.cameraOptions);
                state.batteryOptions = deduplicateOptions(action.payload.batteryOptions);
                state.graphicsCardOptions = deduplicateOptions(action.payload.graphicsCardOptions);
                state.osOptions = deduplicateOptions(action.payload.osOptions);
                state.colorOptions = deduplicateOptions(action.payload.colorOptions);
                
                state.highestPrice = action.payload.maxPrice || 0; 
            })


            // --- Create Product Reducers ---
            .addCase(createProduct.pending, (state) => {
                state.isCreating = true;
                state.createSuccess = false;
                state.createError = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.isCreating = false;
                state.createSuccess = true;
                state.products.push(action.payload); 
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.isCreating = false;
                state.createError = action.payload;
            })
            
            // --- Update Product Reducers ---
            .addCase(updateProduct.pending, (state) => {
                state.isUpdating = true;
                state.updateSuccess = false;
                state.updateError = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.updateSuccess = true;
                
                const updatedProduct = action.payload;
                const index = state.products.findIndex(p => p._id === updatedProduct._id);
                if (index !== -1) {
                    state.products[index] = updatedProduct;
                }
                
                if (state.productDetails?._id === updatedProduct._id) {
                    state.productDetails = updatedProduct;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.isUpdating = false;
                state.updateError = action.payload;
            });
    },
});

export const { setFilters, clearSimilarProducts, clearCreateStatus, clearUpdateStatus } = productSlice.actions;

export default productSlice.reducer;