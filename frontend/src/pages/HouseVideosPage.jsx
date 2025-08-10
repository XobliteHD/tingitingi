// src/pages/HouseVideosPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPublicHouseDetails } from '../utils/api';
import { FaArrowLeft } from 'react-icons/fa';

export default function HouseVideosPage({ t }) {
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

  const videos = house.virtualTourVideos || [];

  return (
    <div className="virtual-tour-container">
      <Link to={`/details/${houseId}/tour`} className="button is-link">
        ← {t('backToSelection', { default: 'Back to Selection' })}
      </Link>
      <h1 className="title is-2 has-text-centered" style={{ marginTop: '2rem' }}>{t('videoTourTitle', { default: 'Video Tour' })}: {house.name}</h1>
      
      {videos.length > 0 ? (
        videos.map((video, index) => (
          <div key={index} style={{ marginBottom: '3rem' }}>
            <h2 className="title is-4" style={{ marginBottom: '1rem' }}>{video.title}</h2>
            <div className="video-responsive">
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}?rel=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            </div>
          </div>
        ))
      ) : (
        <p className="has-text-centered">
          {t('noVirtualTourAvailable', { default: 'No virtual video tour is available for this house yet.' })}
        </p>
      )}
    </div>
  );
}