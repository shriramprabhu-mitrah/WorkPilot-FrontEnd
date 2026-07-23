'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { PrivacyPolicy } from '@/src/app/components/common/privacy';
import { CloseIconSvg } from '@/src/assets/svgs';
import '../../../styles/landing-page.css';
import {
  CheckIconSvg,
  ProjectMgmtIconSvg,
  AgileBoardIconSvg,
  SprintIconSvg,
  CollaborationIconSvg,
  ReportsIconSvg,
  NotificationsIconSvg,
  TrackrLogoSvg,
} from '@/src/assets/svgs';
import { colors } from '@/src/styles/colors';
import { WpButton } from '@/src/app/components/common/button';

// Intersection Observer Hook for scroll animations
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

export const LandingPage = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const router = useRouter();

  useScrollReveal();

  return (
    <div className="lp-page">
      {/* Header */}
      <header className="lp-header">
        {/* <Image
          src="/images/WorkPilot-logo.png"
          alt="WorkPilot Logo"
          width={150}
          height={40}
          className="lp-logo"
          priority
          style={{ width: 'auto' }}
        /> */}
        <div className="logo mt-5">
          <div className="logoIcon">
            <TrackrLogoSvg />
          </div>
          WorkPilot
        </div>
        <div className="lp-header-nav">
          <a href="#features" className="lp-nav-link">
            Features
          </a>
          <a href="#how-it-works" className="lp-nav-link">
            How it Works
          </a>
          <a href="#pricing" className="lp-nav-link">
            Pricing
          </a>
          <WpButton
            variant="secondary"
            onClick={() => router.push('/signin')}
            className="lp-btn-outline"
          >
            Sign In
          </WpButton>
          <WpButton onClick={() => router.push('/signup')} className="lp-btn-primary">
            Get Started
          </WpButton>
        </div>
      </header>

      {/* Hero Section */}
      <section className="lp-hero">
        <h1 className="lp-hero-title animate-on-scroll">
          Manage Projects.
          <br />
          Empower Teams.
          <br />
          <span style={{ color: colors.primaryFocus }}>Deliver Beyond Expectations.</span>
        </h1>
        <p className="lp-hero-subtitle animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
          WorkPilot is an all-in-one project management platform that helps teams plan projects,
          organize backlogs, manage sprints, track tasks, and collaborate efficiently—all from a
          single workspace.
        </p>
        <div className="lp-hero-actions animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
          <WpButton
            onClick={() => router.push('/signup')}
            className="lp-btn-accent"
            style={{ backgroundColor: colors.primaryFocus }}
          >
            Start for Free
          </WpButton>
          <WpButton
            variant="secondary"
            onClick={() => router.push('/signin')}
            className="lp-btn-outline"
          >
            Sign In
          </WpButton>
        </div>

        <div
          className="lp-hero-image-wrapper animate-on-scroll"
          style={{ transitionDelay: '0.3s' }}
        >
          <Image
            src="/images/hero-graphic.jpg"
            alt="Collaboration Graphic"
            width={1000}
            height={562}
            className="lp-hero-image"
          />
        </div>
      </section>

      {/* Trusted By */}
      <section className="lp-trusted animate-on-scroll">
        <h3 className="lp-trusted-title">Trusted by Modern Teams</h3>
        <p
          style={{ color: colors.slate600, maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}
        >
          Helping startups, growing businesses, and enterprise teams streamline project execution
          and deliver successful outcomes.
        </p>
      </section>

      {/* Why Choose WorkPilot */}
      <section id="features" className="lp-section">
        <div className="lp-section-header animate-on-scroll">
          <h2 className="lp-section-title">Why Choose WorkPilot?</h2>
          <p className="lp-section-desc">
            WorkPilot combines agile project management, real-time collaboration, and intelligent
            reporting to simplify software development and business operations.
          </p>
        </div>

        <div className="lp-grid-3">
          {[
            {
              title: 'Project Management',
              desc: 'Create and organize projects with customizable workflows.',
              icon: <ProjectMgmtIconSvg />,
            },
            {
              title: 'Agile Boards',
              desc: 'Manage tasks effortlessly using Kanban and Scrum boards.',
              icon: <AgileBoardIconSvg />,
            },
            {
              title: 'Sprint Planning',
              desc: 'Plan, prioritize, and execute sprints with confidence.',
              icon: <SprintIconSvg />,
            },
            {
              title: 'Team Collaboration',
              desc: 'Assign work, comment on tasks, and stay connected.',
              icon: <CollaborationIconSvg />,
            },
            {
              title: 'Reports & Analytics',
              desc: 'Gain insights with burndown charts, velocity reports, and workload analytics.',
              icon: <ReportsIconSvg />,
            },
            {
              title: 'Smart Notifications',
              desc: 'Never miss updates with instant notifications and reminders.',
              icon: <NotificationsIconSvg />,
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="lp-feature-card animate-on-scroll"
              style={{ transitionDelay: `${idx * 0.1}s` }}
            >
              <div className="lp-feature-icon">{feature.icon}</div>
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
            <p className="lp-section-desc">
              Track project progress, monitor sprint health, analyze workloads, and stay informed
              with a centralized dashboard built for productivity.
            </p>
          </div>
          <div className="lp-dashboard-preview animate-on-scroll">
            <Image
              src="/images/dashboard-landing.png"
              alt="Dashboard Preview"
              width={1200}
              height={675}
              className="lp-dashboard-img"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="lp-section">
        <div className="lp-grid-2" style={{ alignItems: 'center' }}>
          <div className="animate-on-scroll">
            <h2 className="lp-section-title" style={{ textAlign: 'left', marginBottom: '40px' }}>
              How It Works
            </h2>
            <div className="lp-step-list">
              {[
                {
                  title: 'Create your Workspace',
                  desc: 'Set up your company workspace in minutes.',
                },
                { title: 'Create Projects', desc: 'Organize your work into projects and teams.' },
                { title: 'Plan Your Sprint', desc: 'Move backlog items into your sprint.' },
                { title: 'Track Progress', desc: 'Manage tasks using agile boards.' },
                {
                  title: 'Deliver Successfully',
                  desc: 'Generate reports and complete projects on time.',
                },
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
          <div
            className="animate-on-scroll"
            style={{
              background: colors.slate50,
              padding: '40px',
              borderRadius: '20px',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '24px',
                color: colors.slate800,
              }}
            >
              Why Teams Love WorkPilot
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                textAlign: 'left',
              }}
            >
              {[
                'Simple and intuitive interface',
                'Agile project management',
                'Real-time collaboration',
                'Faster project delivery',
                'Secure cloud platform',
                'Responsive on desktop and mobile',
                'Scalable for growing teams',
              ].map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: colors.slate600,
                    fontSize: '16px',
                  }}
                >
                  <span style={{ color: colors.primaryFocus, flexShrink: 0 }}>
                    <CheckIconSvg />
                  </span>
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
              <p className="lp-testimonial-quote">
                &ldquo;WorkPilot has transformed the way our team manages projects. Sprint planning
                is faster, collaboration is smoother, and reporting is effortless.&rdquo;
              </p>
              <div className="lp-testimonial-author">— Product Manager</div>
            </div>
            <div
              className="lp-testimonial-card animate-on-scroll"
              style={{ transitionDelay: '0.1s' }}
            >
              <p className="lp-testimonial-quote">
                &ldquo;The dashboard provides everything we need in one place. It&lsquo;s intuitive,
                fast, and easy for the whole team to use.&rdquo;
              </p>
              <div className="lp-testimonial-author">— Engineering Lead</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment the Pricing for fututre purpose */}
      {/* <section id="pricing" className="lp-section">
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
                  <CheckIconSvg /> {f}
                </li>
              ))}
            </ul>
            <WpButton
              variant="secondary"
              onClick={() => router.push('/signup')}
              className="lp-btn-outline"
              fullWidth
            >
              Start Free
            </WpButton>
          </div>

          <div
            className="lp-pricing-card popular animate-on-scroll"
            style={{ transitionDelay: '0.1s' }}
          >
            <div className="lp-pricing-badge">Most Popular</div>
            <h3 className="lp-pricing-name">Professional</h3>
            <p className="lp-pricing-desc">Ideal for growing teams</p>
            <ul className="lp-pricing-features">
              {[
                'Unlimited Projects',
                'Sprint Planning',
                'Reports',
                'Team Management',
                'Priority Support',
              ].map((f, i) => (
                <li key={i} className="lp-pricing-feature">
                  <CheckIconSvg /> {f}
                </li>
              ))}
            </ul>
            <WpButton onClick={() => router.push('/signup')} className="lp-btn-accent" fullWidth>
              Get Started
            </WpButton>
          </div>

          <div className="lp-pricing-card animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
            <h3 className="lp-pricing-name">Enterprise</h3>
            <p className="lp-pricing-desc">Built for large organizations</p>
            <ul className="lp-pricing-features">
              {[
                'Custom Integrations',
                'SSO',
                'Advanced Security',
                'Dedicated Support',
                'Analytics',
              ].map((f, i) => (
                <li key={i} className="lp-pricing-feature">
                  <CheckIconSvg /> {f}
                </li>
              ))}
            </ul>
            <WpButton variant="secondary" className="lp-btn-outline" fullWidth>
              Contact Sales
            </WpButton>
          </div>
        </div>
      </section> */}

      {/* Call to Action */}
      <section className="lp-cta-section animate-on-scroll">
        <h2 className="lp-cta-title">Ready to Build Better Projects?</h2>
        <p className="lp-cta-desc">
          Join thousands of professionals who trust WorkPilot to manage projects, collaborate with
          teams, and deliver results beyond expectations.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <WpButton onClick={() => router.push('/signup')} className="lp-btn-accent">
            Start Free
          </WpButton>
          <WpButton variant="secondary" className="lp-btn-outline">
            Contact Sales
          </WpButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-grid">
          <div>
            {/* <Image
              src="/images/mitrahsoft-logo.png"
              alt="WorkPilot Logo"
              width={150}
              height={40}
              className="lp-footer-logo"
              style={{ width: 'auto' }}
            /> */}
            <div className="logo">
              <div className="logoIcon">
                <TrackrLogoSvg />
              </div>
              WorkPilot
            </div>
            <p className="lp-footer-tagline">
              Project Management Made Simple. Collaboration Made Powerful. Beyond eXpectation.
            </p>
            <section id="contact">
              <h2 className=" mt-2 text-sm text-gray-500">Contact Us</h2>
              <div className="flex flex-col gap-1">
                <div>
                  <span className=" text-sm text-gray-500">Email</span>
                  <a className="ml-2 text-sm text-blue-600 hover:underline">
                    support@workpilot.com
                  </a>
                </div>
                <div>
                  <span className=" text-sm text-gray-500">Phone</span>
                  <span className="ml-2 text-sm text-blue-600">12345678</span>
                </div>
              </div>
            </section>
          </div>
          <div>
            <h4 className="lp-footer-col-title">Product</h4>
            <ul className="lp-footer-links">
              <li>
                <a href="#" className="lp-footer-link">
                  Features
                </a>
              </li>
              {/* <li>
                <a href="#" className="lp-footer-link">
                  Pricing
                </a>
              </li> */}
              <li>
                <a href="#" className="lp-footer-link">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="lp-footer-link">
                  Roadmap
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="lp-footer-col-title">Resources</h4>
            <ul className="lp-footer-links">
              <li>
                <a href="#" className="lp-footer-link">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="lp-footer-link">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="lp-footer-link">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="lp-footer-link">
                  Community
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="lp-footer-col-title">Company</h4>
            <ul className="lp-footer-links">
              <li>
                <a href="#" className="lp-footer-link">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="lp-footer-link">
                  Careers
                </a>
              </li>
              <li>
                <a href="#contact" className="lp-footer-link">
                  Contact
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="lp-footer-link"
                  onClick={() => setShowPrivacy(true)}
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>
          {/* <div>
            <h4 className="lp-footer-col-title">Connect</h4>
            <ul className="lp-footer-links">
              <li>
                <a href="#" className="lp-footer-link">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="lp-footer-link">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="lp-footer-link">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="lp-footer-link">
                  Facebook
                </a>
              </li>
            </ul>
          </div> */}
        </div>
        <div className="lp-footer-bottom">
          &copy; {new Date().getFullYear()} WorkPilot. All rights reserved.
        </div>
      </footer>
      {showPrivacy && (
        <div className="sidebarOverlay" onClick={() => setShowPrivacy(false)}>
          <div className="sidebarContainer" onClick={(e) => e.stopPropagation()}>
            <WpButton
              type="button"
              variant="ghost"
              size="sm"
              className="sidebarCloseBtn"
              onClick={() => setShowPrivacy(false)}
            >
              <CloseIconSvg />
            </WpButton>
            <PrivacyPolicy />
          </div>
        </div>
      )}
    </div>
  );
};
