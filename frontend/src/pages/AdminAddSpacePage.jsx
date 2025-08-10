import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSpaceForm from '../components/AdminSpaceForm';
import './AdminCommon.css';
import toast from 'react-hot-toast';
import { createAdminSpace } from '../utils/api';

export default function AdminAddSpacePage({ t }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleCreateSpace = async (formData) => {
        setIsLoading(true);
        setError(null);
        try {
            const responseData = await createAdminSpace(formData);
            console.log('Space created successfully:', responseData);
            toast.success(t('adminAddSpaceSuccessMsg', { default: 'Space created successfully!' }));
            navigate('/admin/spaces');
        } catch (err) {
            console.error("Failed to create space item:", err);
            if (err.message === "Unauthorized" || err.message === "Authentication required.") {
                 toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                 setTimeout(() => navigate('/admin/login'), 1500);
            } else {
                 setError(err.message || t('adminAddSpaceErrorMsg', { default: 'Failed to create item.' }));
                 toast.error(err.message || t('adminAddSpaceErrorMsg', { default: 'Failed to create item.' }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page-container">
            <h1 className={`title is-3 admin-page-title`}>
                 {t('adminAddSpacePageTitle', { default: 'Add New Space Item' })}
            </h1>
            {error && <div className="notification is-danger is-light mb-4"><button className="delete" onClick={() => setError(null)}></button>{error}</div>}
            <div className="mb-4 admin-back-link-container">
                 <Link to="/admin/spaces" className="button is-link is-light is-small">
                      ← {t('adminBackToSpacesList', { default: 'Back to Spaces List' })}
                 </Link>
            </div>
            <div className="admin-form-container">
                <AdminSpaceForm onSubmit={handleCreateSpace} isLoading={isLoading} t={t} />
            </div>
        </div>
    );
}