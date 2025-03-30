import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './index.css';

const Home = () => {
  const navigate = useNavigate();

  // Appliances data
  const appliances = [
    {
      id: 1,
      name: "Mobile",
      image: "https://tse2.mm.bing.net/th?id=OIP.0H_GXDBmj8t95s1KzMU5GAHaL5&pid=Api&P=0&h=180",
      brands: ["Samsung", "Apple", "OnePlus", "Xiaomi", "Oppo"],
    },
    {
      id: 2,
      name: "AC",
      image: "https://os-wordpress-media.s3.ap-south-1.amazonaws.com/blog/wp-content/uploads/2020/11/24212247/Air-Conditioner-Buying-Guide.jpg",
      brands: ["LG", "Samsung", "Voltas", "Daikin", "Hitachi"],
    },
    {
      id: 3,
      name: "TV",
      image: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6470/6470245cv12d.jpg",
      brands: ["Sony", "Samsung", "LG", "Panasonic", "TCL"],
    },
    {
      id: 4,
      name: "Refrigerator",
      image: "https://fouanistore.com/storage/data/products_gallery/62fcabd092a9d.png",
      brands: ["Whirlpool", "LG", "Samsung", "Haier", "Godrej"],
    },
    {
      id: 5,
      name: "Washing Machine",
      image: "https://www.lg.com/in/images/washing-machines/md07540887/gallery/FHM1408BDL-Washing-Machines-Right-View-MZ-04-v1.jpg",
      brands: ["LG", "Samsung", "Whirlpool", "Bosch", "IFB"],
    },
    {
      id: 6,
      name: "Microwave",
      image: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/3546/3546009cv13d.jpg",
      brands: ["Samsung", "LG", "IFB", "Whirlpool", "Panasonic"],
    },
    {
      id: 7,
      name: "Agriculture Appliances",
      image: "https://5.imimg.com/data5/SELLER/Default/2023/12/367332276/YQ/JX/PO/9604282/cri-submersible-pumps-500x500.jpeg",
      brands: ["Mahindra", "John Deere", "Kubota", "Tafe", "Escorts"],
    },
  ];

  // Banners data
  const banners = [
    { id: 1, image: "https://i1.wp.com/www.infiniticomputerrepair.co.uk/wp-content/uploads/2015/07/IMG_00952.jpg" },
    { id: 2, image: "https://images.samsung.com/is/image/samsung/assets/ph/720x450-Right-Care-Deal-Hero.jpg?$FB_TYPE_B_JPG$" },
    { id: 3, image: "https://cdn.grabon.in/gograbon/images/web-images/uploads/1621488513434/today-electronics-offers.jpg" },
    { id: 4, image: "https://cdn.create.vista.com/downloads/ab5459cd-ea50-4be2-91bf-cd7df49a45a9_1024.jpeg" },
  ];

  // State for current banner and selected appliance
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedAppliance, setSelectedAppliance] = useState(null);

  // Auto-slide banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000); // Change banner every 3 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  // Handle appliance click to toggle dropdown
  const handleApplianceClick = (id) => {
    setSelectedAppliance(selectedAppliance === id ? null : id);
  };

  // Handle brand click to navigate to product listing page
  const handleBrandClick = (applianceName, brand) => {
    navigate("/products", { state: { category: applianceName, brand } });
  };

  // Close dropdown on hover out
  const handleMouseLeave = () => {
    setSelectedAppliance(null);
  };

  return (
    <div className="home-container">
      {/* Appliances Section */}
      <div className="appliances-single-container">
        {appliances.map((appliance) => (
          <div
            key={appliance.id}
            className="appliance-item"
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={`appliance-header ${selectedAppliance === appliance.id ? "open" : ""}`}
              onClick={() => handleApplianceClick(appliance.id)}
            >
              <img src={appliance.image} alt={appliance.name} />
              <p>
                {appliance.name} <span className="dropdown-icon">▼</span>
              </p>
            </div>
            {selectedAppliance === appliance.id && (
              <div className="brands-dropdown">
                {appliance.brands.map((brand, index) => (
                  <div
                    key={index}
                    className="brand-item"
                    onClick={() => handleBrandClick(appliance.name, brand)}
                  >
                    {brand}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Banner Section */}
      <div className="banner-container">
        <div className="banner-slider" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
          {banners.map((banner) => (
            <div key={banner.id} className="banner-slide">
              <img src={banner.image} alt={`Banner ${banner.id}`} />
            </div>
          ))}
        </div>

        {/* Banner Dots */}
        <div className="banner-dots">
          {banners.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentBanner ? "active" : ""}`}
              onClick={() => setCurrentBanner(index)}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;