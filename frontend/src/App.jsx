// src/App.jsx
import React, { useEffect, useState } from 'react';
import { FaGlobe, FaMoon } from 'react-icons/fa';
import { MdOutlineLightMode } from "react-icons/md";
import { translations } from './translations';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import House_Details from './pages/HouseDetailsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import OtherDetailsPage from './pages/OtherDetailsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminHousesPage from './pages/AdminHousesPage';
import AdminAddHousePage from './pages/AdminAddHousePage';
import AdminEditHousePage from './pages/AdminEditHousePage';
import AdminOthersPage from './pages/AdminOthersPage';
import AdminAddOtherPage from './pages/AdminAddOtherPage';
import AdminEditOtherPage from './pages/AdminEditOtherPage';
import Home from './pages/HomePage';
import './index.css';
import { Toaster } from 'react-hot-toast';

export default function App() {
  
  const navigate = useNavigate();
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

  return (
    <div className="Hole-page">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                  background: 'hsl(141, 71%, 48%)',
                  color: 'white',
              },
              iconTheme: { primary: 'white', secondary: 'hsl(141, 71%, 48%)'}
            },
            error: {
              duration: 5000,
              style: {
                  background: 'hsl(348, 100%, 61%)',
                  color: 'white',
              },
              iconTheme: { primary: 'white', secondary: 'hsl(348, 100%, 61%)'}
            },
        }}
       />
        <header>
        <nav className="Nav">
          <div className="nav-left">
             <h1 className="tingitingi-title" onClick={() => navigate('/')}> Tingitingi</h1>
            <button className="nav-button" onClick={() => navigate('/details/oxala')} >{t('reserve')}</button>
          </div>
          <div className="nav-right">
            <button className="icon-button" onClick={toggleLanguage}><FaGlobe /></button>
            <button className="icon-button" onClick={toggleDarkMode}>
              {isDarkMode ? <MdOutlineLightMode /> : <FaMoon />}
            </button>
          </div>
        </nav>
        </header>

        <main className="main-content-area">
        <Routes>
          <Route path="/"element={<Home t={t} language={language}/>}/>
          <Route path="/details/:houseId" element={<House_Details t={t} language={language}/>} />
          <Route path="/Other/:otherId" element={<OtherDetailsPage t={t} language={language}/>} />
          <Route path="/admin/login" element={<AdminLoginPage t={t} />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage t={t} />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage t={t} />} />

            <Route path="/admin/houses" element={<AdminHousesPage t={t} />} />
            <Route path="/admin/houses/new" element={<AdminAddHousePage t={t} />} />
            <Route path="/admin/houses/edit/:houseId" element={<AdminEditHousePage t={t} />} />

            <Route path="/admin/others" element={<AdminOthersPage t={t} />} />
            <Route path="/admin/others/new" element={<AdminAddOtherPage t={t} />} />
            <Route path="/admin/others/edit/:otherId" element={<AdminEditOtherPage t={t} />} />
            
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
        </main>

        <footer>
        <p>{t('footer')}</p>
        </footer>
    </div>
  );
}
