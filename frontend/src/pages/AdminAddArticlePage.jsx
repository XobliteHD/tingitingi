import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminArticleForm from '../components/AdminArticleForm';
import { createAdminArticle } from '../utils/api';
import toast from 'react-hot-toast';
import './AdminCommon.css';

export default function AdminAddArticlePage({ t }) {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreate = async (formData) => {
        setIsLoading(true);
        try {
            await createAdminArticle(formData);
            toast.success(t('adminArticleCreateSuccess', { default: 'Article created successfully!' }));
            navigate('/admin/blog');
        } catch (error) {
            toast.error(error.message || t('adminArticleCreateError', { default: 'Failed to create article.' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page-container">
            <h1 className="title is-3 admin-page-title">{t('adminAddArticleTitle', { default: 'Add New Article' })}</h1>
            <div className="mb-4">
                <Link to="/admin/blog" className="button is-link is-light is-small">
                    ← {t('adminBackToBlog', { default: 'Back to Blog List' })}
                </Link>
            </div>
            <div className="admin-form-container">
                <AdminArticleForm onSubmit={handleCreate} isLoading={isLoading} t={t} />
            </div>
        </div>
    );
}