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
          <div className="summary-col">
            <div className="summary-title">Features</div>
            <div className="summary-features">
              WiFi • Showers • Parking • Locker Rooms • Sauna • 24/7 Access
            </div>
          </div>
          <div className="summary-col">
            <div className="summary-title">Added</div>
            <div>{addedDate}</div>
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
                setGym((g) =>
                  g ? { ...g, reviews: [resp.data, ...g.reviews] } : g,
                );
                setNewRating("");
                setNewComment("");
                setShowWriteForm(false);
              } catch (err: any) {
                alert(err?.response?.data?.error || "Failed to post review");
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
                    <div className="vr-stars-block">
                      <div className="vr-stars">
                        {renderStars(review.rating)}
                      </div>
                      <div className="vr-score">{review.rating}/5</div>
                    </div>
                  </div>
                  <div className="vr-comment">{review.comment}</div>
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
