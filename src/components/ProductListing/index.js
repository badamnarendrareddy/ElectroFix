import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./index.css";

const ProductListing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const category = location.state?.category || "Mobile"; // Default to Mobile if no category is passed

  // Sample product data for all appliances
  const products = {
    Mobile: [
      { id: 1, name: "Samsung Galaxy S21", price: 699, brand: "Samsung", features: ["5G", "128GB Storage", "AMOLED Display"], image: "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s21-5g-0.jpg", images: ["https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s21-5g-3.jpg", "https://fdn.gsmarena.com/imgroot/reviews/21/samsung-galaxy-s21/lifestyle/-1024w2/gsmarena_004.jpg"], youtubeVideo:"https://youtu.be/PWkoGQXQEmQ", feedback: [{ text: "Great phone!", rating: 5 }] },
      // Add more products...
    ],
    // Add other categories...
  };

  // State for filters
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  // Handle filter changes
  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleFeatureChange = (feature) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  // Filter products based on selected filters
  const filteredProducts = products[category].filter((product) => {
    const withinPriceRange =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesBrand =
      selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    const matchesFeatures =
      selectedFeatures.length === 0 ||
      selectedFeatures.every((feature) => product.features.includes(feature));
    return withinPriceRange && matchesBrand && matchesFeatures;
  });

  const handleProductClick = (product) => {
    navigate("/product-detail", { state: { product } });
  };

  return (
    <div className="product-listing-container">
      {/* Filters Section */}
      <div className="filters-section">
        <h3>Filters</h3>

        {/* Price Range Filter */}
        <div className="filter-group">
          <h4>Price Range</h4>
          <input
            type="range"
            min="0"
            max="10000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
          />
          <p>${priceRange[0]} - ${priceRange[1]}</p>
        </div>

        {/* Brand Filter */}
        <div className="filter-group">
          <h4>Brand</h4>
          {[...new Set(products[category].map((product) => product.brand))].map((brand) => (
            <label key={brand}>
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
              />
              {brand}
            </label>
          ))}
        </div>

        {/* Features Filter */}
        <div className="filter-group">
          <h4>Features</h4>
          {[
            ...new Set(products[category].flatMap((product) => product.features)),
          ].map((feature) => (
            <label key={feature}>
              <input
                type="checkbox"
                checked={selectedFeatures.includes(feature)}
                onChange={() => handleFeatureChange(feature)}
              />
              {feature}
            </label>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="products-section">
        <h2>{category}</h2>
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card" onClick={() => handleProductClick(product)}>
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>Brand: {product.brand}</p>
              <p>Price: ₹{product.price.toLocaleString('en-IN')}</p>
              <p>Features: {product.features.join(", ")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;