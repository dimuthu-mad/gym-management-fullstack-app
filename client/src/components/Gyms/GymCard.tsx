import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./GymCard.css";

type Review = { id: number; user: string; rating: number; comment: string };
type Gym = {
  id: number;
  name: string;
  location: string;
  description?: string;
  rating?: number;
  membershipPrice?: number;
  imageUrl?: string;
  reviews?: Review[];
};

const GymCard = ({ gym }: { gym: Gym }) => {
  const img = `https://images.unsplash.com/photo-1554284126-aa88f22d8d6b?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=${gym.id}`;
  // Prefer the actual reviews array length when available, otherwise fetch the
  // count from the backend endpoint `/gyms/:id/reviewscount`.
  const [fetchedCount, setFetchedCount] = useState<number | null>(null);

  useEffect(() => {
    if (Array.isArray(gym.reviews)) return; // already have reviews, no need to fetch
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/gyms/${gym.id}/reviewscount`,
          {
            credentials: "include",
          },
        );
        if (!mounted) return;
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data && typeof data.count === "number") {
          setFetchedCount(data.count);
        }
      } catch (err) {
        // ignore network errors for now
      }
    })();
    return () => {
      mounted = false;
    };
  }, [gym.id, gym.reviews]);

  const reviewsCount = Array.isArray(gym.reviews)
    ? gym.reviews.length
    : (fetchedCount ?? 0);

  return (
    <article className="gc-card">
      <div
        className="gc-media"
        style={{ backgroundImage: `url(${gym.imageUrl ?? img})` }}
      >
        <button className="gc-fav" aria-label={`Favorite ${gym.name}`}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M12 21s-7.2-4.6-9.2-7.2C.9 11.7 3 6.8 7 6.8c2.1 0 3.5 1.3 5 3.1 1.5-1.8 2.9-3.1 5-3.1 4 0 6.1 4.9 4.2 7.1C19.2 16.4 12 21 12 21z"
              stroke="#ef4444"
              strokeWidth="1.2"
              fill="#fff"
            />
          </svg>
        </button>
      </div>

      <div className="gc-body">
        <div className="gc-header">
          <h3 className="gc-title">{gym.name}</h3>
          <div className="gc-rating">
            <span className="gc-star">★</span>
            <span className="gc-rating-val">
              {(gym.rating ?? 4.9).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="gc-location">
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="#9CA3AF"
            />
          </svg>
          <span>{gym.location}</span>
        </div>

        <div className="gc-tags">
          <span className="gc-tag">💪 Strength</span>
          <span className="gc-tag">💓 Cardio</span>
          <span className="gc-tag">🧘 Yoga</span>
        </div>

        <div className="gc-price">
          From{" "}
          <span className="gc-price-amt">{gym.membershipPrice ?? 499} SEK</span>{" "}
          / month
        </div>

        <div className="gc-review-count">
          <Link to={`/gyms/${gym.id}`} className="gc-reviews">
            {reviewsCount} reviews
          </Link>
        </div>

        <div className="gc-actions">
          <Link to={`/gyms/${gym.id}`} className="gc-btn gc-primary">
            View Details
          </Link>
          {/* <Link to={`/gyms/${gym.id}/reviews`} className="gc-btn gc-primary">
            Write Review
          </Link> */}
        </div>
      </div>
    </article>
  );
};

export default GymCard;
