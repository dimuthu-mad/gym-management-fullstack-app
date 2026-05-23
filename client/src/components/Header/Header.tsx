import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Header.css";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        await axios.get("http://localhost:3000/profile", {
          withCredentials: true,
        });
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, []);

  return (
    <header className="app-header">
      <div className="header-inner">
        <NavLink to="/" className="brand-link">
          FitTrack
        </NavLink>

        <nav className="header-nav">
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
            to="/profile"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Profile
          </NavLink>

          <NavLink
            to="/gyms"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Gyms
          </NavLink>

          <NavLink
            to="/gyms/create"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Create Gym
          </NavLink>

          {checking ? null : isAuthenticated ? (
            <a
              href="http://localhost:3000/auth/logout"
              className="auth-btn auth-logout"
            >
              Logout
            </a>
          ) : (
            <a
              href="http://localhost:3000/login"
              className="auth-btn auth-login"
            >
              Login
            </a>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
