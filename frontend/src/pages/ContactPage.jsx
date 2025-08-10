import React, { useState } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import toast from 'react-hot-toast';
import { submitContactForm } from '../utils/api';
import './AdminCommon.css';

export default function ContactPage({ t }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t('errorNameRequired');
    if (!formData.email.trim()) newErrors.email = t('errorEmailRequired');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('errorEmailInvalid');
    if (!formData.message.trim()) newErrors.message = t('errorMessageRequired', { default: 'Message is required' });
    if (!recaptchaToken) newErrors.recaptcha = t('errorRecaptchaRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    if (token) setErrors(prev => ({ ...prev, recaptcha: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const submissionData = { ...formData, recaptchaToken };
      const response = await submitContactForm(submissionData);
      toast.success(t('contactSuccess', { default: 'Message sent successfully!' }));
      setFormData({ name: '', email: '', message: '' });
      setRecaptchaToken(null); 
    } catch (error) {
      toast.error(error.message || t('contactError', { default: 'Failed to send message.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container">
      <h1 className="title is-2 has-text-centered">{t('contactPageTitle', { default: 'Contact Us' })}</h1>
      <p className="subtitle is-5 has-text-centered">{t('contactPageSubtitle', { default: 'We would love to hear from you. Send us a message!' })}</p>
      
      <div className="admin-form-container" style={{ maxWidth: '700px' }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label" htmlFor="name">{t('formName')}</label>
            <div className="control">
              <input className={`input ${errors.name ? 'is-danger' : ''}`} type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>
            {errors.name && <p className="help is-danger">{errors.name}</p>}
          </div>

          <div className="field">
            <label className="label" htmlFor="email">{t('formEmail')}</label>
            <div className="control">
              <input className={`input ${errors.email ? 'is-danger' : ''}`} type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            {errors.email && <p className="help is-danger">{errors.email}</p>}
          </div>

          <div className="field">
            <label className="label" htmlFor="message">{t('formMessage')}</label>
            <div className="control">
              <textarea className={`textarea ${errors.message ? 'is-danger' : ''}`} id="message" name="message" rows="6" value={formData.message} onChange={handleChange}></textarea>
            </div>
            {errors.message && <p className="help is-danger">{errors.message}</p>}
          </div>

          <div className="field is-grouped is-centered mt-5">
            <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={handleRecaptchaChange} />
          </div>
          {errors.recaptcha && <p className="help is-danger has-text-centered">{errors.recaptcha}</p>}

          <div className="field mt-5">
            <div className="control">
              <button type="submit" className={`button is-primary is-fullwidth is-large ${isSubmitting ? 'is-loading' : ''}`} disabled={isSubmitting}>
                {t('contactSubmitButton', { default: 'Send Message' })}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}