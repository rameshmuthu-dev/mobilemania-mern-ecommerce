import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api'; 
import { toast } from 'react-toastify'; 

const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
    user: user ? user : null, 
    users: [], 
    userToEdit: null,
    isLoading: false,
    isError: false,
    message: '',
};

// ====================================================================
// 1. Async Thunks (API Calls) - Config removed due to API Interceptor
// ====================================================================

export const register = createAsyncThunk(
    'auth/register', 
    async (data, thunkAPI) => {
        try {
            const response = await API.post('/users/register', data); 
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const login = createAsyncThunk(
    'auth/login', 
    async (data, thunkAPI) => {
        try {
            const response = await API.post('/users/login', data);
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully!');
});

export const requestPasswordReset = createAsyncThunk(
    'auth/requestPasswordReset',
    async (email, thunkAPI) => {
        try {
            const response = await API.post('/users/forgotpassword', { email });
            toast.success(response.data.message || 'OTP sent to your email.');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (data, thunkAPI) => {
        try {
            const response = await API.post('/users/resetpassword', data);
            toast.success(response.data.message || 'Password reset successful! Please log in.');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const updateUserDetails = createAsyncThunk(
    'auth/updateUserDetails',
    async (userData, thunkAPI) => {
        try {
            // config removed
            const response = await API.put('/users/profile', userData);
            
            const { user } = thunkAPI.getState().auth; 
            const updatedUserData = { ...user, ...response.data };
            localStorage.setItem('user', JSON.stringify(updatedUserData));
            
            toast.success(response.data.message || 'Profile updated successfully!');
            
            return response.data; 

        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// --- Admin User Management Thunks (Config Removed) ---

export const getAllUsers = createAsyncThunk(
    'auth/getAllUsers',
    async (_, thunkAPI) => {
        try {
            // config removed
            const response = await API.get('/users');
            
            return response.data; 

        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getUserDetailsByAdmin = createAsyncThunk(
    'auth/getUserDetailsByAdmin',
    async (userId, thunkAPI) => {
        try {
            const response = await API.get(`/users/${userId}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            });
            
            if (response.data && response.data._id) {
                 return response.data; 
            } else {
                 return thunkAPI.rejectWithValue("Received empty or invalid user data from the server.");
            }

        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);
export const deleteUserByAdmin = createAsyncThunk(
    'auth/deleteUserByAdmin',
    async (userId, thunkAPI) => {
        try {
            // config removed
            await API.delete(`/users/${userId}`);
            
            toast.success('User deleted successfully!');
            return userId; 

        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const updateUserByAdmin = createAsyncThunk(
    'auth/updateUserByAdmin',
    async ({ userId, userData }, thunkAPI) => {
        try {
            // config removed
            const response = await API.put(`/users/${userId}`, userData);
            
            
            return response.data; 

        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);
export const registerUserByAdmin = createAsyncThunk( 
    'auth/registerUserByAdmin',
    async (userData, thunkAPI) => {
        try {
            const response = await API.post('/users', userData); 
            
           
            return response.data;

        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);


// ====================================================================
// 2. Auth Slice Definition
// ====================================================================
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.message = '';
            state.userToEdit = null; 
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => { state.isLoading = true; state.isError = false; })
            .addCase(register.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload; toast.success('Registration Successful! You are logged in.'); })
            .addCase(register.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; state.user = null; })

            .addCase(login.pending, (state) => { state.isLoading = true; state.isError = false; })
            .addCase(login.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload; toast.success('Login Successful!'); })
            .addCase(login.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; state.user = null; })

            .addCase(logout.fulfilled, (state) => { state.user = null; })
            
            .addCase(requestPasswordReset.pending, (state) => { state.isLoading = true; state.isError = false; state.message = ''; })
            .addCase(requestPasswordReset.fulfilled, (state) => { state.isLoading = false; })
            .addCase(requestPasswordReset.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })

            .addCase(resetPassword.pending, (state) => { state.isLoading = true; state.isError = false; state.message = ''; })
            .addCase(resetPassword.fulfilled, (state) => { state.isLoading = false; })
            .addCase(resetPassword.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
            
            .addCase(updateUserDetails.pending, (state) => { state.isLoading = true; state.isError = false; state.message = ''; })
            .addCase(updateUserDetails.fulfilled, (state, action) => { 
                state.isLoading = false; 
                state.user = { ...state.user, ...action.payload }; 
            })
            .addCase(updateUserDetails.rejected, (state, action) => { 
                state.isLoading = false; 
                state.isError = true; 
                state.message = action.payload; 
            })

            // --- Admin User Management Reducers ---
            
            .addCase(getAllUsers.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload; 
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.users = [];
            })

            .addCase(getUserDetailsByAdmin.pending, (state) => {
                state.isLoading = true;
                state.userToEdit = null;
            })
            .addCase(getUserDetailsByAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userToEdit = action.payload; 
            })
            .addCase(getUserDetailsByAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.userToEdit = null;
            })

            .addCase(deleteUserByAdmin.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user._id !== action.payload); 
            })
            .addCase(deleteUserByAdmin.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            })

            .addCase(updateUserByAdmin.fulfilled, (state, action) => {
                // If the updated user is the currently logged-in Admin, update the user state as well
                if (state.user && state.user._id === action.payload._id) {
                    state.user = { ...state.user, ...action.payload };
                    // Update localStorage as well
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
                
                // Update the users list
                state.users = state.users.map(user => 
                    user._id === action.payload._id ? action.payload : user
                );
            })
            .addCase(updateUserByAdmin.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            })
    },
});

export const { reset } = authSlice.actions;


export default authSlice.reducer;