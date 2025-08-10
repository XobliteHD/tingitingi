import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPublicHouseDetails } from '../utils/api';

export default function ReviewDetailsPage({ t }) {
  const [review, setReview] = useState(null);
  const [houseName, setHouseName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { houseId, reviewId } = useParams();

  useEffect(() => {
    const loadReview = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchPublicHouseDetails(houseId);
        const specificReview = data.reviews?.[parseInt(reviewId, 10)];
        if (specificReview) {
          setReview(specificReview);
          setHouseName(data.name);
        } else {
          setError(t('reviewNotFound', { default: 'Review not found.' }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadReview();
  }, [houseId, reviewId, t]);

  if (isLoading) {
    return <div className="loading-message">{t('loading')}</div>;
  }

  if (error) {
    return <div className="error-message">{t('errorFetching')} {error}</div>;
  }

  if (!review) {
    return <div className="error-message">{t('reviewNotFound', { default: 'Review not found.' })}</div>;
  }

  return (
    <div className="admin-page-container">
      {/* This is the new wrapper that will be centered */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="title is-2">{review.title}</h1>
          <p className="subtitle is-5">A review by <strong>{review.author}</strong> for {houseName}</p>
        </div>

        <div className="content" style={{ lineHeight: '1.8', overflow: 'hidden' }}>
          {review.imageUrl && (
            <img
              src={review.imageUrl}
              alt={review.author}
              style={{
                width: '350px',
                height: 'auto',
                borderRadius: '8px',
                float: 'left',
                marginRight: '2rem',
                marginBottom: '1rem'
              }}
            />
          )}
          <p style={{ whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
            {review.fullText}
          </p>
        </div>

        <div className="has-text-centered mt-6" style={{ clear: 'both' }}>
          <Link to={`/details/${houseId}/reviews`} className="button is-link">
            ← {t('backToAllReviews', { default: 'Back to All Reviews' })}
          </Link>
        </div>

      </div>
    </div>
  );
}