import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { FaPlug, FaTint, FaTools, FaMobileAlt } from "react-icons/fa";

const RepairServices = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      name: "Electrical Work",
      icon: <FaPlug />,
      image: "https://tse2.mm.bing.net/th?id=OIP.dQKgkvb6cy4ntbVcKqZgZwHaE8&pid=Api&P=0&h=180",
      description: "Professional electrical wiring services for homes and offices.",
      relativeWork: [
        "Wiring & Rewiring",
        "Lighting Installation & Repair",
        "Power Outlets & Switches",
        "Circuit Breakers & Panels",
        "Generator Installation",
        "Surge Protection",
        "Security Systems & Cameras",
        "Smart Home Systems",
        "Data & Communication Lines",
        "Troubleshooting & Repairs",
      ],
    },
    {
      id: 2,
      name: "Plumbing Work",
      icon: <FaTint />,
      image: "https://tse4.mm.bing.net/th?id=OIP.kQHSlQ9uNLzz3bN4y72rOgHaE6&pid=Api&P=0&h=180",
      description: "Electrical solutions for plumbing systems.",
      relativeWork: [
        "Water Heater Installation & Repair",
        "Pumps & Motors",
        "Bathroom & Kitchen Fixtures",
        "Pipe Repairs & Leak Fixing",
        "Boiler & Radiator Work",
        "Drainage & Waste Systems",
      ],
    },
    {
      id: 3,
      name: "Home Appliances & Electronics",
      icon: <FaTools />,
      image: "https://tse2.mm.bing.net/th?id=OIP.K3G3X_oKfbc7AG0LZz39qwHaE8&pid=Api&P=0&h=180",
      description: "Install and repair lighting fixtures.",
      relativeWork: [
        "TV & Home Theater Setup",
        "Air Conditioners & Fans",
        "Refrigerators & Freezers",
        "Washing Machines & Dryers",
        "Microwave Ovens & Cooking Ranges",
        "Computers & Networking",
        "Intercom & Doorbell Systems",
      ],
    },
    {
      id: 4,
      name: "Mobiles & Laptops",
      icon: <FaMobileAlt />,
      image: "https://media.istockphoto.com/id/868640082/photo/modern-laptop-and-smartphone-isolated-on-white.jpg?b=1&s=170667a&w=0&k=20&c=DCqYJ07ubLsxMH3un2lue0KdKskhiI4FBuwJcP7-mVk=",
      description: "Smart home solutions for modern living.",
      relativeWork: [
        "Mobile Repair",
        "Laptop Repair",
        "Data Recovery",
        "Battery Replacement",
        "Screen Repair",
      ],
    },
  ];

  const handleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleServiceClick = (serviceId) => {
    navigate(`/book-service/${serviceId}`);
  };

  return (
    <div className="repair-services-container">
      <h2>Repair Services</h2>
      <div className="services-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className="service-item"
            onMouseEnter={() => handleDropdown(service.id)}
            onMouseLeave={() => setActiveDropdown(null)}
            onClick={() => handleServiceClick(service.id)}
          >
            <div className="service-header">
              <div className="service-icon">{service.icon}</div>
              <img src={service.image} alt={service.name} className="service-image" />
              <h3>{service.name}</h3>
            </div>
            {activeDropdown === service.id && (
              <div className="dropdown-content">
                <ul>
                  {service.relativeWork.map((work, index) => (
                    <li key={index}>{work}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepairServices;