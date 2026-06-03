import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Header.css";
import { API_URL, LOGIN_URL } from "../../config";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timeoutId = window.setTimeout(resolve, ms);
      });

    const check = async () => {
      setChecking(true);

      for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
          const response = await axios.get(`${API_URL}/profile`, {
            withCredentials: true,
          });

          if (cancelled) return;
          setIsAuthenticated(true);
          setIsAdmin(response.data.role === "ADMIN");
          setChecking(false);
          return;
        } catch {
          if (cancelled) return;
          if (attempt < 3) {
            await sleep(250);
            continue;
          }

          setIsAuthenticated(false);
          setIsAdmin(false);
          setChecking(false);
        }
      }
    };

    check();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [location.pathname]);

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-group">
          <NavLink to="/" className="brand-link">
            <span className="brand-mark" aria-hidden="true">
              FT
            </span>
            <span className="brand-name">FitTrack</span>
          </NavLink>
        </div>

        <div className="header-desktop-nav">
          <nav className="header-nav" aria-label="Primary navigation">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
              end
            >
              Home
            </NavLink>

            <NavLink
              to="/gyms"
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              Gyms
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/schedules"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "nav-link-active" : ""}`
                }
              >
                Schedules
              </NavLink>
            )}

            {isAuthenticated && isAdmin && (
              <NavLink
                to="/gyms/create"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "nav-link-active" : ""}`
                }
              >
                Create Gym
              </NavLink>
            )}

            {isAuthenticated && (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `nav-link nav-link-icon ${isActive ? "nav-link-active" : ""}`
                }
                aria-label="Profile"
                title="Profile"
              >
                <svg
                  className="nav-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M20 21a8 8 0 0 0-16 0"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
                <span className="nav-text">Profile</span>
              </NavLink>
            )}
          </nav>

          <div className="header-actions">
            {checking ? (
              <span className="auth-skeleton" aria-hidden="true" />
            ) : isAuthenticated ? (
              <a
                href={`${API_URL}/auth/logout`}
                className="auth-btn auth-logout"
              >
                Logout
              </a>
            ) : (
              <a href={LOGIN_URL} className="auth-btn auth-login">
                Login / Sign Up
              </a>
            )}
          </div>
        </div>

        <button
          type="button"
          className={`menu-toggle ${menuOpen ? "menu-toggle-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <svg
            className="menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d={menuOpen ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}
          id="mobile-menu"
        >
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <NavLink
              to="/"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `mobile-link ${isActive ? "mobile-link-active" : ""}`
              }
              end
            >
              Home
            </NavLink>

            <NavLink
              to="/gyms"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `mobile-link ${isActive ? "mobile-link-active" : ""}`
              }
            >
              Gyms
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/schedules"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `mobile-link ${isActive ? "mobile-link-active" : ""}`
                }
              >
                Schedules
              </NavLink>
            )}

            {isAuthenticated && isAdmin && (
              <NavLink
                to="/gyms/create"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `mobile-link ${isActive ? "mobile-link-active" : ""}`
                }
              >
                Create Gym
              </NavLink>
            )}

            <NavLink
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `mobile-link mobile-link-profile ${isActive ? "mobile-link-active" : ""}`
              }
              aria-label="Profile"
            >
              <span>Profile</span>
              <svg
                className="nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M20 21a8 8 0 0 0-16 0"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </NavLink>
          </nav>

          <div className="mobile-meta">
            {checking ? (
              <span className="auth-skeleton" aria-hidden="true" />
            ) : isAuthenticated ? (
              <a
                href={`${API_URL}/auth/logout`}
                className="auth-btn auth-logout"
                onClick={() => setMenuOpen(false)}
              >
                Logout
              </a>
            ) : (
              <a
                href={LOGIN_URL}
                className="auth-btn auth-login"
                onClick={() => setMenuOpen(false)}
              >
                Login / Sign Up
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
