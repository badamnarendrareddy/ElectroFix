import React, { useState } from "react";
import { 
  FaStar, FaCalendarAlt, FaClock, FaUser, FaMapMarkerAlt, 
  FaTools, FaPhone, FaBolt, FaShieldAlt, FaCertificate, 
  FaCar, FaSearch, FaMapPin, FaLocationArrow, FaEdit,
  FaCheck, FaPrint, FaSpinner
} from "react-icons/fa";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import './index.css';
import { motion } from "framer-motion";

const RepairBooking = () => {
  const [electricians, setElectricians] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    phone: "",
    problem: "",
    date: "",
    time: "",
    pincode: "",
    address: "",
    useCurrentLocation: false
  });
  const [locationStatus, setLocationStatus] = useState({
    loading: false,
    error: null,
    coords: null
  });
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [bookedSlot, setBookedSlot] = useState(null);
  const [selectedElectrician, setSelectedElectrician] = useState(null);
  const [showElectricianDetails, setShowElectricianDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSavingBooking, setIsSavingBooking] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  // Time slots (2-hour gaps)
  const timeSlots = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];

  // Fetch user's current location
  const fetchCurrentLocation = () => {
    setLocationStatus({ loading: true, error: null, coords: null });
    setShowAddressInput(false);
    
    if (!navigator.geolocation) {
      setLocationStatus({ 
        loading: false, 
        error: "Geolocation is not supported by your browser",
        coords: null
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationStatus({ 
          loading: false, 
          error: null, 
          coords: { latitude, longitude }
        });
        
        // Reverse geocode to get address (using a free API)
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        setLocationStatus({ 
          loading: false, 
          error: error.message,
          coords: null
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data.address) {
        const addressParts = [];
        if (data.address.road) addressParts.push(data.address.road);
        if (data.address.suburb) addressParts.push(data.address.suburb);
        if (data.address.city) addressParts.push(data.address.city);
        if (data.address.postcode) {
          setBookingDetails(prev => ({ 
            ...prev, 
            pincode: data.address.postcode,
            address: addressParts.join(", "),
            useCurrentLocation: true
          }));
        }
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setLocationStatus(prev => ({
        ...prev,
        error: "Could not fetch address details"
      }));
    }
  };

  // Handle location toggle
  const handleLocationToggle = () => {
    if (!bookingDetails.useCurrentLocation) {
      fetchCurrentLocation();
    } else {
      setBookingDetails(prev => ({ 
        ...prev, 
        useCurrentLocation: false,
        address: ""
      }));
    }
  };

  // Fetch electricians based on pincode
  const fetchElectriciansByPincode = async () => {
    if (!bookingDetails.pincode || bookingDetails.pincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode");
      return;
    }
    
    setLoading(true);
    try {
      const q = query(
        collection(db, "serviceAgents"), 
        where("pincode", "==", bookingDetails.pincode),
        where("status", "==", "Verified")
      );
      
      const querySnapshot = await getDocs(q);
      const electriciansData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        rating: calculateRating(),
        distance: calculateDistance()
      }));
      
      setElectricians(electriciansData);
      setSearchInitiated(true);
      
      if (electriciansData.length === 0) {
        alert("No electricians found in this pincode area");
      }
    } catch (error) {
      console.error("Error fetching electricians:", error);
      alert("Failed to fetch electricians. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate average rating (mock for now)
  const calculateRating = () => {
    return Math.floor(Math.random() * 2) + 4; // Random between 4-5
  };

  // Calculate distance (mock for now)
  const calculateDistance = () => {
    return (Math.random() * 5).toFixed(1);
  };

  // Handle booking a slot
  const handleBookSlot = (electrician, time) => {
    setBookedSlot({
      electrician: electrician.fullName,
      electricianId: electrician.id,
      phone: electrician.phone,
      date: bookingDetails.date,
      time: time,
      pincode: bookingDetails.pincode,
      address: bookingDetails.address || "Address not specified"
    });
    setShowConfirmation(true);
  };

  // Save booking to Firestore
  const saveBookingToFirestore = async () => {
    if (!bookedSlot) return;
    
    setIsSavingBooking(true);
    try {
      const bookingData = {
        customerName: bookingDetails.name,
        customerPhone: bookingDetails.phone,
        problemDescription: bookingDetails.problem,
        electricianId: bookedSlot.electricianId,
        electricianName: bookedSlot.electrician,
        electricianPhone: bookedSlot.phone,
        bookingDate: bookedSlot.date,
        timeSlot: bookedSlot.time,
        address: bookedSlot.address,
        pincode: bookedSlot.pincode,
        status: "confirmed",
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "bookings"), bookingData);
      setBookingId(docRef.id);
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error saving booking:", error);
      alert("Failed to save booking. Please try again.");
    } finally {
      setIsSavingBooking(false);
    }
  };

  // Render confirmation dialog
  const renderConfirmationDialog = () => {
    if (!showConfirmation || !bookedSlot) return null;

    return (
      <div className="repair-booking__modal repair-booking__modal--show">
        <div 
          className="repair-booking__modal-overlay" 
          onClick={() => setShowConfirmation(false)}
        ></div>
        <div className="repair-booking__modal-content">
          <button 
            className="repair-booking__modal-close"
            onClick={() => setShowConfirmation(false)}
          >
            &times;
          </button>

          <h3>Confirm Your Booking</h3>
          <p>Please review your booking details before confirming:</p>

          <div className="repair-booking__details-card">
            <div className="repair-booking__detail">
              <FaUser />
              <span><strong>Customer:</strong> {bookingDetails.name}</span>
            </div>
            <div className="repair-booking__detail">
              <FaPhone />
              <span><strong>Your Phone:</strong> {bookingDetails.phone}</span>
            </div>
            <div className="repair-booking__detail">
              <FaUser />
              <span><strong>Electrician:</strong> {bookedSlot.electrician}</span>
            </div>
            <div className="repair-booking__detail">
              <FaPhone />
              <span><strong>Electrician Phone:</strong> {bookedSlot.phone}</span>
            </div>
            <div className="repair-booking__detail">
              <FaCalendarAlt />
              <span><strong>Date:</strong> {bookedSlot.date}</span>
            </div>
            <div className="repair-booking__detail">
              <FaClock />
              <span><strong>Time:</strong> {bookedSlot.time}</span>
            </div>
            <div className="repair-booking__detail">
              <FaMapMarkerAlt />
              <span><strong>Address:</strong> {bookedSlot.address}</span>
            </div>
            <div className="repair-booking__detail">
              <FaMapPin />
              <span><strong>Pincode:</strong> {bookedSlot.pincode}</span>
            </div>
            <div className="repair-booking__detail">
              <FaTools />
              <span><strong>Problem:</strong> {bookingDetails.problem}</span>
            </div>
          </div>

          <div className="repair-booking__confirmation-actions">
            <button 
              className="repair-booking__button--primary"
              onClick={saveBookingToFirestore}
              disabled={isSavingBooking}
            >
              {isSavingBooking ? (
                <>
                  <FaSpinner className="repair-booking__spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <FaCheck /> Confirm Booking
                </>
              )}
            </button>
            <button 
              className="repair-booking__button--secondary"
              onClick={() => setShowConfirmation(false)}
              disabled={isSavingBooking}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render booking success
  const renderBookingSuccess = () => {
    if (!bookingId || !bookedSlot) return null;

    return (
      <div className="repair-booking__step repair-booking__step--active">
        <div className="repair-booking__step-number">4</div>
        <div className="repair-booking__step-content">
          <div className="repair-booking__confirmation">
            <div className="repair-booking__confirmation-icon">
              <div className="repair-booking__checkmark">✓</div>
            </div>
            <h3>Booking Confirmed!</h3>
            <p>Your booking ID: <strong>{bookingId}</strong></p>
            <p>Your electrician will arrive at the scheduled time.</p>

            <div className="repair-booking__details-card">
              <div className="repair-booking__detail">
                <FaUser />
                <span><strong>Electrician:</strong> {bookedSlot.electrician}</span>
              </div>
              <div className="repair-booking__detail">
                <FaPhone />
                <span><strong>Contact:</strong> {bookedSlot.phone}</span>
              </div>
              <div className="repair-booking__detail">
                <FaCalendarAlt />
                <span><strong>Date:</strong> {bookedSlot.date}</span>
              </div>
              <div className="repair-booking__detail">
                <FaClock />
                <span><strong>Time:</strong> {bookedSlot.time}</span>
              </div>
              <div className="repair-booking__detail">
                <FaMapMarkerAlt />
                <span><strong>Address:</strong> {bookedSlot.address}</span>
              </div>
              <div className="repair-booking__detail">
                <FaMapPin />
                <span><strong>Pincode:</strong> {bookedSlot.pincode}</span>
              </div>
            </div>

            <div className="repair-booking__confirmation-actions">
              <button 
                className="repair-booking__button--primary"
                onClick={() => window.print()}
              >
                <FaPrint /> Print Confirmation
              </button>
              <button 
                className="repair-booking__button--secondary"
                onClick={() => {
                  setBookedSlot(null);
                  setSelectedElectrician(null);
                  setSearchInitiated(false);
                  setBookingId(null);
                  setBookingDetails({
                    name: "",
                    phone: "",
                    problem: "",
                    date: "",
                    time: "",
                    pincode: "",
                    address: "",
                    useCurrentLocation: false
                  });
                }}
              >
                Book Another Service
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="repair-booking">
      {/* Booking Flow */}
      <div className="repair-booking__flow">
        {/* Step 1: Enter Details */}
        <div className={`repair-booking__step repair-booking__step--active`}>
          <div className="repair-booking__step-number">1</div>
          <div className="repair-booking__step-content">
            <h3 className="repair-booking__step-title">Enter Your Details</h3>
            <div className="repair-booking__form">
              <div className="repair-booking__form-row">
                <div className="repair-booking__form-group">
                  <label className="repair-booking__form-label">Your Name</label>
                  <div className="repair-booking__input-wrapper">
                    <FaUser className="repair-booking__input-icon" />
                    <input
                      type="text"
                      className="repair-booking__input"
                      placeholder="John Doe"
                      value={bookingDetails.name}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="repair-booking__form-group">
                  <label className="repair-booking__form-label">Phone Number</label>
                  <div className="repair-booking__input-wrapper">
                    <FaPhone className="repair-booking__input-icon" />
                    <input
                      type="tel"
                      className="repair-booking__input"
                      placeholder="+91 9876543210"
                      value={bookingDetails.phone}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="repair-booking__form-group">
                <label className="repair-booking__form-label">Service Address</label>
                
                <div className="repair-booking__location-options">
                  <button
                    type="button"
                    className={`repair-booking__location-toggle ${
                      bookingDetails.useCurrentLocation ? 'repair-booking__location-toggle--active' : ''
                    }`}
                    onClick={handleLocationToggle}
                    disabled={locationStatus.loading}
                  >
                    <FaLocationArrow />
                    {locationStatus.loading ? "Detecting..." : "Use Current Location"}
                  </button>
                  
                  <button
                    type="button"
                    className={`repair-booking__manual-address-btn ${
                      showAddressInput ? 'repair-booking__manual-address-btn--active' : ''
                    }`}
                    onClick={() => {
                      setShowAddressInput(!showAddressInput);
                      if (!showAddressInput) {
                        setBookingDetails(prev => ({ 
                          ...prev, 
                          useCurrentLocation: false 
                        }));
                      }
                    }}
                  >
                    <FaEdit />
                    {showAddressInput ? "Cancel" : "Enter Address Manually"}
                  </button>
                </div>
                
                {locationStatus.error && (
                  <p className="repair-booking__error">{locationStatus.error}</p>
                )}
                
                {bookingDetails.useCurrentLocation && bookingDetails.address && (
                  <div className="repair-booking__current-address">
                    <FaMapMarkerAlt />
                    <span>{bookingDetails.address}</span>
                  </div>
                )}
                
                {showAddressInput && (
                  <div className="repair-booking__input-wrapper">
                    <FaMapMarkerAlt className="repair-booking__input-icon" />
                    <textarea
                      className="repair-booking__textarea repair-booking__textarea--address"
                      placeholder="Enter your full address (House no, Building, Street, Area)"
                      value={bookingDetails.address}
                      onChange={(e) => setBookingDetails({ 
                        ...bookingDetails, 
                        address: e.target.value
                      })}
                      rows={3}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="repair-booking__form-group">
                <label className="repair-booking__form-label">Pincode</label>
                <div className="repair-booking__pincode-search">
                  <div className="repair-booking__input-wrapper">
                    <FaMapPin className="repair-booking__input-icon" />
                    <input
                      type="text"
                      className="repair-booking__input"
                      placeholder="Enter 6-digit pincode"
                      maxLength="6"
                      value={bookingDetails.pincode}
                      onChange={(e) => setBookingDetails({ 
                        ...bookingDetails, 
                        pincode: e.target.value.replace(/\D/g, '')
                      })}
                      required
                    />
                  </div>
                  <button 
                    className={`repair-booking__search-button ${
                      !bookingDetails.pincode || bookingDetails.pincode.length !== 6 
                        ? 'repair-booking__search-button--disabled' 
                        : ''
                    }`}
                    onClick={fetchElectriciansByPincode}
                    disabled={!bookingDetails.pincode || bookingDetails.pincode.length !== 6}
                  >
                    <FaSearch /> {loading ? "Searching..." : "Find Electricians"}
                  </button>
                </div>
              </div>

              <div className="repair-booking__form-group">
                <label className="repair-booking__form-label">Service Required</label>
                <div className="repair-booking__input-wrapper">
                  <FaTools className="repair-booking__input-icon" />
                  <textarea
                    className="repair-booking__textarea"
                    placeholder="Describe your electrical problem..."
                    value={bookingDetails.problem}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, problem: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Select Electrician */}
        {searchInitiated && (
          <div className={`repair-booking__step ${electricians.length ? 'repair-booking__step--active' : ''}`}>
            <div className="repair-booking__step-number">2</div>
            <div className="repair-booking__step-content">
              <h3 className="repair-booking__step-title">Available Electricians in {bookingDetails.pincode}</h3>
              
              {loading ? (
                <div className="repair-booking__loading">
                  <div className="repair-booking__spinner"></div>
                  <p>Finding electricians near you...</p>
                </div>
              ) : electricians.length > 0 ? (
                <div className="repair-booking__electricians">
                  {electricians.map((electrician) => (
                    <motion.div 
                      key={electrician.id}
                      className="repair-booking__electrician"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="repair-booking__electrician-header">
                        <div className="repair-booking__electrician-avatar">
                          {electrician.fullName.charAt(0)}
                        </div>
                        <div className="repair-booking__electrician-info">
                          <h4 className="repair-booking__electrician-name">{electrician.fullName}</h4>
                          <div className="repair-booking__electrician-meta">
                            <div className="repair-booking__rating">
                              {Array.from({ length: 5 }, (_, i) => (
                                <FaStar key={i} className={`repair-booking__star ${
                                  i < electrician.rating 
                                    ? 'repair-booking__star--filled' 
                                    : 'repair-booking__star--empty'
                                }`} />
                              ))}
                              <span>({electrician.rating}.0)</span>
                            </div>
                            <div className="repair-booking__distance">
                              <FaMapMarkerAlt /> {electrician.distance} km away
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="repair-booking__electrician-details">
                        <div className="repair-booking__detail">
                          <FaBolt />
                          <span>Specializes in: {electrician.specification || "General Electrical"}</span>
                        </div>
                        <div className="repair-booking__detail">
                          <FaCertificate />
                          <span>Experience: {electrician.experience || "5"} years</span>
                        </div>
                        <div className="repair-booking__detail">
                          <FaShieldAlt />
                          <span>Verified Professional</span>
                        </div>
                      </div>

                      <div className="repair-booking__electrician-actions">
                        <button 
                          className="repair-booking__profile-button"
                          onClick={() => {
                            setSelectedElectrician(electrician);
                            setShowElectricianDetails(true);
                          }}
                        >
                          View Profile
                        </button>
                        <button 
                          className="repair-booking__select-button"
                          onClick={() => setSelectedElectrician(electrician)}
                        >
                          Select
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="repair-booking__empty-state">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" 
                    alt="No electricians" 
                    className="repair-booking__empty-state-image"
                  />
                  <h4 className="repair-booking__empty-state-title">No electricians available in this area</h4>
                  <p className="repair-booking__empty-state-description">
                    We couldn't find any verified electricians in your pincode. Try a nearby pincode or check back later.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Select Time Slot */}
        {selectedElectrician && !bookingId && (
          <div className="repair-booking__step repair-booking__step--active">
            <div className="repair-booking__step-number">3</div>
            <div className="repair-booking__step-content">
              <h3 className="repair-booking__step-title">Select Time Slot</h3>
              <div className="repair-booking__selected-electrician">
                <div className="repair-booking__electrician-avatar">
                  {selectedElectrician.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="repair-booking__electrician-name">{selectedElectrician.fullName}</h4>
                  <div className="repair-booking__rating">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FaStar key={i} className={`repair-booking__star ${
                        i < selectedElectrician.rating 
                          ? 'repair-booking__star--filled' 
                          : 'repair-booking__star--empty'
                      }`} />
                    ))}
                    <span>({selectedElectrician.rating}.0)</span>
                  </div>
                </div>
              </div>

              <div className="repair-booking__date-picker">
                <label className="repair-booking__form-label">Select Date</label>
                <div className="repair-booking__input-wrapper">
                  <FaCalendarAlt className="repair-booking__input-icon" />
                  <input
                    type="date"
                    className="repair-booking__input"
                    value={bookingDetails.date}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              {bookingDetails.date && (
                <div className="repair-booking__timeslots">
                  <h4>Available Time Slots</h4>
                  <div className="repair-booking__timeslots-grid">
                    {timeSlots.map((slot) => (
                      <motion.div
                        key={slot}
                        className={`repair-booking__timeslot ${
                          bookedSlot?.time === slot ? 'repair-booking__timeslot--selected' : ''
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBookSlot(selectedElectrician, slot)}
                      >
                        {slot}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Booking Success */}
        {renderBookingSuccess()}
      </div>

      {/* Electrician Details Modal */}
      {showElectricianDetails && selectedElectrician && (
        <div className={`repair-booking__modal ${
          showElectricianDetails ? 'repair-booking__modal--show' : ''
        }`}>
          <div 
            className="repair-booking__modal-overlay" 
            onClick={() => setShowElectricianDetails(false)}
          ></div>
          <div className="repair-booking__modal-content">
            <button 
              className="repair-booking__modal-close"
              onClick={() => setShowElectricianDetails(false)}
            >
              &times;
            </button>

            <div className="repair-booking__modal-header">
              <div className="repair-booking__modal-avatar">
                {selectedElectrician.fullName.charAt(0)}
              </div>
              <div>
                <h3>{selectedElectrician.fullName}</h3>
                <div className="repair-booking__rating">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar key={i} className={`repair-booking__star ${
                      i < selectedElectrician.rating 
                        ? 'repair-booking__star--filled' 
                        : 'repair-booking__star--empty'
                    }`} />
                  ))}
                  <span>({selectedElectrician.rating}.0)</span>
                </div>
                <div className="repair-booking__distance">
                  <FaMapMarkerAlt /> {selectedElectrician.distance} km from your location
                </div>
              </div>
            </div>

            <div className="repair-booking__modal-body">
              <div className="repair-booking__modal-section">
                <h4 className="repair-booking__modal-section-title">Professional Information</h4>
                <div className="repair-booking__detail">
                  <FaCertificate />
                  <span><strong>License:</strong> {selectedElectrician.licenseNumber ? "Verified" : "Not provided"}</span>
                </div>
                <div className="repair-booking__detail">
                  <FaTools />
                  <span><strong>Tools:</strong> {selectedElectrician.tools || "Standard toolkit"}</span>
                </div>
                <div className="repair-booking__detail">
                  <FaCar />
                  <span><strong>Vehicle:</strong> {selectedElectrician.vehicle || "Personal vehicle"}</span>
                </div>
              </div>

              <div className="repair-booking__modal-section">
                <h4 className="repair-booking__modal-section-title">Service Areas</h4>
                <div className="repair-booking__detail">
                  <FaMapMarkerAlt />
                  <span><strong>Primary Pincode:</strong> {selectedElectrician.pincode}</span>
                </div>
                <div className="repair-booking__detail">
                  <FaMapMarkerAlt />
                  <span><strong>Service Areas:</strong> {selectedElectrician.serviceAreas || "Within 10km radius"}</span>
                </div>
              </div>

              <div className="repair-booking__modal-section">
                <h4 className="repair-booking__modal-section-title">Contact Information</h4>
                <div className="repair-booking__detail">
                  <FaPhone />
                  <span><strong>Phone:</strong> {selectedElectrician.phone}</span>
                </div>
                <div className="repair-booking__detail">
                  <FaPhone />
                  <span><strong>Alternate Phone:</strong> {selectedElectrician.alternatePhone || "Not provided"}</span>
                </div>
              </div>
            </div>

            <div className="repair-booking__modal-footer">
              <button 
                className="repair-booking__select-button"
                onClick={() => {
                  setSelectedElectrician(selectedElectrician);
                  setShowElectricianDetails(false);
                }}
              >
                Select This Electrician
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {renderConfirmationDialog()}
    </div>
  );
};

export default RepairBooking;