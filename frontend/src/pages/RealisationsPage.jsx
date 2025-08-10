import React from 'react';
import FeatureSection from '../components/FeatureSection';
import './AdminCommon.css';

export default function RealisationsPage({ t }) {
  return (
    <div className="admin-page-container" style={{ padding: '2rem 1rem' }}>
      <h1 className="title is-2 has-text-centered" style={{ marginBottom: '1rem', color: 'var(--title-color)' }}>
        {t('realisationsPageTitle')}
      </h1>
      <h2 className="subtitle is-4 has-text-centered" style={{ color: 'var(--icon-color)'}}>
        {t('realisationsPageSubtitle')}
      </h2>

      <FeatureSection
        title={t('realisationsGaiaTitle')}
        text={t('realisationsGaiaText')}
        imageUrl="https://res.cloudinary.com/daaxaj4j7/image/upload/v1746217800/S_-Dar-Gaia-7_jznwkj.jpg"
        imagePosition="right"
        linkUrl="/details/gaia"
      />

      <FeatureSection
        title={t('realisationsOxalaTitle')}
        text={t('realisationsOxalaText')}
        imageUrl="https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875788/S_Oxala-1_dxurej.png"
        imagePosition="left"
        linkUrl="/details/oxala"
      />

      <FeatureSection
        title={t('realisationsBabelTitle')}
        text={t('realisationsBabelText')}
        imageUrl="https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218387/Babel-Out5_fiqjhj.jpg"
        imagePosition="right"
        linkUrl="/details/babel"
      />

      <FeatureSection
        title={t('realisationsTogunaTitle')}
        text={t('realisationsTogunaText')}
        imageUrl="https://res.cloudinary.com/daaxaj4j7/image/upload/v1749589924/tingitingi_rentals/others/toguna/c2iqzmxoocowor2dksg3.jpg"
        imagePosition="left"
        linkUrl="/spaces/toguna"
      />

      <FeatureSection
        title={t('realisationsZeboutikTitle')}
        text={t('realisationsZeboutikText')}
        imageUrl="https://lh5.googleusercontent.com/-fOYR8v29Ivw/U0nXiGfLiWI/AAAAAAAADRE/NzDkkkvKkzQ/DSC00921.JPG?imgmax=150&crop=1"
        imagePosition="right"
      />
    </div>
  );
}