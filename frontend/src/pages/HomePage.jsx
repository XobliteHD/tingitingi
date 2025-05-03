import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { fetchPublicHouses, fetchPublicOthers } from '../utils/api';

export default function Home({ t, language }) {
  const [houses, setHouses] = useState([]);
  const [othersData, setOthersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [fetchedHouses, fetchedOthers] = await Promise.all([
          fetchPublicHouses(),
          fetchPublicOthers()
        ]);
        setHouses(fetchedHouses || []);
        setOthersData(fetchedOthers || []);
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

        {othersData.length > 0 && (
          <h2 className="section-title section-title--grid-header">
            {t('other')}
          </h2>
        )}

        {othersData.length > 0 ? (
          othersData.map((otherItem) => (
            <div key={otherItem.id} className="card">
              <div className="card-media">
                <img
                  src={otherItem.image || '/images/placeholder.png'}
                  alt={`Image of ${otherItem.name}`}
                />
              </div>
              <div className="card-content">
                <h3 className="card-title">{otherItem.name}</h3>
                <p className="card-description">
                    {otherItem.shortDescription?.[language] || otherItem.shortDescription?.['en'] || ''}
                </p>
                <Link to={`/Other/${otherItem.id}`} className="card-button">
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