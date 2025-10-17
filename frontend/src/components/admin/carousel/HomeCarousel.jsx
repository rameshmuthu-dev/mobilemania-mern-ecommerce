import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const HomeCarousel = ({ data }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const AUTO_SLIDE_INTERVAL = 6000; 

    if (!data || data.length === 0) return null;

    const totalSlides = data.length;

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    }, [totalSlides]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    };
    
    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    // Auto-slide effect
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, AUTO_SLIDE_INTERVAL);
        return () => clearInterval(interval);
    }, [nextSlide]); 

    return (
        <section 
            className="relative w-full h-[400px] overflow-hidden rounded-xl shadow-xl" 
            aria-label="Featured Products Carousel"
        > 
            {/* 1. Container holding all slides */}
            <div 
                className="flex h-full transition-transform ease-in-out duration-700"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {data.map((item, index) => (
                    
                    <article 
                        key={item._id || index} 
                        className="w-full h-full flex-shrink-0 relative"
                    >
                        
                        {/* 1. Image Tag (z-index: 10) */}
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover absolute top-0 left-0 z-10" 
                            onError={(e) => { e.target.style.display = 'none'; console.error("Carousel image failed to load:", item.image); }}
                        />
                        
                        {/* 2. Dark Overlay */}
                        <div className="absolute inset-0 bg-black opacity-30 z-15"></div>


                        {/* 3. Content Link (z-index: 20) */}
                        <Link 
                            // CORRECTED: Use item.productId._id as slug was undefined.
                            to={`/product/${item.productId ? item.productId._id : ''}`} 
                            className="absolute inset-0 flex items-center justify-center p-8 text-center z-20" 
                        >
                            <div className="text-white max-w-2xl">
                                <h2 className="text-4xl sm:text-5xl font-extrabold mb-2 leading-tight">
                                    {item.title}
                                </h2>
                                <p className="text-lg sm:text-xl font-medium mb-4">
                                    {item.subtitle}
                                </p>
                                <span className="inline-block bg-lime-500 hover:bg-lime-600 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300">
                                    Shop Now
                                </span>
                            </div>
                        </Link>
                    </article>
                ))}
            </div>

            {/* Navigation Buttons (z-30) */}
            <button 
                onClick={prevSlide} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition z-30"
                aria-label="Previous Slide"
            >
                <FaChevronLeft size={20} />
            </button>
            
            <button 
                onClick={nextSlide} 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition z-30"
                aria-label="Next Slide"
            >
                <FaChevronRight size={20} />
            </button>
            
            
            {/* Pagination Dots (z-30) */}
            <nav className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-30" aria-label="Carousel Pagination">
                {data.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors duration-300 shadow-md ${
                            currentIndex === index
                                ? 'bg-lime-500 scale-110' 
                                : 'bg-gray-400 hover:bg-gray-500' 
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    ></button>
                ))}
            </nav>
        </section>
    );
};

export default HomeCarousel;