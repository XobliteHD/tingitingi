import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicArticles } from '../utils/api';
import './AdminCommon.css'; // For the main container
import './BlogListPage.css'; // Import our new dedicated CSS

export default function BlogListPage({ t }) {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadArticles = async () => {
            setIsLoading(true);
            try {
                const data = await fetchPublicArticles();
                setArticles(data);
            } catch (err) {
                setError(err.message || 'Failed to load articles.');
            } finally {
                setIsLoading(false);
            }
        };
        loadArticles();
    }, []);

    if (isLoading) return <div className="loading-indicator">{t('loading', { default: 'Loading...' })}</div>;
    if (error) return <div className="notification is-danger">{error}</div>;

    return (
        <div className="admin-page-container">
            <h1 className="title is-2 has-text-centered" style={{ color: 'var(--title-color)' }}>{t('blogTitle', { default: 'Our Blog' })}</h1>
            
            {articles.length === 0 ? (
                <p className="has-text-centered">{t('noArticlesFound', { default: 'No articles have been published yet.' })}</p>
            ) : (
                <div className="blog-cards-container">
                    {articles.map((article) => (
                        <div key={article.slug} className="blog-card-wrapper">
                            <div className="blog-card">
                                {article.mainImage && (
                                    <div className="blog-card-image">
                                        <Link to={`/blog/${article.slug}`}>
                                            <img src={article.mainImage} alt={article.title} />
                                        </Link>
                                    </div>
                                )}
                                <div className="blog-card-content">
                                    <h3 className="blog-card-title">
                                        <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                                    </h3>
                                    <p className="blog-card-meta">by {article.author}</p>
                                    <p className="blog-card-summary">{article.summary}</p>
                                    <time className="blog-card-date" dateTime={article.createdAt}>
                                        {new Date(article.createdAt).toLocaleDateString()}
                                    </time>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}