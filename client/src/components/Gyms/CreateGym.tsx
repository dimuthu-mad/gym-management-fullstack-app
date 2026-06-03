import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./CreateGym.css";
import { API_URL, LOGIN_URL } from "../../config";

const CreateGym = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState<number | "">("");
  const [membershipPrice, setMembershipPrice] = useState<number | "">("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_URL}/profile`, {
          withCredentials: true,
        });
        setIsAuthenticated(true);
        setIsAdmin(res?.data?.role === "ADMIN");
      } catch {
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      setError("You must be logged in to create a gym.");
      return;
    }

    if (!name || !location) {
      setError("Name and location are required.");
      return;
    }

    const payload = {
      name,
      location,
      description,
      rating: typeof rating === "number" ? rating : undefined,
      membershipPrice:
        typeof membershipPrice === "number" ? membershipPrice : undefined,
      imageUrl: imageUrl || undefined,
    };

    try {
      setLoading(true);
      await axios.post(`${API_URL}/gyms`, payload, {
        withCredentials: true,
      });
      navigate("/gyms");
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        setIsAuthenticated(false);
        setError("You must be logged in to create a gym.");
      } else if (status === 403) {
        setError(err?.response?.data?.error || "Admin access required");
      } else {
        setError(err?.response?.data?.error || "Failed to create gym");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-gym-container">
      <div className="create-gym-card">
        <div className="cg-header">
          <h2 className="cg-title">Create Gym</h2>
          <p className="cg-subtitle">
            Add a new gym to help others discover and train at the best places.
          </p>
        </div>
        {error && <div className="cg-error">{error}</div>}

        {authChecking ? (
          <p>Checking sign-in status...</p>
        ) : !isAuthenticated ? (
          <div className="cg-signin">
            <h3>Sign in required</h3>
            <p>You need to be signed in to create a gym.</p>
            <div className="cg-actions">
              <a className="cg-btn cg-btn-primary" href={LOGIN_URL}>
                Sign in
              </a>
              <Link className="cg-btn cg-btn-ghost" to="/gyms">
                Back to gyms
              </Link>
            </div>
          </div>
        ) : !isAdmin ? (
          <div className="cg-signin">
            <h3>Admin access required</h3>
            <p>You must be an admin to create a gym.</p>
            <div className="cg-actions">
              <Link className="cg-btn cg-btn-ghost" to="/gyms">
                Back to gyms
              </Link>
            </div>
          </div>
        ) : (
          <form className="cg-form" onSubmit={handleSubmit}>
            <div className="cg-field">
              <label className="cg-label">
                <span className="cg-icon">🏷️</span>Name *
              </label>
              <input
                className="cg-input"
                placeholder="e.g. Pulse Fitness"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="cg-field">
              <label className="cg-label">
                <span className="cg-icon">📍</span>Location *
              </label>
              <input
                className="cg-input"
                placeholder="e.g. Stockholm, Sweden"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="cg-field cg-field-description">
              <label className="cg-label">
                <span className="cg-icon">📄</span>Description
              </label>
              <textarea
                className="cg-textarea"
                placeholder="Describe your gym, facilities, and what makes it special..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
              <div className="cg-desc-count">{description.length} / 500</div>
            </div>

            <div className="cg-field">
              <label className="cg-label">
                <span className="cg-icon">⭐</span>Rating (1–5) *
              </label>
              <div className="cg-stars" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`cg-star ${typeof rating === "number" && rating >= s ? "active" : ""}`}
                    onClick={() => setRating(s)}
                    aria-checked={typeof rating === "number" && rating === s}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    </svg>
                  </button>
                ))}
              </div>
              <div className="cg-hint">Select a rating from 1 to 5 stars</div>
            </div>

            <div className="cg-field">
              <label className="cg-label">
                <span className="cg-icon">💳</span>Membership Price (SEK) *
              </label>
              <div className="price-input">
                <span className="currency">kr</span>
                <input
                  className="cg-input cg-input-price"
                  type="number"
                  placeholder="e.g. 399"
                  value={membershipPrice}
                  onChange={(e) =>
                    setMembershipPrice(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  min={0}
                />
              </div>
            </div>

            <div className="cg-field">
              <label className="cg-label">
                <span className="cg-icon">🖼️</span>Image URL
              </label>
              <input
                className="cg-input"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {imageUrl && (
                <div className="cg-img-preview">
                  <img
                    src={imageUrl}
                    alt="preview"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
            </div>

            <div className="cg-actions">
              <Link className="cg-btn cg-btn-ghost" to="/gyms">
                Cancel
              </Link>
              <button
                className="cg-btn cg-btn-primary"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <span className="btn-icon">🏋️</span>Create Gym
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateGym;
