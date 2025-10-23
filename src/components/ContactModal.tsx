// Contact information modal component
// Appears after all tests are completed to capture lead information

import React, { useState } from 'react';
import type { ContactFormData } from '../types';
import '../styles/ContactModal.css';

interface ContactModalProps {
  onSubmit: (data: ContactFormData) => void;
  isOpen: boolean;
  isDismissable?: boolean;
  isCareerReport?: boolean;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  onSubmit,
  isOpen,
  isDismissable = true,
  isCareerReport = false
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    studentName: '',
    parentEmail: '',
    parentWhatsapp: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateWhatsApp = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
    } else if (!validateEmail(formData.parentEmail)) {
      newErrors.parentEmail = 'Please enter a valid email address';
    }

    if (!formData.parentWhatsapp.trim()) {
      newErrors.parentWhatsapp = 'WhatsApp number is required';
    } else if (!validateWhatsApp(formData.parentWhatsapp)) {
      newErrors.parentWhatsapp = 'Please enter a valid phone number (10-15 digits)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (isDismissable) {
      // Allow closing if dismissable (not implemented yet, but hook for future)
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isCareerReport ? 'Unlock Your Career Report!' : 'Congratulations!'}
          </h2>
          <p className="modal-subtitle">
            {isCareerReport
              ? 'You\'ve completed all tests and unlocked your comprehensive career analysis! Enter your details below to receive your personalized career guidance report.'
              : 'You\'ve completed all four psychometric assessments. To receive your comprehensive analysis reports, please provide your contact information below.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="contact-form">
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
            <input
              type="tel"
              id="parentWhatsapp"
              name="parentWhatsapp"
              value={formData.parentWhatsapp}
              onChange={handleChange}
              className={`form-input ${errors.parentWhatsapp ? 'input-error' : ''}`}
              placeholder="10-15 digit phone number"
              disabled={isSubmitting}
            />
            {errors.parentWhatsapp && (
              <span className="error-message">{errors.parentWhatsapp}</span>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Get My Reports'}
          </button>

          <p className="privacy-note">
            Your reports will be sent to the provided email and WhatsApp number. We respect your privacy and will only use this information for delivering your psychometric analysis.
          </p>
        </form>
      </div>
    </div>
  );
};
