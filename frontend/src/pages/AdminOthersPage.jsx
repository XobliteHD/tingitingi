import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminCommon.css';
import toast from 'react-hot-toast';
import { confirmAlert } from 'react-confirm-alert';
import { fetchAdminOthers, deleteAdminOther } from '../utils/api';

export default function AdminOthersPage({ t }) {
    const [others, setOthers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const loadOthers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchAdminOthers();
            setOthers(data);
        } catch (err) {
            console.error("Failed to fetch others:", err);
            if (err.message === "Unauthorized" || err.message === "Authentication required.") {
                 toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                 setTimeout(() => navigate('/admin/login'), 1500);
            } else {
                 setError(err.message || t('adminOthersFetchError', { default: 'Failed to fetch other items' }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOthers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = (otherId, otherName) => {
        confirmAlert({
            title: t('adminConfirmDeleteTitle', { default: 'Confirm Deletion' }),
            message: t('adminConfirmDeleteOther', { name: otherName, id: otherId, default: `Are you sure you want to permanently delete '${otherName}' (${otherId})? This includes all associated images and cannot be undone.` }),
            buttons: [
                {
                    label: t('adminConfirmYes', { default: 'Yes, Delete' }),
                    onClick: async () => {
                        setError(null);
                        try {
                            const responseData = await deleteAdminOther(otherId);
                            setOthers(prevOthers => prevOthers.filter(o => o._id !== otherId));
                            toast.success(responseData?.message || t('adminDeleteOtherSuccessMsg', { default: `Item ${otherId} deleted successfully.` }));
                        } catch (err) {
                            console.error(`Error deleting other item ${otherId}:`, err);
                             if (err.message === "Unauthorized") {
                                  toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                                  setTimeout(() => navigate('/admin/login'), 1500);
                             } else {
                                  setError(`Failed to delete item ${otherId}: ${err.message}`);
                                  toast.error(t('adminDeleteOtherErrorMsg', { message: err.message, default: `Error deleting item: ${err.message}` }));
                             }
                        }
                    }
                },
                {
                    label: t('adminConfirmNo', { default: 'No, Cancel' }),
                    onClick: () => {}
                }
            ],
            closeOnClickOutside: false,
        });
    };

    if (isLoading) return <div className="loading-indicator">{t('loading', { default: 'Loading...' })}</div>;
    if (error && others.length === 0) return <div className="notification is-danger is-light">{t('adminOthersFetchErrorBase', { default: 'Error fetching items:' })} {error}</div>;

    return (
        <div className="admin-page-container">
            <h1 className={`title is-3 admin-page-title`}>
                {t('adminManageOthersTitle', { default: 'Manage Other Items' })}
            </h1>

            {error && <div className="notification is-danger is-light mb-4">{error} <button onClick={() => setError(null)} className="delete"></button></div>}

            <div className="admin-page-actions">
                <Link to="/admin/dashboard" className="button is-link is-light is-small">
                    ← {t('adminBackToDashboard', { default: 'Back to Dashboard' })}
                </Link>
                <Link to="/admin/others/new" className={`button is-success add-button`}>
                    {t('adminAddOtherButton', { default: 'Add New Item' })}
                </Link>
            </div>

            {others.length === 0 && !isLoading ? (
                <p>{t('adminOthersNoneFound', { default: 'No other items found.' })}</p>
            ) : (
                <div className="table-container">
                    <table className={`table is-striped is-hoverable is-fullwidth admin-table-responsive`}>
                        <thead>
                            <tr>
                                <th>{t('adminOthersHeaderId', { default: 'ID (Slug)' })}</th>
                                <th>{t('adminOthersHeaderName', { default: 'Name' })}</th>
                                <th>{t('adminOthersHeaderImage', { default: 'Main Image' })}</th>
                                <th>{t('adminOthersHeaderGallery', { default: 'Gallery Count' })}</th>
                                <th>{t('adminOthersHeaderActions', { default: 'Actions' })}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {others.map((other) => (
                                <tr key={other._id}>
                                    <td data-label={t('adminOthersHeaderId', { default: 'ID' })}>{other._id}</td>
                                    <td data-label={t('adminOthersHeaderName', { default: 'Name' })}>{other.name}</td>
                                    <td data-label={t('adminOthersHeaderImage', { default: 'Image' })}>
                                        {other.image ? (
                                            <img src={other.image} alt={other.name} className="thumbnail" />
                                        ) : (
                                            t('adminOthersNoImage', { default: 'No Image' })
                                        )}
                                    </td>
                                     <td data-label={t('adminOthersHeaderGallery', { default: 'Gallery' })}>
                                        {other.images?.length || 0}
                                    </td>
                                    <td data-label={t('adminOthersHeaderActions', { default: 'Actions' })}>
                                        <div className="buttons are-small">
                                            <Link to={`/admin/others/edit/${other._id}`} className="button is-link is-outlined" title={t('adminEditOtherTooltip', { default: 'Edit Item' })}>
                                                <span>{t('adminEditButton', { default: 'Edit' })}</span>
                                            </Link>
                                            <button
                                                className="button is-danger is-outlined"
                                                onClick={() => handleDelete(other._id, other.name)}
                                                title={t('adminDeleteOtherTooltip', { default: 'Delete Item' })}
                                            >
                                                <span>{t('adminDeleteButton', { default: 'Delete' })}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}