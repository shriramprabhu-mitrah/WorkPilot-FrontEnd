import { useTranslations } from 'next-intl';
import { SignIn } from '../components/signin';

export const SignInTemplate = () => {
    const t=useTranslations();
    return (
        <div className="templateContainer">
            <div className="leftPane">
                <SignIn />
            </div>
            
            <div className="rightPane">
                <div className="gridBackground"></div>
                
                <div className="contentWrapper">
                    <div className="iconWrapper">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 20V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18 20V4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 20V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    <h2 className="templateTitle">{t('shipProjects')}</h2>
                    
                    <p className="description">
                        {t('trackerContent')}
                    </p>
                    
                    <div className="statsContainer">
                        <div className="statCard">
                            <div className="statValue">240+</div>
                            <div className="statLabel">{t('projects')}</div>
                        </div>
                        <div className="statCard">
                            <div className="statValue">18k</div>
                            <div className="statLabel">{t('teams')}</div>
                        </div>
                        <div className="statCard">
                            <div className="statValue">1.2M</div>
                            <div className="statLabel">{t('tasksDone')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};