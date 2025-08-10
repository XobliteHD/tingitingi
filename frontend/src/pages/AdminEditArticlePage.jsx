import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminArticleForm from '../components/AdminArticleForm';
import { fetchAdminArticleDetails, updateAdminArticle } from '../utils/api';
import toast from 'react-hot-toast';
import './AdminCommon.css';

export default function AdminEditArticlePage({ t }) {
    const [article, setArticle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { articleId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const loadArticle = async () => {
            setIsLoading(true);
            try {
                const data = await fetchAdminArticleDetails(articleId);
                setArticle(data);
            } catch (error) {
                toast.error(error.message || t('adminArticleFetchError', { default: 'Failed to fetch article details.' }));
            } finally {
                setIsLoading(false);
            }
        };
        if (articleId) {
            loadArticle();
        } else {
            toast.error(t('adminArticleNotFound', { default: 'Article not found.' }));
            navigate('/admin/blog');
        }
    }, [articleId, navigate, t]);

    const handleUpdate = async (formData) => {
        setIsSubmitting(true);
        try {
            await updateAdminArticle(articleId, formData);
            toast.success(t('adminArticleUpdateSuccess', { default: 'Article updated successfully!' }));
            navigate('/admin/blog');
        } catch (error) {
            toast.error(error.message || t('adminArticleUpdateError', { default: 'Failed to update article.' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="loading-indicator">{t('loading', { default: 'Loading...' })}</div>;
    if (!article) return (
        <div className="admin-page-container">
            <h1 className="title is-3 admin-page-title">{t('adminEditArticleTitle', { default: 'Edit Article' })}</h1>
            <div className="notification is-danger">{t('adminArticleNotFound', { default: 'Article not found.' })}</div>
             <div className="mb-4">
                <Link to="/admin/blog" className="button is-link is-light is-small">
                    ← {t('adminBackToBlog', { default: 'Back to Blog List' })}
                </Link>
            </div>
        </div>
    );


    return (
        <div className="admin-page-container">
            <h1 className="title is-3 admin-page-title">{t('adminEditArticleTitle', { default: 'Edit Article' })}</h1>
            <div className="mb-4">
                <Link to="/admin/blog" className="button is-link is-light is-small">
                    ← {t('adminBackToBlog', { default: 'Back to Blog List' })}
                </Link>
            </div>
            <div className="admin-form-container">
                <AdminArticleForm onSubmit={handleUpdate} initialData={article} isLoading={isSubmitting} t={t} />
            </div>
        </div>
    );
}