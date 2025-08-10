// src/App.jsx

import React, { useEffect, useState } from 'react';
import { FaGlobe, FaMoon, FaBars, FaTimes } from 'react-icons/fa';
import { MdOutlineLightMode } from "react-icons/md";
import { translations } from './translations';
import { Routes, Route, useNavigate, Navigate, useLocation, useMatch } from 'react-router-dom';
import House_Details from './pages/HouseDetailsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import SpaceDetailsPage from './pages/SpaceDetailsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminHousesPage from './pages/AdminHousesPage';
import AdminAddHousePage from './pages/AdminAddHousePage';
import AdminEditHousePage from './pages/AdminEditHousePage';
import AdminSpacesPage from './pages/AdminSpacesPage';
import AdminAddSpacePage from './pages/AdminAddSpacePage';
import AdminEditSpacePage from './pages/AdminEditSpacePage';
import PresentationPage from './pages/PresentationPage';
import RealisationsPage from './pages/RealisationsPage';
import Home from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import HousePresentationPage from './pages/HousePresentationPage';
import ReviewsListPage from './pages/ReviewsListPage';
import ReviewDetailsPage from './pages/ReviewDetailsPage';
import AdminBlogPage from './pages/AdminBlogPage';
import AdminAddArticlePage from './pages/AdminAddArticlePage';
import AdminEditArticlePage from './pages/AdminEditArticlePage';
import BlogListPage from './pages/BlogListPage';
import ArticleDetailsPage from './pages/ArticleDetailsPage';
import './index.css';
import { Toaster } from 'react-hot-toast';

import HouseTourSelectionPage from './pages/VirtualTourPage';
import HouseVideosPage from './pages/HouseVideosPage';
import HousePhotosPage from './pages/HousePhotosPage';


export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHouseDetailsPage = useMatch('/details/:houseId/*');
  const houseId = isHouseDetailsPage?.params?.houseId;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) return JSON.parse(savedMode);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'fr');

  const t = React.useCallback((key, options) => {
    let translation = translations[language]?.[key];
    if (!translation) {
      translation = translations['en']?.[key];
    }
    if (!translation) {
      return options?.default || `Missing translation: ${key}`;
    }
    if (options && typeof options === 'object') {
      Object.entries(options).forEach(([placeholder, value]) => {
        const regex = new RegExp(`{${placeholder}}`, 'g');
        const replacementValue = (typeof value === 'string' || typeof value === 'number') ? value : '';
        translation = translation.replace(regex, replacementValue);
      });
    }
    return translation;
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const setRealVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setRealVh();
    window.addEventListener('resize', setRealVh);
    return () => window.removeEventListener('resize', setRealVh);
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => setLanguage(l => (l === 'fr' ? 'en' : 'fr'));
  const toggleDarkMode = () => setIsDarkMode(d => !d);

  const handleMobileLinkClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const renderNavbar = () => {
    const navLinks = isHouseDetailsPage ? (
      <>
        <button className={`nav-button ${location.pathname === `/details/${houseId}` ? 'active' : ''}`} onClick={() => handleMobileLinkClick(`/details/${houseId}`)}>{t('reserve', { default: 'Reserve' })}</button>
        <button className={`nav-button ${location.pathname.endsWith('/presentation') ? 'active' : ''}`} onClick={() => handleMobileLinkClick(`/details/${houseId}/presentation`)}>{t('navHousePresentation', { default: 'Presentation' })}</button>
        <button className={`nav-button ${location.pathname.startsWith(`/details/${houseId}/tour`) ? 'active' : ''}`} onClick={() => handleMobileLinkClick(`/details/${houseId}/tour`)}>{t('navVirtualTour', { default: 'Virtual Tour' })}</button>
        <button className={`nav-button ${location.pathname.endsWith('/reviews') ? 'active' : ''}`} onClick={() => handleMobileLinkClick(`/details/${houseId}/reviews`)}>{t('navReviews', { default: 'Reviews' })}</button>
        <button className={`nav-button ${location.pathname.endsWith('/contact') ? 'active' : ''}`} onClick={() => handleMobileLinkClick(`/details/${houseId}/contact`)}>{t('navContact', { default: 'Contact' })}</button>
      </>
    ) : (
      <>
        <button className="nav-button" onClick={() => handleMobileLinkClick('/details/oxala')} >{t('reserve')}</button>
        <button className={`nav-button ${location.pathname === '/presentation' ? 'active' : ''}`} onClick={() => handleMobileLinkClick('/presentation')}>{t('navPresentation', { default: 'Presentation' })}</button>
        <button className={`nav-button ${location.pathname === '/realisations' ? 'active' : ''}`} onClick={() => handleMobileLinkClick('/realisations')}>{t('navRealisations', { default: 'Realisations' })}</button>
        <button className={`nav-button ${location.pathname.startsWith('/blog') ? 'active' : ''}`} onClick={() => handleMobileLinkClick('/blog')}>{t('navBlog', { default: 'Blog' })}</button>
        <button className={`nav-button ${location.pathname === '/contact' ? 'active' : ''}`} onClick={() => handleMobileLinkClick('/contact')}>{t('navContact', { default: 'Contact' })}</button>
      </>
    );

    return (
      <nav className="Nav">
        <div className="nav-left">
          <h1 className="tingitingi-title" onClick={() => navigate('/')}> Tingitingi</h1>
        </div>
        <div className="nav-center desktop-only">
          {navLinks}
        </div>
        <div className="nav-right">
          <button className="icon-button" onClick={toggleLanguage}><FaGlobe /></button>
          <button className="icon-button" onClick={toggleDarkMode}>
            {isDarkMode ? <MdOutlineLightMode /> : <FaMoon />}
          </button>
          <button className="icon-button mobile-nav-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>
    );
  };

  return (
    <div className={`Hole-page ${isMobileMenuOpen ? 'no-scroll' : ''}`}>
      {isMobileMenuOpen && <div className="mobile-nav-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <div className={`mobile-nav-panel ${isMobileMenuOpen ? 'is-open' : ''}`}>
        {isHouseDetailsPage ? (
          <>
            <button className={`nav-button ${location.pathname === `/details/${houseId}` ? 'active' : ''}`} onClick={() => handleMobileLinkClick(`/details/${houseId}`)}>{t('reserve', { default: 'Reserve' })}</button>
            <button className={`nav-button ${location.pathname.endsWith('/presentation') ? 'active' : ''}`} onClick={() => handleMobileLinkClick(`/details/${houseId}/presentation`)}>{t('navHousePresentation', { default: 'Presentation' })}</button>
            <button className={`nav-button ${location.pathname.startsWith(`/details/${houseId}/tour`) ? 'active' : ''}`} onClick={() => handleMobileLinkClick(`/details/${houseId}/tour`)}>{t('navVirtualTour', { default: 'Virtual Tour' })}</button>
            <button className={`nav-button ${location.pathname.endsWith('/reviews') ? 'active' : ''}`} onClick={() => handleMobileLinkClick(`/details/${houseId}/reviews`)}>{t('navReviews', { default: 'Reviews' })}</button>
            <button className={`nav-button ${location.pathname.endsWith('/contact') ? 'active' : ''}`} onClick={() => handleMobileLinkClick(`/details/${houseId}/contact`)}>{t('navContact', { default: 'Contact' })}</button>
          </>
        ) : (
          <>
            <button className="nav-button" onClick={() => handleMobileLinkClick('/details/oxala')} >{t('reserve')}</button>
            <button className={`nav-button ${location.pathname === '/presentation' ? 'active' : ''}`} onClick={() => handleMobileLinkClick('/presentation')}>{t('navPresentation', { default: 'Presentation' })}</button>
            <button className={`nav-button ${location.pathname === '/realisations' ? 'active' : ''}`} onClick={() => handleMobileLinkClick('/realisations')}>{t('navRealisations', { default: 'Realisations' })}</button>
            <button className={`nav-button ${location.pathname.startsWith('/blog') ? 'active' : ''}`} onClick={() => handleMobileLinkClick('/blog')}>{t('navBlog', { default: 'Blog' })}</button>
            <button className={`nav-button ${location.pathname === '/contact' ? 'active' : ''}`} onClick={() => handleMobileLinkClick('/contact')}>{t('navContact', { default: 'Contact' })}</button>
          </>
        )}
      </div>

      <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 5000, style: { background: '#363636', color: '#fff' }, success: { duration: 3000, style: { background: 'hsl(141, 71%, 48%)', color: 'white' }, iconTheme: { primary: 'white', secondary: 'hsl(141, 71%, 48%)' } }, error: { duration: 5000, style: { background: 'hsl(348, 100%, 61%)', color: 'white' }, iconTheme: { primary: 'white', secondary: 'hsl(348, 100%, 61%)' } }, }} />
      <header>{renderNavbar()}</header>
      <main className="main-content-area">
        <Routes>
          <Route path="/" element={<Home t={t} language={language} />} />
          <Route path="/presentation" element={<PresentationPage t={t} />} />
          <Route path="/realisations" element={<RealisationsPage t={t} />} />
          <Route path="/contact" element={<ContactPage t={t} />} />
          <Route path="/details/:houseId" element={<House_Details t={t} language={language} />} />
          <Route path="/details/:houseId/presentation" element={<HousePresentationPage t={t} language={language} />} />
          <Route path="/details/:houseId/tour" element={<HouseTourSelectionPage t={t} />} />
          <Route path="/details/:houseId/tour/videos" element={<HouseVideosPage t={t} />} />
          <Route path="/details/:houseId/tour/photos" element={<HousePhotosPage t={t} />} />
          
          <Route path="/details/:houseId/reviews" element={<ReviewsListPage t={t} />} />
          <Route path="/details/:houseId/reviews/:reviewId" element={<ReviewDetailsPage t={t} />} />
          <Route path="/details/:houseId/contact" element={<ContactPage t={t} />} />
          <Route path="/spaces/:spaceId" element={<SpaceDetailsPage t={t} language={language} />} />
          <Route path="/blog" element={<BlogListPage t={t} language={language} />} />
          <Route path="/blog/:slug" element={<ArticleDetailsPage t={t} language={language} />} />
          
          <Route path="/admin/login" element={<AdminLoginPage t={t} />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage t={t} />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage t={t} />} />
            <Route path="/admin/houses" element={<AdminHousesPage t={t} />} />
            <Route path="/admin/houses/new" element={<AdminAddHousePage t={t} />} />
            <Route path="/admin/houses/edit/:houseId" element={<AdminEditHousePage t={t} />} />
            <Route path="/admin/spaces" element={<AdminSpacesPage t={t} />} />
            <Route path="/admin/spaces/new" element={<AdminAddSpacePage t={t} />} />
            <Route path="/admin/spaces/edit/:spaceId" element={<AdminEditSpacePage t={t} />} />
            <Route path="/admin/blog" element={<AdminBlogPage t={t} />} />
            <Route path="/admin/blog/new" element={<AdminAddArticlePage t={t} />} />
            <Route path="/admin/blog/edit/:articleId" element={<AdminEditArticlePage t={t} />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </main>
      <footer><p>{t('footer')}</p></footer>
    </div>
  );
}