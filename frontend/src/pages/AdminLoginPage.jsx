// frontend/src/pages/AdminLoginPage.jsx

import React, { useState, } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminCommon.css';
import toast from 'react-hot-toast';
import { loginAdmin } from '../utils/api';

export default function AdminLoginPage({ t = (key) => key }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const loginData = { email, password };
            const data = await loginAdmin(loginData);
            localStorage.setItem('adminUserInfo', JSON.stringify(data));
            navigate('/admin/dashboard');
        } catch (err) {
            console.error("Login failed:", err);
             const errorMessage = err.message === "Unauthorized"
                 ? (t('adminLoginInvalidCredentials') || 'Invalid email or password')
                 : (err.message || t('adminLoginFailedError', { default: 'Login failed. Please try again.' }));
             setError(errorMessage);
             toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="hero is-fullheight">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <div className="column is-4 is-offset-4">
                        <h3 className="title has-text-grey">{t('adminLoginTitle') || 'Admin Login'}</h3>
                        <p className="subtitle has-text-grey">{t('adminLoginSubtitle') || 'Please login to proceed.'}</p>
                        <div className="box">
                            <figure className="avatar mb-5">
                            </figure>
                            <form onSubmit={handleLoginSubmit}>
                                <div className="field">
                                    <div className="control">
                                        <input
                                            className={`input is-large ${error ? 'is-danger' : ''}`}
                                            type="email"
                                            placeholder={t('formEmailPlaceholder') || 'Your Email'}
                                            autoFocus=""
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <div className="control">
                                        <input
                                            className={`input is-large ${error ? 'is-danger' : ''}`}
                                            type="password"
                                            placeholder={t('formPasswordPlaceholder') || 'Your Password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                {error && (
                                    <p className="help is-danger has-text-centered mb-4">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    className={`button is-block is-info is-large is-fullwidth ${isLoading ? 'is-loading' : ''}`}
                                    disabled={isLoading}
                                >
                                    {t('adminLoginButton') || 'Login'}
                                    <i className="fa fa-sign-in" aria-hidden="true"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}