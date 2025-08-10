import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import './AdminCommon.css';
import styles from './HouseDetailsPage.module.css';
import { fetchPublicSpaceDetails } from '../utils/api';

export default function SpaceDetailsPage({ t, language }) {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { spaceId } = useParams();

  useEffect(() => {
    if (!spaceId) {
      setError("Item ID not found in URL.");
      setIsLoading(false);
      return;
    }

    const loadDetails = async () => {
      setIsLoading(true);
      setError(null);
      setDetails(null);
      try {
        const data = await fetchPublicSpaceDetails(spaceId);
        if (!data || !data.id) { throw new Error(t('invalidSpaceData', { default: 'Invalid Item Data' })); }
        setDetails(data);
      } catch (fetchError) {
        console.error("Error fetching space item details:", fetchError);
        setError(fetchError.message || t('fetchErrorGeneric', { default: 'Failed to fetch details.' }));
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [spaceId, t]);

  const handleLightboxViewChange = useCallback(({ index: currentIndex }) => {
    setLightboxIndex(currentIndex);
  }, []);

  if (isLoading) {
    return (<div className="admin-page-container"><h1>{t('loading')}</h1></div>);
  }
  if (error) {
    return (<div className="admin-page-container"><h1>{t('errorFetching')}</h1><p>{error}</p><Link to="/" className="button is-link is-light mt-4">{t('backToHome', { default: 'Back Home' })}</Link></div>);
  }
  if (!details) {
    return (<div className="admin-page-container"><h1>{t('spaceNotFound', { default: 'Item details could not be loaded.' })}</h1><Link to="/" className="button is-link is-light mt-4">{t('backToHome', { default: 'Back Home' })}</Link></div>);
  }

  const longDescriptionText = details.longDescription?.[language] || details.longDescription?.['en'] || t('noDescriptionAvailable', { default: 'No description available.'});

  return (
    <div className="admin-page-container">

      <h1 className={styles.houseTitle}>{details.name}</h1>

      <div className={styles.carouselSection}>
        <h2 className={styles.sectionHeading}>{t('gallery')}</h2>
        {details.images && details.images.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination, A11y, Autoplay]}
            spaceBetween={-10} slidesPerView={'auto'} centeredSlides={true} loop={true}
            navigation={true} pagination={{ clickable: true }} a11y={{ enabled: true }}
            className={styles.previewSwiper}
            autoplay={{ delay: 3000, disableOnInteraction: true, pauseOnMouseEnter: true, }}
          >
            {details.images.map((imgSrc, index) => (
              <SwiperSlide key={index}>
                <button
                    type="button"
                    className={styles.carouselImageButton}
                    onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
                >
                  <img src={imgSrc} alt={`${details.name} - Image ${index + 1}`} />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p>{t('noImagesAvailable')}</p>
        )}
      </div>

      {details.images && details.images.length > 0 && (
          <Lightbox
              open={lightboxOpen}
              close={() => setLightboxOpen(false)}
              slides={details.images.map(src => ({ src }))}
              index={lightboxIndex}
              on={{ view: handleLightboxViewChange }}
              plugins={[Zoom]}
              zoom={{ maxZoomPixelRatio: 5 }}
          />
      )}

      <div className={styles.contentArea}>
        <div className={styles.descriptionBox}>
          <p className={styles.houseDescription}>
            {longDescriptionText}
          </p>
        </div>
      </div>
       <div className="has-text-centered mt-5">
             <Link to="/" className="button is-link is-light">
               ← {t('backToHome', { default: 'Back Home' })}
             </Link>
        </div>
    </div>
  );
}