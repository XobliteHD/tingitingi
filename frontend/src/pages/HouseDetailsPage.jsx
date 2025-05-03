import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaHome, FaCalendarAlt } from "react-icons/fa";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays } from 'date-fns';
import './datepicker-custom.css';
import toast from 'react-hot-toast';
import styles from './HouseDetailsPage.module.css';
import ReCAPTCHA from "react-google-recaptcha";
import {
    fetchPublicHouseDetails,
    fetchPublicHouses,
    fetchPublicHouseBookedDates,
    submitBooking
} from '../utils/api';

const CustomDateInput = React.forwardRef(
  ({ value, onClick, placeholder, id , className }, ref) => (
      <button
          className={className || `input ${!value ? styles.placeholderVisible : ''}`}
          type="button"
          onClick={onClick}
          ref={ref}
          id={id}
          style={{ textAlign: 'left', justifyContent: 'flex-start', width: '100%' }}
      >
          {value ? value : <span style={{ opacity: 0.6 }}>{placeholder}</span>}
      </button>
  )
);
CustomDateInput.displayName = 'CustomDateInput';

export default function HouseDetailsPage({ t, language }) {
  const [formErrors, setFormErrors] = useState({});
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookedDatesInfo, setBookedDatesInfo] = useState([]);
  const { houseId } = useParams();
  const navigate = useNavigate();
  const [houseDetails, setHouseDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [allHouses, setAllHouses] = useState([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const validateForm = () => {
    const errors = {};
    if (!recaptchaToken) errors.recaptcha = t('errorRecaptchaRequired');
    if (!name.trim()) errors.name = t('errorNameRequired');
    if (!email.trim()) errors.email = t('errorEmailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = t('errorEmailInvalid');
    if (!phone.trim()) errors.phone = t('errorPhoneRequired');
    else if (!/^[0-9+\-()\s]+$/.test(phone)) errors.phone = t('errorPhoneFormat');
    if (!startDate) errors.startDate = t('errorStartDateRequired');
    if (!endDate) errors.endDate = t('errorEndDateRequired');
    if (adults < 1) errors.adults = t('errorAdultsMin');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    if (token) {
       setFormErrors(prevErrors => {
           const newErrors = { ...prevErrors };
           delete newErrors.recaptcha;
           return newErrors;
       });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormErrors({});
    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    const bookingData = {
      houseId, name, email, phone, adults, children, message, recaptchaToken,
      checkIn: startDate ? startDate.toISOString() : null,
      checkOut: endDate ? endDate.toISOString() : null,
    };

    try {
       const responseData = await submitBooking(bookingData);
       toast.success(responseData.message || t('bookingSuccess', { default: 'Booking request received successfully!' }));
       setStartDate(null); setEndDate(null); setAdults(1); setChildren(0);
       setName(''); setEmail(''); setPhone(''); setMessage('');
       setRecaptchaToken(null); setFormErrors({});
     } catch (networkError) {
       toast.error(networkError.message || t('bookingError', { default: 'Failed to send booking request.' }));
     } finally {
       setIsSubmitting(false);
     }
  };

  const loadBookedDates = useCallback(async () => {
      if (!houseId) return;
      try {
          const data = await fetchPublicHouseBookedDates(houseId);
          const formattedData = data.map(interval => ({
              start: new Date(interval.start),
              end: new Date(interval.end),
              status: interval.status
          }));
          setBookedDatesInfo(formattedData);
      } catch (err) {
          console.error("Error fetching booked dates:", err);
          toast.error(t('fetchBookedDatesError', {default: 'Could not load availability.'}))
      }
  }, [houseId, t]);

  useEffect(() => {
      loadBookedDates();
  }, [loadBookedDates]);

  const confirmedIntervals = bookedDatesInfo
      .filter(interval => interval.status === 'Confirmed')
      .map(({ start, end }) => ({ start, end }));

  const allBookedDates = bookedDatesInfo;

  const getDayClassName = (date) => {
      for (const interval of allBookedDates) {
          const dayOnly = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
          const startOnly = new Date(Date.UTC(interval.start.getFullYear(), interval.start.getMonth(), interval.start.getDate()));
          const endOnly = new Date(Date.UTC(interval.end.getFullYear(), interval.end.getMonth(), interval.end.getDate()));
          if (dayOnly >= startOnly && dayOnly <= endOnly) {
              return interval.status === 'Confirmed' ? styles.confirmedDay : styles.pendingDay;
          }
      }
      return '';
  };

  const handleNameChange = (event) => setName(event.target.value);
  const handleEmailChange = (event) => setEmail(event.target.value);
  const handlePhoneChange = (event) => setPhone(event.target.value);
  const handleMessageChange = (event) => setMessage(event.target.value);
  const handleStartDateChange = (date) => {
      setStartDate(date);
      if (endDate && date && endDate <= date) setEndDate(null);
  };
  const handleEndDateChange = (date) => setEndDate(date);
  const handleAdultsChange = (event) => setAdults(Math.max(1, parseInt(event.target.value, 10) || 1));
  const handleChildrenChange = (event) => setChildren(Math.max(0, parseInt(event.target.value, 10) || 0));

  const handleHouseChange = (event) => {
    const selectedHouseId = event.target.value;
    if (selectedHouseId && selectedHouseId !== houseId) {
        setStartDate(null); setEndDate(null); setAdults(1); setChildren(0);
        setName(''); setEmail(''); setPhone(''); setMessage('');
        setRecaptchaToken(null); setFormErrors({});
        navigate(`/details/${selectedHouseId}`);
    }
  };

  useEffect(() => {
    if (!houseId) {
      setError(t('houseIdMissing') || "House ID not found in URL.");
      setIsLoading(false);
      setIsListLoading(false);
      return;
    }
    let isMounted = true;
    const loadPageData = async () => {
      setIsLoading(true);
      setIsListLoading(true);
      setError(null);
      setHouseDetails(null);
      setAllHouses([]);
      setStartDate(null); setEndDate(null); setAdults(1); setChildren(0);
      setName(''); setEmail(''); setPhone(''); setMessage('');
      setRecaptchaToken(null); setFormErrors({});

      try {
         const [detailsData, listData] = await Promise.all([
            fetchPublicHouseDetails(houseId),
            fetchPublicHouses()
         ]);

        if (!detailsData || !detailsData.id) throw new Error(t('invalidHouseData'));
        if (!listData) throw new Error(t('houseListFetchError'));

        if (isMounted) {
          setHouseDetails(detailsData);
          setAllHouses(listData);
          loadBookedDates();
        }
      } catch (fetchError) {
        console.error("Error fetching page data:", fetchError);
        if (isMounted) setError(fetchError.message);
      } finally {
        if (isMounted) { setIsLoading(false); setIsListLoading(false); }
      }
    };
    loadPageData();
    return () => { isMounted = false; };
  }, [houseId, t, loadBookedDates]);

  const handleLightboxViewChange = useCallback(({ index: currentIndex }) => {
    setLightboxIndex(currentIndex);
  }, []);

  if (isLoading) return <div className={styles.pageContainer}><h1>{t('loading')}</h1></div>;
  if (error) return <div className={styles.pageContainer}><h1>{t('errorFetching')}</h1><p>{error}</p><Link to="/" className={styles.backLink}>{t('backToHome') || 'Back Home'}</Link></div>;
  if (!houseDetails) return <div className={styles.pageContainer}><h1>{t('houseNotFound')}</h1><Link to="/" className={styles.backLink}>{t('backToHome') || 'Back Home'}</Link></div>;

  return (
    <div className={styles.detailsPageContainer}>
      <h1 className={styles.houseTitle}>{houseDetails.name}</h1>
      <div className={styles.carouselSection}>
        <h2 className={styles.sectionHeading}>{t('gallery')}</h2>
        {houseDetails.images && houseDetails.images.length > 0 ? (
          <Swiper
              modules={[Navigation, Pagination, A11y, Autoplay]}
              spaceBetween={-10} slidesPerView={'auto'} centeredSlides={true} loop={true}
              navigation={true} pagination={{ clickable: true }} a11y={{ enabled: true }}
              className={styles.previewSwiper}
              autoplay={{ delay: 3000, disableOnInteraction: true, pauseOnMouseEnter: true, }}
          >
            {houseDetails.images.map((imgSrc, index) => (
              <SwiperSlide key={index}>
                <button type="button" className={styles.carouselImageButton} onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}>
                  <img src={imgSrc} alt={`${houseDetails.name} - Image ${index + 1}`} />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p>{t('noImagesAvailable')}</p>
        )}
      </div>

      {houseDetails.images && houseDetails.images.length > 0 && (
          <Lightbox
              open={lightboxOpen} close={() => setLightboxOpen(false)}
              slides={houseDetails.images.map(src => ({ src }))}
              index={lightboxIndex} on={{ view: handleLightboxViewChange }}
              plugins={[Zoom]} zoom={{ maxZoomPixelRatio: 5, }}
          />
      )}

      <div className={styles.contentArea}>
        <div className={styles.descriptionBox}>
          <p className={styles.houseDescription}>
            {houseDetails.longDescription?.[language] || houseDetails.longDescription?.['en'] || ''}
          </p>
        </div>

        <div className={styles.bookingSection}>
          <h2 className={styles.sectionHeading}>{t('bookNow')}</h2>
          <form className={styles.bookingForm} onSubmit={handleSubmit}>
            <div className="field">
              <label className="label" htmlFor={`house-select-${houseId}`}>{t('formSelectHouse')}</label>
              <div className="control has-icons-left">
                <div className="select is-fullwidth">
                  <select id={`house-select-${houseId}`} value={houseId} onChange={handleHouseChange}>
                    <option value={houseDetails.id}>{houseDetails.name}</option>
                    {allHouses
                      .filter(house => house.id !== houseId)
                      .map(house => (
                        <option key={house.id} value={house.id}>{house.name}</option>
                      ))
                    }
                    {isListLoading && !houseDetails && (<option disabled>{t('loadingHouses')}</option>)}
                  </select>
                </div>
                <span className="icon is-left"><FaHome /></span>
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor={`name-${houseId}`}>{t('formName')}</label>
              <div className="control"><input className={`input ${formErrors.name ? 'is-danger' : ''}`} type="text" id={`name-${houseId}`} name="name" placeholder={t('formNamePlaceholder')} value={name} onChange={handleNameChange} /></div>
              {formErrors.name && <p className="help is-danger">{formErrors.name}</p>}
            </div>
            <div className="field">
              <label className="label" htmlFor={`email-${houseId}`}>{t('formEmail')}</label>
              <div className="control"><input className={`input ${formErrors.email ? 'is-danger' : ''}`} type="email" id={`email-${houseId}`} name="email" placeholder={t('formEmailPlaceholder')} value={email} onChange={handleEmailChange} /></div>
              {formErrors.email && <p className="help is-danger">{formErrors.email}</p>}
            </div>
            <div className="field">
              <label className="label" htmlFor={`phone-${houseId}`}>{t('formPhone')}</label>
              <div className="control"><input className={`input ${formErrors.phone ? 'is-danger' : ''}`} type="tel" id={`phone-${houseId}`} name="phone" placeholder={t('formPhonePlaceholder')} value={phone} onChange={handlePhoneChange} /></div>
              {formErrors.phone && <p className="help is-danger">{formErrors.phone}</p>}
            </div>

            <div className="field">
              <label className="label" htmlFor={`checkin-date-${houseId}`}>{t('formCheckIn')}</label>
              <div className={`control has-icons-left ${formErrors.startDate ? styles.datepickerErrorWrapper : ''}`}>
                 <DatePicker
                    selected={startDate} onChange={handleStartDateChange} selectsStart startDate={startDate} endDate={endDate}
                    minDate={new Date()} dateFormat="dd/MM/yyyy" excludeDateIntervals={confirmedIntervals}
                    dayClassName={getDayClassName}
                    customInput={<CustomDateInput id={`checkin-date-${houseId}`} placeholder={t('formSelectDate')} className={`input ${formErrors.startDate ? 'is-danger' : ''}`} />}
                 />
                 <span className="icon is-left"><FaCalendarAlt /></span>
              </div>
              {formErrors.startDate && <p className="help is-danger">{formErrors.startDate}</p>}
            </div>
            <div className="field">
              <label className="label" htmlFor={`checkout-date-${houseId}`}>{t('formCheckOut')}</label>
              <div className={`control has-icons-left ${formErrors.endDate ? styles.datepickerErrorWrapper : ''}`}>
                 <DatePicker
                    selected={endDate} onChange={handleEndDateChange} selectsEnd startDate={startDate} endDate={endDate}
                    minDate={startDate ? addDays(startDate, 1) : new Date()} dateFormat="dd/MM/yyyy" disabled={!startDate}
                    excludeDateIntervals={confirmedIntervals} dayClassName={getDayClassName}
                    customInput={<CustomDateInput id={`checkout-date-${houseId}`} placeholder={t('formSelectDate')} className={`input ${formErrors.endDate ? 'is-danger' : ''}`} />}
                 />
                 <span className="icon is-left"><FaCalendarAlt /></span>
              </div>
              {formErrors.endDate && <p className="help is-danger">{formErrors.endDate}</p>}
            </div>

             <div className="field">
                <label className="label" htmlFor={`adults-${houseId}`}>{t('formAdults')}</label>
                <div className="control">
                   <div className={`select is-fullwidth ${formErrors.adults ? 'is-danger' : ''}`}>
                      <select id={`adults-${houseId}`} name="adults" value={adults} onChange={handleAdultsChange}>
                         {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (<option key={`adult-${num}`} value={num}>{num}</option>))}
                      </select>
                   </div>
                </div>
                {formErrors.adults && <p className="help is-danger">{formErrors.adults}</p>}
             </div>
             <div className="field">
                <label className="label" htmlFor={`children-${houseId}`}>{t('formChildren')}</label>
                <div className="control">
                   <div className="select is-fullwidth">
                      <select id={`children-${houseId}`} name="children" value={children} onChange={handleChildrenChange}>
                         {Array.from({ length: 6 }, (_, i) => i).map(num => (<option key={`child-${num}`} value={num}>{num}</option>))}
                      </select>
                   </div>
                </div>
             </div>

             <div className="field">
                <label className="label" htmlFor={`message-${houseId}`}>{t('formMessage')}</label>
                <div className="control">
                   <textarea className="textarea" id={`message-${houseId}`} name="message" placeholder={t('formMessagePlaceholder')} rows="4" value={message} onChange={handleMessageChange}></textarea>
                </div>
             </div>

            <div className={styles.captchaContainer}>
              <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={handleRecaptchaChange} />
              {formErrors.recaptcha && (<p className={`help is-danger ${styles.recaptchaErrorText}`}>{formErrors.recaptcha}</p>)}
            </div>
            <div className="field" style={{marginTop: '1.5rem'}}>
              <div className="control">
                <button type="submit" className={`button is-primary is-fullwidth ${isSubmitting ? 'is-loading' : ''}`} disabled={isSubmitting}>
                  <span style={{ fontSize: '20px' }}>{t('formSubmit')}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}