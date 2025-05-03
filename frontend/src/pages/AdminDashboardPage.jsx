// frontend/src/pages/AdminDashboardPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './AdminCommon.css';

export default function AdminDashboardPage({ t = (key) => key }) {
  const navigate = useNavigate();

  const handleLogout = () => {
      console.log('Admin logging out...');
      localStorage.removeItem('adminUserInfo');
      navigate('/admin/login');
  };

    return (
        <div className="admin-dashboard-container">
            <h1 className={`title is-3 admin-dashboard-title`}>
                {t('adminDashboardTitle')}
            </h1>
            <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                <button onClick={handleLogout} className="button is-danger is-outlined">
                     {t('adminLogoutButton') || 'Logout'}
                </button>
            </div>
            <div className="columns is-multiline is-centered">
                <div className="column is-one-third">
                    <div className="box has-text-centered">
                        <h2 className="title is-5">{t('adminDashboardManageBookings')}</h2>
                        <Link to="/admin/bookings" className="button is-link">
                            {t('adminDashboardGoToBookings')}
                        </Link>
                    </div>
                </div>

                 <div className="column is-one-third">
                    <div className="box has-text-centered">
                        <h2 className="title is-5">{t('adminDashboardManageHouses')}</h2>
                        <Link to="/admin/houses" className="button is-link">
                            {t('adminDashboardGoToHouses')}
                        </Link>
                    </div>
                </div>
                 <div className="column is-one-third">
                    <div className="box has-text-centered">
                        <h2 className="title is-5">{t('adminDashboardManageOthers')}</h2>
                        <Link to="/admin/others" className="button is-link">
                            {t('adminDashboardGoToOthers')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}