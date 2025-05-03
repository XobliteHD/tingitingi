import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminOtherForm from '../components/AdminOtherForm';
import './AdminCommon.css';
import toast from 'react-hot-toast';
import { createAdminOther } from '../utils/api';

export default function AdminAddOtherPage({ t }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleCreateOther = async (formData) => {
        setIsLoading(true);
        setError(null);
        try {
            const responseData = await createAdminOther(formData);
            console.log('Other created successfully:', responseData);
            toast.success(t('adminAddOtherSuccessMsg', { default: 'Other created successfully!' }));
            navigate('/admin/others');
        } catch (err) {
            console.error("Failed to create other item:", err);
            if (err.message === "Unauthorized" || err.message === "Authentication required.") {
                 toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                 setTimeout(() => navigate('/admin/login'), 1500);
            } else {
                 setError(err.message || t('adminAddOtherErrorMsg', { default: 'Failed to create item.' }));
                 toast.error(err.message || t('adminAddOtherErrorMsg', { default: 'Failed to create item.' }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page-container">
            <h1 className={`title is-3 admin-page-title`}>
                 {t('adminAddOtherPageTitle', { default: 'Add New Other Item' })}
            </h1>
            {error && <div className="notification is-danger is-light mb-4"><button className="delete" onClick={() => setError(null)}></button>{error}</div>}
            <div className="mb-4 admin-back-link-container">
                 <Link to="/admin/others" className="button is-link is-light is-small">
                      ← {t('adminBackToOthersList', { default: 'Back to Others List' })}
                 </Link>
            </div>
            <div className="admin-form-container">
                <AdminOtherForm onSubmit={handleCreateOther} isLoading={isLoading} t={t} />
            </div>
        </div>
    );
}