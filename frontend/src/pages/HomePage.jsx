import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { fetchPublicHouses, fetchPublicSpaces } from '../utils/api';

export default function Home({ t, language }) {
  const [houses, setHouses] = useState([]);
  const [spacesData, setSpacesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [fetchedHouses, fetchedSpaces] = await Promise.all([
          fetchPublicHouses(),
          fetchPublicSpaces()
        ]);

        if (Array.isArray(fetchedHouses)) {
          setHouses(fetchedHouses);
        } else {
          console.warn("fetchPublicHouses did not return an array. Received:", fetchedHouses);
          setHouses([]);
        }

        if (Array.isArray(fetchedSpaces)) {
          setSpacesData(fetchedSpaces);
        } else {
          console.warn("fetchPublicSpaces did not return an array. Received:", fetchedSpaces);
          setSpacesData([]);
        }

      } catch (fetchError) {
        console.error("Error fetching home page data:", fetchError);
        setError(fetchError.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <div className="loading-message">{t('loading')}</div>;
  }
  if (error) {
    return <div className="error-message">{t('errorFetching')} {error}</div>;
  }

  return (
    <main className="main-content-area">
      <div className="cards-container">
        <h2 className="section-title section-title--grid-header">
          {t('ourHouses')}
        </h2>

        {houses.length > 0 ? (
          houses.map((house) => (
            <div key={house.id} className="card">
              <div className="card-media">
                <img src={house.image || '/images/placeholder.png'} alt={`Image of ${house.name}`} />
              </div>
              <div className="card-content">
                <h3 className="card-title">{house.name}</h3>
                <p className="card-description">
                    {house.shortDescription?.[language] || house.shortDescription?.['en'] || ''}
                </p>
                <Link to={`/details/${house.id}`} className="card-button">
                  {t('viewDetails')}
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="grid-span-all">{t('noHousesAvailable')}</p>
        )}

        {spacesData.length > 0 && (
          <h2 className="section-title section-title--grid-header">
            {t('ourSpaces', { default: 'Our Spaces' })}
          </h2>
        )}

        {spacesData.length > 0 ? (
          spacesData.map((spaceItem) => (
            <div key={spaceItem.id} className="card">
              <div className="card-media">
                <img
                  src={spaceItem.image || '/images/placeholder.png'}
                  alt={`Image of ${spaceItem.name}`}
                />
              </div>
              <div className="card-content">
                <h3 className="card-title">{spaceItem.name}</h3>
                <p className="card-description">
                    {spaceItem.shortDescription?.[language] || spaceItem.shortDescription?.['en'] || ''}
                </p>
                <Link to={`/spaces/${spaceItem.id}`} className="card-button">
                  {t('viewDetails')}
                </Link>
              </div>
            </div>
          ))
        ) : null }
      </div>
    </main>
  );
}