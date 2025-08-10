import React from 'react';
import './FeatureSection.css';
import { Link } from 'react-router-dom';

export default function FeatureSection({ title, text, imageUrl, imagePosition = 'right', linkUrl }) {
  const sectionClassName = `feature-section ${imagePosition === 'left' ? 'image-left' : ''}`;
  const imageContent = linkUrl ? (
    <Link to={linkUrl} className="feature-image-link">
      <img src={imageUrl} alt={title} />
    </Link>
  ) : (
    <img src={imageUrl} alt={title} />
  );

  return (
    <section className={sectionClassName}>
      <div className="feature-text-content">
        <h2 className="feature-title">{title}</h2>
        <p className="feature-text">{text}</p>
      </div>
      <div className="feature-image-content">
        {imageContent}
      </div>
    </section>
  );
}