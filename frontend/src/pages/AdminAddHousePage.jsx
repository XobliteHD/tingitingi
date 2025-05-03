import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminHouseForm from '../components/AdminHouseForm';
import './AdminCommon.css';
import toast from 'react-hot-toast';
import { createAdminHouse } from '../utils/api';

export default function AdminAddHousePage({ t }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleCreateHouse = async (formData) => {
        setIsLoading(true);
        setError(null);

        try {
            const responseData = await createAdminHouse(formData);
            console.log('House created successfully:', responseData);
            toast.success(t('adminAddHouseSuccessMsg', { default: 'House created successfully!' }));
            navigate('/admin/houses');
        } catch (err) {
            console.error("Failed to create house:", err);
             if (err.message === "Unauthorized" || err.message === "Authentication required.") {
                 toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                 setTimeout(() => navigate('/admin/login'), 1500);
            } else {
                 setError(err.message || t('adminAddHouseErrorMsg', { default: 'Failed to create house.' }));
                 toast.error(err.message || t('adminAddHouseErrorMsg', { default: 'Failed to create house.' }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page-container">
            <h1 className={`title is-3 admin-page-title`}>
                 {t('adminAddHousePageTitle', { default: 'Add New House' })}
            </h1>

            {error && (
                <div className="notification is-danger is-light mb-4">
                    <button className="delete" onClick={() => setError(null)}></button>
                    {error}
                </div>
            )}

            <div className="mb-4 admin-back-link-container">
                 <Link to="/admin/houses" className="button is-link is-light is-small">
                      ← {t('adminBackToList', { default: 'Back to Houses List' })}
                 </Link>
            </div>
            <div className="admin-form-container">
                <AdminHouseForm
                    onSubmit={handleCreateHouse}
                    isLoading={isLoading}
                    t={t}
                />
            </div>
        </div>
    );
}