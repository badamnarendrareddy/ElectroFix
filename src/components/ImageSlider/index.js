// src/components/ImageSlider.js
import React, { useState, useEffect } from "react";
import './index.css';

const images = [
  "https://img.freepik.com/free-vector/illustrated-people-renovating-living-room_23-2148677770.jpg?t=st=1740929434~exp=1740933034~hmac=181a0eafff23ec28d6528d995b9443b10a1eda90c620e9d10d7ec9af47772249&w=1800",
  "https://img.freepik.com/free-photo/professional-male-manual-worker-wearing-protective-eyewear-head-mask-gloves-holding-drilling-machine-fixing-something-his-colleague-female-with-dirty-face-having-happy-expression_273609-7940.jpg?t=st=1740926983~exp=1740930583~hmac=10349d7ddb4f0ada2cc374d9e6466616ba9bb8375507770b37f6efbaf9b27d27&w=1800",
  "https://img.freepik.com/premium-photo/home-appliance-with-ribbons-discounts_252025-696.jpg?w=1480",
];

const ImageSlider = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="image-slider">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Slide ${index + 1}`}
          className={index === currentImage ? "active" : ""}
        />
      ))}
    </div>
  );
};

export default ImageSlider;