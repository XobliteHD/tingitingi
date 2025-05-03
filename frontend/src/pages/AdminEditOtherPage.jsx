import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminOtherForm from '../components/AdminOtherForm';
import './AdminCommon.css';
import toast from 'react-hot-toast';
import { fetchAdminOtherDetails, updateAdminOther } from '../utils/api';

export default function AdminEditOtherPage({ t }) {
    const [otherData, setOtherData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { otherId } = useParams();

    useEffect(() => {
        const loadOtherDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchAdminOtherDetails(otherId);
                setOtherData(data);
            } catch (err) {
                console.error(`Failed to fetch other item ${otherId}:`, err);
                if (err.message === "Unauthorized" || err.message === "Authentication required.") {
                     toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                     setTimeout(() => navigate('/admin/login'), 1500);
                } else {
                     setError(err.message || t('adminEditOtherFetchError', { default: 'Failed to fetch item details.' }));
                     toast.error(err.message || t('adminEditOtherFetchError', { default: 'Failed to fetch item details.' }));
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadOtherDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otherId, navigate, t]);

    const handleUpdateOther = async (formData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const responseData = await updateAdminOther(otherId, formData);
            console.log('Other item updated successfully:', responseData);
            toast.success(t('adminEditOtherSuccessMsg', { default: 'Item updated successfully!' }));
            navigate('/admin/others');
        } catch (err) {
            console.error(`Failed to update other item ${otherId}:`, err);
             if (err.message === "Unauthorized") {
                  toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                  setTimeout(() => navigate('/admin/login'), 1500);
             } else {
                  setError(err.message || t('adminEditOtherErrorMsg', { default: 'Failed to update item.' }));
                  toast.error(err.message || t('adminEditOtherErrorMsg', { default: 'Failed to update item.' }));
             }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="loading-indicator">{t('loading', { default: 'Loading...' })}</div>;
    if (error && !otherData) return <div className="admin-page-container"><h1 className={`title is-3 admin-page-title`}>{t('adminEditOtherPageTitleError', { default: 'Edit Item' })}</h1><div className="notification is-danger is-light">{error}</div><Link to="/admin/others" className="button is-link is-light is-small">← {t('adminBackToOthersList', { default: 'Back to Others List' })}</Link></div>;
    if (!otherData) return <div className="admin-page-container"><p>{t('adminOtherNotFoundError', { id: otherId, default: `Item with ID ${otherId} not found.` })}</p><Link to="/admin/others" className="button is-link is-light is-small">← {t('adminBackToOthersList', { default: 'Back to Others List' })}</Link></div>;

    const baseTitle = t('adminEditOtherPageTitle', { default: 'Edit Item: {name}' });
    const finalTitle = otherData?.name ? baseTitle.replace('{name}', otherData.name) : t('adminEditOtherPageTitleError', { default: 'Edit Item' });

    return (
        <div className="admin-page-container">
            <h1 className={`title is-3 admin-page-title`}>{finalTitle}</h1>
            {error && <div className="notification is-danger is-light mb-4"><button className="delete" onClick={() => setError(null)}></button>{error}</div>}
            <div className="mb-4 admin-back-link-container">
                 <Link to="/admin/others" className="button is-link is-light is-small">
                      ← {t('adminBackToOthersList', { default: 'Back to Others List' })}
                 </Link>
            </div>
            <div className="admin-form-container">
                <AdminOtherForm onSubmit={handleUpdateOther} initialData={otherData} isLoading={isSubmitting} t={t} />
            </div>
        </div>
    );
}