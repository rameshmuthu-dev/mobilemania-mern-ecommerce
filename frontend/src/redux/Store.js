

import { configureStore } from '@reduxjs/toolkit';

import { apiSlice } from './slices/apiSlice';
import authReducer from './slices/authSlice'
import productReducer from './slices/productSlice'
import cartReducer from './slices/cartSlice'
import orderReducer from './slices/orderSlice'
import reviewReducer from './slices/reviewSlice'
import wishlistReducer from './slices/wishlistSlice';
import carouselReducer from './slices/carouselSlice';

import adminProductReducer from './slices/adminProductSlice';
import categoryReducer from './slices/categorySlice';
import adminOrderReducer from './slices/adminOrderSlice';




export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    order: orderReducer,
    review: reviewReducer,
    wishlist: wishlistReducer,
    carousel: carouselReducer,
    adminProduct: adminProductReducer,
    category: categoryReducer,
    adminOrders: adminOrderReducer,

  },

  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }).concat(apiSlice.middleware),
});