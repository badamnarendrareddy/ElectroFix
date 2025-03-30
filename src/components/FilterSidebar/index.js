import React, { useState } from "react";

const FilterSidebar = ({ filters, onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState({});

  const handleCheckboxChange = (filterType, value) => {
    const updatedFilters = { ...selectedFilters };
    if (!updatedFilters[filterType]) {
      updatedFilters[filterType] = [];
    }
    if (updatedFilters[filterType].includes(value)) {
      updatedFilters[filterType] = updatedFilters[filterType].filter((item) => item !== value);
    } else {
      updatedFilters[filterType].push(value);
    }
    setSelectedFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const renderFilterGroup = (filterType, filterOptions) => {
    return (
      <div className="filter-group" key={filterType}>
        <h3>{filterType.replace(/([A-Z])/g, " $1").toUpperCase()}</h3>
        {filterOptions.map((option) => (
          <div key={option}>
            <label>
              <input
                type="checkbox"
                checked={selectedFilters[filterType]?.includes(option) || false}
                onChange={() => handleCheckboxChange(filterType, option)}
              />
              {option}
            </label>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="filter-sidebar">
      {Object.entries(filters).map(([filterType, filterOptions]) =>
        Array.isArray(filterOptions)
          ? renderFilterGroup(filterType, filterOptions)
          : null
      )}
    </div>
  );
};

export default FilterSidebar;