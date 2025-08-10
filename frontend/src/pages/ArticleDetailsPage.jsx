import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPublicArticleDetails } from '../utils/api';
import './AdminCommon.css';
import './ArticleDetailsPage.css';

export default function ArticleDetailsPage({ t }) {
    const [article, setArticle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { slug } = useParams();

    useEffect(() => {
        const loadArticle = async () => {
            setIsLoading(true);
            try {
                const data = await fetchPublicArticleDetails(slug);
                setArticle(data);
            } catch (err) {
                setError(err.message || 'Article not found.');
            } finally {
                setIsLoading(false);
            }
        };
        loadArticle();
    }, [slug]);
    
    if (isLoading) return <div className="loading-indicator">{t('loading', { default: 'Loading...' })}</div>;
    if (error) return <div className="notification is-danger">{error}</div>;
    if (!article) return null;

    return (
        <div className="admin-page-container">
            <div className="article-details-container">
                <h1 className="title is-1 article-title">{article.title}</h1>
                <p className="subtitle is-5 article-meta">
                    Published on {new Date(article.createdAt).toLocaleDateString()} by {article.author}
                </p>
                
                {article.mainImage && (
                    <figure className="image is-16by9 article-main-image">
                        <img src={article.mainImage} alt={article.title} />
                    </figure>
                )}
                
                <div className="content article-content" dangerouslySetInnerHTML={{ __html: article.content }}></div>

                <div className="has-text-centered" style={{ marginTop: '3rem' }}>
                    <Link to="/blog" className="button is-link is-light">
                        ← {t('backToBlog', { default: 'Back to Blog' })}
                    </Link>
                </div>
            </div>
        </div>
    );
}