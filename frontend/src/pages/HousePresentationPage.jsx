import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPublicHouseDetails } from '../utils/api';
import FeatureSection from '../components/FeatureSection';

export default function HousePresentationPage({ t, language }) {
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
    return <div className="error-message">{t('errorFetching')} {error}</div>;
  }

  if (!house) {
    return <div className="error-message">{t('houseNotFound')}</div>;
  }

  const presentationText = house.presentationContent?.[language] || house.presentationContent?.['en'] || '';
  const sections = presentationText.split('---').map(s => s.trim());
  const mainTitle = sections.length > 0 ? sections.shift() : house.name;

  return (
    <div className="admin-page-container" style={{ padding: '2rem 1rem' }}>
      <h1 className="title is-2 has-text-centered" style={{ color: 'var(--title-color)' }}>
        {mainTitle}
      </h1>
      
      {sections.map((sectionText, index) => {
        const image = house.images?.[index] || house.image;

        return (
          <FeatureSection
            key={index}
            text={sectionText}
            imageUrl={image}
            imagePosition={index % 2 === 0 ? 'right' : 'left'}
          />
        );
      })}

      
    </div>
  );
}