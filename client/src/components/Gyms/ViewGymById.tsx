import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "./ViewGymById.css";

type Review = {
  id: number;
  user: string;
  rating: number;
  comment: string;
};

type GymDetails = {
  id: number;
  name: string;
  location: string;
  description: string;
  rating: number;
  membershipPrice: number;
  reviews: Review[];
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState<number | "">("");
  const [editComment, setEditComment] = useState<string>("");

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const response = await axios.get<GymDetails>(
          `http://localhost:3000/gyms/${id}`,
          { withCredentials: true },
        );
        setGym(response.data);
        // attempt to fetch profile (may be unauthenticated)
        try {
          const p = await axios.get("http://localhost:3000/profile", {
            withCredentials: true,
          });
          setProfile(p.data);
        } catch (e) {
          setProfile(null);
        }
      } catch (err) {
        setError("Gym not found or failed to load.");
        setGym(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGym();
  }, [id]);

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

  return (
    <div className="view-gym-container">
      <div className="view-gym-card">
        <p className="vg-back">
          <Link to="/gyms" className="vg-back-link">
            ← Back to gyms
          </Link>
        </p>
        <h1 className="vg-title">{gym.name}</h1>

        <div className="vg-field">
          <span className="vg-label">Location:</span>
          <span className="vg-value">{gym.location}</span>
        </div>

        <div className="vg-field">
          <span className="vg-label">Description:</span>
          <span className="vg-value">{gym.description}</span>
        </div>

        <div className="vg-field">
          <span className="vg-label">Rating:</span>
          <span className="vg-value">{gym.rating}</span>
        </div>

        <div className="vg-field">
          <span className="vg-label">Membership Price:</span>
          <span className="vg-value">{gym.membershipPrice} SEK</span>
        </div>

        <h2 className="vg-subtitle">Reviews</h2>
        {gym.reviews.length === 0 ? (
          <p className="vg-no-reviews">No reviews yet.</p>
        ) : (
          <ul className="vg-reviews">
            {gym.reviews.map((review) => {
              const isOwner =
                profile &&
                (profile.name === review.user || profile.email === review.user);
              const isEditing = editingId === review.id;

              return (
                <li key={review.id} className="vg-review-item">
                  <div className="vr-header">
                    <strong>{review.user}</strong>
                    <span className="vr-rating">{` (${review.rating}/5)`}</span>
                    {isOwner && !isEditing && (
                      <button
                        className="vr-edit-btn"
                        onClick={() => {
                          setEditingId(review.id);
                          setEditRating(review.rating);
                          setEditComment(review.comment);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {isOwner && isEditing && (
                      <button
                        className="vr-cancel-btn"
                        onClick={() => {
                          setEditingId(null);
                          setEditRating("");
                          setEditComment("");
                        }}
                      >
                        Cancel
                      </button>
                    )}
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
                            {
                              withCredentials: true,
                            },
                          );
                          // update local state
                          setGym((g) => {
                            if (!g) return g;
                            return {
                              ...g,
                              reviews: g.reviews.map((r) =>
                                r.id === review.id ? resp.data : r,
                              ),
                            } as GymDetails;
                          });
                          setEditingId(null);
                          setEditRating("");
                          setEditComment("");
                        } catch (err: any) {
                          alert(
                            err?.response?.data?.error ||
                              "Failed to update review",
                          );
                        }
                      }}
                    >
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
                      <label>
                        Comment:
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                        />
                      </label>
                      <button type="submit">Save</button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ViewGymById;
