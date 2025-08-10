import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPublicHouseDetails } from '../utils/api';
import { FaArrowLeft } from 'react-icons/fa';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import '../pages/VirtualTourPage.css';

export default function HousePhotosPage({ t }) {
  const [house, setHouse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { houseId } = useParams();

  useEffect(() => {
    const loadHouse = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchPublicHouseDetails(houseId);
        setHouse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadHouse();
  }, [houseId]);

  const handleLightboxViewChange = useCallback(({ index: currentIndex }) => {
    setLightboxIndex(currentIndex);
  }, []);

  if (isLoading) {
    return <div className="loading-message">{t('loading')}</div>;
  }

  if (error) {
    return <div className="error-message">{t('errorFetching', { default: 'Error fetching data:' })} {error}</div>;
  }

  if (!house) {
    return <div className="error-message">{t('houseNotFound', { default: 'House details could not be loaded.' })}</div>;
  }

  const photosForSlideshow = house.displayPhotosUrls || [];
  const hasDisplayPhotos = photosForSlideshow.length > 0;
  const hasGooglePhotosLink = house.googlePhotosLink && house.googlePhotosLink.trim() !== '';

  return (
    <div className="virtual-tour-container">
      <Link to={`/details/${houseId}/tour`} className="button is-link">
        ← {t('backToSelection', { default: 'Back to Selection' })}
      </Link>
      <h1 className="title is-2 has-text-centered" style={{ marginTop: '2rem' }}>
        {t('photoGalleryTitle', { default: 'Photo Gallery' })}: {house.name}
      </h1>
      
      {hasDisplayPhotos ? (
        <div className="slideshow-section">
          <Swiper
            modules={[Navigation, Pagination, A11y, Autoplay]}
            spaceBetween={-10}
            slidesPerView={'auto'}
            centeredSlides={true}
            loop={true}
            navigation={true}
            pagination={{ clickable: true }}
            a11y={{ enabled: true }}
            className="photos-swiper"
            autoplay={{ delay: 3000, disableOnInteraction: true, pauseOnMouseEnter: true }}
          >
            {photosForSlideshow.map((imgSrc, index) => (
              <SwiperSlide key={index}>
                <button
                  type="button"
                  className="carousel-image-button"
                  onClick={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                >
                  <img src={imgSrc} alt={`${house.name} - Display Photo ${index + 1}`} />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>

          {hasGooglePhotosLink && (
            <div className="more-photos-button-overlay-container">
              <a 
                href={house.googlePhotosLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="more-photos-button-fixed"
              >
                {t('clickForMorePhotos', { default: 'More Photos' })}
              </a>
            </div>
          )}
        </div>
      ) : (
        <p className="has-text-centered">
          {t('noCuratedPhotosAvailable', { default: 'No curated photos are available for this house yet.' })}
          {hasGooglePhotosLink && (
            <div className="more-photos-button-standalone-container">
              <a 
                href={house.googlePhotosLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="more-photos-button"
              >
                {t('clickForMorePhotos', { default: 'More Photos' })}
              </a>
            </div>
          )}
        </p>
      )}

      {photosForSlideshow.length > 0 && (
          <Lightbox
              open={lightboxOpen}
              close={() => setLightboxOpen(false)}
              slides={photosForSlideshow.map(src => ({ src }))}
              index={lightboxIndex}
              on={{ view: handleLightboxViewChange }}
              plugins={[Zoom]}
              zoom={{ maxZoomPixelRatio: 5 }}
          />
      )}
    </div>
  );
}