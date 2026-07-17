'use client';

import  { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import '../../../styles/landing-page.css';

// Intersection Observer Hook for scroll animations
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);
};

export const LandingPage = () => {
  const router = useRouter();
  useScrollReveal();

  return (
    <div className="lp-page">
      {/* Header */}
      <header className="lp-header">
        <Image src="/images/mitrahsoft-logo.png" alt="MitrahSoft Logo" width={150} height={40} className="lp-logo" priority style={{ width: 'auto' }} />
        <div className="lp-header-nav">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how-it-works" className="lp-nav-link">How it Works</a>
          <a href="#pricing" className="lp-nav-link">Pricing</a>
          <button onClick={() => router.push('/signin')} className="lp-btn-outline">Sign In</button>
          <button onClick={() => router.push('/signup')} className="lp-btn-primary">Get Started</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="lp-hero">
        <h1 className="lp-hero-title animate-on-scroll">Manage Projects.<br/>Empower Teams.<br/><span style={{color: '#65a30d'}}>Deliver Beyond Expectations.</span></h1>
        <p className="lp-hero-subtitle animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
          MitrahSoft is an all-in-one project management platform that helps teams plan projects, organize backlogs, manage sprints, track tasks, and collaborate efficiently—all from a single workspace.
        </p>
        <div className="lp-hero-actions animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
          <button onClick={() => router.push('/signup')} className="lp-btn-accent">Start for Free</button>
          <button onClick={() => router.push('/signin')} className="lp-btn-outline">Sign In</button>
        </div>
        
        <div className="lp-hero-image-wrapper animate-on-scroll" style={{ transitionDelay: '0.3s' }}>
          <Image src="/images/hero-graphic.jpg" alt="Collaboration Graphic" width={1000} height={562} className="lp-hero-image" />
        </div>
      </section>

      {/* Trusted By */}
      <section className="lp-trusted animate-on-scroll">
        <h3 className="lp-trusted-title">Trusted by Modern Teams</h3>
        <p style={{ color: '#475569', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Helping startups, growing businesses, and enterprise teams streamline project execution and deliver successful outcomes.
        </p>
      </section>

      {/* Why Choose MitrahSoft */}
      <section id="features" className="lp-section">
        <div className="lp-section-header animate-on-scroll">
          <h2 className="lp-section-title">Why Choose MitrahSoft?</h2>
          <p className="lp-section-desc">MitrahSoft combines agile project management, real-time collaboration, and intelligent reporting to simplify software development and business operations.</p>
        </div>
        
        <div className="lp-grid-3">
          {[
            { title: 'Project Management', desc: 'Create and organize projects with customizable workflows.', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
            { title: 'Agile Boards', desc: 'Manage tasks effortlessly using Kanban and Scrum boards.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { title: 'Sprint Planning', desc: 'Plan, prioritize, and execute sprints with confidence.', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { title: 'Team Collaboration', desc: 'Assign work, comment on tasks, and stay connected.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { title: 'Reports & Analytics', desc: 'Gain insights with burndown charts, velocity reports, and workload analytics.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { title: 'Smart Notifications', desc: 'Never miss updates with instant notifications and reminders.', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' }
          ].map((feature, idx) => (
            <div key={idx} className="lp-feature-card animate-on-scroll" style={{ transitionDelay: `${idx * 0.1}s` }}>
              <div className="lp-feature-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="lp-feature-title">{feature.title}</h3>
              <p className="lp-feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="lp-section-alt">
        <div className="lp-section-inner">
          <div className="lp-section-header animate-on-scroll">
            <h2 className="lp-section-title">A Complete Workspace at Your Fingertips</h2>
            <p className="lp-section-desc">Track project progress, monitor sprint health, analyze workloads, and stay informed with a centralized dashboard built for productivity.</p>
          </div>
          <div className="lp-dashboard-preview animate-on-scroll">
            <Image src="/images/dashboard.jpg" alt="Dashboard Preview" width={1200} height={675} className="lp-dashboard-img" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="lp-section">
        <div className="lp-grid-2" style={{ alignItems: 'center' }}>
          <div className="animate-on-scroll">
            <h2 className="lp-section-title" style={{ textAlign: 'left', marginBottom: '40px' }}>How It Works</h2>
            <div className="lp-step-list">
              {[
                { title: 'Create your Workspace', desc: 'Set up your company workspace in minutes.' },
                { title: 'Create Projects', desc: 'Organize your work into projects and teams.' },
                { title: 'Plan Your Sprint', desc: 'Move backlog items into your sprint.' },
                { title: 'Track Progress', desc: 'Manage tasks using agile boards.' },
                { title: 'Deliver Successfully', desc: 'Generate reports and complete projects on time.' }
              ].map((step, idx) => (
                <div key={idx} className="lp-step">
                  <div className="lp-step-num">{idx + 1}</div>
                  <div className="lp-step-content">
                    <h4 className="lp-step-title">{step.title}</h4>
                    <p className="lp-step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="animate-on-scroll" style={{ background: '#f8fafc', padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1e293b' }}>Why Teams Love MitrahSoft</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              {['Simple and intuitive interface', 'Agile project management', 'Real-time collaboration', 'Faster project delivery', 'Secure cloud platform', 'Responsive on desktop and mobile', 'Scalable for growing teams'].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '16px' }}>
                  <svg style={{ color: '#65a30d', flexShrink: 0 }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="lp-section-alt">
        <div className="lp-section-inner">
          <div className="lp-section-header animate-on-scroll">
            <h2 className="lp-section-title">What Our Users Say</h2>
          </div>
          <div className="lp-grid-2">
            <div className="lp-testimonial-card animate-on-scroll">
              <p className="lp-testimonial-quote">&ldquo;MitrahSoft has transformed the way our team manages projects. Sprint planning is faster, collaboration is smoother, and reporting is effortless.&rdquo;</p>
              <div className="lp-testimonial-author">— Product Manager</div>
            </div>
            <div className="lp-testimonial-card animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
              <p className="lp-testimonial-quote">&ldquo;The dashboard provides everything we need in one place. It&lsquo;s intuitive, fast, and easy for the whole team to use.&rdquo;</p>
              <div className="lp-testimonial-author">— Engineering Lead</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="lp-section">
        <div className="lp-section-header animate-on-scroll">
          <h2 className="lp-section-title">Pricing</h2>
          <p className="lp-section-desc">Choose the plan that fits your team&lsquo;s needs.</p>
        </div>
        
        <div className="lp-pricing-grid">
          <div className="lp-pricing-card animate-on-scroll">
            <h3 className="lp-pricing-name">Free</h3>
            <p className="lp-pricing-desc">Perfect for individuals</p>
            <ul className="lp-pricing-features">
              {['Up to 3 Projects', 'Basic Boards', 'Team Collaboration'].map((f, i) => (
                <li key={i} className="lp-pricing-feature">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => router.push('/signup')} className="lp-btn-outline" style={{ width: '100%' }}>Start Free</button>
          </div>

          <div className="lp-pricing-card popular animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
            <div className="lp-pricing-badge">Most Popular</div>
            <h3 className="lp-pricing-name">Professional</h3>
            <p className="lp-pricing-desc">Ideal for growing teams</p>
            <ul className="lp-pricing-features">
              {['Unlimited Projects', 'Sprint Planning', 'Reports', 'Team Management', 'Priority Support'].map((f, i) => (
                <li key={i} className="lp-pricing-feature">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => router.push('/signup')} className="lp-btn-accent" style={{ width: '100%' }}>Get Started</button>
          </div>

          <div className="lp-pricing-card animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
            <h3 className="lp-pricing-name">Enterprise</h3>
            <p className="lp-pricing-desc">Built for large organizations</p>
            <ul className="lp-pricing-features">
              {['Custom Integrations', 'SSO', 'Advanced Security', 'Dedicated Support', 'Analytics'].map((f, i) => (
                <li key={i} className="lp-pricing-feature">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {f}
                </li>
              ))}
            </ul>
            <button className="lp-btn-outline" style={{ width: '100%' }}>Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="lp-cta-section animate-on-scroll">
        <h2 className="lp-cta-title">Ready to Build Better Projects?</h2>
        <p className="lp-cta-desc">Join thousands of professionals who trust MitrahSoft to manage projects, collaborate with teams, and deliver results beyond expectations.</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={() => router.push('/signup')} className="lp-btn-accent">Start Free</button>
          <button className="lp-btn-outline" style={{ background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>Contact Sales</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-grid">
          <div>
            <Image src="/images/mitrahsoft-logo.png" alt="MitrahSoft Logo" width={150} height={40} className="lp-footer-logo" style={{ width: 'auto' }} />
            <p className="lp-footer-tagline">Project Management Made Simple. Collaboration Made Powerful. Beyond eXpectation.</p>
          </div>
          <div>
            <h4 className="lp-footer-col-title">Product</h4>
            <ul className="lp-footer-links">
              <li><a href="#" className="lp-footer-link">Features</a></li>
              <li><a href="#" className="lp-footer-link">Pricing</a></li>
              <li><a href="#" className="lp-footer-link">Integrations</a></li>
              <li><a href="#" className="lp-footer-link">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h4 className="lp-footer-col-title">Resources</h4>
            <ul className="lp-footer-links">
              <li><a href="#" className="lp-footer-link">Documentation</a></li>
              <li><a href="#" className="lp-footer-link">Help Center</a></li>
              <li><a href="#" className="lp-footer-link">Blog</a></li>
              <li><a href="#" className="lp-footer-link">Community</a></li>
            </ul>
          </div>
          <div>
            <h4 className="lp-footer-col-title">Company</h4>
            <ul className="lp-footer-links">
              <li><a href="#" className="lp-footer-link">About Us</a></li>
              <li><a href="#" className="lp-footer-link">Careers</a></li>
              <li><a href="#" className="lp-footer-link">Contact</a></li>
              <li><a href="/privacy-policy" className="lp-footer-link">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="lp-footer-col-title">Connect</h4>
            <ul className="lp-footer-links">
              <li><a href="#" className="lp-footer-link">LinkedIn</a></li>
              <li><a href="#" className="lp-footer-link">GitHub</a></li>
              <li><a href="#" className="lp-footer-link">Twitter</a></li>
              <li><a href="#" className="lp-footer-link">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="lp-footer-bottom">
          &copy; {new Date().getFullYear()} MitrahSoft. All rights reserved.
        </div>
      </footer>
    </div>
  );
};