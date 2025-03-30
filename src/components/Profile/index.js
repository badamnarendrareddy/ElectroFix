// src/pages/Profile/index.js
import React, { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "./index.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    // Fetch user details
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        email: currentUser.email,
        uid: currentUser.uid,
      });

      // Fetch repair bookings
      const fetchBookings = async () => {
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(bookingsQuery);
        const bookingsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(bookingsList);
      };

      // Fetch after-sales services
      const fetchServices = async () => {
        const servicesQuery = query(
          collection(db, "services"),
          where("userId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(servicesQuery);
        const servicesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesList);
      };

      fetchBookings();
      fetchServices();
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      <div className="user-details">
        <h2>User Information</h2>
        <p>Email: {user.email}</p>
        <p>User ID: {user.uid}</p>
      </div>

      <div className="bookings">
        <h2>Repair Bookings</h2>
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <p>Repair Person: {booking.repairPersonName}</p>
              <p>Date: {booking.date}</p>
              <p>Status: {booking.status}</p>
            </div>
          ))
        ) : (
          <p>No bookings found.</p>
        )}
      </div>

      <div className="services">
        <h2>After-Sales Services</h2>
        {services.length > 0 ? (
          services.map((service) => (
            <div key={service.id} className="service-card">
              <p>Service Type: {service.type}</p>
              <p>Date: {service.date}</p>
              <p>Status: {service.status}</p>
            </div>
          ))
        ) : (
          <p>No services requested.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;