import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import './index.css'; // Add CSS for styling
import { FaMapMarkerAlt, FaClock, FaStar } from "react-icons/fa";

const BookRepairService = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    contact: "",
    date: "",
    time: "",
    serviceArea: "",
  });
  const [serviceAreas, setServiceAreas] = useState([]); // List of service areas
  const [electricians, setElectricians] = useState([]); // List of electricians for the selected service area
  const [selectedElectrician, setSelectedElectrician] = useState(null); // Selected electrician
  const [availableSlots, setAvailableSlots] = useState([]); // Available time slots
  const [rating, setRating] = useState(0); // Rating after service

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      const docRef = doc(db, "repairServices", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setService({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such document!");
      }
    };

    fetchService();
  }, [id]);

  // Fetch service areas from Firestore
  useEffect(() => {
    const fetchServiceAreas = async () => {
      const querySnapshot = await getDocs(collection(db, "serviceAreas"));
      const areas = querySnapshot.docs.map((doc) => doc.data().name);
      setServiceAreas(areas);
    };

    fetchServiceAreas();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({
      ...bookingDetails,
      [name]: value,
    });

    // Fetch electricians when service area is selected
    if (name === "serviceArea") {
      fetchElectricians(value);
    }
  };

  // Fetch electricians based on service area
  const fetchElectricians = async (area) => {
    const q = query(collection(db, "serviceAgents"), where("serviceAreas", "array-contains", area));
    const querySnapshot = await getDocs(q);
    const electriciansData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setElectricians(electriciansData);
  };

  // Handle electrician selection
  const handleElectricianSelection = (electrician) => {
    setSelectedElectrician(electrician);
    setAvailableSlots(["9 AM", "11 AM", "2 PM", "4 PM", "6 PM"]); // Mock slots
  };

  // Handle slot selection
  const handleSlotSelection = (slot) => {
    setBookingDetails({ ...bookingDetails, time: slot });
  };

  // Handle rating change
  const handleRatingChange = (value) => {
    setRating(value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedElectrician || !bookingDetails.time) {
      alert("Please select an electrician and a time slot.");
      return;
    }

    // Store booking details in Firestore
    try {
      await addDoc(collection(db, "bookings"), {
        ...bookingDetails,
        electricianId: selectedElectrician.id,
        serviceId: id,
        rating: rating,
      });
      alert("Booking Successful!");
    } catch (error) {
      console.error("Error booking service: ", error);
      alert("Failed to book service.");
    }
  };

  if (!service) {
    return <div>Loading...</div>;
  }

  return (
    <div className="book-repair-service">
      <h2>Book {service.name}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Name:</label>
          <input
            type="text"
            name="name"
            value={bookingDetails.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Your Contact:</label>
          <input
            type="text"
            name="contact"
            value={bookingDetails.contact}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={bookingDetails.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Service Area:</label>
          <input
            type="text"
            name="serviceArea"
            value={bookingDetails.serviceArea}
            onChange={handleChange}
            list="serviceAreas"
            placeholder="Enter your service area"
            required
          />
          <datalist id="serviceAreas">
            {serviceAreas.map((area, index) => (
              <option key={index} value={area} />
            ))}
          </datalist>
        </div>

        {/* Display Electricians */}
        {electricians.length > 0 && (
          <div className="electricians-list">
            <h3>Available Electricians</h3>
            {electricians.map((electrician) => (
              <div
                key={electrician.id}
                className={`electrician-card ${selectedElectrician?.id === electrician.id ? "selected" : ""}`}
                onClick={() => handleElectricianSelection(electrician)}
              >
                <h4>{electrician.fullName}</h4>
                <p><FaMapMarkerAlt /> {electrician.serviceAreas.join(", ")}</p>
                <p><FaClock /> Available Slots: 9 AM, 11 AM, 2 PM, 4 PM, 6 PM</p>
              </div>
            ))}
          </div>
        )}

        {/* Display Available Slots */}
        {selectedElectrician && (
          <div className="slots-list">
            <h3>Select a Time Slot</h3>
            {availableSlots.map((slot, index) => (
              <button
                key={index}
                type="button"
                className={`slot-button ${bookingDetails.time === slot ? "selected" : ""}`}
                onClick={() => handleSlotSelection(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        )}

        {/* Rating */}
        {selectedElectrician && (
          <div className="rating-section">
            <h3>Rate the Service</h3>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <FaStar
                  key={value}
                  className={`star ${rating >= value ? "active" : ""}`}
                  onClick={() => handleRatingChange(value)}
                />
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="submit-button">Book Now</button>
      </form>
    </div>
  );
};

export default BookRepairService;