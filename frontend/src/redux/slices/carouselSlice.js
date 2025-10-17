import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

const initialState = {
    carousels: [],
    carousel: {},
    loading: false,
    error: null,
    success: false,
};

export const getCarousels = createAsyncThunk(
    'carousel/getCarousels',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get('/carousels');
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const createCarousel = createAsyncThunk(
    'carousel/createCarousel',
    async (formData, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };
            const { data } = await API.post('/carousels', formData, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const deleteCarousel = createAsyncThunk(
    'carousel/deleteCarousel',
    async (id, { rejectWithValue }) => {
        try {
            await API.delete(`/carousels/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

export const getCarouselDetails = createAsyncThunk(
    'carousel/getCarouselDetails',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await API.get(`/carousels/${id}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);


export const updateCarousel = createAsyncThunk(
    'carousel/updateCarousel',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };
            const { data } = await API.put(`/carousels/${id}`, formData, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);


const carouselSlice = createSlice({
    name: 'carousel',
    initialState,
    reducers: {
        clearCarouselSuccess: (state) => {
            state.success = false;
        },
        clearCarouselError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCarousels.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCarousels.fulfilled, (state, action) => {
                state.loading = false;
                state.carousels = action.payload;
            })
            .addCase(getCarousels.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createCarousel.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(createCarousel.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.carousels.push(action.payload);
            })
            .addCase(createCarousel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteCarousel.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(deleteCarousel.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.carousels = state.carousels.filter(
                    (carousel) => carousel._id !== action.payload
                );
            })
            .addCase(deleteCarousel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getCarouselDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.carousel = {};
            })
            .addCase(getCarouselDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.carousel = action.payload;
            })
            .addCase(getCarouselDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.carousel = {};
            })

            .addCase(updateCarousel.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(updateCarousel.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const index = state.carousels.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.carousels[index] = action.payload;
                }
                state.carousel = action.payload;
            })
            .addCase(updateCarousel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCarouselSuccess, clearCarouselError } = carouselSlice.actions;
// export { getCarouselDetails, updateCarousel };
export default carouselSlice.reducer;