import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminHouseForm from '../components/AdminHouseForm';
import './AdminCommon.css';
import toast from 'react-hot-toast';
import { fetchAdminHouseDetails, updateAdminHouse } from '../utils/api';

export default function AdminEditHousePage({ t }) {
    const [houseData, setHouseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { houseId } = useParams();

    useEffect(() => {
        const loadHouseDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchAdminHouseDetails(houseId);
                setHouseData(data);
            } catch (err) {
                console.error(`Failed to fetch house ${houseId}:`, err);
                if (err.message === "Unauthorized" || err.message === "Authentication required.") {
                     toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                     setTimeout(() => navigate('/admin/login'), 1500);
                } else {
                     setError(err.message || t('adminEditHouseFetchError', { default: 'Failed to fetch house details.' }));
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadHouseDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [houseId, navigate, t]);


    const handleUpdateHouse = async (formData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const responseData = await updateAdminHouse(houseId, formData);
            console.log('House updated successfully:', responseData);
            toast.success(t('adminEditHouseSuccessMsg', { default: 'House updated successfully!' }));
            navigate('/admin/houses');
        } catch (err) {
            console.error(`Failed to update house ${houseId}:`, err);
             if (err.message === "Unauthorized") {
                  toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                  setTimeout(() => navigate('/admin/login'), 1500);
             } else {
                  setError(err.message || t('adminEditHouseErrorMsg', { default: 'Failed to update house.' }));
                  toast.error(err.message || t('adminEditHouseErrorMsg', { default: 'Failed to update house.' }));
             }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="loading-indicator">{t('loading', { default: 'Loading...' })}</div>;
    }

    if (error && !houseData) {
        return (
            <div className="admin-page-container">
                 <h1 className={`title is-3 admin-page-title`}>{t('adminEditHousePageTitleError', { default: 'Edit House' })}</h1>
                 <div className="notification is-danger is-light">{error}</div>
                 <Link to="/admin/houses" className="button is-link is-light is-small">
                    ← {t('adminBackToList', { default: 'Back to Houses List' })}
                 </Link>
            </div>
        );
    }

    if (!houseData) {
         return (
             <div className="admin-page-container">
                  <p>{t('adminHouseNotFoundError', { id: houseId, default: `House with ID ${houseId} not found.` })}</p>
                 <Link to="/admin/houses" className="button is-link is-light is-small">
                    ← {t('adminBackToList', { default: 'Back to Houses List' })}
                 </Link>
             </div>
         );
    }

    const baseTitle = t('adminEditHousePageTitle', { default: 'Edit House: {name}' });
    const finalTitle = houseData?.name ? baseTitle.replace('{name}', houseData.name) : t('adminEditHousePageTitleError', { default: 'Edit House' });

    return (
        <div className="admin-page-container">
            <h1 className={`title is-3 admin-page-title`}>{finalTitle}</h1>

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
                    onSubmit={handleUpdateHouse}
                    initialData={houseData}
                    isLoading={isSubmitting}
                    t={t}
                />
            </div>
        </div>
    );
}