import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { confirmAlert } from 'react-confirm-alert';
import { fetchAdminArticles, deleteAdminArticle } from '../utils/api';
import './AdminCommon.css';

export default function AdminBlogPage({ t }) {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const loadArticles = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminArticles();
            setArticles(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch articles');
            toast.error(err.message || 'Failed to fetch articles');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadArticles();
    }, []);

    const handleDelete = (articleId, articleTitle) => {
        confirmAlert({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete the article "${articleTitle}"?`,
            buttons: [
                {
                    label: 'Yes, Delete',
                    onClick: async () => {
                        try {
                            await deleteAdminArticle(articleId);
                            toast.success('Article deleted successfully!');
                            loadArticles();
                        } catch (err) {
                            toast.error(err.message || 'Failed to delete article.');
                        }
                    }
                },
                { label: 'No' }
            ]
        });
    };

    if (isLoading) return <div className="loading-indicator">Loading...</div>;
    if (error) return <div className="notification is-danger">{error}</div>;

    return (
        <div className="admin-page-container">
            <h1 className="title is-3 admin-page-title">Manage Blog Articles</h1>
            <div className="admin-page-actions">
                <Link to="/admin/dashboard" className="button is-link is-light is-small">
                    ← Back to Dashboard
                </Link>
                <Link to="/admin/blog/new" className="button is-success add-button">
                    Add New Article
                </Link>
            </div>

            <div className="table-container">
                <table className="table is-striped is-hoverable is-fullwidth admin-table-responsive">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Slug</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article) => (
                            <tr key={article._id}>
                                <td data-label="Title">{article.title}</td>
                                <td data-label="Slug">{article.slug}</td>
                                <td data-label="Status">
                                    <span className={`tag ${article.isPublished ? 'is-success' : 'is-warning'}`}>
                                        {article.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td data-label="Created At">{new Date(article.createdAt).toLocaleDateString()}</td>
                                <td data-label="Actions">
                                    <div className="buttons are-small">
                                        <Link to={`/admin/blog/edit/${article._id}`} className="button is-link is-outlined">
                                            Edit
                                        </Link>
                                        <button onClick={() => handleDelete(article._id, article.title)} className="button is-danger is-outlined">
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}