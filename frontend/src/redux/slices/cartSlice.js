import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
import { toast } from 'react-toastify';

// Helper function to calculate all prices based on cartItems
const calculatePrices = (state) => {
    // 1. Items Price (Subtotal)
    state.itemsPrice = state.cartItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
    );

    // ⭐ 2. Shipping Price (CONSTANT: ₹10.00 for a non-empty cart) ⭐
    // NOTE: If itemsPrice is 0 (empty cart), shipping is 0.
    const SHIPPING_FEE = 10.00; 
    state.shippingPrice = state.itemsPrice > 0 ? SHIPPING_FEE : 0.00;

    // 3. Tax Price (Example: 18% Tax on Subtotal)
    state.taxPrice = state.itemsPrice * 0.18;

    // 4. Total Price (Grand Total)
    state.totalPrice = state.itemsPrice + state.shippingPrice + state.taxPrice;
};


const cartItemsFromStorage = localStorage.getItem('cartItems') 
    ? JSON.parse(localStorage.getItem('cartItems')) 
    : [];

const initialState = {
    cartItems: cartItemsFromStorage,
    
    // ⭐ Initialize all price fields to 0 to prevent the 'toFixed' error ⭐
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,

    isLoading: false,
    isError: false,
    message: '',
};

// Calculate initial prices if items are loaded from storage
if (initialState.cartItems.length > 0) {
    calculatePrices(initialState);
}


export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem', 
    async ({ productId, qty }, thunkAPI) => {
        try {
            const { data: product } = await API.get(`/products/${productId}`);
            const item = {
                product: product._id, 
                name: product.name,
                price: product.price,
                image: product.images[0], 
                countInStock: product.countInStock,
                qty,
                // NOTE: We don't need 'shippingCost' here for constant shipping logic.
            };
            // Dispatch the synchronous action to update cart and calculate prices
            thunkAPI.dispatch(cartSlice.actions.updateCart(item)); 
            return item;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(`Cart Error: ${message}`);
            return thunkAPI.rejectWithValue(message);
        }
});


export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        updateCart: (state, action) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x.product === item.product);

            if (existItem) {
                state.cartItems = state.cartItems.map((x) => 
                    x.product === existItem.product ? item : x
                );
            } else {
                state.cartItems.push(item);
            }
            
            // ⭐ Call calculatePrices after cart items are updated ⭐
            calculatePrices(state); 
            
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            toast.success(`${item.name} updated in cart.`);
        },
        removeItemFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter((x) => x.product !== action.payload);
            
            // ⭐ Call calculatePrices after item is removed ⭐
            calculatePrices(state); 
            
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            toast.info("Item removed from cart.");
        },
        clearCartItems: (state) => {
            state.cartItems = [];
            // Set prices back to zero after clearing cart
            state.itemsPrice = 0;
            state.shippingPrice = 0;
            state.taxPrice = 0;
            state.totalPrice = 0;
            
            localStorage.removeItem('cartItems');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateCartItem.pending, (state) => { state.isLoading = true; })
            .addCase(updateCartItem.fulfilled, (state, action) => { state.isLoading = false; })
            .addCase(updateCartItem.rejected, (state, action) => { 
                state.isLoading = false; state.isError = true; state.message = action.payload;
            });
    }
});

export const { updateCart, removeItemFromCart, clearCartItems } = cartSlice.actions;
export default cartSlice.reducer;