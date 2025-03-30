import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { 
  FaTools, FaFilePdf, FaTrash, FaCheckCircle, FaSearch, FaFilter,
  FaTimesCircle, FaUserPlus, FaUsers, FaChartLine, FaCalendarAlt, FaEye
} from "react-icons/fa";
import { RiDashboardFill } from "react-icons/ri";
import { BsFillGearFill } from "react-icons/bs";
import './index.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [electricians, setElectricians] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedElectrician, setSelectedElectrician] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [bookingSearchTerm, setBookingSearchTerm] = useState("");
  const [bookingFilterStatus, setBookingFilterStatus] = useState("all");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [newElectrician, setNewElectrician] = useState({
    fullName: "",
    phone: "",
    alternatePhone: "",
    email: "",
    specification: "",
    serviceAreas: "",
    age: "",
    gender: "",
  });

  // Stats for dashboard
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    recent: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0
  });

  // Fetch electricians data from Firebase
  useEffect(() => {
    const fetchElectricians = async () => {
      const querySnapshot = await getDocs(collection(db, "serviceAgents"));
      const electriciansData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setElectricians(electriciansData);
      
      // Calculate stats
      const verifiedCount = electriciansData.filter(e => e.status === "Verified").length;
      const pendingCount = electriciansData.filter(e => !e.status || e.status === "Pending").length;
      
      setStats(prev => ({
        ...prev,
        total: electriciansData.length,
        verified: verifiedCount,
        pending: pendingCount,
        recent: electriciansData.filter(e => {
          const addedDate = e.timestamp?.toDate() || new Date();
          return (new Date() - addedDate) < (7 * 24 * 60 * 60 * 1000); // Last 7 days
        }).length
      }));
    };

    fetchElectricians();
  }, [activeTab]);

  // Fetch bookings data from Firebase
  useEffect(() => {
    const fetchBookings = async () => {
      const querySnapshot = await getDocs(collection(db, "bookings"));
      const bookingsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setBookings(bookingsData);
      
      // Calculate booking stats
      const confirmedCount = bookingsData.filter(b => b.status === "confirmed").length;
      const completedCount = bookingsData.filter(b => b.status === "completed").length;
      
      setStats(prev => ({
        ...prev,
        totalBookings: bookingsData.length,
        confirmedBookings: confirmedCount,
        completedBookings: completedCount
      }));
    };

    if (activeTab === "bookings" || activeTab === "dashboard") {
      fetchBookings();
    }
  }, [activeTab]);

  // Filter electricians based on search and status
  const filteredElectricians = electricians.filter(electrician => {
    const matchesSearch = electrician.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         electrician.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         electrician.phone?.includes(searchTerm);
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "verified" && electrician.status === "Verified") ||
                         (filterStatus === "pending" && (!electrician.status || electrician.status === "Pending"));
    
    return matchesSearch && matchesStatus;
  });

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customerName?.toLowerCase().includes(bookingSearchTerm.toLowerCase()) || 
      booking.customerPhone?.includes(bookingSearchTerm) ||
      booking.electricianName?.toLowerCase().includes(bookingSearchTerm.toLowerCase());
    
    const matchesStatus = 
      bookingFilterStatus === "all" || 
      booking.status?.toLowerCase() === bookingFilterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Handle adding a new electrician
  const handleAddElectrician = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "serviceAgents"), {
        ...newElectrician,
        status: "Pending",
        timestamp: new Date()
      });
      
      // Update local state
      setElectricians([...electricians, { id: docRef.id, ...newElectrician, status: "Pending" }]);
      
      // Clear form
      setNewElectrician({
        fullName: "",
        phone: "",
        alternatePhone: "",
        email: "",
        specification: "",
        serviceAreas: "",
        age: "",
        gender: "",
      });

      // Show success notification
      showNotification("Electrician added successfully!", "success");
    } catch (error) {
      console.error("Error adding electrician: ", error);
      showNotification("Failed to add electrician.", "error");
    }
  };

  // Handle deleting an electrician
  const handleDeleteElectrician = async (id) => {
    if (window.confirm("Are you sure you want to delete this electrician?")) {
      try {
        await deleteDoc(doc(db, "serviceAgents", id));
        setElectricians(electricians.filter(e => e.id !== id));
        showNotification("Electrician deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting electrician: ", error);
        showNotification("Failed to delete electrician.", "error");
      }
    }
  };

  // Handle verifying an electrician
  const handleVerifyElectrician = async (id) => {
    try {
      await updateDoc(doc(db, "serviceAgents", id), { status: "Verified" });
      setElectricians(electricians.map(e => 
        e.id === id ? { ...e, status: "Verified" } : e
      ));
      showNotification("Electrician verified successfully!", "success");
    } catch (error) {
      console.error("Error verifying electrician: ", error);
      showNotification("Failed to verify electrician.", "error");
    }
  };

  // Handle updating booking status
  const updateBookingStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status });
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, status } : booking
      ));
      showNotification(`Booking status updated to ${status}`, "success");
    } catch (error) {
      console.error("Error updating booking status: ", error);
      showNotification("Failed to update booking status", "error");
    }
  };

  // Show notification
  const showNotification = (message, type) => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  return (
    <div className={`admin-page ${isSidebarCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>ElectroAdmin</h2>
          <button 
            className="collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? "»" : "«"}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            <RiDashboardFill />
            {!isSidebarCollapsed && "Dashboard"}
          </button>
          <button
            className={activeTab === "verify-electricians" ? "active" : ""}
            onClick={() => setActiveTab("verify-electricians")}
          >
            <FaTools />
            {!isSidebarCollapsed && "Verify Electricians"}
          </button>
          <button
            className={activeTab === "add-electrician" ? "active" : ""}
            onClick={() => setActiveTab("add-electrician")}
          >
            <FaUserPlus />
            {!isSidebarCollapsed && "Add Electrician"}
          </button>
          <button
            className={activeTab === "bookings" ? "active" : ""}
            onClick={() => setActiveTab("bookings")}
          >
            <FaCalendarAlt />
            {!isSidebarCollapsed && "Bookings"}
          </button>
          <button
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setActiveTab("settings")}
          >
            <BsFillGearFill />
            {!isSidebarCollapsed && "Settings"}
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">AD</div>
            {!isSidebarCollapsed && (
              <div className="user-info">
                <span className="name">Admin User</span>
                <span className="role">Super Admin</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="dashboard-tab">
            <h1><RiDashboardFill /> Dashboard Overview</h1>
            
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon"><FaUsers /></div>
                <div className="stat-info">
                  <h3>Total Electricians</h3>
                  <p>{stats.total}</p>
                </div>
              </div>
              
              <div className="stat-card verified">
                <div className="stat-icon"><FaCheckCircle /></div>
                <div className="stat-info">
                  <h3>Verified</h3>
                  <p>{stats.verified}</p>
                </div>
              </div>
              
              <div className="stat-card pending">
                <div className="stat-icon"><FaTimesCircle /></div>
                <div className="stat-info">
                  <h3>Pending</h3>
                  <p>{stats.pending}</p>
                </div>
              </div>
              
              <div className="stat-card recent">
                <div className="stat-icon"><FaChartLine /></div>
                <div className="stat-info">
                  <h3>New This Week</h3>
                  <p>{stats.recent}</p>
                </div>
              </div>

              <div className="stat-card bookings-total">
                <div className="stat-icon"><FaCalendarAlt /></div>
                <div className="stat-info">
                  <h3>Total Bookings</h3>
                  <p>{stats.totalBookings}</p>
                </div>
              </div>

              <div className="stat-card bookings-confirmed">
                <div className="stat-icon"><FaCheckCircle /></div>
                <div className="stat-info">
                  <h3>Confirmed Bookings</h3>
                  <p>{stats.confirmedBookings}</p>
                </div>
              </div>

              <div className="stat-card bookings-completed">
                <div className="stat-icon"><FaCheckCircle /></div>
                <div className="stat-info">
                  <h3>Completed Bookings</h3>
                  <p>{stats.completedBookings}</p>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="recent-activity">
              <h2>Recent Bookings</h2>
              <div className="activity-list">
                {bookings.slice(0, 5).map(booking => (
                  <div key={booking.id} className="activity-item">
                    <div className="avatar">{booking.customerName?.charAt(0) || "B"}</div>
                    <div className="activity-details">
                      <p>
                        <strong>{booking.customerName || "Customer"}</strong> 
                        {" booked " + (booking.electricianName || "an electrician") + " for " + booking.problemDescription}
                      </p>
                      <small>{new Date(booking.createdAt).toLocaleString()}</small>
                    </div>
                    <div className={`status-badge ${booking.status}`}>
                      {booking.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Verify Electrician Tab */}
        {activeTab === "verify-electricians" && (
          <div className="verify-electricians-tab">
            <div className="tab-header">
              <h1><FaTools /> Electrician Verification</h1>
              <div className="controls">
                <div className="search-box">
                  <FaSearch />
                  <input 
                    type="text" 
                    placeholder="Search electricians..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filter-dropdown">
                  <FaFilter />
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Service Areas</th>
                    <th>Documents</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredElectricians.length > 0 ? (
                    filteredElectricians.map((electrician) => (
                      <tr key={electrician.id}>
                        <td>
                          <div className="user-cell">
                            <div className="avatar">{electrician.fullName?.charAt(0) || "E"}</div>
                            <div>
                              <strong>{electrician.fullName}</strong>
                              <small>{electrician.specification}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="contact-cell">
                            <div>{electrician.phone}</div>
                            <small>{electrician.email}</small>
                          </div>
                        </td>
                        <td>{electrician.serviceAreas}</td>
                        <td>
                          <div className={`documents-cell ${electrician.governmentId && electrician.licenseNumber ? "complete" : "incomplete"}`}>
                            {electrician.governmentId && electrician.licenseNumber ? (
                              <>
                                <FaFilePdf /> Complete
                              </>
                            ) : (
                              <>
                                <FaTimesCircle /> Incomplete
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className={`status-cell ${electrician.status === "Verified" ? "verified" : "pending"}`}>
                            {electrician.status === "Verified" ? (
                              <>
                                <FaCheckCircle /> Verified
                              </>
                            ) : (
                              <>
                                <FaTimesCircle /> Pending
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="actions-cell">
                            {electrician.status !== "Verified" && (
                              <button 
                                className="verify-btn"
                                onClick={() => handleVerifyElectrician(electrician.id)}
                              >
                                Verify
                              </button>
                            )}
                            <button 
                              className="view-btn"
                              onClick={() => setSelectedElectrician(electrician)}
                            >
                              View
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteElectrician(electrician.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results">
                        No electricians found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="table-footer">
              <div className="pagination">
                <button disabled>Previous</button>
                <span>Page 1 of 1</span>
                <button disabled>Next</button>
              </div>
              <div className="total-count">
                Showing {filteredElectricians.length} of {electricians.length} electricians
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="bookings-tab">
            <div className="tab-header">
              <h1><FaCalendarAlt /> Booking Management</h1>
              <div className="controls">
                <div className="search-box">
                  <FaSearch />
                  <input 
                    type="text" 
                    placeholder="Search bookings..." 
                    value={bookingSearchTerm}
                    onChange={(e) => setBookingSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filter-dropdown">
                  <FaFilter />
                  <select 
                    value={bookingFilterStatus}
                    onChange={(e) => setBookingFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Electrician</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <div className="user-cell">
                            <div className="avatar">{booking.customerName?.charAt(0) || "C"}</div>
                            <div>
                              <strong>{booking.customerName}</strong>
                            </div>
                          </div>
                        </td>
                        <td>
                          {booking.electricianName ? (
                            <div className="user-cell">
                              <div className="avatar electrician">{booking.electricianName?.charAt(0) || "E"}</div>
                              <div>
                                <strong>{booking.electricianName}</strong>
                              </div>
                            </div>
                          ) : (
                            <span className="unassigned">Unassigned</span>
                          )}
                        </td>
                        <td>{booking.customerPhone}</td>
                        <td>
                          <div className={`status-cell ${booking.status}`}>
                            {booking.status}
                          </div>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button 
                              className="view-btn"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <FaEye /> View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-results">
                        No bookings found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="table-footer">
              <div className="pagination">
                <button disabled>Previous</button>
                <span>Page 1 of 1</span>
                <button disabled>Next</button>
              </div>
              <div className="total-count">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </div>
            </div>
          </div>
        )}

        {/* Add Electrician Tab */}
        {activeTab === "add-electrician" && (
          <div className="add-electrician-tab">
            <h1><FaUserPlus /> {newElectrician.id ? "Edit Electrician" : "Add New Electrician"}</h1>
            
            <form onSubmit={handleAddElectrician}>
              <div className="form-grid">
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={newElectrician.fullName}
                      onChange={(e) => setNewElectrician({ ...newElectrician, fullName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        value={newElectrician.phone}
                        onChange={(e) => setNewElectrician({ ...newElectrician, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Alternate Phone</label>
                      <input
                        type="tel"
                        value={newElectrician.alternatePhone}
                        onChange={(e) => setNewElectrician({ ...newElectrician, alternatePhone: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={newElectrician.email}
                      onChange={(e) => setNewElectrician({ ...newElectrician, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>Professional Details</h3>
                  <div className="form-group">
                    <label>Specialization *</label>
                    <input
                      type="text"
                      value={newElectrician.specification}
                      onChange={(e) => setNewElectrician({ ...newElectrician, specification: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Service Areas *</label>
                    <input
                      type="text"
                      value={newElectrician.serviceAreas}
                      onChange={(e) => setNewElectrician({ ...newElectrician, serviceAreas: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Age *</label>
                      <input
                        type="number"
                        min="18"
                        value={newElectrician.age}
                        onChange={(e) => setNewElectrician({ ...newElectrician, age: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender *</label>
                      <select
                        value={newElectrician.gender}
                        onChange={(e) => setNewElectrician({ ...newElectrician, gender: e.target.value })}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Profile Photo</label>
                    <div className="file-upload">
                      <input type="file" id="profile-photo" accept="image/*" />
                      <label htmlFor="profile-photo">Choose File</label>
                      <span>No file chosen</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {newElectrician.id ? "Update Electrician" : "Add Electrician"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="settings-tab">
            <h1><BsFillGearFill /> Admin Settings</h1>
            <div className="settings-grid">
              <div className="settings-card">
                <h3>Account Settings</h3>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Admin Name</label>
                    <input type="text" value="Admin User" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value="admin@electroservice.com" />
                  </div>
                  <button className="save-btn">Save Changes</button>
                </div>
              </div>
              
              <div className="settings-card">
                <h3>System Preferences</h3>
                <div className="preferences">
                  <div className="preference-item">
                    <label>Dark Mode</label>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="preference-item">
                    <label>Notifications</label>
                    <label className="switch">
                      <input type="checkbox" checked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document View Modal */}
        {selectedElectrician && (
          <div className="document-modal">
            <div className="modal-overlay" onClick={() => setSelectedElectrician(null)}></div>
            <div className="modal-content">
              <div className="modal-header">
                <h2>{selectedElectrician.fullName}'s Documents</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedElectrician(null)}
                >
                  &times;
                </button>
              </div>
              
              <div className="modal-body">
                <div className="electrician-info">
                  <div className="avatar">{selectedElectrician.fullName?.charAt(0) || "E"}</div>
                  <div>
                    <h3>{selectedElectrician.fullName}</h3>
                    <p>{selectedElectrician.specification}</p>
                    <p>{selectedElectrician.serviceAreas}</p>
                  </div>
                </div>
                
                <div className="documents-grid">
                  <div className="document-card">
                    <h4>Government ID</h4>
                    {selectedElectrician.governmentId ? (
                      <div className="document-preview">
                        <img 
                          src={selectedElectrician.governmentId} 
                          alt="Government ID" 
                        />
                        <a 
                          href={selectedElectrician.governmentId} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="view-full"
                        >
                          View Full Document
                        </a>
                      </div>
                    ) : (
                      <div className="document-missing">
                        <FaTimesCircle />
                        <p>Document not uploaded</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="document-card">
                    <h4>Professional License</h4>
                    {selectedElectrician.licenseNumber ? (
                      <div className="document-preview">
                        <img 
                          src={selectedElectrician.licenseNumber} 
                          alt="Professional License" 
                        />
                        <a 
                          href={selectedElectrician.licenseNumber} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="view-full"
                        >
                          View Full Document
                        </a>
                      </div>
                    ) : (
                      <div className="document-missing">
                        <FaTimesCircle />
                        <p>Document not uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="modal-actions">
                  {selectedElectrician.status !== "Verified" && (
                    <button 
                      className="verify-btn"
                      onClick={() => {
                        handleVerifyElectrician(selectedElectrician.id);
                        setSelectedElectrician(null);
                      }}
                    >
                      <FaCheckCircle /> Verify Electrician
                    </button>
                  )}
                  <button 
                    className="close-modal-btn"
                    onClick={() => setSelectedElectrician(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="booking-modal active">
            <div className="modal-overlay" onClick={() => setSelectedBooking(null)}></div>
            <div className="modal-content">
              <div className="modal-header">
                <h2>Booking Details</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedBooking(null)}
                >
                  &times;
                </button>
              </div>
              
              <div className="modal-body">
                <div className="booking-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <h4>Booking ID</h4>
                      <p>#{selectedBooking.id.substring(0, 8)}</p>
                    </div>
                    <div className="info-item">
                      <h4>Status</h4>
                      <p className={`status-badge ${selectedBooking.status}`}>
                        {selectedBooking.status}
                      </p>
                    </div>
                    <div className="info-item">
                      <h4>Booking Date</h4>
                      <p>{selectedBooking.bookingDate} at {selectedBooking.timeSlot}</p>
                    </div>
                    <div className="info-item">
                      <h4>Created At</h4>
                      <p>{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="section">
                    <h3>Customer Details</h3>
                    <div className="user-details">
                      <div className="avatar">{selectedBooking.customerName?.charAt(0) || "C"}</div>
                      <div>
                        <h4>{selectedBooking.customerName}</h4>
                        <p>{selectedBooking.customerPhone}</p>
                        <p>{selectedBooking.customerEmail || "No email provided"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="section">
                    <h3>Service Details</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <h4>Service Type</h4>
                        <p>{selectedBooking.problemDescription}</p>
                      </div>
                      <div className="info-item">
                        <h4>Address</h4>
                        <p>{selectedBooking.address}</p>
                        <small>Pincode: {selectedBooking.pincode}</small>
                      </div>
                    </div>
                  </div>

                  {selectedBooking.electricianName && (
                    <div className="section">
                      <h3>Electrician Details</h3>
                      <div className="user-details">
                        <div className="avatar electrician">{selectedBooking.electricianName?.charAt(0) || "E"}</div>
                        <div>
                          <h4>{selectedBooking.electricianName}</h4>
                          <p>{selectedBooking.electricianPhone}</p>
                          <small>ID: {selectedBooking.electricianId}</small>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="section">
                    <h3>Additional Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <h4>Preferred Time</h4>
                        <p>{selectedBooking.timeSlot}</p>
                      </div>
                      <div className="info-item">
                        <h4>Special Requirements</h4>
                        <p>{selectedBooking.specialRequirements || "None"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <div className="status-actions">
                    {selectedBooking.status !== "confirmed" && (
                      <button 
                        className="confirm-btn"
                        onClick={() => {
                          updateBookingStatus(selectedBooking.id, "confirmed");
                          setSelectedBooking(null);
                        }}
                      >
                        Confirm Booking
                      </button>
                    )}
                    {selectedBooking.status !== "completed" && (
                      <button 
                        className="complete-btn"
                        onClick={() => {
                          updateBookingStatus(selectedBooking.id, "completed");
                          setSelectedBooking(null);
                        }}
                      >
                        Mark as Completed
                      </button>
                    )}
                    {selectedBooking.status !== "cancelled" && (
                      <button 
                        className="cancel-btn"
                        onClick={() => {
                          updateBookingStatus(selectedBooking.id, "cancelled");
                          setSelectedBooking(null);
                        }}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                  <button 
                    className="close-modal-btn"
                    onClick={() => setSelectedBooking(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;