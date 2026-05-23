import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Gyms.css";

type gymsProfile = {
  id: number;
  name: string;
  location: string;
  description: string;
  rating: number;
  membershipPrice: number;
};

const GymData = () => {
  const [gyms, setGyms] = useState<gymsProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState<number | "">("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const sampleImages = [
    "https://images.unsplash.com/photo-1554284126-aa88f22d8d6b?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=1",
    "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=2",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3",
    "https://images.unsplash.com/photo-1526403224744-0b9a9f2c1a13?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=4",
  ];

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const response = await axios.get<gymsProfile[]>(
          "http://localhost:3000/gyms",
          {
            withCredentials: true,
          },
        );
        setGyms(response.data);
      } catch (error) {
        setGyms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, []);

  if (loading) {
    return <div className="gyms-loading">Loading...</div>;
  }

  const q = query.trim().toLowerCase();
  const filteredGyms = (q
    ? gyms.filter((g) => {
        return (
          g.name.toLowerCase().includes(q) ||
          g.location.toLowerCase().includes(q) ||
          (g.description || "").toLowerCase().includes(q)
        );
      })
    : gyms
  ).filter((g) => {
    if (minRating !== "") {
      if (g.rating === null || g.rating === undefined) return false;
      if (g.rating < (minRating as number)) return false;
    }
    if (minPrice !== "") {
      if (g.membershipPrice === null || g.membershipPrice === undefined) return false;
      if (g.membershipPrice < (minPrice as number)) return false;
    }
    if (maxPrice !== "") {
      if (g.membershipPrice === null || g.membershipPrice === undefined) return false;
      if (g.membershipPrice > (maxPrice as number)) return false;
    }
    return true;
  });
  // show still the page even if empty so form is available
  // if (gyms.length === 0) {
  //   return <div>No gym data available.</div>;
  // }

  return (
    <div className="gyms-page">
      <div className="gyms-card">
        <div className="gyms-header">
          <h1>Gym Listings</h1>
          <div className="gyms-search">
            <input
              aria-label="Search gyms"
              className="gyms-search-input"
              placeholder="Search by name, location or description"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="gyms-search-clear" onClick={() => setQuery("")}>Clear</button>
            )}
          </div>
        </div>

        <div className="gyms-filters">
          <label className="filter-item">
            Min rating:
            <select value={minRating as any} onChange={(e) => setMinRating(e.target.value === "" ? "" : Number(e.target.value))}>
              <option value="">Any</option>
              <option value={1}>1+</option>
              <option value={2}>2+</option>
              <option value={3}>3+</option>
              <option value={4}>4+</option>
              <option value={5}>5</option>
            </select>
          </label>

          <label className="filter-item">
            Price from:
            <input type="number" min={0} value={minPrice as any} onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))} />
          </label>

          <label className="filter-item">
            to:
            <input type="number" min={0} value={maxPrice as any} onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} />
          </label>

          <button className="filter-reset" onClick={() => { setMinRating(""); setMinPrice(""); setMaxPrice(""); setQuery(""); }}>
            Reset
          </button>
        </div>

        {filteredGyms.length === 0 ? (
          <p className="gyms-empty">No gym data available.</p>
        ) : (
          <div className="gyms-grid">
            {filteredGyms.map((gym) => (
              <article key={gym.id} className="gym-card">
                <Link to={`/gyms/${gym.id}`} className="gym-card-link">
                  <div
                    className="gym-image"
                    aria-hidden
                    style={{
                      backgroundImage: `url(${sampleImages[gym.id % sampleImages.length]})`,
                    }}
                  />
                  <div className="gym-body">
                    <h3 className="gym-name">{gym.name}</h3>
                    <div className="gym-sub">Gym</div>
                    <div className="gym-location">{gym.location}</div>
                    <div className="gym-meta">
                      <span className="gym-rating">{gym.rating ?? "-"}⭐</span>
                      <span className="gym-price">{gym.membershipPrice?.toFixed(0)} SEK</span>
                    </div>
                  </div>
                </Link>
                <div className="gym-actions">
                  <Link className="create-review" to={`/gyms/${gym.id}/reviews`}>
                    Create Review
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GymData;
