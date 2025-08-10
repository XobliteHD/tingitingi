import React from 'react';
import './CenteredTextSection.css';

export default function CenteredTextSection({ title, text }) {
  return (
    <section className="centered-text-section">
      <h2 className="centered-title">{title}</h2>
      <p className="centered-text">{text}</p>
    </section>
  );
}