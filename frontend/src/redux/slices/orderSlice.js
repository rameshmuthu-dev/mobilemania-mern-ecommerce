import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/api";
import { toast } from "react-toastify";

// ====================================================================
// LOCAL STORAGE HELPERS
// ====================================================================
const getLocalStorageItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return defaultValue;
  }
};

const defaultCheckoutDetails = {
  orderItems: [],
  itemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
  totalPrice: 0,
};

// ====================================================================
// INITIAL STATE
// ====================================================================
const initialState = {
  orderDetails: null,
  myOrders: [],
  isLoading: false,
  isError: false,
  message: "",
  isOrderCreated: false,

  checkoutDetails: getLocalStorageItem("checkoutDetails", defaultCheckoutDetails),
  shippingAddress: getLocalStorageItem("shippingAddress", null),
  paymentMethod: localStorage.getItem("paymentMethod") || null,
};

// ====================================================================
// ASYNC THUNKS
// ====================================================================
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (order, thunkAPI) => {
    try {
      const { data } = await API.post("/orders", order);
      toast.success(`Order #${data._id} placed successfully!`);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(`Order creation error: ${message}`);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMyOrders = createAsyncThunk(
  "order/getMyOrders",
  async (_, thunkAPI) => {
    try {
      const { data } = await API.get("/orders/myorders");
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  "order/getOrderDetails",
  async (orderId, thunkAPI) => {
    try {
      const { data } = await API.get(`/orders/${orderId}`);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ====================================================================
// SLICE
// ====================================================================
export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setCheckoutDetails: (state, action) => {
      state.checkoutDetails = action.payload;
      localStorage.setItem("checkoutDetails", JSON.stringify(action.payload));
    },

    clearCheckout: (state) => {
      state.checkoutDetails = defaultCheckoutDetails;
      localStorage.removeItem("checkoutDetails");
    },

    clearOrder: (state) => {
      state.orderDetails = null;
      state.myOrders = [];
      state.isOrderCreated = false;
      state.isError = false;
      state.message = "";
      localStorage.removeItem("checkoutDetails");
      localStorage.removeItem("shippingAddress");
      localStorage.removeItem("paymentMethod");
    },

    resetOrderState: (state) => {
      state.orderDetails = null;
      state.isOrderCreated = false;
      state.isError = false;
      state.message = "";
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem("shippingAddress", JSON.stringify(action.payload));
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem("paymentMethod", action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.isOrderCreated = false;
        state.message = "";
        state.isError = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload;
        state.isOrderCreated = true;

        // Clear temporary checkout after order success
        state.checkoutDetails = defaultCheckoutDetails;
        localStorage.removeItem("checkoutDetails");
        localStorage.removeItem("shippingAddress");
        localStorage.removeItem("paymentMethod");
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.isOrderCreated = false;
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMyOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myOrders = action.payload;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const {
  resetOrderState,
  setCheckoutDetails,
  clearCheckout,
  clearOrder,
  saveShippingAddress,
  savePaymentMethod,
} = orderSlice.actions;

export default orderSlice.reducer;
