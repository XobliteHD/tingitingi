// src/components/AdminHouseForm.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { confirmAlert } from 'react-confirm-alert';
import  '../pages/AdminCommon.css';

function AdminHouseForm({ onSubmit, initialData = null, isLoading = false, t }) {
    const [id, setId] = useState(initialData?._id || '');
    const [name, setName] = useState(initialData?.name || '');
    const [shortDescriptionFr, setShortDescriptionFr] = useState(initialData?.shortDescription?.fr || '');
    const [shortDescriptionEn, setShortDescriptionEn] = useState(initialData?.shortDescription?.en || '');
    const [longDescriptionFr, setLongDescriptionFr] = useState(initialData?.longDescription?.fr || '');
    const [longDescriptionEn, setLongDescriptionEn] = useState(initialData?.longDescription?.en || '');
    const [capacity, setCapacity] = useState(initialData?.capacity || '');
    const [isManuallyUnavailable, setIsManuallyUnavailable] = useState(initialData?.isManuallyUnavailable || false);

    const [mainImageFile, setMainImageFile] = useState(null);
    const [galleryImageFiles, setGalleryImageFiles] = useState([]);

    const [existingMainImage, setExistingMainImage] = useState(initialData?.image || null);
    const [existingGalleryImages, setExistingGalleryImages] = useState(initialData?.images || []);
    const [galleryImagesToDelete, setGalleryImagesToDelete] = useState([]);

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setId(initialData._id || '');
            setName(initialData.name || '');
            setShortDescriptionFr(initialData.shortDescription?.fr || '');
            setShortDescriptionEn(initialData.shortDescription?.en || '');
            setLongDescriptionFr(initialData.longDescription?.fr || '');
            setLongDescriptionEn(initialData.longDescription?.en || '');
            setCapacity(initialData.capacity || '');
            setIsManuallyUnavailable(initialData.isManuallyUnavailable || false);
            setExistingMainImage(initialData.image || null);
            setExistingGalleryImages(initialData.images || []);
            setMainImageFile(null);
            setGalleryImageFiles([]);
            setGalleryImagesToDelete([]);
            setErrors({});
        } else {
            setId(''); setName(''); setShortDescriptionFr(''); setShortDescriptionEn('');
            setLongDescriptionFr(''); setLongDescriptionEn(''); setCapacity(''); setIsManuallyUnavailable(false);
            setExistingMainImage(null); setExistingGalleryImages([]);
            setMainImageFile(null); setGalleryImageFiles([]); setErrors({});
        }
    }, [initialData]);


    const validateForm = () => {
        const newErrors = {};
        if (!id.trim()) newErrors.id = t('adminHouseFormErrorIdRequired', { default: 'ID (Slug) is required.' });
        else if (!/^[a-z0-9-]+$/.test(id)) newErrors.id = t('adminHouseFormErrorIdFormat', { default: 'ID must be lowercase letters, numbers, or hyphens.' });
        if (!name.trim()) newErrors.name = t('adminHouseFormErrorNameRequired', { default: 'Name is required.' });
        if (!shortDescriptionFr.trim()) newErrors.shortDescriptionFr = t('adminHouseFormErrorShortFrRequired', { default: 'Short Description (FR) is required.' });
        if (!shortDescriptionEn.trim()) newErrors.shortDescriptionEn = t('adminHouseFormErrorShortEnRequired', { default: 'Short Description (EN) is required.' });
        if (!longDescriptionFr.trim()) newErrors.longDescriptionFr = t('adminHouseFormErrorLongFrRequired', { default: 'Long Description (FR) is required.' });
        if (!longDescriptionEn.trim()) newErrors.longDescriptionEn = t('adminHouseFormErrorLongEnRequired', { default: 'Long Description (EN) is required.' });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleMarkGalleryImageForDelete = (imageUrlToDelete) => {
        setGalleryImagesToDelete(prev => [...prev, imageUrlToDelete]);
    };
    const handleUnmarkGalleryImageForDelete = (imageUrlToKeep) => {
        setGalleryImagesToDelete(prev => prev.filter(url => url !== imageUrlToKeep));
    };

    const confirmDeleteGalleryImage = (imgUrl) => {
        const isMarked = galleryImagesToDelete.includes(imgUrl);
        if (isMarked) {
            handleUnmarkGalleryImageForDelete(imgUrl);
        } else {
            confirmAlert({
                title: t('adminConfirmGalleryDeleteTitle', { default: 'Confirm Image Deletion' }),
                message: t('adminConfirmGalleryDeleteMessage', { default: 'Are you sure you want to mark this image for deletion? It will be permanently deleted when you save changes.' }),
                buttons: [
                    {
                        label: t('adminConfirmYesMarkDelete', { default: 'Yes, Mark for Deletion' }),
                        onClick: () => handleMarkGalleryImageForDelete(imgUrl) // Mark if confirmed
                    },
                    {
                        label: t('adminConfirmNo', { default: 'No, Cancel' }),
                        onClick: () => {}
                    }
                ],
                closeOnClickOutside: false,
            });
        }
   };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        const formData = new FormData();
        if (!initialData) formData.append('id', id);
        formData.append('name', name);
        formData.append('shortDescription_fr', shortDescriptionFr);
        formData.append('shortDescription_en', shortDescriptionEn);
        formData.append('longDescription_fr', longDescriptionFr);
        formData.append('longDescription_en', longDescriptionEn);
        formData.append('isManuallyUnavailable', isManuallyUnavailable ? 'true' : 'false');
        if (capacity) formData.append('capacity', capacity);
        if (mainImageFile) formData.append('image', mainImageFile);
        galleryImageFiles.forEach(file => formData.append('images', file));
        if (galleryImagesToDelete.length > 0) {
            formData.append('imagesToDelete', JSON.stringify(galleryImagesToDelete));
        }
        onSubmit(formData, initialData?._id);
    };

    const handleMainImageChange = (event) => { if (event.target.files?.[0]) setMainImageFile(event.target.files[0]); };
    const handleGalleryImagesChange = (event) => { if (event.target.files) setGalleryImageFiles(prev => [...prev, ...Array.from(event.target.files)]); };

    return (
        <form onSubmit={handleFormSubmit} noValidate>
            <div className="field">
                <label className="label" htmlFor="house-id">{t('adminHousesHeaderId', { default: 'ID (Slug)' })}</label>
                <div className="control">
                    <input
                        className={`input ${errors.id ? 'is-danger' : ''}`}
                        type="text"
                        id="house-id"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        required
                        disabled={!!initialData}
                        placeholder={t('adminHouseFormIdPlaceholder', { default: 'e.g., unique-house-name' })}
                    />
                </div>
                 {errors.id && <p className="help is-danger">{errors.id}</p>}
                 {initialData && <p className="help">{t('adminHouseFormIdEditHelp', { default: 'ID cannot be changed after creation.' })}</p>}
            </div>

            <div className="field">
                <label className="label" htmlFor="house-name">{t('adminHousesHeaderName', { default: 'Name' })}</label>
                <div className="control">
                    <input
                        className={`input ${errors.name ? 'is-danger' : ''}`}
                        type="text"
                        id="house-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder={t('adminHouseFormNamePlaceholder', { default: 'e.g., Oxala House' })}
                    />
                </div>
                {errors.name && <p className="help is-danger">{errors.name}</p>}
            </div>

            <div className="field">
                <label className="label" htmlFor="short-desc-fr">{t('adminHouseFormShortFr', { default: 'Short Description (FR)' })}</label>
                <div className="control">
                    <textarea
                        className={`textarea ${errors.shortDescriptionFr ? 'is-danger' : ''}`}
                        id="short-desc-fr"
                        rows="3"
                        value={shortDescriptionFr}
                        onChange={(e) => setShortDescriptionFr(e.target.value)}
                        required
                    />
                </div>
                 {errors.shortDescriptionFr && <p className="help is-danger">{errors.shortDescriptionFr}</p>}
            </div>

            <div className="field">
                <label className="label" htmlFor="short-desc-en">{t('adminHouseFormShortEn', { default: 'Short Description (EN)' })}</label>
                <div className="control">
                    <textarea
                        className={`textarea ${errors.shortDescriptionEn ? 'is-danger' : ''}`}
                        id="short-desc-en"
                        rows="3"
                        value={shortDescriptionEn}
                        onChange={(e) => setShortDescriptionEn(e.target.value)}
                        required
                    />
                </div>
                 {errors.shortDescriptionEn && <p className="help is-danger">{errors.shortDescriptionEn}</p>}
            </div>

             <div className="field">
                <label className="label" htmlFor="long-desc-fr">{t('adminHouseFormLongFr', { default: 'Long Description (FR)' })}</label>
                <div className="control">
                    <textarea
                        className={`textarea ${errors.longDescriptionFr ? 'is-danger' : ''}`}
                        id="long-desc-fr"
                        rows="6"
                        value={longDescriptionFr}
                        onChange={(e) => setLongDescriptionFr(e.target.value)}
                        required
                    />
                </div>
                 {errors.longDescriptionFr && <p className="help is-danger">{errors.longDescriptionFr}</p>}
            </div>

             <div className="field">
                <label className="label" htmlFor="long-desc-en">{t('adminHouseFormLongEn', { default: 'Long Description (EN)' })}</label>
                <div className="control">
                    <textarea
                        className={`textarea ${errors.longDescriptionEn ? 'is-danger' : ''}`}
                        id="long-desc-en"
                        rows="6"
                        value={longDescriptionEn}
                        onChange={(e) => setLongDescriptionEn(e.target.value)}
                        required
                    />
                </div>
                 {errors.longDescriptionEn && <p className="help is-danger">{errors.longDescriptionEn}</p>}
            </div>

            <div className="field">
                <label className="label" htmlFor="house-capacity">{t('adminHouseFormCapacity', { default: 'Capacity (Optional)' })}</label>
                <div className="control">
                    <input
                        className={`input ${errors.capacity ? 'is-danger' : ''}`}
                        type="number"
                        id="house-capacity"
                        min="1"
                        step="1"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        placeholder={t('adminHouseFormCapacityPlaceholder', { default: 'e.g., 4' })}
                    />
                </div>
                {errors.capacity && <p className="help is-danger">{errors.capacity}</p>}
            </div>

            <div className="field">
                <div className="control">
                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={isManuallyUnavailable}
                            onChange={(e) => setIsManuallyUnavailable(e.target.checked)}
                        />
                        {' '} {t('adminHouseFormUnavailable', { default: 'Manually Mark as Unavailable' })}
                    </label>
                </div>
            </div>

            <hr />

            <div className="field">
                <label className="label">{t('adminHouseFormMainImage', { default: 'Main Image' })}</label>
                {existingMainImage && !mainImageFile && (
                    <div className="mb-2">
                        <img src={existingMainImage} alt="Current main" style={{ maxHeight: '100px', borderRadius: '4px' }} />
                    </div>
                )}
                {mainImageFile && (
                     <p className="mb-2">{t('adminHouseFormImageSelected', { default: 'New image selected:'})} {mainImageFile.name}</p>
                )}
                <div className="control">
                    <div className="file has-name is-fullwidth">
                        <label className="file-label">
                            <input
                                className="file-input"
                                type="file"
                                name="image"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleMainImageChange}
                            />
                            <span className="file-cta">
                                <span className="file-icon">
                                    <i className="fas fa-upload"></i>
                                </span>
                                <span className="file-label">
                                     {existingMainImage ? t('adminHouseFormChangeImageBtn', {default: 'Change Image…'}) : t('adminHouseFormChooseImageBtn', {default: 'Choose Image…'})}
                                </span>
                            </span>
                             <span className="file-name">
                                {mainImageFile ? mainImageFile.name : t('adminHouseFormNoFileChosen', {default: 'No file chosen'})}
                             </span>
                        </label>
                    </div>
                </div>
                 {errors.mainImage && <p className="help is-danger">{errors.mainImage}</p>}
            </div>

            <div className="field">
                 <label className="label">{t('adminHouseFormGalleryImages', { default: 'Gallery Images' })}</label>
                 
                {existingGalleryImages.length > 0 && (
                   <div className="mb-3 p-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                       {existingGalleryImages.map((imgUrl, index) => {
                          const isMarkedForDelete = galleryImagesToDelete.includes(imgUrl);
                           return (
                              <div key={`existing-${index}-${imgUrl}`} style={{ position: 'relative', opacity: isMarkedForDelete ? 0.4 : 1, border: isMarkedForDelete ? '2px dashed hsl(348, 86%, 61%)' : 'none', padding: '2px' }}> {/* Visual feedback */}
                                   <img src={imgUrl} alt={`Gallery ${index}`} style={{ maxHeight: '80px', height: '80px', width: 'auto', display: 'block', borderRadius: '4px' }} />
                                   <button
                                       type="button"
                                       className={`delete is-small ${isMarkedForDelete ? 'has-background-grey-light' : 'has-background-danger'}`} // Style based on state
                                       style={{ position: 'absolute', top: '3px', right: '3px', opacity: 1, cursor: 'pointer' }}
                                       title={isMarkedForDelete ? t('adminHouseFormUndoDeleteImage', { default: 'Undo delete' }) : t('adminHouseFormDeleteImage', { default: 'Mark for delete' })}
                                       onClick={() => confirmDeleteGalleryImage(imgUrl)}
                                   >
                                   </button>
                              </div>
                          )})}
                   </div>
                )}

                 {galleryImageFiles.length > 0 && (
                     <p className="mb-2">{t('adminHouseFormGallerySelected', {count: galleryImageFiles.length, default: `${galleryImageFiles.length} new gallery image(s) selected:`})}</p>
                 )}
                <div className="control">
                     <div className="file is-multiple has-name is-fullwidth">
                        <label className="file-label">
                            <input
                                className="file-input"
                                type="file"
                                name="images"
                                accept="image/png, image/jpeg, image/webp"
                                multiple
                                onChange={handleGalleryImagesChange}
                            />
                            <span className="file-cta">
                                <span className="file-icon"><i className="fas fa-upload"></i></span>
                                <span className="file-label">{t('adminHouseFormChooseGalleryBtn', {default: 'Choose Gallery Images…'})}</span>
                            </span>
                             <span className="file-name">
                                {galleryImageFiles.length > 0 ? t('adminHouseFormGalleryFileCount', { count: galleryImageFiles.length, default: `${galleryImageFiles.length} files selected`}) : t('adminHouseFormNoFileChosen', {default: 'No file chosen'})}
                             </span>
                        </label>
                    </div>
                </div>
            </div>


            <div className="field mt-5">
                <div className="control">
                    <button
                        type="submit"
                        className={`button is-primary is-fullwidth ${isLoading ? 'is-loading' : ''}`}
                        disabled={isLoading}
                    >
                        {initialData ? t('adminHouseFormSubmitUpdate', { default: 'Update House' }) : t('adminHouseFormSubmitCreate', { default: 'Create House' })}
                    </button>
                </div>
            </div>
        </form>
    );
}

AdminHouseForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  isLoading: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

export default AdminHouseForm;