// src/components/FilterSidebar.jsx

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';

// --- 1. Sub-Component for CHECKBOXES ---
const CheckboxFilterOptions = ({ title, name, options, optionLabels, currentValues, onChange }) => {
  const selectedArray = Array.isArray(currentValues)
    ? currentValues
    : currentValues
    ? currentValues.split(',').filter(v => v !== '')
    : [];

  const displayOptions = options;
  const displayLabels = optionLabels || options;

  return (
    <div className="pb-4 border-b border-gray-100">
      <h3 className="text-md font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="space-y-2 text-sm">
        {displayOptions.map((option, index) => (
          <label
            key={option || 'all'}
            className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition duration-100"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={selectedArray.includes(option)}
              onChange={onChange}
              className="h-4 w-4 accent-lime-600 border-gray-300 rounded focus:ring-lime-400"
            />
            <span className="ml-3 text-gray-600">{displayLabels[index]}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// --- MAIN FILTER SIDEBAR COMPONENT ---
const FilterSidebar = ({ filters, onFilterChange, isMobileDrawer, onClose }) => {
  const {
    categories,
    brands,
    processorOptions,
    ramOptions,
    storageOptions,
    displayOptions,
    cameraOptions,
    batteryOptions,
    graphicsCardOptions,
    osOptions,
    colorOptions,
    highestPrice,
  } = useSelector(state => state.products);

  const SORT_OPTIONS = [
    { label: 'Latest (Newest)', value: 'latest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Rating: High to Low', value: 'rating_desc' },
  ];

  const PRICE_RANGES = useMemo(() => {
    const ranges = [
      { label: '₹0 - ₹10,000', value: '0-10000' },
      { label: '₹10,001 - ₹30,000', value: '10001-30000' },
      { label: '₹30,001 - ₹50,000', value: '30001-50000' },
    ];

    if (highestPrice > 50000) {
      ranges.push({
        label: `₹50,000 & Above (Max: ₹${Math.ceil(highestPrice).toLocaleString('en-IN')})`,
        value: '50001-max',
      });
    }
    return ranges;
  }, [highestPrice]);

  const handleCheckboxFilterChange = e => {
    const { name, value, checked } = e.target;

    const isSingleSelect = name === 'sort' || name === 'priceRangeString';
    let newStringValue;

    if (isSingleSelect) {
      newStringValue = checked ? value : '';
    } else {
      const currentValuesString = filters[name];
      let currentValuesArray = currentValuesString
        ? currentValuesString.split(',').filter(v => v !== '')
        : [];

      if (checked) {
        if (!currentValuesArray.includes(value)) {
          currentValuesArray = [...currentValuesArray, value];
        }
      } else {
        currentValuesArray = currentValuesArray.filter(v => v !== value);
      }

      newStringValue = currentValuesArray.join(',');
    }

    onFilterChange({ [name]: newStringValue, page: 1 });
  };

  const handleResetFilters = () => {
    const resetData = {
      category: '',
      brand: '',
      priceRangeString: '',
      processor: '',
      camera: '',
      battery: '',
      graphicsCard: '',
      os: '',
      ram: '',
      storage: '',
      display: '',
      color: '',
      page: 1,
    };
    onFilterChange(resetData);
    if (onClose) onClose();
  };

  // ✅ Desktop: Full screen height, independent scroll
  const containerClasses = isMobileDrawer
    ? 'p-4 h-full overflow-y-auto'
    : 'w-full p-4 h-screen overflow-y-auto sticky top-0';

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-2 sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold text-gray-800">Filters & Sort</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetFilters}
            type="button"
            className="text-sm text-red-600 hover:text-red-800 transition duration-150 font-medium"
          >
            Clear All
          </button>
          {isMobileDrawer && (
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
              <FaTimes size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      <div className="space-y-6">
        <CheckboxFilterOptions
          title="Sort By"
          name="sort"
          options={SORT_OPTIONS.map(opt => opt.value)}
          optionLabels={SORT_OPTIONS.map(opt => opt.label)}
          currentValues={filters.sort}
          onChange={handleCheckboxFilterChange}
        />

        <CheckboxFilterOptions
          title="Price Range"
          name="priceRangeString"
          options={PRICE_RANGES.map(range => range.value)}
          optionLabels={PRICE_RANGES.map(range => range.label)}
          currentValues={filters.priceRangeString}
          onChange={handleCheckboxFilterChange}
        />

        {categories.length > 0 && (
          <CheckboxFilterOptions
            title="Category"
            name="category"
            options={categories}
            currentValues={filters.category}
            onChange={handleCheckboxFilterChange}
          />
        )}

        {brands.length > 0 && (
          <CheckboxFilterOptions
            title="Brand"
            name="brand"
            options={brands}
            currentValues={filters.brand}
            onChange={handleCheckboxFilterChange}
          />
        )}

        {processorOptions.length > 0 && (
          <CheckboxFilterOptions
            title="Processor"
            name="processor"
            options={processorOptions}
            currentValues={filters.processor}
            onChange={handleCheckboxFilterChange}
          />
        )}

        {ramOptions.length > 0 && (
          <CheckboxFilterOptions
            title="RAM"
            name="ram"
            options={ramOptions}
            currentValues={filters.ram}
            onChange={handleCheckboxFilterChange}
          />
        )}

        {storageOptions.length > 0 && (
          <CheckboxFilterOptions
            title="Storage"
            name="storage"
            options={storageOptions}
            currentValues={filters.storage}
            onChange={handleCheckboxFilterChange}
          />
        )}

        {displayOptions.length > 0 && (
          <CheckboxFilterOptions
            title="Display"
            name="display"
            options={displayOptions}
            currentValues={filters.display}
            onChange={handleCheckboxFilterChange}
          />
        )}

        {batteryOptions.length > 0 && (
          <CheckboxFilterOptions
            title="Battery"
            name="battery"
            options={batteryOptions}
            currentValues={filters.battery}
            onChange={handleCheckboxFilterChange}
          />
        )}

        {cameraOptions.length > 0 && (
          <CheckboxFilterOptions
            title="Camera"
            name="camera"
            options={cameraOptions}
            currentValues={filters.camera}
            onChange={handleCheckboxFilterChange}
          />
        )}

        {graphicsCardOptions.length > 0 && (
          <CheckboxFilterOptions
            title="Graphics Card"
            name="graphicsCard"
            options={graphicsCardOptions}
            currentValues={filters.graphicsCard}
            onChange={handleCheckboxFilterChange}
          />
        )}

        {osOptions.length > 0 && (
          <CheckboxFilterOptions
            title="Operating System"
            name="os"
            options={osOptions}
            currentValues={filters.os}
            onChange={handleCheckboxFilterChange}
          />
        )}

        {colorOptions.length > 0 && (
          <CheckboxFilterOptions
            title="Color"
            name="color"
            options={colorOptions}
            currentValues={filters.color}
            onChange={handleCheckboxFilterChange}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(FilterSidebar);
