import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <section className="home-container">
      <div className="home-shell">
        <div className="home-hero">
          <div className="home-copy">
            <span className="home-badge">FitTrack</span>
            <h1 className="home-title">
              A clearer way to discover gyms, compare them, and choose with
              confidence.
            </h1>
            <p className="home-subtitle">
              Browse the best gyms in one place, read useful feedback from real
              users, and add your own experience when you find a spot worth
              sharing.
            </p>

            <div className="home-actions">
              <Link to="/gyms" className="home-btn home-btn-primary">
                Explore Gyms
              </Link>
              <Link to="/gyms/create" className="home-btn home-btn-secondary">
                Add a Gym
              </Link>
              <Link to="/profile" className="home-btn home-btn-ghost">
                View Profile
              </Link>
            </div>

            <div className="home-metrics" aria-label="Highlights">
              <div className="home-metric">
                <strong>Fast browse</strong>
                <span>See location, rating, and price at a glance.</span>
              </div>
              <div className="home-metric">
                <strong>Real reviews</strong>
                <span>Read honest feedback before you visit.</span>
              </div>
              <div className="home-metric">
                <strong>Easy sharing</strong>
                <span>Add gyms and reviews in a few clicks.</span>
              </div>
            </div>
          </div>

          <aside className="home-sidecard">
            <p className="home-sidecard-label">How it works</p>
            <div className="home-sidecard-image">
              <div className="home-sidecard-circle home-sidecard-circle-one" />
              <div className="home-sidecard-circle home-sidecard-circle-two" />
              <div className="home-sidecard-card home-sidecard-card-main">
                <span className="home-sidecard-kicker">Featured pick</span>
                <h2>Compare a gym before you join.</h2>
                <p>
                  Look at the list, open a gym, read the reviews, and make a
                  better decision for your routine.
                </p>
              </div>
            </div>

            <div className="home-sidecard-list">
              <div>
                <span>1</span>
                <p>Open gyms</p>
              </div>
              <div>
                <span>2</span>
                <p>Check details</p>
              </div>
              <div>
                <span>3</span>
                <p>Leave feedback</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="home-grid">
          <article className="home-feature home-feature-wide home-feature-warm">
            <span className="home-feature-tag">Explore</span>
            <h2>Pick a gym that fits your style</h2>
            <p>
              Find the right mix of location, membership price, and training
              vibe before you commit.
            </p>
          </article>

          <article className="home-feature home-feature-tall">
            <span className="home-feature-tag">Community</span>
            <h2>Built around useful reviews</h2>
            <p>
              See what members liked, what they missed, and what makes each gym
              stand out.
            </p>
          </article>

          <article className="home-feature home-feature-tall home-feature-accent">
            <span className="home-feature-tag">Contribute</span>
            <h2>Add a gym and help others decide</h2>
            <p>
              Create a gym listing or post a review so the next person can find
              a better fit faster.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Home;
