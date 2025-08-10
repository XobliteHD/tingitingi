import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPublicHouseDetails } from '../utils/api';
import './VirtualTourPage.css';
import { FaVideo, FaImages } from 'react-icons/fa';

export default function VirtualTourPage({ t }) {
  const [house, setHouse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

  if (isLoading) {
    return <div className="loading-message">{t('loading')}</div>;
  }

  if (error) {
    return <div className="error-message">{t('errorFetching', { default: 'Error fetching data:' })} {error}</div>;
  }

  if (!house) {
    return <div className="error-message">{t('houseNotFound', { default: 'House details could not be loaded.' })}</div>;
  }

  const hasVideos = house.virtualTourVideos && house.virtualTourVideos.length > 0;
  const hasPhotos = (house.images && house.images.length > 0) || house.googlePhotosLink;

  return (
    <div className="tour-selection-page">
      <h1 className="title is-2 has-text-centered">
        {t('virtualTourTitle', { default: 'Virtual Tour' })}: {house.name}
      </h1>
      
      {(hasVideos || hasPhotos) ? (
        <div className="tour-selection-options">
          {hasVideos && (
            <Link to={`/details/${houseId}/tour/videos`} className="tour-option-button">
              <FaVideo className="icon" />
              <span>{t('viewVideos', { default: 'View Videos' })}</span>
            </Link>
          )}
          {hasPhotos && (
            <Link to={`/details/${houseId}/tour/photos`} className="tour-option-button">
              <FaImages className="icon" />
              <span>{t('viewPhotos', { default: 'View Photos' })}</span>
            </Link>
          )}
        </div>
      ) : (
        <p className="has-text-centered">
          {t('noVirtualTourAvailable', { default: 'No virtual tour content is available for this house yet.' })}
        </p>
      )}
    </div>
  );
}