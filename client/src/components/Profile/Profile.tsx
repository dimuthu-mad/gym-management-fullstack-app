import { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

type UserProfile = {
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
  role?: string;
  createdAt?: string;
  reviewCount?: number;
  scheduleCount?: number;
  favoriteGyms?: number;
};

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get<UserProfile>(
          "http://localhost:3000/profile",
          {
            withCredentials: true,
          },
        );
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">Loading...</div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card profile-empty">
          <p className="profile-empty-text">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="profile-main-title">My Profile</h1>
        <p className="profile-subtitle">
          View and manage your account information
        </p>
      </div>

      <div className="profile-grid">
        <aside className="profile-left card">
          <div className="profile-left-top">
            {user.picture ? (
              <div className="avatar-wrap">
                <img
                  src={user.picture}
                  alt="Profile"
                  className="profile-picture"
                />
                <button className="avatar-camera" aria-label="Change avatar">
                  📷
                </button>
              </div>
            ) : (
              <div className="avatar-wrap">
                <div className="profile-avatar">
                  {(user.given_name || user.family_name
                    ? user.given_name || user.family_name
                    : user.email || "?"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <button className="avatar-camera" aria-label="Change avatar">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="13"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                </button>
              </div>
            )}

            <h2 className="profile-name-large">
              {user.given_name || user.family_name
                ? `${user.given_name || ""} ${user.family_name || ""}`.trim()
                : "Unknown"}
            </h2>
            <div className="role-badge">
              {(user.role || "USER").toUpperCase()}
            </div>
          </div>

          <hr className="profile-separator" />

          <div className="profile-fields">
            <div className="field-row">
              <span className="field-icon" aria-hidden>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="2"
                    y="4"
                    width="20"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M22 6L12 13L2 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <div className="field-label">Email</div>
                <div className="field-value">{user.email}</div>
              </div>
            </div>

            <div className="field-row">
              <span className="field-icon" aria-hidden>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M16 2V6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 2V6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div>
                <div className="field-label">Member Since</div>
                <div className="field-value">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "-"}
                </div>
              </div>
            </div>

            <div className="field-row">
              <span className="field-icon" aria-hidden>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L20 6V11C20 16 16 20 12 22C8 20 4 16 4 11V6L12 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <div className="field-label">Role</div>
                <div className="field-value">{user.role || "User"}</div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn-edit">✎ Edit Profile</button>
          </div>
        </aside>

        <section className="profile-right">
          <div className="activity-card card">
            <div className="activity-title">Your Activity</div>
            <div className="activity-stats">
              <div className="stat">
                <div className="stat-icon">⭐</div>
                <div className="stat-number">{user.reviewCount ?? 0}</div>
                <div className="stat-label">Reviews Written</div>
              </div>
              <div className="stat">
                <div className="stat-icon">📆</div>
                <div className="stat-number">{user.scheduleCount ?? 0}</div>
                <div className="stat-label">Schedules Created</div>
              </div>
              <div className="stat">
                <div className="stat-icon">❤️</div>
                <div className="stat-number">{user.favoriteGyms ?? 0}</div>
                <div className="stat-label">Favorite Gyms Saved</div>
              </div>
            </div>
          </div>

          <div className="recent-card card">
            <div className="recent-title">Recent Activity</div>
            <div className="recent-empty">
              <div className="recent-illustration">📋</div>
              <div className="recent-text">No recent activity</div>
              <div className="recent-sub">
                Start exploring gyms and create schedules!
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
