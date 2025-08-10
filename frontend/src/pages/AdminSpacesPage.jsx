import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminCommon.css';
import toast from 'react-hot-toast';
import { confirmAlert } from 'react-confirm-alert';
import { fetchAdminSpaces, deleteAdminSpace } from '../utils/api';

export default function AdminSpacesPage({ t }) {
    const [spaces, setSpaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const loadSpaces = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchAdminSpaces();
            setSpaces(data);
        } catch (err) {
            console.error("Failed to fetch spaces:", err);
            if (err.message === "Unauthorized" || err.message === "Authentication required.") {
                 toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                 setTimeout(() => navigate('/admin/login'), 1500);
            } else {
                 setError(err.message || t('adminSpacesFetchError', { default: 'Failed to fetch space items' }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSpaces();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = (spaceId, spaceName) => {
        confirmAlert({
            title: t('adminConfirmDeleteTitle', { default: 'Confirm Deletion' }),
            message: t('adminConfirmDeleteSpace', { name: spaceName, id: spaceId, default: `Are you sure you want to permanently delete '${spaceName}' (${spaceId})? This includes all associated images and cannot be undone.` }),
            buttons: [
                {
                    label: t('adminConfirmYes', { default: 'Yes, Delete' }),
                    onClick: async () => {
                        setError(null);
                        try {
                            const responseData = await deleteAdminSpace(spaceId);
                            setSpaces(prevSpaces => prevSpaces.filter(s => s._id !== spaceId));
                            toast.success(responseData?.message || t('adminDeleteSpaceSuccessMsg', { default: `Item ${spaceId} deleted successfully.` }));
                        } catch (err) {
                            console.error(`Error deleting space item ${spaceId}:`, err);
                             if (err.message === "Unauthorized") {
                                  toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                                  setTimeout(() => navigate('/admin/login'), 1500);
                             } else {
                                  setError(`Failed to delete item ${spaceId}: ${err.message}`);
                                  toast.error(t('adminDeleteSpaceErrorMsg', { message: err.message, default: `Error deleting item: ${err.message}` }));
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
    if (error && spaces.length === 0) return <div className="notification is-danger is-light">{t('adminSpacesFetchErrorBase', { default: 'Error fetching items:' })} {error}</div>;

    return (
        <div className="admin-page-container">
            <h1 className={`title is-3 admin-page-title`}>
                {t('adminManageSpacesTitle', { default: 'Manage Spaces' })}
            </h1>

            {error && <div className="notification is-danger is-light mb-4">{error} <button onClick={() => setError(null)} className="delete"></button></div>}

            <div className="admin-page-actions">
                <Link to="/admin/dashboard" className="button is-link is-light is-small">
                    ← {t('adminBackToDashboard', { default: 'Back to Dashboard' })}
                </Link>
                <Link to="/admin/spaces/new" className={`button is-success add-button`}>
                    {t('adminAddSpaceButton', { default: 'Add New Item' })}
                </Link>
            </div>

            {spaces.length === 0 && !isLoading ? (
                <p>{t('adminSpacesNoneFound', { default: 'No space items found.' })}</p>
            ) : (
                <div className="table-container">
                    <table className={`table is-striped is-hoverable is-fullwidth admin-table-responsive`}>
                        <thead>
                            <tr>
                                <th>{t('adminSpacesHeaderId', { default: 'ID (Slug)' })}</th>
                                <th>{t('adminSpacesHeaderName', { default: 'Name' })}</th>
                                <th>{t('adminSpacesHeaderImage', { default: 'Main Image' })}</th>
                                <th>{t('adminSpacesHeaderGallery', { default: 'Gallery Count' })}</th>
                                <th>{t('adminSpacesHeaderActions', { default: 'Actions' })}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {spaces.map((space) => (
                                <tr key={space._id}>
                                    <td data-label={t('adminSpacesHeaderId', { default: 'ID' })}>{space._id}</td>
                                    <td data-label={t('adminSpacesHeaderName', { default: 'Name' })}>{space.name}</td>
                                    <td data-label={t('adminSpacesHeaderImage', { default: 'Image' })}>
                                        {space.image ? (
                                            <img src={space.image} alt={space.name} className="thumbnail" />
                                        ) : (
                                            t('adminSpacesNoImage', { default: 'No Image' })
                                        )}
                                    </td>
                                     <td data-label={t('adminSpacesHeaderGallery', { default: 'Gallery' })}>
                                        {space.images?.length || 0}
                                    </td>
                                    <td data-label={t('adminSpacesHeaderActions', { default: 'Actions' })}>
                                        <div className="buttons are-small">
                                            <Link to={`/admin/spaces/edit/${space._id}`} className="button is-link is-outlined" title={t('adminEditSpaceTooltip', { default: 'Edit Item' })}>
                                                <span>{t('adminEditButton', { default: 'Edit' })}</span>
                                            </Link>
                                            <button
                                                className="button is-danger is-outlined"
                                                onClick={() => handleDelete(space._id, space.name)}
                                                title={t('adminDeleteSpaceTooltip', { default: 'Delete Item' })}
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