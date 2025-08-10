import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { confirmAlert } from 'react-confirm-alert';
import '../pages/AdminCommon.css'; // Assuming this is correct for general admin styling

function AdminHouseForm({ onSubmit, initialData = null, isLoading = false, t }) {
    const [id, setId] = useState(initialData?._id || '');
    const [name, setName] = useState(initialData?.name || '');
    const [shortDescriptionFr, setShortDescriptionFr] = useState(initialData?.shortDescription?.fr || '');
    const [shortDescriptionEn, setShortDescriptionEn] = useState(initialData?.shortDescription?.en || '');
    const [longDescriptionFr, setLongDescriptionFr] = useState(initialData?.longDescription?.fr || '');
    const [longDescriptionEn, setLongDescriptionEn] = useState(initialData?.longDescription?.en || '');
    const [presentationContentFr, setPresentationContentFr] = useState(initialData?.presentationContent?.fr || '');
    const [presentationContentEn, setPresentationContentEn] = useState(initialData?.presentationContent?.en || '');
    const [videos, setVideos] = useState(initialData?.virtualTourVideos || []);
    const [reviews, setReviews] = useState(initialData?.reviews || []);
    const [googlePhotosLink, setGooglePhotosLink] = useState(initialData?.googlePhotosLink || '');
    const [capacity, setCapacity] = useState(initialData?.capacity || '');
    const [isManuallyUnavailable, setIsManuallyUnavailable] = useState(initialData?.isManuallyUnavailable || false);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [galleryImageFiles, setGalleryImageFiles] = useState([]);
    const [existingMainImage, setExistingMainImage] = useState(initialData?.image || null);
    const [existingGalleryImages, setExistingGalleryImages] = useState(initialData?.images || []);
    const [galleryImagesToDelete, setGalleryImagesToDelete] = useState([]);
    const [errors, setErrors] = useState({});

    // CHANGED: displayPhotosUrls is now an empty array by default, or loaded from initialData
    const [displayPhotosUrls, setDisplayPhotosUrls] = useState([]);


    useEffect(() => {
        if (initialData) {
            setId(initialData._id || '');
            setName(initialData.name || '');
            setShortDescriptionFr(initialData.shortDescription?.fr || '');
            setShortDescriptionEn(initialData.shortDescription?.en || '');
            setLongDescriptionFr(initialData.longDescription?.fr || '');
            setLongDescriptionEn(initialData.longDescription?.en || '');
            setPresentationContentFr(initialData.presentationContent?.fr || '');
            setPresentationContentEn(initialData.presentationContent?.en || '');
            setVideos(initialData.virtualTourVideos || []);
            setReviews(initialData.reviews || []);
            setGooglePhotosLink(initialData.googlePhotosLink || '');
            setCapacity(initialData.capacity || '');
            setIsManuallyUnavailable(initialData.isManuallyUnavailable || false);
            setExistingMainImage(initialData.image || null);
            setExistingGalleryImages(initialData.images || []);
            setMainImageFile(null);
            setGalleryImageFiles([]);
            setGalleryImagesToDelete([]);
            setErrors({});

            // Initialize displayPhotosUrls from initialData
            setDisplayPhotosUrls(initialData.displayPhotosUrls || []);

        } else {
            // Reset for new house creation
            setId(''); setName(''); setShortDescriptionFr(''); setShortDescriptionEn('');
            setLongDescriptionFr(''); setLongDescriptionEn(''); setPresentationContentFr(''); setPresentationContentEn('');
            setVideos([]); setReviews([]); setGooglePhotosLink(''); setCapacity(''); setIsManuallyUnavailable(false);
            setExistingMainImage(null); setExistingGalleryImages([]);
            setMainImageFile(null); setGalleryImageFiles([]); setErrors({});
            setDisplayPhotosUrls([]); // Reset for new house to empty array
        }
    }, [initialData]);

    const handleVideoChange = (index, field, value) => {
        const newVideos = [...videos];
        newVideos[index][field] = value;
        setVideos(newVideos);
    };

    const addVideo = () => {
        setVideos([...videos, { title: '', videoId: '' }]);
    };

    const removeVideo = (index) => {
        setVideos(videos.filter((_, i) => i !== index));
    };

    const handleReviewChange = (index, field, value) => {
        const newReviews = [...reviews];
        newReviews[index][field] = value;
        setReviews(newReviews);
    };

    const handleReviewImageChange = (index, file) => {
        const newReviews = [...reviews];
        newReviews[index].newImageFile = file;
        newReviews[index].tempImageUrl = URL.createObjectURL(file);
        setReviews(newReviews);
    };

    const addReview = () => {
        setReviews([...reviews, { title: '', shortQuote: '', fullText: '', author: '', imageUrl: '' }]);
    };

    const removeReview = (index) => {
        setReviews(reviews.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!id.trim()) newErrors.id = t('adminHouseFormErrorIdRequired');
        else if (!/^[a-z0-9-]+$/.test(id)) newErrors.id = t('adminHouseFormErrorIdFormat');
        if (!name.trim()) newErrors.name = t('adminHouseFormErrorNameRequired');
        if (!shortDescriptionFr.trim()) newErrors.shortDescriptionFr = t('adminHouseFormErrorShortFrRequired');
        if (!shortDescriptionEn.trim()) newErrors.shortDescriptionEn = t('adminHouseFormErrorShortEnRequired');
        if (!longDescriptionFr.trim()) newErrors.longDescriptionFr = t('adminHouseFormErrorLongFrRequired');
        if (!longDescriptionEn.trim()) newErrors.longDescriptionEn = t('adminHouseFormErrorLongEnRequired');
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
                title: t('adminConfirmGalleryDeleteTitle'),
                message: t('adminConfirmGalleryDeleteMessage'),
                buttons: [
                    {
                        label: t('adminConfirmYesMarkDelete'),
                        onClick: () => handleMarkGalleryImageForDelete(imgUrl)
                    },
                    {
                        label: t('adminConfirmNo', { default: 'No, Cancel' }),
                        onClick: () => { }
                    }
                ],
                closeOnClickOutside: false,
            });
        }
    };

    // NEW HANDLER: For adding a display photo input field
    const addDisplayPhoto = () => {
        setDisplayPhotosUrls(prevUrls => [...prevUrls, '']);
    };

    // NEW HANDLER: For removing a display photo input field
    const removeDisplayPhoto = (index) => {
        setDisplayPhotosUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
    };

    // NEW HANDLER: For changing the value of a display photo URL
    const handleDisplayPhotoUrlChange = (index, value) => {
        const newDisplayPhotos = [...displayPhotosUrls];
        newDisplayPhotos[index] = value;
        setDisplayPhotosUrls(newDisplayPhotos);
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (!validateForm()) return;

        const formData = new FormData();
        if (!initialData) formData.append('id', id); // Only for create operation
        
        formData.append('name', name);
        formData.append('shortDescription_fr', shortDescriptionFr);
        formData.append('shortDescription_en', shortDescriptionEn);
        formData.append('longDescription_fr', longDescriptionFr);
        formData.append('longDescription_en', longDescriptionEn);
        formData.append('capacity', capacity);
        formData.append('isManuallyUnavailable', isManuallyUnavailable ? 'true' : 'false');
        formData.append('presentationContent_fr', presentationContentFr);
        formData.append('presentationContent_en', presentationContentEn);
        
        // Filter out empty video entries before stringifying
        formData.append('virtualTourVideos', JSON.stringify(videos.filter(v => v.title.trim() !== '' || v.videoId.trim() !== '')));

        const reviewsData = reviews.map(r => ({
            title: r.title,
            shortQuote: r.shortQuote,
            fullText: r.fullText,
            author: r.author,
            imageUrl: r.imageUrl // Keep existing imageUrl
        }));
        formData.append('reviewsData', JSON.stringify(reviewsData));

        reviews.forEach((review, index) => {
            if (review.newImageFile) { // Only append if a new file was selected
                formData.append(`reviewImage_${index}`, review.newImageFile);
            }
        });

        // NEW: Append display photos (filtered) and Google Photos link
        formData.append('displayPhotosUrls', JSON.stringify(displayPhotosUrls.filter(url => url.trim() !== ''))); // Filter empty URLs
        formData.append('googlePhotosLink', googlePhotosLink.trim()); // Trim whitespace

        if (mainImageFile) { // If a new main image file is selected
            formData.append('image', mainImageFile);
        }
        
        // Append new gallery image files
        galleryImageFiles.forEach(file => formData.append('images', file));
        
        // Append URLs of images to delete from gallery
        if (galleryImagesToDelete.length > 0) {
            formData.append('imagesToDelete', JSON.stringify(galleryImagesToDelete));
        }
        
        onSubmit(formData, initialData?._id); // Pass initialData._id for update API call
    };

    const handleMainImageChange = (event) => { if (event.target.files?.[0]) setMainImageFile(event.target.files[0]); };
    const handleGalleryImagesChange = (event) => { if (event.target.files) setGalleryImageFiles(prev => [...prev, ...Array.from(event.target.files)]); };

    return (
        <form onSubmit={handleFormSubmit} noValidate>
            <div className="field">
                <label className="label" htmlFor="house-id">{t('adminHousesHeaderId')}</label>
                <div className="control">
                    <input className={`input ${errors.id ? 'is-danger' : ''}`} type="text" id="house-id" value={id} onChange={(e) => setId(e.target.value)} required disabled={!!initialData} placeholder={t('adminHouseFormIdPlaceholder')} />
                </div>
                {errors.id && <p className="help is-danger">{errors.id}</p>}
                {initialData && <p className="help">{t('adminHouseFormIdEditHelp')}</p>}
            </div>
            <div className="field">
                <label className="label" htmlFor="house-name">{t('adminHousesHeaderName')}</label>
                <div className="control">
                    <input className={`input ${errors.name ? 'is-danger' : ''}`} type="text" id="house-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder={t('adminHouseFormNamePlaceholder')} />
                </div>
                {errors.name && <p className="help is-danger">{errors.name}</p>}
            </div>
            <div className="field">
                <label className="label" htmlFor="short-desc-fr">{t('adminHouseFormShortFr')}</label>
                <div className="control"><textarea className={`textarea ${errors.shortDescriptionFr ? 'is-danger' : ''}`} id="short-desc-fr" rows="3" value={shortDescriptionFr} onChange={(e) => setShortDescriptionFr(e.target.value)} required /></div>
                {errors.shortDescriptionFr && <p className="help is-danger">{errors.shortDescriptionFr}</p>}
            </div>
            <div className="field">
                <label className="label" htmlFor="short-desc-en">{t('adminHouseFormShortEn')}</label>
                <div className="control"><textarea className={`textarea ${errors.shortDescriptionEn ? 'is-danger' : ''}`} id="short-desc-en" rows="3" value={shortDescriptionEn} onChange={(e) => setShortDescriptionEn(e.target.value)} required /></div>
                {errors.shortDescriptionEn && <p className="help is-danger">{errors.shortDescriptionEn}</p>}
            </div>
            <div className="field">
                <label className="label" htmlFor="long-desc-fr">{t('adminHouseFormLongFr')}</label>
                <div className="control"><textarea className={`textarea ${errors.longDescriptionFr ? 'is-danger' : ''}`} id="long-desc-fr" rows="6" value={longDescriptionFr} onChange={(e) => setLongDescriptionFr(e.target.value)} required /></div>
                {errors.longDescriptionFr && <p className="help is-danger">{errors.longDescriptionFr}</p>}
            </div>
            <div className="field">
                <label className="label" htmlFor="long-desc-en">{t('adminHouseFormLongEn')}</label>
                <div className="control"><textarea className={`textarea ${errors.longDescriptionEn ? 'is-danger' : ''}`} id="long-desc-en" rows="6" value={longDescriptionEn} onChange={(e) => setLongDescriptionEn(e.target.value)} required /></div>
                {errors.longDescriptionEn && <p className="help is-danger">{errors.longDescriptionEn}</p>}
            </div>
            <hr />
            <h3 className="title is-5">{t('adminHouseFormPresentationSectionTitle', { default: 'House Presentation Page Content' })}</h3>
            <div className="field">
                <label className="label" htmlFor="presentation-fr">{t('adminHouseFormPresentationFr', { default: 'Presentation Content (FR)' })}</label>
                <div className="control"><textarea className="textarea" id="presentation-fr" rows="15" value={presentationContentFr} onChange={(e) => setPresentationContentFr(e.target.value)} /></div>
                <p className="help">{t('adminHouseFormPresentationHelp', { default: 'This is the detailed text for the house-specific presentation page.' })}</p>
            </div>
            <div className="field">
                <label className="label" htmlFor="presentation-en">{t('adminHouseFormPresentationEn', { default: 'Presentation Content (EN)' })}</label>
                <div className="control"><textarea className="textarea" id="presentation-en" rows="15" value={presentationContentEn} onChange={(e) => setPresentationContentEn(e.target.value)} /></div>
            </div>
            <hr />
            <div className="field">
                <label className="label">{t('adminHouseFormVirtualTourSection', { default: 'Virtual Tour Videos' })}</label>
                {videos.map((video, index) => (
                    <div key={index} className="box" style={{ marginBottom: '1rem' }}>
                        <div className="field">
                            <label className="label is-small">{t('adminHouseFormVideoTitle', { default: 'Video Title' })}</label>
                            <div className="control"><input className="input is-small" type="text" placeholder={t('adminHouseFormVideoTitlePlaceholder', { default: 'e.g., Main Living Area' })} value={video.title} onChange={(e) => handleVideoChange(index, 'title', e.target.value)} /></div>
                        </div>
                        <div className="field">
                            <label className="label is-small">{t('adminHouseFormYoutubeId', { default: 'YouTube Video ID' })}</label>
                            <div className="control"><input className="input is-small" type="text" placeholder={t('adminHouseFormYoutubePlaceholder', { default: 'e.g., dQw4w9WgXcQ' })} value={video.videoId} onChange={(e) => handleVideoChange(index, 'videoId', e.target.value)} /></div>
                        </div>
                        <button type="button" className="button is-danger is-small is-outlined" onClick={() => removeVideo(index)}>{t('remove', { default: 'Remove' })}</button>
                    </div>
                ))}
                <button type="button" className="button is-link is-light" onClick={addVideo}>+ {t('addVideo', { default: 'Add Video' })}</button>
            </div>
            <hr />

            {/* NEW SECTION: Dynamic Curated Display Photos */}
            <h3 className="title is-5">{t('displayPhotosSection', { default: 'Curated Display Photos for Slideshow' })}</h3>
            <p className="help">{t('displayPhotosHelp', { default: 'Enter URLs for photos to be shown in the main slideshow on the house details photo page.' })}</p>
            {displayPhotosUrls.map((url, index) => (
                <div className="field is-grouped" key={`display-photo-${index}`} style={{ marginBottom: '1rem' }}>
                    <div className="control is-expanded">
                        <input
                            className="input"
                            type="text"
                            placeholder={`${t('photoUrl', { default: 'Photo URL' })} ${index + 1}`}
                            value={url}
                            onChange={(e) => handleDisplayPhotoUrlChange(index, e.target.value)}
                        />
                    </div>
                    {url && ( // Show preview if URL exists
                        <div className="control">
                            <img src={url} alt={`Display Photo ${index + 1}`} style={{ height: '40px', width: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                    )}
                    <div className="control">
                        <button type="button" className="button is-danger is-outlined" onClick={() => removeDisplayPhoto(index)}>
                            {t('remove', { default: 'Remove' })}
                        </button>
                    </div>
                </div>
            ))}
            <div className="control">
                <button type="button" className="button is-info is-light" onClick={addDisplayPhoto}>
                    + {t('addPicture', { default: 'Add Picture' })}
                </button>
            </div>
            <hr />
            {/* END NEW SECTION */}

            <div className="field">
                <label className="label" htmlFor="google-photos-link">{t('adminHouseFormGooglePhotosLink', { default: 'Google Photos Album Link (Optional)' })}</label>
                <div className="control">
                    <input
                        className="input"
                        type="url"
                        id="google-photos-link"
                        value={googlePhotosLink}
                        onChange={(e) => setGooglePhotosLink(e.target.value)}
                        placeholder={t('adminHouseFormGooglePhotosLinkPlaceholder', { default: 'e.g., https://photos.app.goo.gl/YourAlbumID' })}
                    />
                </div>
                <p className="help">{t('adminHouseFormGooglePhotosLinkHelp', { default: 'Link to a Google Photos album for additional virtual tour pictures.' })}</p>
            </div>
            <hr />
            <div className="field">
                <label className="label">{t('adminHouseFormReviewsSection', { default: 'Guest Reviews' })}</label>
                {reviews.map((review, index) => (
                    <div key={index} className="box" style={{ marginBottom: '1rem' }}>
                        <div className="field">
                            <label className="label is-small">{t('adminHouseFormReviewTitle', { default: 'Review Title' })}</label>
                            <div className="control"><input className="input is-small" type="text" placeholder={t('adminHouseFormReviewTitlePlaceholder', { default: 'e.g., An Unforgettable Stay!' })} value={review.title || ''} onChange={(e) => handleReviewChange(index, 'title', e.target.value)} /></div>
                        </div>
                        <div className="field">
                            <label className="label is-small">{t('adminHouseFormReviewShortQuote', { default: 'Short Quote / Summary' })}</label>
                            <div className="control"><textarea className="textarea is-small" rows="3" placeholder={t('adminHouseFormReviewShortQuotePlaceholder', { default: 'A brief, catchy summary for the list page.' })} value={review.shortQuote || ''} onChange={(e) => handleReviewChange(index, 'shortQuote', e.target.value)} /></div>
                        </div>
                        <div className="field">
                            <label className="label is-small">{t('adminHouseFormReviewFullText', { default: 'Full Review Text' })}</label>
                            <div className="control"><textarea className="textarea is-small" rows="6" placeholder={t('adminHouseFormReviewFullTextPlaceholder', { default: 'The full, detailed review goes here.' })} value={review.fullText || ''} onChange={(e) => handleReviewChange(index, 'fullText', e.target.value)} /></div>
                        </div>
                        <div className="field">
                            <label className="label is-small">{t('adminHouseFormReviewAuthor')}</label>
                            <div className="control"><input className="input is-small" type="text" placeholder={t('adminHouseFormReviewAuthorPlaceholder', { default: 'e.g., Jane Doe' })} value={review.author} onChange={(e) => handleReviewChange(index, 'author', e.target.value)} /></div>
                        </div>
                        <div className="field">
                            <label className="label is-small">{t('adminHouseFormReviewImage', { default: 'Author Image (Optional)' })}</label>
                            {(review.imageUrl || review.tempImageUrl) && (<img src={review.tempImageUrl || review.imageUrl} alt={review.author || 'Reviewer'} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }} />)}
                            <div className="file is-small">
                                <label className="file-label">
                                    <input className="file-input" type="file" onChange={(e) => handleReviewImageChange(index, e.target.files[0])} />
                                    <span className="file-cta">
                                        <span className="file-icon"><i className="fas fa-upload"></i></span>
                                        <span className="file-label">{t('adminHouseFormChooseImageBtn')}</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                        <button type="button" className="button is-danger is-small is-outlined" onClick={() => removeReview(index)}>{t('remove', { default: 'Remove' })}</button>
                    </div>
                ))}
                <button type="button" className="button is-link is-light" onClick={addReview}>+ {t('addReview', { default: 'Add Review' })}</button>
            </div>
            <hr />
            <div className="field">
                <label className="label" htmlFor="house-capacity">{t('adminHouseFormCapacity')}</label>
                <div className="control"><input className={`input ${errors.capacity ? 'is-danger' : ''}`} type="number" id="house-capacity" min="1" step="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder={t('adminHouseFormCapacityPlaceholder')} /></div>
                {errors.capacity && <p className="help is-danger">{errors.capacity}</p>}
            </div>
            <div className="field">
                <div className="control"><label className="checkbox"><input type="checkbox" checked={isManuallyUnavailable} onChange={(e) => setIsManuallyUnavailable(e.target.checked)} />{' '} {t('adminHouseFormUnavailable')}</label></div>
            </div>
            <hr />
            <div className="field">
                <label className="label">{t('adminHouseFormMainImage')}</label>
                {existingMainImage && !mainImageFile && (<div className="mb-2"><img src={existingMainImage} alt="Current main" style={{ maxHeight: '100px', borderRadius: '4px' }} /></div>)}
                {mainImageFile && (<p className="mb-2">{t('adminHouseFormImageSelected')} {mainImageFile.name}</p>)}
                <div className="control">
                    <div className="file has-name is-fullwidth">
                        <label className="file-label">
                            <input className="file-input" type="file" name="image" accept="image/png, image/jpeg, image/webp" onChange={handleMainImageChange} />
                            <span className="file-cta">
                                <span className="file-icon"><i className="fas fa-upload"></i></span>
                                <span className="file-label">{existingMainImage ? t('adminHouseFormChangeImageBtn') : t('adminHouseFormChooseImageBtn')}</span>
                            </span>
                            <span className="file-name">{mainImageFile ? mainImageFile.name : t('adminHouseFormNoFileChosen')}</span>
                        </label>
                    </div>
                </div>
                {errors.mainImage && <p className="help is-danger">{errors.mainImage}</p>}
            </div>
            <div className="field">
                <label className="label">{t('adminHouseFormGalleryImages')}</label>
                {existingGalleryImages.length > 0 && (
                    <div className="mb-3 p-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                        {existingGalleryImages.map((imgUrl, index) => {
                            const isMarkedForDelete = galleryImagesToDelete.includes(imgUrl);
                            return (
                                <div key={`existing-${index}-${imgUrl}`} style={{ position: 'relative', opacity: isMarkedForDelete ? 0.4 : 1, border: isMarkedForDelete ? '2px dashed hsl(348, 86%, 61%)' : 'none', padding: '2px' }}>
                                    <img src={imgUrl} alt={`Gallery ${index}`} style={{ maxHeight: '80px', height: '80px', width: 'auto', display: 'block', borderRadius: '4px' }} />
                                    <button type="button" className={`delete is-small ${isMarkedForDelete ? 'has-background-grey-light' : 'has-background-danger'}`} style={{ position: 'absolute', top: '3px', right: '3px', opacity: 1, cursor: 'pointer' }} title={isMarkedForDelete ? t('adminHouseFormUndoDeleteImage', { default: 'Undo delete' }) : t('adminHouseFormDeleteImage', { default: 'Mark for delete' })} onClick={() => confirmDeleteGalleryImage(imgUrl)}></button>
                                </div>
                            )
                        })}
                    </div>
                )}
                {galleryImageFiles.length > 0 && (<p className="mb-2">{t('adminHouseFormGallerySelected', { count: galleryImageFiles.length })}</p>)}
                <div className="control">
                    <div className="file is-multiple has-name is-fullwidth">
                        <label className="file-label">
                            <input className="file-input" type="file" name="images" accept="image/png, image/jpeg, image/webp" multiple onChange={handleGalleryImagesChange} />
                            <span className="file-cta">
                                <span className="file-icon"><i className="fas fa-upload"></i></span>
                                <span className="file-label">{t('adminHouseFormChooseGalleryBtn')}</span>
                            </span>
                            <span className="file-name">{galleryImageFiles.length > 0 ? t('adminHouseFormGalleryFileCount', { count: galleryImageFiles.length }) : t('adminHouseFormNoFileChosen')}</span>
                        </label>
                    </div>
                </div>
            </div>
            <div className="field mt-5">
                <div className="control"><button type="submit" className={`button is-primary is-fullwidth ${isLoading ? 'is-loading' : ''}`} disabled={isLoading}>{initialData ? t('adminHouseFormSubmitUpdate') : t('adminHouseFormSubmitCreate')}</button></div>
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