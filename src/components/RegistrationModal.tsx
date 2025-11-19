// Registration modal component - Redesigned with modern UX principles
// Appears on first visit to capture student information before tests begin
// Non-dismissable modal with visual hierarchy and exciting design

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
      newErrors.studentName = 'Please enter your name';
    }

    if (!formData.parentEmail.trim()) {
      newErrors.parentEmail = 'Please enter parent email';
    }

    const fullPhone = countryCode + phoneNumber;
    if (!phoneNumber.trim()) {
      newErrors.parentWhatsapp = 'Please enter WhatsApp number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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

        {/* Hero Header with Icon */}
        <div className="registration-header">
          <div className="registration-icon-wrapper">
            <svg className="registration-icon" width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="registration-title">Begin Your Journey</h1>
          <p className="registration-subtitle">
            Discover your unique personality, strengths, and ideal career paths through 4 comprehensive assessments
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="registration-form">

          {/* Student Name */}
          <div className="form-group">
            <label htmlFor="studentName" className="form-label">
              Your Name
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
              autoFocus
            />
            {errors.studentName && (
              <span className="error-message">{errors.studentName}</span>
            )}
          </div>

          {/* Parent Email */}
          <div className="form-group">
            <label htmlFor="parentEmail" className="form-label">
              Parent's Email
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

          {/* WhatsApp Number */}
          <div className="form-group">
            <label htmlFor="parentWhatsapp" className="form-label">
              WhatsApp Number
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

          {/* CTA Button */}
          <button
            type="submit"
            className="registration-cta-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="button-spinner"></span>
                <span>Starting Your Journey...</span>
              </>
            ) : (
              <>
                <span>Start My Assessment</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>

          {/* Privacy Note */}
          <div className="registration-privacy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12L14.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Your data is encrypted and secure. Takes only 2 minutes to complete.</span>
          </div>
        </form>
      </div>
    </div>
  );
};
