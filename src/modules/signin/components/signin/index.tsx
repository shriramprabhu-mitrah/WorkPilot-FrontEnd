'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSignin } from '../../hooks/useSignin';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export const SignIn = () => {
    const t =useTranslations();
    const { handleSignIn, isLoading, error } = useSignin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const router = useRouter();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await handleSignIn({ email, password, rememberMe });
            router.push('/home');
        } catch  {
            // Error is handled by the hook and exposed via error state
        }
    };

    return (
        <div className="signinContainer">
            <div className="logo">
                <div className="logoIcon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '100%', height: '100%', padding: '4px'}}>
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
                        <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                {t('trackr')}
            </div>

            <h1 className="signinTitle">{t('welcomeBack')}</h1>
            <h2 className="subtitle">{t('signContent')}</h2>

            <form onSubmit={onSubmit} style={{ width: '100%' }}>
                <div className="formGroup">
                    <label className="label" htmlFor="email">{t('email')}</label>
                    <div className="inputWrapper">
                        <svg className="inputIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <input
                            type="email"
                            id="email"
                            className="input"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="formGroup">
                    <label className="label" htmlFor="password">{t('password')}</label>
                    <div className="inputWrapper">
                        <svg className="inputIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <input
                            type="password"
                            id="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="optionsRow">
                    <label className="rememberMe">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        {t('remember')}
                    </label>
                    <Link href="/forgot-password" className="forgotPassword">
                        {t('forgotPassword')}
                    </Link>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

                <button type="submit" className="submitBtn" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <div className="divider">or continue with</div>

            <button type="button" className="googleBtn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.72 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                    <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.72 17.57C14.74 18.23 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.11H2.17V16.96C3.98 20.57 7.7 23 12 23Z" fill="#34A853"/>
                    <path d="M5.84 14.11C5.62 13.45 5.49 12.74 5.49 12C5.49 11.26 5.62 10.55 5.84 9.89V7.04H2.17C1.43 8.52 1 10.2 1 12C1 13.8 1.43 15.48 2.17 16.96L5.84 14.11Z" fill="#FBBC05"/>
                    <path d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.02L19.35 3.87C17.45 2.09 14.97 1 12 1C7.7 1 3.98 3.43 2.17 7.04L5.84 9.89C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EA4335"/>
                </svg>
                {t('continueGoogle')}
            </button>

            <div className="signupPrompt">
                {t('haveAccount')}
                <Link href="/signup" className="signupLink">
                    {t('createAcc')}
                </Link>
            </div>
        </div>
    );
};
