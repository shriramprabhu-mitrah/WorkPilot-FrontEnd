import { SignUp } from '../components/signup';
import { TaskCheckIconSvg, TeamIconSvg, AnalyticsIconSvg } from '@/src/assets/svgs';

export const SignUpTemplate = () => {
  return (
    <div className="templateContainer">
      <div className="leftPane">
        <SignUp />
      </div>

      <div className="rightPane">
        <div className="gridBackground"></div>

        <div className="featuresWrapper">
          <div className="featureCard">
            <div className="featureIcon">
              <TaskCheckIconSvg />
            </div>
            <div className="featureContent">
              <div className="featureTitle">Unlimited projects & tasks</div>
              <div className="featureDesc">
                Create as many boards and issues as your team needs.
              </div>
            </div>
          </div>

          <div className="featureCard">
            <div className="featureIcon">
              <TeamIconSvg />
            </div>
            <div className="featureContent">
              <div className="featureTitle">Real-time collaboration</div>
              <div className="featureDesc">
                Invite teammates and see changes live across the board.
              </div>
            </div>
          </div>

          <div className="featureCard">
            <div className="featureIcon">
              <AnalyticsIconSvg />
            </div>
            <div className="featureContent">
              <div className="featureTitle">Sprint analytics & reports</div>
              <div className="featureDesc">
                Velocity charts, burndowns, and team workload at a glance.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
