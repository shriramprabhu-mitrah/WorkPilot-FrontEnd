'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSignup } from '../../hooks/useSignup';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TermsConditions } from '../../../../app/components/common/terms-coditions';
import { PrivacyPolicy } from '../../../../app/components/common/privacy';

export const SignUp = () => {
    const t = useTranslations();
    const { handleSignUp, isLoading, error } = useSignup();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [sidebarContent, setSidebarContent] = useState<'terms' | 'privacy' | null>(null);

    const passwordsMatch = password === confirmPwd;
    const isFormValid = name.trim() !== '' && email.trim() !== '' && password !== '' && confirmPwd !== '' && passwordsMatch && agreedToTerms;
    
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        try {
            await handleSignUp({ name, email, password, confirmPwd });
            router.push('/home');
        } catch  {
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

            <h1 className="signinTitle">Create your account</h1>
            <h2 className="subtitle">Get started free — no credit card required.</h2>

            <form onSubmit={onSubmit} style={{ width: '100%' }}>
                <div className="formGroup">
                    <label className="label" htmlFor="name">{t('fullName')}</label>
                    <div className="inputWrapper">
                        <svg className="inputIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <input
                            type="text"
                            id="name"
                            className="input"
                            placeholder="Jane Smith"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="formGroup">
                    <label className="label" htmlFor="email">{t('workEmail')}</label>
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
                            placeholder="8+ characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="formGroup" style={{ marginBottom: '32px' }}>
                    <label className="label" htmlFor="confirmPwd">{t('confirmPassword')}</label>
                    <div className="inputWrapper">
                        <svg className="inputIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <input
                            type="password"
                            id="confirmPwd"
                            className="input"
                            placeholder="Re-enter your password"
                            value={confirmPwd}
                            onChange={(e) => setConfirmPwd(e.target.value)}
                            required
                        />
                    </div>
                    {password && confirmPwd && !passwordsMatch && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>Passwords do not match</div>
                    )}
                </div>

                {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '24px', fontSize: '12px', color: '#6b7280' }}>
                    <input 
                        type="checkbox" 
                        id="terms" 
                        checked={agreedToTerms} 
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        style={{ marginTop: '2px', cursor: 'pointer' }}
                    />
                    <label htmlFor="terms" style={{ cursor: 'pointer' }}>
                        By continuing you agree to our{' '}
                        <button type="button" onClick={() => setSidebarContent('terms')} style={{ color: '#2563eb', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit' }}>Terms</button>{' '}
                        and{' '}
                        <button type="button" onClick={() => setSidebarContent('privacy')} style={{ color: '#2563eb', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit' }}>Privacy Policy</button>
                    </label>
                </div>

                <button type="submit" className="submitBtn" disabled={isLoading || !isFormValid}>
                    {isLoading ? 'Creating account...' : t('createAccount')}
                </button>
            </form>

            <div className="signupPrompt" style={{ marginTop: '24px' }}>
                Already have an account? 
                <Link href="/signin" className="signupLink">
                    Sign in
                </Link>
            </div>

            {sidebarContent && (
                <div className="sidebarOverlay" onClick={() => setSidebarContent(null)}>
                    <div className="sidebarContainer" onClick={(e) => e.stopPropagation()}>
                        <button className="sidebarCloseBtn" onClick={() => setSidebarContent(null)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                        {sidebarContent === 'terms' ? <TermsConditions /> : <PrivacyPolicy />}
                    </div>
                </div>
            )}
        </div>
    );
};