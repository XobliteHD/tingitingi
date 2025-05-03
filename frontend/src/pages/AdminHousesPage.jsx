import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminCommon.css';
import toast from 'react-hot-toast';
import { confirmAlert } from 'react-confirm-alert';
import { fetchAdminHouses, deleteAdminHouse } from '../utils/api';

export default function AdminHousesPage({ t }) {
    const [houses, setHouses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const loadHouses = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchAdminHouses();
            setHouses(data);
        } catch (err) {
            console.error("Failed to fetch houses:", err);
            if (err.message === "Unauthorized" || err.message === "Authentication required.") {
                 toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                 setTimeout(() => navigate('/admin/login'), 1500);
            } else {
                 setError(err.message || t('adminHousesFetchError', { default: 'Failed to fetch houses' }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadHouses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = (houseId, houseName) => {
        confirmAlert({
            title: t('adminConfirmDeleteTitle', { default: 'Confirm Deletion' }),
            message: t('adminConfirmDeleteHouse', { name: houseName, id: houseId, default: `Are you sure you want to permanently delete house '${houseName}' (${houseId})? This includes all associated images and cannot be undone.` }),
            buttons: [
                {
                    label: t('adminConfirmYes', { default: 'Yes, Delete' }),
                    onClick: async () => {
                        setError(null);
                        try {
                            const responseData = await deleteAdminHouse(houseId);
                            setHouses(prevHouses => prevHouses.filter(h => h._id !== houseId));
                            toast.success(responseData?.message || t('adminDeleteHouseSuccessMsg', { default: `House ${houseId} deleted successfully.` }));
                        } catch (err) {
                            console.error(`Error deleting house ${houseId}:`, err);
                            if (err.message === "Unauthorized") {
                                 toast.error(t('authenticationRequired', { default: "Authentication required. Redirecting..."}));
                                 setTimeout(() => navigate('/admin/login'), 1500);
                            } else {
                                 setError(`Failed to delete house ${houseId}: ${err.message}`);
                                 toast.error(t('adminDeleteHouseErrorMsg', { message: err.message, default: `Error deleting house: ${err.message}` }));
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

    if (isLoading) {
        return <div className="loading-indicator">{t('loading', { default: 'Loading...' })}</div>;
    }

    if (error && houses.length === 0) {
        return <div className="notification is-danger is-light">{t('adminHousesFetchErrorBase', { default: 'Error fetching houses:' })} {error}</div>;
    }

    return (
        <div className="admin-page-container">
            <h1 className={`title is-3 admin-page-title`}>
                {t('adminManageHousesTitle', { default: 'Manage Houses' })}
            </h1>

            {error && <div className="notification is-danger is-light mb-4">{error} <button onClick={() => setError(null)} className="delete"></button></div>}

            <div className="admin-page-actions">
                <Link to="/admin/dashboard" className="button is-link is-light is-small">
                    ← {t('adminBackToDashboard', { default: 'Back to Dashboard' })}
                </Link>
                <Link to="/admin/houses/new" className={`button is-success add-button`}>
                    {t('adminAddHouseButton', { default: 'Add New House' })}
                </Link>
            </div>

            {houses.length === 0 && !isLoading ? (
                <p>{t('adminHousesNoneFound', { default: 'No houses found.' })}</p>
            ) : (
                <div className="table-container">
                    <table className={`table is-striped is-hoverable is-fullwidth admin-table-responsive`}>
                        <thead>
                            <tr>
                                <th>{t('adminHousesHeaderId', { default: 'ID (Slug)' })}</th>
                                <th>{t('adminHousesHeaderName', { default: 'Name' })}</th>
                                <th>{t('adminHousesHeaderImage', { default: 'Main Image' })}</th>
                                <th>{t('adminHousesHeaderGallery', { default: 'Gallery Count' })}</th>
                                <th>{t('adminHousesHeaderActions', { default: 'Actions' })}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {houses.map((house) => (
                                <tr key={house._id}>
                                    <td data-label={t('adminHousesHeaderId', { default: 'ID' })}>{house._id}</td>
                                    <td data-label={t('adminHousesHeaderName', { default: 'Name' })}>{house.name}</td>
                                    <td data-label={t('adminHousesHeaderImage', { default: 'Image' })}>
                                        {house.image ? (
                                            <img src={house.image} alt={house.name} className="thumbnail" />
                                        ) : (
                                            t('adminHousesNoImage', { default: 'No Image' })
                                        )}
                                    </td>
                                     <td data-label={t('adminHousesHeaderGallery', { default: 'Gallery' })}>
                                        {house.images?.length || 0}
                                    </td>
                                    <td data-label={t('adminHousesHeaderActions', { default: 'Actions' })}>
                                        <div className="buttons are-small">
                                            <Link to={`/admin/houses/edit/${house._id}`} className="button is-link is-outlined" title={t('adminEditHouseTooltip', { default: 'Edit House' })}>
                                                <span>{t('adminEditButton', { default: 'Edit' })}</span>
                                            </Link>
                                            <button
                                                className="button is-danger is-outlined"
                                                onClick={() => handleDelete(house._id, house.name)}
                                                title={t('adminDeleteHouseTooltip', { default: 'Delete House' })}
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