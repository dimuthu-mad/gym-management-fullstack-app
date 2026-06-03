import { Link } from "react-router-dom";
import heroImage from "../../assets/home-gym-hero.png";
import "./Home.css";

const DumbbellIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 8v8M8 6v12M16 6v12M20 8v8M8 12h8" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6-5.4-2.84-5.4 2.84 1.03-6-4.36-4.25 6.03-.88Z" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 19v-1a3 3 0 0 0-2.3-2.92M16 4.25a3 3 0 0 1 0 5.5" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s6-5.68 6-11a6 6 0 1 0-12 0c0 5.32 6 11 6 11Z" />
    <path d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m21 21-4.35-4.35M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
  </svg>
);

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 5h14v11H8l-3 3V5Z" />
    <path d="M8 9h8M8 12h5" />
  </svg>
);

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m4 20 4.5-1 10-10a2.12 2.12 0 0 0-3-3l-10 10L4 20Z" />
    <path d="m13.5 7.5 3 3" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M14 8.5h2V5h-2.7C10.35 5 9 6.82 9 9.2V11H6.5v3.6H9V21h4v-6.4h3l.5-3.6H13V9.75c0-.8.3-1.25 1-1.25Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8.2 3h7.6A5.2 5.2 0 0 1 21 8.2v7.6a5.2 5.2 0 0 1-5.2 5.2H8.2A5.2 5.2 0 0 1 3 15.8V8.2A5.2 5.2 0 0 1 8.2 3Z" />
    <path d="M16.7 7.35h.01" />
    <path d="M15.6 12a3.6 3.6 0 1 1-7.2 0 3.6 3.6 0 0 1 7.2 0Z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 4h4.7l4.05 5.5L17.55 4H21l-6.9 7.9L21.5 21h-4.7l-4.45-6.05L7 21H3.5l7.35-8.4L4 4Z" />
  </svg>
);

const stats = [
  { icon: <DumbbellIcon />, value: "250+", label: "Total Gyms" },
  { icon: <StarIcon />, value: "2.5K+", label: "Reviews" },
  { icon: <UsersIcon />, value: "10K+", label: "Members" },
  { icon: <PinIcon />, value: "15+", label: "Cities" },
];

const steps = [
  {
    icon: <SearchIcon />,
    title: "Discover Gyms",
    text: "Search gyms by location, category or name and find the right one.",
  },
  {
    icon: <MessageIcon />,
    title: "Read Reviews",
    text: "Read honest reviews from real members and compare ratings.",
  },
  {
    icon: <PencilIcon />,
    title: "Share Experiences",
    text: "Write your own reviews and help others make better choices.",
  },
];

const Home = () => {
  return (
    <main className="home-page">
      <section className="home-hero-section" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <h1 id="home-title" className="home-title">
            Find Your
            <span>Perfect Gym</span>
          </h1>
          <p className="home-subtitle">
            Compare gyms, read reviews, and choose the best place for your
            fitness journey.
          </p>
          <div className="home-hero-actions">
            <Link to="/gyms" className="home-primary-link">
              Explore Gyms
            </Link>
          </div>
        </div>

        <div className="home-hero-art" aria-hidden="true">
          <img src={heroImage} alt="" />
        </div>
      </section>

      <section className="home-stats" aria-label="FitTrack statistics">
        {stats.map((stat) => (
          <div className="home-stat" key={stat.label}>
            <span className="home-stat-icon">{stat.icon}</span>
            <span className="home-stat-value">{stat.value}</span>
            <span className="home-stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="home-how" id="about" aria-labelledby="how-title">
        <p className="home-section-kicker" id="how-title">
          How It Works
        </p>
        <div className="home-steps">
          {steps.map((step) => (
            <article className="home-step" key={step.title}>
              <span className="home-step-icon">{step.icon}</span>
              <div>
                <h2>{step.title}</h2>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-reviews-note" id="reviews" aria-label="Reviews">
        <p>
          Browse gym pages to compare member feedback, ratings, facilities, and
          prices before you choose your next training spot.
        </p>
      </section>

      <footer className="home-footer">
        <div className="home-footer-brand">
          <Link to="/" className="home-footer-logo">
            <span>FT</span>
            <strong>FitTrack</strong>
          </Link>
          <p>(c) 2026 FitTrack. All rights reserved.</p>
        </div>

        <div className="home-socials" aria-label="Social links">
          <a href="https://www.facebook.com/" aria-label="Facebook">
            <FacebookIcon />
          </a>
          <a href="https://www.instagram.com/" aria-label="Instagram">
            <InstagramIcon />
          </a>
          <a href="https://x.com/" aria-label="X">
            <XIcon />
          </a>
        </div>
      </footer>
    </main>
  );
};

export default Home;
