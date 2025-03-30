import React from 'react';
import {
  FaUser,
  FaIdCard,
  FaPhone,
  FaHome,
  FaCertificate,
  FaBriefcase,
  FaMapMarkedAlt,
  FaCar,
  FaMoneyBillWave,
  FaFilePdf,
  FaFileImage,
  FaDownload,
  FaTimes
} from "react-icons/fa";
import { motion } from "framer-motion";
import './index.css'

const ElectricianDetailsModal = ({ electrician, onClose }) => {
  // Determine document types for icons
  const getDocIcon = (url) => {
    return url?.includes('.pdf') ? <FaFilePdf /> : <FaFileImage />;
  };

  return (
    <motion.div 
      className="electrician-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="electrician-modal-content"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <button className="close-modal" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="electrician-header">
          <div className="avatar">{electrician.fullName?.charAt(0) || 'E'}</div>
          <h2>{electrician.fullName || 'Electrician Details'}</h2>
          <div className={`status-badge ${electrician.status}`}>
            {electrician.status || 'Unknown'}
          </div>
        </div>
        
        <div className="details-grid">
          {/* Personal Information Card */}
          <div className="detail-card personal-info">
            <h3><FaUser /> Personal Information</h3>
            <div className="detail-item">
              <span>Email:</span>
              <span>{electrician.email || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span><FaPhone /> Phone:</span>
              <span>{electrician.phone || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span><FaHome /> Address:</span>
              <span>{electrician.address || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span>Location:</span>
              <span>
                {[electrician.street, electrician.city, electrician.state, electrician.pincode]
                  .filter(Boolean).join(', ') || 'Not provided'}
              </span>
            </div>
          </div>
          
          {/* Professional Information Card */}
          <div className="detail-card professional-info">
            <h3><FaBriefcase /> Professional Information</h3>
            <div className="detail-item">
              <span>License Number:</span>
              <span>{electrician.licenseNumber || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span><FaCertificate /> Certifications:</span>
              <span>{electrician.certifications || 'None'}</span>
            </div>
            <div className="detail-item">
              <span>Experience:</span>
              <span>{electrician.experience || 'Not specified'}</span>
            </div>
            <div className="detail-item">
              <span><FaMapMarkedAlt /> Service Areas:</span>
              <span>{electrician.serviceAreas || 'Not specified'}</span>
            </div>
            <div className="detail-item">
              <span>Tools:</span>
              <span>{electrician.tools || 'Not specified'}</span>
            </div>
            <div className="detail-item">
              <span><FaCar /> Vehicle:</span>
              <span>{electrician.vehicle || 'Not specified'}</span>
            </div>
          </div>
          
          {/* Documents Card */}
          <div className="detail-card documents">
            <h3><FaIdCard /> Documents</h3>
            <div className="document-item">
              <span>Government ID:</span>
              {electrician.governmentId ? (
                <a 
                  href={electrician.governmentId} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="document-link"
                >
                  {getDocIcon(electrician.governmentId)} View Document <FaDownload />
                </a>
              ) : (
                <span>Not uploaded</span>
              )}
            </div>
            <div className="document-item">
              <span>Professional License:</span>
              {electrician.licenseNumber ? (
                <a 
                  href={electrician.licenseNumber} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="document-link"
                >
                  {getDocIcon(electrician.licenseNumber)} View Document <FaDownload />
                </a>
              ) : (
                <span>Not uploaded</span>
              )}
            </div>
          </div>
          
          {/* Payment Information Card */}
          <div className="detail-card payment-info">
            <h3><FaMoneyBillWave /> Payment Information</h3>
            <div className="detail-item">
              <span>Bank Details:</span>
              <span>{electrician.bankDetails || 'Not provided'}</span>
            </div>
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="verify-button" onClick={() => {/* Handle verify */}}>
            Verify Electrician
          </button>
          <button className="reject-button" onClick={() => {/* Handle reject */}}>
            Request More Info
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ElectricianDetailsModal;