import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./index.css";

const ProductDetail = () => {
  const location = useLocation();
  const product = location.state?.product || {}; // Default to an empty object if `product` is undefined

  // Use optional chaining and default values for `images`
  const [selectedImage, setSelectedImage] = useState(product?.images?.[0] || "");
  const [isVideoSelected, setIsVideoSelected] = useState(false);

  // If `product` is not defined, show a loading or error message
  if (!product || Object.keys(product).length === 0) {
    return <div>Product not found or loading...</div>;
  }

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsVideoSelected(false);
  };

  const handleVideoClick = () => {
    setSelectedImage(product.youtubeVideo);
    setIsVideoSelected(true);
  };

  return (
    <div className="product-detail-container">
      {/* Left Section: Image Gallery */}
      <div className="image-gallery">
        <div className="main-media">
          {isVideoSelected ? (
            <iframe
              src={selectedImage.replace("watch?v=", "embed/")}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <img src={selectedImage} alt={product.name} />
          )}
        </div>
        <div className="thumbnail-list">
          {/* Safely map over `product.images` */}
          {product.images?.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${product.name} ${index + 1}`}
              className={`thumbnail ${selectedImage === image ? "active" : ""}`}
              onClick={() => handleImageClick(image)}
            />
          ))}
          {product.youtubeVideo && (
            <div
              className={`thumbnail ${isVideoSelected ? "active" : ""}`}
              onClick={handleVideoClick}
            >
              <img src="https://img.icons8.com/color/48/000000/youtube-play.png" alt="YouTube Video" />
            </div>
          )}
        </div>
        {/* Action Buttons Below Images */}
        <div className="action-buttons">
          <button className="add-to-cart">Add to Cart</button>
          <button className="order-now">Order Now</button>
        </div>
      </div>

      {/* Right Section: Product Details */}
      <div className="product-details">
        <h1>{product.name || "Product Name Not Available"}</h1>
        <div className="rating-section">
          <span className="rating">4.2606 ★</span>
          <span className="reviews">4.2606 Ratings & 55 Reviews</span>
        </div>
        <div className="price-section">
          <h2>₹3,333/month</h2>
          <p>3 months No Cost EMI Plan with Bajaj Finserv</p>
          <p className="discount">Extra ₹4000 off</p>
          <div className="price">
            <span className="current-price">₹9,999</span>
            <span className="original-price">₹13,999</span>
            <span className="discount-percent">28% off</span>
          </div>
        </div>
        <div className="offers-section">
          <h3>Available offers</h3>
          <ul>
            <li>
              <span className="icon">🏦</span>
              <span>Bank Offer 5% Unlimited Cashback on Flipkart Axis Bank Credit Card T&C</span>
            </li>
            <li>
              <span className="icon">🎉</span>
              <span>Special Price Get extra ₹4000 off (price inclusive of cashback/coupon) T&C</span>
            </li>
            <li>
              <span className="icon">💳</span>
              <span>No cost EMI ₹3,333/month. Standard EMI also available View Plans</span>
            </li>
            <li>
              <span className="icon">🛒</span>
              <span>Buy More, Save More Buy worth ₹5000 save ₹500 See all products T&C</span>
            </li>
          </ul>
        </div>
        <div className="warranty-section">
          <img src="https://tse4.mm.bing.net/th?id=OIP.lVAQglzLlNbBFiYOUrzmCwHaCc&pid=Api&P=0&h=180"alt="Product Logo" className="product-logo" />
          <p>1 Year Manufacturer Warranty for Device and 6 Months for In-Box Accessories</p>
        </div>
        <div className="color-ram-section">
          <div className="color-section">
            <h4>Color</h4>
            <div className="color-images">
              {/* Safely access `product.colorImages` */}
              {product.colorImages?.map((colorImage, index) => (
                <img key={index} src={colorImage} alt={`Color ${index + 1}`} />
              ))}
            </div>
          </div>
          <div className="ram-section">
            <h4>RAM</h4>
            <div className="ram-buttons">
              <button>4 GB</button>
              <button>6 GB</button>
              <button>8 GB</button>
            </div>
          </div>
        </div>
        <div className="highlights-section">
          <h3>Highlights</h3>
          <ul>
            {/* Safely access `product.highlights` */}
            {product.highlights?.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        </div>
        <div className="protection-section">
          <h3>Protect your product</h3>
          <div className="protection-option">
            <input type="checkbox" id="protection" />
            <label htmlFor="protection">
              <img src={product.protectionImage} alt="Protection" />
              <div>
                <h4>Complete Mobile Protection Powered By OneAssist</h4>
                <p>Get brand authorised repairs for all phone damages with free pickup and drop. If we can't repair it, we will replace it!</p>
                <button onClick={() => alert("Know More clicked")}>Know More</button>
                <p>Enjoy complete peace of mind for your new mobile!</p>
                <p className="protection-price">₹399 <span className="original-price">₹599</span> <span className="discount-percent">33% off</span></p>
              </div>
            </label>
          </div>
        </div>
        <div className="specifications-section">
          <h3>Specifications</h3>
          <div className="spec-group">
            <h4>General</h4>
            <table>
              <tbody>
                <tr>
                  <td>Display Size</td>
                  <td>17.02 cm (6.7 inch)</td>
                </tr>
                <tr>
                  <td>Resolution</td>
                  <td>1600 x 720 Pixels</td>
                </tr>
                <tr>
                  <td>Resolution Type</td>
                  <td>HD+</td>
                </tr>
                <tr>
                  <td>GPU</td>
                  <td>ARM Mali G57</td>
                </tr>
                <tr>
                  <td>Display Type</td>
                  <td>PLS LCD</td>
                </tr>
                <tr>
                  <td>HD Game Support</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>Display Colors</td>
                  <td>16 Million</td>
                </tr>
                <tr>
                  <td>Other Display Features</td>
                  <td>Refresh Rate: 90Hz</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="ratings-reviews-section">
          <h3>Ratings & Reviews</h3>
          <div className="ratings-summary">
            <div className="rating-range">
              <span>5★</span>
              <div className="range-bar">
                <div className="range-fill" style={{ width: "70%" }}></div>
              </div>
              <span>381</span>
            </div>
            <div className="rating-range">
              <span>4★</span>
              <div className="range-bar">
                <div className="range-fill" style={{ width: "50%" }}></div>
              </div>
              <span>106</span>
            </div>
            <div className="rating-range">
              <span>3★</span>
              <div className="range-bar">
                <div className="range-fill" style={{ width: "30%" }}></div>
              </div>
              <span>3</span>
            </div>
            <div className="rating-range">
              <span>2★</span>
              <div className="range-bar">
                <div className="range-fill" style={{ width: "10%" }}></div>
              </div>
              <span>77</span>
            </div>
            <div className="rating-range">
              <span>1★</span>
              <div className="range-bar">
                <div className="range-fill" style={{ width: "5%" }}></div>
              </div>
              <span>77</span>
            </div>
          </div>

          {/* Unpacking Images */}
          <div className="unpacking-images">
            <h4>Unpacking Images</h4>
            <div className="images">
              {product.unpackingImages?.map((image, index) => (
                <img key={index} src={image} alt={`Unpacking ${index + 1}`} />
              ))}
            </div>
          </div>

          {/* User Feedback */}
          <div className="user-feedback">
            <h4>User Feedback</h4>
            {product.feedback?.map((review, index) => (
              <div key={index} className="review">
                <div className="review-header">
                  <span className="rating">{"★".repeat(review.rating)}</span>
                  <span className="user">{review.user}</span>
                  <span className="date">{review.date}</span>
                </div>
                <p>{review.text}</p>
                <div className="review-actions">
                  <button>Like</button>
                  <button>Dislike</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ProductDetail;