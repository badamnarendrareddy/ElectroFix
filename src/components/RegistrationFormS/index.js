import React, { useState, useEffect, useCallback } from "react";
import { 
  db, 
  storage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  collection, 
  addDoc, 
  doc, 
  onSnapshot, 
  getDoc,
  setDoc,
  getDocs,
  auth,
  query,
  where
} from "../../firebase";
import './index.css';
import {
  FaUser,
  FaIdCard,
  FaUpload,
  FaCheckCircle,
  FaTools,
  FaSmile,
  FaMapMarkerAlt,
  FaSpinner,
  FaCheck,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaCertificate,
  FaBriefcase,
  FaMapMarkedAlt,
  FaCar,
  FaMoneyBillWave,
  FaShieldAlt,
  FaLightbulb,
  FaCalendarAlt,
  FaHandshake
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";

const ServiceAgentRegistration = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    licenseNumber: null,
    certifications: "",
    experience: "",
    serviceAreas: "",
    tools: "",
    vehicle: "",
    governmentId: null,
    bankDetails: "",
    pincode: "",
    street: "",
    city: "",
    state: "",
  });

  const [showNotification, setShowNotification] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplication, setHasApplication] = useState(false);
  const [loadingApplicationCheck, setLoadingApplicationCheck] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewImages, setPreviewImages] = useState({
    governmentId: null,
    licenseNumber: null
  });

  const statusConfig = {
    pending: {
      icon: <FaClock className="status-icon pending" />,
      title: "Application Under Review",
      message: "Our team is reviewing your application. We'll notify you once it's approved.",
      color: "#FFA500",
      gif: "https://media.giphy.com/media/3o7aTskHEUdgCQAXde/giphy.gif",
      tips: [
        "Check your email regularly for updates",
        "Ensure your contact information is up-to-date",
        "Prepare any additional documents that might be requested"
      ]
    },
    Verified: {
      icon: <FaCheck className="status-icon approved" />,
      title: "Application Approved!",
      message: "Congratulations! Your application has been approved. Welcome to our team!",
      color: "#4CAF50",
      gif: "https://media.giphy.com/media/xUOxfjsW9fWPqEWouI/giphy.gif",
      nextSteps: [
        "Check your email for onboarding instructions",
        "Download our service provider app",
        "Complete your profile setup"
      ]
    },
    rejected: {
      icon: <FaTools className="status-icon rejected" />,
      title: "Application Needs Revision",
      message: "We need some additional information. Please check your email for details.",
      color: "#F44336",
      gif: "https://media.giphy.com/media/l3V0j3ytFyGHqiV7W/giphy.gif",
      actions: [
        "Review the feedback provided",
        "Update your documents if needed",
        "Resubmit your application"
      ]
    }
  };

  // Check if user has an existing application
  const checkExistingApplication = useCallback(async (userId) => {
    if (!userId) return false;

    try {
      const q = query(
        collection(db, "serviceAgents"),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setApplicationStatus(doc.data().status);
        setApplicationId(doc.id);
        setFormData(prev => ({
          ...prev,
          fullName: doc.data().fullName || "",
          email: doc.data().email || "",
          phone: doc.data().phone || "",
          address: doc.data().address || ""
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking existing application:", error);
      return false;
    }
  }, []);

  const trackUserAction = useCallback(async (actionType, metadata = {}) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      const actionData = {
        type: actionType,
        timestamp: new Date().toISOString(),
        ...metadata
      };

      if (userDoc.exists()) {
        await setDoc(userRef, {
          actions: [...(userDoc.data().actions || []), actionData],
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        await setDoc(userRef, {
          actions: [actionData],
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error tracking user action: ", error);
    }
  }, [currentUser]);

  const checkApplicationStatus = useCallback((docId) => {
    const docRef = doc(db, "serviceAgents", docId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setApplicationStatus(doc.data().status);
        setApplicationId(doc.id);
        setHasApplication(true);
        if (currentUser) {
          trackUserAction("application_status_change", {
            status: doc.data().status,
            applicationId: doc.id
          });
        }
      }
    });
    return unsubscribe;
  }, [currentUser, trackUserAction]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoadingApplicationCheck(true);
      if (user) {
        setCurrentUser(user);
        setFormData(prev => ({ ...prev, email: user.email }));
        
        // Check for existing application when user changes
        const hasApp = await checkExistingApplication(user.uid);
        setHasApplication(hasApp);
        
        if (hasApp) {
          // If user has application, listen for status changes
          const q = query(
            collection(db, "serviceAgents"),
            where("userId", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            checkApplicationStatus(docId);
          }
        }
      } else {
        setCurrentUser(null);
        setApplicationStatus(null);
        setApplicationId(null);
        setHasApplication(false);
      }
      setLoadingApplicationCheck(false);
    });

    return () => unsubscribe();
  }, [checkExistingApplication, checkApplicationStatus]);

  const fetchAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const address = data.results[0].formatted_address;
        const pincode = addressComponents.find((component) =>
          component.types.includes("postal_code")
        )?.long_name;
        const city = addressComponents.find((component) =>
          component.types.includes("locality")
        )?.long_name;
        const state = addressComponents.find((component) =>
          component.types.includes("administrative_area_level_1")
        )?.long_name;

        setFormData((prevData) => ({
          ...prevData,
          address,
          pincode: pincode || "",
          city: city || "",
          state: state || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching address: ", error);
      setErrors({...errors, location: "Failed to fetch location. Please enter manually."});
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleGetLocation = () => {
    setLoadingLocation(true);
    trackUserAction("location_access_requested");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          trackUserAction("location_access_granted", { latitude, longitude });
          fetchAddressFromCoordinates(latitude, longitude);
        },
        (error) => {
          console.error("Error fetching location: ", error);
          trackUserAction("location_access_denied", { error: error.message });
          setErrors({...errors, location: "Location access denied. Please enter manually."});
          setLoadingLocation(false);
        }
      );
    } else {
      trackUserAction("location_access_unsupported");
      setErrors({...errors, location: "Geolocation is not supported by this browser."});
      setLoadingLocation(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.governmentId) newErrors.governmentId = "Government ID is required";
    if (!formData.licenseNumber) newErrors.licenseNumber = "License is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({...errors, [name]: null});
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) {
      setErrors({...errors, [name]: "Please select a file"});
      return;
    }
    
    const file = files[0];
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrors({...errors, [name]: "Please upload a JPG, PNG, or PDF file"});
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({...errors, [name]: "File size must be less than 5MB"});
      return;
    }

    // Create preview for images
    if (file.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => ({
          ...prev,
          [name]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImages(prev => ({
        ...prev,
        [name]: null
      }));
    }
  
    setFormData({ ...formData, [name]: file });
    if (errors[name]) {
      setErrors({...errors, [name]: null});
    }
  };

  const uploadFileToStorage = async (file, fileName) => {
    try {
      if (!file || !fileName) {
        throw new Error("No file selected");
      }
      
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `documents/${Date.now()}_${sanitizedFileName}`);
      const metadata = {
        contentType: file.type,
      };
      await uploadBytes(storageRef, file, metadata);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;
  
    setIsSubmitting(true);
    setErrors({...errors, submit: ""});
  
    try {
      trackUserAction("application_submission_started");
      
      // Validate files before uploading
      if (!formData.governmentId || !formData.licenseNumber) {
        throw new Error("Please upload all required documents");
      }
  
      // Upload files in parallel
      const [governmentIdURL, licenseURL] = await Promise.all([
        uploadFileToStorage(formData.governmentId, formData.governmentId?.name),
        uploadFileToStorage(formData.licenseNumber, formData.licenseNumber?.name)
      ]);
  
      // Save application data
      const docRef = await addDoc(collection(db, "serviceAgents"), {
        ...formData,
        licenseNumber: licenseURL,
        governmentId: governmentIdURL,
        status: "pending",
        submittedAt: new Date().toISOString(),
        userId: currentUser ? currentUser.uid : null,
        userEmail: formData.email
      });
  
      checkApplicationStatus(docRef.id);
      trackUserAction("application_submitted", {
        applicationId: docRef.id,
        submissionTime: new Date().toISOString()
      });
      setShowNotification(true);
      setHasApplication(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      trackUserAction("application_submission_failed", { error: error.message });
      setErrors({...errors, submit: `Error submitting registration: ${error.message}`});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    trackUserAction("notification_dismissed");
  };

  const handleNewApplication = () => {
    setHasApplication(false);
    setApplicationStatus(null);
    setApplicationId(null);
    setFormData({
      fullName: "",
      email: currentUser?.email || "",
      phone: "",
      address: "",
      licenseNumber: null,
      certifications: "",
      experience: "",
      serviceAreas: "",
      tools: "",
      vehicle: "",
      governmentId: null,
      bankDetails: "",
      pincode: "",
      street: "",
      city: "",
      state: "",
    });
    setPreviewImages({
      governmentId: null,
      licenseNumber: null
    });
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loadingApplicationCheck) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <FaSpinner className="spin" />
        </div>
        <p>Checking your application status...</p>
      </div>
    );
  }

  if (hasApplication && applicationStatus) {
    const status = statusConfig[applicationStatus] || statusConfig.pending;
    
    return (
      <div className="status-container">
        <motion.div 
          className="status-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="status-animation">
            <img
              src={status.gif}
              alt="Application status"
              className="status-image"
            />
          </div>
          <div className="status-header">
            {status.icon}
            <h2 style={{ color: status.color }}>{status.title}</h2>
          </div>
          <p className="status-message">{status.message}</p>
          
          <div className="status-details-card">
            <div className="detail-item">
              <span className="detail-label">Application ID:</span>
              <span className="detail-value">{applicationId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{formData.fullName || "Not provided"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Submitted On:</span>
              <span className="detail-value">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {(status.tips || status.nextSteps || status.actions) && (
            <div className="status-advice">
              <h4>
                <FaLightbulb /> {applicationStatus === 'approved' ? 'Next Steps' : 
                                applicationStatus === 'rejected' ? 'Recommended Actions' : 'Tips While You Wait'}
              </h4>
              <ul>
                {(status.tips || status.nextSteps || status.actions).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="status-actions">
            <button 
              className="contact-button" 
              onClick={() => trackUserAction("support_contact_clicked")}
            >
              <FaEnvelope /> Contact Support
            </button>
            {applicationStatus === 'rejected' && (
              <button 
                className="new-application-button" 
                onClick={handleNewApplication}
              >
                <FaTools /> Submit Revised Application
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="registration-container">
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            className="notification-popup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="notification-content">
              <button 
                className="close-notification"
                onClick={handleCloseNotification}
              >
                <IoMdClose />
              </button>
              <div className="notification-animation">
                <img
                  src="https://media.giphy.com/media/3o7aTskHEUdgCQAXde/giphy.gif"
                  alt="Application in process"
                />
              </div>
              <div className="notification-text">
                <h3>Application Submitted! <FaSmile /></h3>
                <p>We've received your application and will review it shortly.</p>
                <p>You'll receive an email confirmation and can check back here for updates.</p>
              </div>
              <button 
                className="notification-button"
                onClick={handleCloseNotification}
              >
                Got It!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="registration-hero">
        <div className="hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Join Our <span>Professional Network</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Become a trusted service provider and grow your business with us
          </motion.p>
          
          <div className="benefits-grid">
            <motion.div 
              className="benefit-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="benefit-icon">
                <FaMoneyBillWave />
              </div>
              <h4>Competitive Earnings</h4>
              <p>Keep more of what you earn with our favorable commission structure</p>
            </motion.div>
            
            <motion.div 
              className="benefit-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="benefit-icon">
                <FaCalendarAlt />
              </div>
              <h4>Flexible Schedule</h4>
              <p>Work when you want and manage your own availability</p>
            </motion.div>
            
            <motion.div 
              className="benefit-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="benefit-icon">
                <FaHandshake />
              </div>
              <h4>Verified Customers</h4>
              <p>Get connected with pre-screened customers in your area</p>
            </motion.div>
            
            <motion.div 
              className="benefit-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="benefit-icon">
                <FaShieldAlt />
              </div>
              <h4>Insurance Coverage</h4>
              <p>Protection for you and your work with our liability coverage</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="registration-form-container">
        <motion.div 
          className="registration-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="form-header">
            <h2>
              <FaIdCard /> Service Provider Application
              <span className="step-indicator">Step {currentStep} of 4</span>
            </h2>
            {currentUser && (
              <p className="user-welcome">
                Welcome back, <strong>{currentUser.displayName || currentUser.email.split('@')[0]}</strong>! 
                We've pre-filled your details where possible.
              </p>
            )}
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>

          <form onSubmit={handleSubmit} className="animated-form">
            {currentStep === 1 && (
              <motion.div
                className="form-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3><FaUser /> Personal Information</h3>
                
                <div className="form-row">
                  <div className={`form-group ${errors.fullName ? 'has-error' : ''}`}>
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <span className="error">{errors.fullName}</span>}
                  </div>
                  
                  <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      disabled={currentUser}
                    />
                    {errors.email && <span className="error">{errors.email}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
                    <label><FaPhone /> Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                    />
                    {errors.phone && <span className="error">{errors.phone}</span>}
                  </div>
                </div>
                
                <div className="location-section">
                  <button 
                    type="button" 
                    className="location-button"
                    onClick={handleGetLocation}
                    disabled={loadingLocation}
                  >
                    {loadingLocation ? (
                      <>
                        <FaSpinner className="spin" /> Detecting Location...
                      </>
                    ) : (
                      <>
                        <FaMapMarkerAlt /> Use Current Location
                      </>
                    )}
                  </button>
                  <span className="or-text">or</span>
                  <span className="manual-text">Enter manually below</span>
                  {errors.location && <span className="error">{errors.location}</span>}
                </div>
                
                <div className={`form-group ${errors.address ? 'has-error' : ''}`}>
                  <label><FaHome /> Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                  />
                  {errors.address && <span className="error">{errors.address}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="123456"
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="New York"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="New York"
                    />
                  </div>
                  <div className="form-group">
                    <label>Street</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="Main Street"
                    />
                  </div>
                </div>
                
                <div className="form-navigation">
                  <button 
                    type="button" 
                    className="next-button"
                    onClick={nextStep}
                  >
                    Next: Professional Details <FaBriefcase />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                className="form-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3><FaBriefcase /> Professional Information</h3>
                
                <div className="form-row">
                  <div className={`form-group ${errors.licenseNumber ? 'has-error' : ''}`}>
                    <label><FaCertificate /> License Number *</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      onChange={handleChange}
                      placeholder="LIC-123456"
                    />
                    {errors.licenseNumber && <span className="error">{errors.licenseNumber}</span>}
                  </div>
                  <div className="form-group">
                    <label><FaCertificate /> Certifications</label>
                    <input
                      type="text"
                      name="certifications"
                      value={formData.certifications}
                      onChange={handleChange}
                      placeholder="Certified Electrician, etc."
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label><FaBriefcase /> Years of Experience *</label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="5"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label><FaMapMarkedAlt /> Service Areas *</label>
                    <input
                      type="text"
                      name="serviceAreas"
                      value={formData.serviceAreas}
                      onChange={handleChange}
                      placeholder="Areas you serve (comma separated)"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label><FaTools /> Tools You Own</label>
                    <input
                      type="text"
                      name="tools"
                      value={formData.tools}
                      onChange={handleChange}
                      placeholder="List your tools"
                    />
                  </div>
                  <div className="form-group">
                    <label><FaCar /> Vehicle</label>
                    <input
                      type="text"
                      name="vehicle"
                      value={formData.vehicle}
                      onChange={handleChange}
                      placeholder="Vehicle details if applicable"
                    />
                  </div>
                </div>
                
                <div className="form-navigation">
                  <button 
                    type="button" 
                    className="back-button"
                    onClick={prevStep}
                  >
                    <FaUser /> Back to Personal Info
                  </button>
                  <button 
                    type="button" 
                    className="next-button"
                    onClick={nextStep}
                  >
                    Next: Document Upload <FaUpload />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                className="form-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3><FaUpload /> Document Verification</h3>
                <p className="section-description">
                  Upload clear photos or scans of your documents. These will be used to verify your identity and qualifications.
                </p>
                
                <div className="document-upload-section">
                  <div className={`form-group file-upload ${errors.governmentId ? 'has-error' : ''}`}>
                    <label>Government ID *</label>
                    <p className="field-description">(Passport, Driver's License, etc.)</p>
                    <label className="upload-box">
                      <input
                        type="file"
                        name="governmentId"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className="file-input"
                      />
                      <div className="upload-content">
                        {previewImages.governmentId ? (
                          <>
                            <div className="document-preview">
                              <img src={previewImages.governmentId} alt="Government ID preview" />
                            </div>
                            <p className="file-name">{formData.governmentId?.name}</p>
                          </>
                        ) : (
                          <>
                            <div className="upload-icon">
                              <FaUpload />
                            </div>
                            <p className="upload-text">Click to upload</p>
                            <p className="file-requirements">JPG, PNG or PDF (max 5MB)</p>
                          </>
                        )}
                      </div>
                    </label>
                    {errors.governmentId && <span className="error">{errors.governmentId}</span>}
                  </div>
                  
                  <div className={`form-group file-upload ${errors.licenseNumber ? 'has-error' : ''}`}>
                    <label>Professional License *</label>
                    <p className="field-description">(Trade license, certification, etc.)</p>
                    <label className="upload-box">
                      <input
                        type="file"
                        name="licenseNumber"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className="file-input"
                      />
                      <div className="upload-content">
                        {previewImages.licenseNumber ? (
                          <>
                            <div className="document-preview">
                              <img src={previewImages.licenseNumber} alt="License preview" />
                            </div>
                            <p className="file-name">{formData.licenseNumber?.name}</p>
                          </>
                        ) : (
                          <>
                            <div className="upload-icon">
                              <FaUpload />
                            </div>
                            <p className="upload-text">Click to upload</p>
                            <p className="file-requirements">JPG, PNG or PDF (max 5MB)</p>
                          </>
                        )}
                      </div>
                    </label>
                    {errors.licenseNumber && <span className="error">{errors.licenseNumber}</span>}
                  </div>
                </div>
                
                <div className="form-navigation">
                  <button 
                    type="button" 
                    className="back-button"
                    onClick={prevStep}
                  >
                    <FaBriefcase /> Back to Professional Info
                  </button>
                  <button 
                    type="button" 
                    className="next-button"
                    onClick={nextStep}
                  >
                    Next: Payment Details <FaMoneyBillWave />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                className="form-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3><FaMoneyBillWave /> Payment Information</h3>
                <p className="section-description">
                  Provide your payment details to receive earnings from completed jobs.
                </p>
                
                <div className="form-group">
                  <label>Bank Account Details *</label>
                  <input
                    type="text"
                    name="bankDetails"
                    value={formData.bankDetails}
                    onChange={handleChange}
                    placeholder="Account number, bank name, etc."
                    required
                  />
                  <p className="field-hint">We use this information to transfer your earnings securely</p>
                </div>
                
                <div className="privacy-agreement">
                  <input type="checkbox" id="agree-terms" required />
                  <label htmlFor="agree-terms">
                    I agree to the Terms of Service and Privacy Policy, 
                    and confirm that all information provided is accurate.
                  </label>
                </div>
                
                {errors.submit && (
                  <div className="form-error">
                    <FaTools /> {errors.submit}
                  </div>
                )}
                
                <div className="form-navigation">
                  <button 
                    type="button" 
                    className="back-button"
                    onClick={prevStep}
                  >
                    <FaUpload /> Back to Documents
                  </button>
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle /> Submit Application
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ServiceAgentRegistration;