import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "./ViewGymById.css";

type Review = {
  id: number;
  user: string;
  rating: number;
  comment: string;
  createdAt?: string;
};

type GymDetails = {
  id: number;
  name: string;
  location: string;
  description: string;
  rating: number;
  membershipPrice: number;
  reviews: Review[];
  createdAt?: string;
  members?: number;
};

const ViewGymById = () => {
  const { id } = useParams();
  const [gym, setGym] = useState<GymDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    id?: number;
    name?: string;
    email?: string;
  } | null>(null);

  const [showWriteForm, setShowWriteForm] = useState(false);
  const [newRating, setNewRating] = useState<number | "">("");
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState<number | "">("");
  const [editComment, setEditComment] = useState("");

  const reviewsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchGym = async () => {
      try {
        const r = await axios.get<GymDetails>(
          `http://localhost:3000/gyms/${id}`,
          { withCredentials: true },
        );
        if (!mounted) return;
        setGym(r.data);
      } catch (e) {
        if (!mounted) return;
        setError("Gym not found or failed to load.");
        setGym(null);
      } finally {
        if (mounted) setLoading(false);
      }

      // try to fetch profile
      try {
        const p = await axios.get("http://localhost:3000/profile", {
          withCredentials: true,
        });
        if (mounted) setProfile(p.data);
      } catch (e) {
        if (mounted) setProfile(null);
      }
    };

    fetchGym();
    return () => {
      mounted = false;
    };
  }, [id]);

  const avatarColors = ["#E6F6EE", "#F6E6FA", "#FFF5E6", "#E8F3FF"];

  const features = [
    "WiFi",
    "Showers",
    "Parking",
    "Locker Rooms",
    "Sauna",
    "24/7 Access",
  ];

  const renderStars = (n: number) => {
    const full = Math.round(n);
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < full ? "star-filled" : "star-empty"}>
        ★
      </span>
    ));
  };

  if (loading)
    return (
      <div className="view-gym-container">
        <div className="view-gym-card">Loading gym details...</div>
      </div>
    );

  if (error)
    return (
      <div className="view-gym-container">
        <div className="view-gym-card vg-error">{error}</div>
      </div>
    );

  if (!gym)
    return (
      <div className="view-gym-container">
        <div className="view-gym-card">Gym not found.</div>
      </div>
    );

  const reviewCount = gym.reviews?.length ?? 0;
  const addedDate = gym.createdAt
    ? new Date(gym.createdAt).toLocaleDateString()
    : "May 12, 2026";

  return (
    <div className="view-gym-container">
      <div className="view-gym-card">
        <p className="vg-back">
          <Link to="/gyms" className="vg-back-link">
            ← Back to gyms
          </Link>
        </p>

        <div className="vg-header-row">
          <div className="vg-left-col">
            <h1 className="vg-title">{gym.name}</h1>
            <div className="vg-location">📍 {gym.location}</div>
            <p className="vg-desc">{gym.description}</p>
            <div className="vg-price">💳 {gym.membershipPrice} SEK / month</div>
          </div>

          <div className="vg-right-col">
            <div className="vg-rating-block">
              <div className="vg-rating-row">
                <span className="star-filled">★</span>
                <span className="vg-rating-val">{gym.rating?.toFixed(1)}</span>
                <button
                  className="vg-count-link"
                  onClick={() => {
                    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {reviewCount} reviews
                </button>
              </div>
              <button
                className="vg-write-btn"
                onClick={() => {
                  if (!profile) {
                    alert("Please log in to write a review.");
                    return;
                  }
                  setShowWriteForm((s) => !s);
                }}
              >
                Write Review
              </button>
            </div>
          </div>
        </div>

        <div className="vg-summary-box">
          <div className="summary-col">
            <div className="summary-title">Opening Hours</div>
            <div className="summary-line">
              <div>Mon - Fri</div>
              <div>05:00 - 23:00</div>
            </div>
            <div className="summary-line">
              <div>Sat</div>
              <div>07:00 - 21:00</div>
            </div>
            <div className="summary-line">
              <div>Sun</div>
              <div>08:00 - 20:00</div>
            </div>
          </div>
          <div className="summary-col summary-features-col">
            <div className="summary-title">Features</div>
            <div className="summary-features">
              {features.map((f) => (
                <span key={f} className="feature-chip">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        <h2 className="vg-subtitle">Reviews ({reviewCount})</h2>

        {showWriteForm && (
          <form
            className="vg-write-form"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const resp = await axios.post(
                  `http://localhost:3000/gyms/${gym.id}/reviews`,
                  { rating: Number(newRating), comment: newComment },
                  { withCredentials: true },
                );
                // basic client-side validation already done, but double-check
                if (!newComment || newRating === "" || Number.isNaN(Number(newRating))) {
                  alert("Please provide a rating (1-5) and a comment.");
                  return;
                }
                setGym((g) =>
                  g ? { ...g, reviews: [resp.data, ...g.reviews] } : g,
                );
                setNewRating("");
                setNewComment("");
                setShowWriteForm(false);
              } catch (err: any) {
                console.error("Create review error:", err);
                const serverMsg = err?.response?.data || err?.message || err;
                alert(
                  serverMsg?.error || serverMsg?.message || JSON.stringify(serverMsg) || "Failed to post review",
                );
              }
            }}
          >
            <div className="vg-write-row">
              <input
                type="number"
                min={1}
                max={5}
                placeholder="Rating"
                value={newRating as any}
                onChange={(e) =>
                  setNewRating(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <button className="vg-save-btn" type="submit">
                Post Review
              </button>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your review"
            />
          </form>
        )}

        <div ref={reviewsRef} />

        <ul className="vg-reviews">
          {gym.reviews.map((review, idx) => {
            const date = review.createdAt
              ? new Date(review.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString();
            const color = avatarColors[idx % avatarColors.length];
            const isOwner =
              profile &&
              (profile.name === review.user || profile.email === review.user);
            const isEditing = editingId === review.id;
            return (
              <li key={review.id} className="vg-review-item">
                <div className="vr-left">
                  <div className="vr-avatar" style={{ background: color }}>
                    {review.user?.[0] ?? "U"}
                  </div>
                </div>
                <div className="vr-body">
                  <div className="vr-top">
                    <div>
                      <strong>{review.user}</strong>
                      <div className="vr-date">{date}</div>
                    </div>
                    <div className="vr-right-top">
                      <div className="vr-stars-block">
                        <div className="vr-stars">
                          {renderStars(review.rating)}
                        </div>
                        <div className="vr-score">{review.rating}/5</div>
                      </div>
                      {!isEditing && isOwner && (
                        <button
                          className="vr-edit-btn-inline"
                          onClick={() => {
                            setEditingId(review.id);
                            setEditRating(review.rating);
                            setEditComment(review.comment);
                          }}
                          aria-label="Edit review"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width={18}
                            height={18}
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="vr-comment">{review.comment}</div>
                  )}

                  {isEditing && (
                    <form
                      className="vr-edit-form"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          const body: any = {
                            rating: Number(editRating),
                            comment: editComment,
                          };
                          const resp = await axios.patch(
                            `http://localhost:3000/reviews/${review.id}`,
                            body,
                            { withCredentials: true },
                          );
                          setGym((g) =>
                            g
                              ? ({
                                  ...g,
                                  reviews: g.reviews.map((r) =>
                                    r.id === review.id ? resp.data : r,
                                  ),
                                } as GymDetails)
                              : g,
                          );
                          setEditingId(null);
                          setEditRating("");
                          setEditComment("");
                        } catch (err: any) {
                          console.error('Update review error:', err);
                          const serverMsg = err?.response?.data || err?.message || err;
                          alert(serverMsg?.error || serverMsg?.message || JSON.stringify(serverMsg) || 'Failed to update review');
                        }
                      }}
                    >
                      <div className="vr-edit-row">
                        <label>
                          Rating:
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={editRating as any}
                            onChange={(e) =>
                              setEditRating(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </label>
                        <button type="submit" className="vr-save-btn">
                          Save
                        </button>
                        <button
                          type="button"
                          className="vr-cancel-btn"
                          onClick={() => {
                            setEditingId(null);
                            setEditRating("");
                            setEditComment("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                      <label>
                        Comment:
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                        />
                      </label>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ViewGymById;
