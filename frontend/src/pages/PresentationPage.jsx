import React from 'react';
import { Link } from 'react-router-dom';
import FeatureSection from '../components/FeatureSection';
import CenteredTextSection from '../components/CenteredTextSection';
import './AdminCommon.css';

export default function PresentationPage({ t }) {
  return (
    <div className="admin-page-container" style={{ padding: '2rem 1rem' }}>
      <h1 className="title is-2 has-text-centered" style={{ marginBottom: '1rem', color: 'var(--title-color)' }}>
        {t('presentationPageTitle', { default: 'Tingitingi: For Another Kind of Tourism' })}
      </h1>
      <h2 className="subtitle is-4 has-text-centered" style={{ color: 'var(--icon-color)'}}>
        {t('presentationPageSubtitle', { default: 'A more balanced, solidary, and authentic approach.'})}
      </h2>

      <FeatureSection
        title={t('presentationSection1Title', { default: 'A Fair and Responsible Project' })}
        text={t('presentationSection1Text')}
        imageUrl="https://res.cloudinary.com/daaxaj4j7/image/upload/v1746217806/S_Dar-Gaia-3_wyglvh.jpg"
        imagePosition="right"
        linkUrl="/details/gaia"
      />

      <FeatureSection
        title={t('presentationSection2Title', { default: 'Our Houses: Oxala & Dar Gaïa' })}
        text={t('presentationSection2Text')}
        imageUrl="https://res.cloudinary.com/daaxaj4j7/image/upload/v1745875791/S_Oxala-6_fjuc26.png"
        imagePosition="left"
        linkUrl="/details/oxala"
      />

      <FeatureSection
        title={t('presentationSection3Title', { default: 'Our Concrete Commitments' })}
        text={t('presentationSection3Text')}
        imageUrl="https://res.cloudinary.com/daaxaj4j7/image/upload/v1746218389/DarBabel-Djerbahood-0_eiwsqh.jpg"
        imagePosition="right"
        linkUrl="/details/babel"
      />

      <FeatureSection
        title={t('presentationSection4Title', { default: 'An Authentic Approach' })}
        text={t('presentationSection4Text')}
        imageUrl="https://res.cloudinary.com/daaxaj4j7/image/upload/v1749589923/tingitingi_rentals/others/toguna/bbo3k67ddqjwitepxxus.jpg"
        imagePosition="left"
        linkUrl="/spaces/toguna"
      />
      
      <CenteredTextSection
        title={t('presentationSection5Title')}
        text={t('presentationSection5Text')}
      />
    </div>
  );
}