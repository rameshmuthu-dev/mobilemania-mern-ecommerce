import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { FaFilter } from 'react-icons/fa';
import { useParams, Link } from 'react-router-dom';

import ProductGallery from '../product/ProductGallery';
import FilterSidebar from '../product/FilterSidebar';
import Pagination from '../ui/Pagination';
import Spinner from '../ui/Spinner'; 
import Message from '../ui/Message';
import Button from '../ui/Button';
import HomeCarousel from '../admin/carousel/HomeCarousel'

import { 
    getProducts, 
    setFilters, 
    getAllFilterOptions 
} from '../../redux/slices/productSlice';
import { getCarousels } from '../../redux/slices/carouselSlice';

const HomePage = () => {
    const dispatch = useDispatch();
    const { keyword: urlKeyword } = useParams(); 
    
    const searchKeyword = urlKeyword || '';

    // Product & Filter Data
    const { 
        products, 
        loading: isLoading, 
        error: isError,
        filters: currentReduxFilters, 
        totalPages, 
    } = useSelector((state) => state.products); 
    
    // Carousel Data - Isolated with shallowEqual to avoid Redux warnings
    const { 
        carousels, 
        carouselLoading, 
        carouselError 
    } = useSelector(
        (state) => ({
            carousels: state.carousel.carousels,
            carouselLoading: state.carousel.loading,
            carouselError: state.carousel.error,
        }),
        shallowEqual 
    );
    
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const fetchProducts = useCallback((filters, keyword) => {
        const filtersToSend = {
            ...filters,
            search: keyword, 
        };
        dispatch(getProducts(filtersToSend)); 
    }, [dispatch]);

    const handleFilterChange = useCallback((newFilterValues) => {
        const newFilters = { 
            ...currentReduxFilters, 
            ...newFilterValues, 
            page: 1 
        };
        
        dispatch(setFilters(newFilters));
        fetchProducts(newFilters, searchKeyword);
    }, [dispatch, currentReduxFilters, searchKeyword, fetchProducts]);

    const handlePageChange = useCallback((newPage) => {
        const newFilters = { ...currentReduxFilters, page: newPage };
        dispatch(setFilters(newFilters)); 
        fetchProducts(newFilters, searchKeyword);
        window.scrollTo(0, 0); 
    }, [dispatch, currentReduxFilters, searchKeyword, fetchProducts]);

    useEffect(() => {
        dispatch(getAllFilterOptions());
        fetchProducts({ ...currentReduxFilters, keyword: searchKeyword }, searchKeyword);

        if (!carousels || carousels.length === 0) {
            dispatch(getCarousels());
        }
    }, [dispatch, fetchProducts, searchKeyword, carousels]);

    const applyFiltersHandler = () => {
        setIsFilterOpen(false); 
    };

    const toggleFilterDrawer = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    const pages = totalPages; 
    const page = currentReduxFilters.page; 

    return (
        <main className="container mx-auto px-4 py-4 h-auto"> 
            
            <section aria-label="Featured Carousel">
                {!searchKeyword && (
                    <div className='mb-8'>
                        {carouselLoading ? (
                            <Spinner />
                        ) : carouselError ? (
                            <Message variant='danger'>{carouselError}</Message>
                        ) : carousels && carousels.length > 0 ? (
                            <HomeCarousel data={carousels} /> 
                        ) : null}
                    </div>
                )}
            </section>

            {searchKeyword && (
                <header>
                    <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">
                        Search Results for: <span className="text-indigo-600">"{searchKeyword}"</span>
                    </h2>
                </header>
            )}

            <div className="md:hidden flex justify-end mb-4">
                <Button 
                    onClick={toggleFilterDrawer} 
                    variant="primary" 
                    className="bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-400 flex items-center shadow-lg !py-2 !px-4"
                >
                    <FaFilter className="mr-2" size={16} /> View Filters
                </Button>
            </div>

            {isLoading && <Spinner />}
            {isError && <Message variant="danger">{isError}</Message>}

            {!isLoading && !isError && (
                <div 
                    className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full"
                    style={{ minHeight: 'auto' }} 
                >
                    <aside aria-label="Product Filters" className="md:col-span-3 lg:col-span-3 hidden md:block h-full"> 
                        <div className="h-full overflow-y-auto pr-2 flex flex-col"> 
                            <FilterSidebar 
                                filters={currentReduxFilters} 
                                onFilterChange={handleFilterChange} 
                                onApply={applyFiltersHandler}
                            />
                        </div>
                    </aside>

                    <section aria-label="Product Gallery" className="md:col-span-9 lg:col-span-9"> 
                        <div className="flex flex-col justify-between h-full"> 
                            {products && products.length > 0 ? (
                                <>
                                    <ProductGallery products={products} />
                                    {pages > 1 && (
                                        <nav aria-label="Product Pagination" className="mt-8">
                                            <Pagination 
                                                pages={pages} 
                                                page={page} 
                                                onPageChange={handlePageChange} 
                                            />
                                        </nav>
                                    )}
                                </>
                            ) : (
                                <div className="py-10 text-center flex-grow flex items-center justify-center">
                                    <Message variant="info">
                                        {searchKeyword 
                                            ? `No products found matching "${searchKeyword}".` 
                                            : 'No products matching the filters.'}
                                    </Message>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {isFilterOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-40 md:hidden" 
                    onClick={toggleFilterDrawer}
                    aria-hidden="true"
                ></div>
            )}
            <aside 
                aria-label="Mobile Filter Drawer"
                className={`fixed top-0 right-0 w-3/4 max-w-sm max-h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden
                    ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`} 
            >
                <FilterSidebar 
                    isMobileDrawer={true} 
                    onClose={toggleFilterDrawer} 
                    filters={currentReduxFilters} 
                    onFilterChange={handleFilterChange}
                    onApply={applyFiltersHandler} 
                />
            </aside>
        </main>
    );
};

export default HomePage;