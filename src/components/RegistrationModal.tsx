// Registration modal component
// Appears on first visit to capture student information before tests begin
// Non-dismissable modal that ensures upfront registration

import React, { useState } from 'react';
import type { ContactFormData } from '../types';
import '../styles/RegistrationModal.css';

interface RegistrationModalProps {
  onSubmit: (data: ContactFormData) => void;
  isOpen: boolean;
  isSubmitting: boolean;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  onSubmit,
  isOpen,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    studentName: '',
    parentEmail: '',
    parentWhatsapp: '+91',
  });

  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCountryCode(value);
    setFormData(prev => ({ ...prev, parentWhatsapp: value + phoneNumber }));
    if (errors.parentWhatsapp) {
      setErrors(prev => ({ ...prev, parentWhatsapp: '' }));
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setFormData(prev => ({ ...prev, parentWhatsapp: countryCode + value }));
    if (errors.parentWhatsapp) {
      setErrors(prev => ({ ...prev, parentWhatsapp: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!formData.parentEmail.trim()) {
      newErrors.parentEmail = 'Parent email is required';
    }

    // Combine country code and phone number for validation
    const fullPhone = countryCode + phoneNumber;
    if (!phoneNumber.trim()) {
      newErrors.parentWhatsapp = 'WhatsApp number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Update formData with full phone number before submitting
    const submissionData = {
      ...formData,
      parentWhatsapp: fullPhone
    };

    await onSubmit(submissionData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay registration-modal-overlay">
      <div className="modal-content registration-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Welcome! Let's Get Started</h2>
          <p className="modal-subtitle">
            Please provide your details to begin your psychometric assessment journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="contact-form registration-form">
          <div className="form-group">
            <label htmlFor="studentName" className="form-label">
              Student Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              className={`form-input ${errors.studentName ? 'input-error' : ''}`}
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
            {errors.studentName && (
              <span className="error-message">{errors.studentName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="parentEmail" className="form-label">
              Parent's Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="parentEmail"
              name="parentEmail"
              value={formData.parentEmail}
              onChange={handleChange}
              className={`form-input ${errors.parentEmail ? 'input-error' : ''}`}
              placeholder="parent@example.com"
              disabled={isSubmitting}
            />
            {errors.parentEmail && (
              <span className="error-message">{errors.parentEmail}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="parentWhatsapp" className="form-label">
              Parent's WhatsApp Number <span className="required">*</span>
            </label>
            <div className="phone-input-container">
              <input
                type="text"
                id="countryCode"
                name="countryCode"
                value={countryCode}
                onChange={handleCountryCodeChange}
                className="form-input country-code-input"
                placeholder="+91"
                disabled={isSubmitting}
              />
              <input
                type="tel"
                id="parentWhatsapp"
                name="phoneNumber"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className={`form-input phone-number-input ${errors.parentWhatsapp ? 'input-error' : ''}`}
                placeholder="Enter phone number"
                disabled={isSubmitting}
              />
            </div>
            {errors.parentWhatsapp && (
              <span className="error-message">{errors.parentWhatsapp}</span>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Starting...' : 'Start Tests'}
          </button>

          <p className="privacy-note">
            Your information is secure and will only be used to provide your personalized psychometric analysis reports.
          </p>
        </form>
      </div>
    </div>
  );
};
