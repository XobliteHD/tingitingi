import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPublicHouseDetails } from '../utils/api';
import './ReviewsPage.css';

export default function ReviewsListPage({ t }) {
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

  const reviews = house.reviews || [];

  return (
    <div className="reviews-page-container">
      <h1 className="title is-2 has-text-centered">{t('reviewsTitle', { default: 'What Our Guests Say' })}</h1>
      <h2 className="subtitle is-4 has-text-centered" style={{ color: 'var(--icon-color)' }}>{house.name}</h2>

      {reviews.length > 0 ? (
        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <Link to={`/details/${houseId}/reviews/${index}`} key={index} className="review-card-link">
              <div className="review-card">
                <div className="review-card-content">
                  <h3 className="review-title">{review.title}</h3>
                  <p className="review-quote">"{review.shortQuote}"</p>
                </div>
                <div className="review-card-author">
                  {review.imageUrl && <img src={review.imageUrl} alt={review.author} className="author-image" />}
                  <span className="author-name">- {review.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="has-text-centered">{t('noReviewsAvailable', { default: 'No reviews are available for this house yet.' })}</p>
      )}

      <div className="has-text-centered mt-6">
      </div>
    </div>
  );
}