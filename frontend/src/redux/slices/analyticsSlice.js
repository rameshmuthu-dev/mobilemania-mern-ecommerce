import { apiSlice } from './apiSlice'; 

const ADMIN_URL = '/admin';

export const analyticsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardAnalytics: builder.query({
            query: () => ({
                url: `${ADMIN_URL}/dashboard`,
                method: 'GET',
            }),
            providesTags: ['Analytics'], 
            transformResponse: (response) => {
                if (!response) {
                    return {
                        totalRevenue: 0,
                        totalOrders: 0,
                        totalReviewsCount: 0,
                        totalProductsCount: 0,
                        totalUsersCount: 0,
                        salesTrend: [],
                        topProducts: []
                    };
                }
                return response;
            }
        }),
    }),
});

export const { useGetDashboardAnalyticsQuery } = analyticsSlice;