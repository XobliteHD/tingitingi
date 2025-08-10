// src/components/AdminOtherForm.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { confirmAlert } from 'react-confirm-alert';

function AdminOtherForm({ onSubmit, initialData = null, isLoading = false, t }) {
    const [id, setId] = useState(initialData?._id || '');
    const [name, setName] = useState(initialData?.name || '');
    const [shortDescriptionFr, setShortDescriptionFr] = useState(initialData?.shortDescription?.fr || '');
    const [shortDescriptionEn, setShortDescriptionEn] = useState(initialData?.shortDescription?.en || '');
    const [longDescriptionFr, setLongDescriptionFr] = useState(initialData?.longDescription?.fr || '');
    const [longDescriptionEn, setLongDescriptionEn] = useState(initialData?.longDescription?.en || '');
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
            setIsManuallyUnavailable(initialData.isManuallyUnavailable || false);
            setExistingMainImage(initialData.image || null);
            setExistingGalleryImages(initialData.images || []);
            setMainImageFile(null); setGalleryImageFiles([]); setErrors({});
            setGalleryImagesToDelete([]);
        } else {
            setId(''); setName(''); setShortDescriptionFr(''); setShortDescriptionEn('');
            setLongDescriptionFr(''); setLongDescriptionEn(''); setIsManuallyUnavailable(false);
            setLongDescriptionFr(''); setLongDescriptionEn('');
            setExistingMainImage(null); setExistingGalleryImages([]);
            setMainImageFile(null); setGalleryImageFiles([]); setErrors({});
        }
    }, [initialData]);

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
                                onClick: () => handleMarkGalleryImageForDelete(imgUrl)
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

    const validateForm = () => {
        const newErrors = {};
        if (!id.trim()) newErrors.id = t('adminOtherFormErrorIdRequired', { default: 'ID (Slug) is required.' });
        else if (!/^[a-z0-9-]+$/.test(id)) newErrors.id = t('adminOtherFormErrorIdFormat', { default: 'ID must be lowercase letters, numbers, or hyphens.' });
        if (!name.trim()) newErrors.name = t('adminOtherFormErrorNameRequired', { default: 'Name is required.' });
        if (!shortDescriptionFr.trim()) newErrors.shortDescriptionFr = t('adminOtherFormErrorShortFrRequired', { default: 'Short Description (FR) is required.' });
        if (!shortDescriptionEn.trim()) newErrors.shortDescriptionEn = t('adminOtherFormErrorShortEnRequired', { default: 'Short Description (EN) is required.' });
        if (!longDescriptionFr.trim()) newErrors.longDescriptionFr = t('adminOtherFormErrorLongFrRequired', { default: 'Long Description (FR) is required.' });
        if (!longDescriptionEn.trim()) newErrors.longDescriptionEn = t('adminOtherFormErrorLongEnRequired', { default: 'Long Description (EN) is required.' });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (!validateForm()) return;

        const formData = new FormData();
        formData.append('id', id);
        formData.append('name', name);
        formData.append('shortDescription_fr', shortDescriptionFr);
        formData.append('shortDescription_en', shortDescriptionEn);
        formData.append('longDescription_fr', longDescriptionFr);
        formData.append('longDescription_en', longDescriptionEn);
        formData.append('isManuallyUnavailable', isManuallyUnavailable ? 'true' : 'false');
        if (mainImageFile) formData.append('image', mainImageFile);
        galleryImageFiles.forEach(file => formData.append('images', file));

        if (galleryImagesToDelete.length > 0) {
            formData.append('imagesToDelete', JSON.stringify(galleryImagesToDelete));
        }

        onSubmit(formData, initialData?._id);
    };

    const handleMainImageChange = (event) => {
        if (event.target.files && event.target.files[0]) setMainImageFile(event.target.files[0]);
    };
    const handleGalleryImagesChange = (event) => {
        if (event.target.files) setGalleryImageFiles(prev => [...prev, ...Array.from(event.target.files)]);
    };

    return (
        <form onSubmit={handleFormSubmit} noValidate>
            <div className="field">
                <label className="label" htmlFor="other-id">{t('adminOthersHeaderId', { default: 'ID (Slug)' })}</label>
                <div className="control">
                    <input className={`input ${errors.id ? 'is-danger' : ''}`} type="text" id="other-id" value={id} onChange={(e) => setId(e.target.value)} required disabled={!!initialData} placeholder={t('adminOtherFormIdPlaceholder', { default: 'e.g., unique-item-name' })} />
                </div>
                 {errors.id && <p className="help is-danger">{errors.id}</p>}
                 {initialData && <p className="help">{t('adminOtherFormIdEditHelp', { default: 'ID cannot be changed after creation.' })}</p>
                 }

            </div>

            <div className="field">
                <label className="label" htmlFor="other-name">{t('adminOthersHeaderName', { default: 'Name' })}</label>
                <div className="control">
                    <input className={`input ${errors.name ? 'is-danger' : ''}`} type="text" id="other-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder={t('adminOtherFormNamePlaceholder', { default: 'e.g., Toguna Cafe' })} />
                </div>
                {errors.name && <p className="help is-danger">{errors.name}</p>}
            </div>

            <div className="field"><label className="label" htmlFor="short-desc-fr">{t('adminOtherFormShortFr', { default: 'Short Description (FR)' })}</label><div className="control"><textarea className={`textarea ${errors.shortDescriptionFr ? 'is-danger' : ''}`} id="short-desc-fr" rows="3" value={shortDescriptionFr} onChange={(e) => setShortDescriptionFr(e.target.value)} required /></div>{errors.shortDescriptionFr && <p className="help is-danger">{errors.shortDescriptionFr}</p>}</div>
            <div className="field"><label className="label" htmlFor="short-desc-en">{t('adminOtherFormShortEn', { default: 'Short Description (EN)' })}</label><div className="control"><textarea className={`textarea ${errors.shortDescriptionEn ? 'is-danger' : ''}`} id="short-desc-en" rows="3" value={shortDescriptionEn} onChange={(e) => setShortDescriptionEn(e.target.value)} required /></div>{errors.shortDescriptionEn && <p className="help is-danger">{errors.shortDescriptionEn}</p>}</div>
            <div className="field"><label className="label" htmlFor="long-desc-fr">{t('adminOtherFormLongFr', { default: 'Long Description (FR)' })}</label><div className="control"><textarea className={`textarea ${errors.longDescriptionFr ? 'is-danger' : ''}`} id="long-desc-fr" rows="6" value={longDescriptionFr} onChange={(e) => setLongDescriptionFr(e.target.value)} required /></div>{errors.longDescriptionFr && <p className="help is-danger">{errors.longDescriptionFr}</p>}</div>
            <div className="field"><label className="label" htmlFor="long-desc-en">{t('adminOtherFormLongEn', { default: 'Long Description (EN)' })}</label><div className="control"><textarea className={`textarea ${errors.longDescriptionEn ? 'is-danger' : ''}`} id="long-desc-en" rows="6" value={longDescriptionEn} onChange={(e) => setLongDescriptionEn(e.target.value)} required /></div>{errors.longDescriptionEn && <p className="help is-danger">{errors.longDescriptionEn}</p>}</div>

            <div className="field">
                <div className="control">
                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={isManuallyUnavailable}
                            onChange={(e) => setIsManuallyUnavailable(e.target.checked)}
                        />
                            {' '} {t('adminOtherFormUnavailable', { default: 'Manually Mark as Unavailable' })}
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
                    <p className="help is-italic mb-2">{t('adminHouseFormImageSelected', { default: 'New image selected:'})} {mainImageFile.name}</p>
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
                                    {existingMainImage ? t('adminHouseFormChangeImageBtn', {default: 'Change Image…'}) : t('adminHouseFormChooseImageBtn', {default: 'Choose Image…'})} {/* Adjust key for OtherForm */}
                               </span>
                           </span>
                            <span className="file-name">
                               {mainImageFile ? mainImageFile.name : t('adminHouseFormNoFileChosen', {default: 'No file chosen'})}
                            </span>
                       </label>
                   </div>
               </div>
           </div>
            <div className="field">
                 <label className="label">{t('adminOtherFormGalleryImages', { default: 'Gallery Images' })}</label>

                 {existingGalleryImages.length > 0 && (
                    <div className="mb-3 p-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                        {existingGalleryImages.map((imgUrl, index) => {
                           const isMarkedForDelete = galleryImagesToDelete.includes(imgUrl);
                            return (
                               <div key={`existing-other-${index}-${imgUrl}`} style={{ position: 'relative', opacity: isMarkedForDelete ? 0.4 : 1, border: isMarkedForDelete ? '2px dashed hsl(348, 86%, 61%)' : 'none', padding: '2px' }}>
                                    <img src={imgUrl} alt={`Gallery ${index + 1}`} style={{ maxHeight: '80px', height: '80px', width: 'auto', display: 'block', borderRadius: '4px' }} />
                                    <button
                                        type="button"
                                        className={`delete is-small ${isMarkedForDelete ? 'has-background-grey-light' : 'has-background-danger'}`}
                                        style={{ position: 'absolute', top: '3px', right: '3px', opacity: 1, cursor: 'pointer' }}
                                        title={isMarkedForDelete ? t('adminOtherFormUndoDeleteImage', { default: 'Undo delete' }) : t('adminOtherFormDeleteImage', { default: 'Mark for delete' })}
                                        onClick={() => confirmDeleteGalleryImage(imgUrl)}
                                    >
                                    </button>
                               </div>
                           )})}
                    </div>
                 )}

                 {galleryImageFiles.length > 0 && (
                     <p className="help is-italic mb-2">{t('adminOtherFormGallerySelected', {count: galleryImageFiles.length, default: `${galleryImageFiles.length} new image(s) will be added:`})}</p>
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
                                <span className="file-label">{t('adminOtherFormChooseGalleryBtn', {default: 'Choose/Add Gallery Images…'})}</span>
                            </span>
                             <span className="file-name">
                                {galleryImageFiles.length > 0 ? t('adminOtherFormGalleryFileCount', { count: galleryImageFiles.length, default: `${galleryImageFiles.length} new files staged`}) : t('adminOtherFormNoFileChosen', {default: 'No file chosen'})}
                             </span>
                        </label>
                    </div>
                </div>
            </div>
            <div className="field mt-5">
                <div className="control">
                    <button type="submit" className={`button is-primary is-fullwidth ${isLoading ? 'is-loading' : ''}`} disabled={isLoading}>
                        {initialData ? t('adminOtherFormSubmitUpdate', { default: 'Update Item' }) : t('adminOtherFormSubmitCreate', { default: 'Create Item' })}
                    </button>
                </div>
            </div>
        </form>
    );
}


AdminOtherForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  isLoading: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

export default AdminOtherForm;