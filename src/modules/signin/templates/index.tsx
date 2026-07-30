import { SignIn } from '../components/signin';
import { BarChartIconSvg } from '@/src/assets/svgs';

export const SignInTemplate = () => {
  return (
    <div className="templateContainer">
      <div className="leftPane">
        <SignIn />
      </div>

      <div className="rightPane">
        <div className="gridBackground"></div>

        <div className="contentWrapper">
          <div className="iconWrapper">
            <BarChartIconSvg />
          </div>

          <h2 className="templateTitle">Ship projects faster, together</h2>

          <p className="description">
            Trackr brings your team&apos;s work together — sprint planning, kanban boards, and
            real-time analytics in one place.
          </p>

          <div className="statsContainer">
            <div className="statCard">
              <div className="statValue">240+</div>
              <div className="statLabel">Projects</div>
            </div>
            <div className="statCard">
              <div className="statValue">18k</div>
              <div className="statLabel">Teams</div>
            </div>
            <div className="statCard">
              <div className="statValue">1.2M</div>
              <div className="statLabel">Tasks done</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
