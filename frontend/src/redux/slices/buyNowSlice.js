// src/redux/slices/buyNowSlice.js

import { createSlice } from '@reduxjs/toolkit';

// Retrieve item and flow status from localStorage if available,
// to handle page reloads during the checkout process.
const buyNowItemFromStorage = localStorage.getItem('buyNowItem') 
    ? JSON.parse(localStorage.getItem('buyNowItem')) 
    : null;

const buyNowFlowStatus = localStorage.getItem('isBuyNowFlow') === 'true';

const initialState = {
    // Stores the single product object for immediate purchase
    item: buyNowItemFromStorage, 
    // Flag to indicate if the current checkout is a Buy Now flow (true) or a Cart flow (false)
    isBuyNowFlow: buyNowFlowStatus, 
};

const buyNowSlice = createSlice({
    name: 'buyNow',
    initialState,
    reducers: {
        /**
         * Sets the single product item and activates the Buy Now flow.
         * The payload should be the single item object, containing product ID, name, price, qty, etc.
         */
        setBuyNowItem: (state, action) => {
            state.item = action.payload; 
            state.isBuyNowFlow = true;
            
            // Save state to localStorage to persist across page reloads during checkout steps
            localStorage.setItem('buyNowItem', JSON.stringify(action.payload));
            localStorage.setItem('isBuyNowFlow', 'true');
        },
        
        /**
         * Clears the item and deactivates the Buy Now flow. 
         * This MUST be called after the order is successfully placed (in PlaceOrder.jsx).
         */
        clearBuyNowItem: (state) => {
            state.item = null;
            state.isBuyNowFlow = false;
            
            // Clear items from localStorage
            localStorage.removeItem('buyNowItem');
            localStorage.removeItem('isBuyNowFlow');
        },
    },
});

export const { setBuyNowItem, clearBuyNowItem } = buyNowSlice.actions;

// Export the reducer to be added to the store (src/redux/store.js)
export default buyNowSlice.reducer;