import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminSpaceForm from '../components/AdminSpaceForm';
import './AdminCommon.css';
import toast from 'react-hot-toast';
import { fetchAdminSpaceDetails, updateAdminSpace } from '../utils/api';

export default function AdminEditSpacePage({ t }) {
    const [spaceData, setSpaceData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { spaceId } = useParams();

    useEffect(() => {
        const loadSpaceDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchAdminSpaceDetails(spaceId);
                setSpaceData(data);
            } catch (err) {
                console.error(`Failed to fetch space item ${spaceId}:`, err);
                if (err.message === "Unauthorized" || err.message === "Authentication required.") {
                     toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                     setTimeout(() => navigate('/admin/login'), 1500);
                } else {
                     setError(err.message || t('adminEditSpaceFetchError', { default: 'Failed to fetch item details.' }));
                     toast.error(err.message || t('adminEditSpaceFetchError', { default: 'Failed to fetch item details.' }));
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadSpaceDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spaceId, navigate, t]);

    const handleUpdateSpace = async (formData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const responseData = await updateAdminSpace(spaceId, formData);
            console.log('Space item updated successfully:', responseData);
            toast.success(t('adminEditSpaceSuccessMsg', { default: 'Item updated successfully!' }));
            navigate('/admin/spaces');
        } catch (err) {
            console.error(`Failed to update space item ${spaceId}:`, err);
             if (err.message === "Unauthorized") {
                  toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                  setTimeout(() => navigate('/admin/login'), 1500);
             } else {
                  setError(err.message || t('adminEditSpaceErrorMsg', { default: 'Failed to update item.' }));
                  toast.error(err.message || t('adminEditSpaceErrorMsg', { default: 'Failed to update item.' }));
             }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="loading-indicator">{t('loading', { default: 'Loading...' })}</div>;
    if (error && !spaceData) return <div className="admin-page-container"><h1 className={`title is-3 admin-page-title`}>{t('adminEditSpacePageTitleError', { default: 'Edit Item' })}</h1><div className="notification is-danger is-light">{error}</div><Link to="/admin/spaces" className="button is-link is-light is-small">← {t('adminBackToSpacesList', { default: 'Back to Spaces List' })}</Link></div>;
    if (!spaceData) return <div className="admin-page-container"><p>{t('adminSpaceNotFoundError', { id: spaceId, default: `Item with ID ${spaceId} not found.` })}</p><Link to="/admin/spaces" className="button is-link is-light is-small">← {t('adminBackToSpacesList', { default: 'Back to Spaces List' })}</Link></div>;

    const baseTitle = t('adminEditSpacePageTitle', { default: 'Edit Item: {name}' });
    const finalTitle = spaceData?.name ? baseTitle.replace('{name}', spaceData.name) : t('adminEditSpacePageTitleError', { default: 'Edit Item' });

    return (
        <div className="admin-page-container">
            <h1 className={`title is-3 admin-page-title`}>{finalTitle}</h1>
            {error && <div className="notification is-danger is-light mb-4"><button className="delete" onClick={() => setError(null)}></button>{error}</div>}
            <div className="mb-4 admin-back-link-container">
                 <Link to="/admin/spaces" className="button is-link is-light is-small">
                      ← {t('adminBackToSpacesList', { default: 'Back to Spaces List' })}
                 </Link>
            </div>
            <div className="admin-form-container">
                <AdminSpaceForm onSubmit={handleUpdateSpace} initialData={spaceData} isLoading={isSubmitting} t={t} />
            </div>
        </div>
    );
}