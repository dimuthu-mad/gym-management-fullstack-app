import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "./Schedule.css";

type Gym = {
  id: number;
  name: string;
  location: string;
  image?: string | null;
};

type Schedule = {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  gymId: number;
  userId: number;
  gym?: Gym;
  user?: {
    id: number;
    name?: string | null;
    email?: string | null;
  };
};

type Profile = {
  id?: number;
  name?: string | null;
  email?: string | null;
  role?: "USER" | "ADMIN";
};

type GymDetails = {
  id: number;
  name: string;
  location: string;
  image?: string | null;
};

const fallbackGymImage =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48";

const toDateInput = (value: string) => value.slice(0, 10);

const toTimeInput = (value: string) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(11, 16);
};

const buildDateTime = (date: string, time: string) => `${date}T${time}:00`;

const SchedulePage = () => {
  const { id } = useParams();
  const gymId = useMemo(() => (id ? Number(id) : null), [id]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [gym, setGym] = useState<GymDetails | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedGymId, setSelectedGymId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");

  const isAdmin = profile?.role === "ADMIN";
  const visibleSchedules = useMemo(() => schedules, [schedules]);

  const fallbackSelectedGymId = gymId ? String(gymId) : selectedGymId;

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileResp, gymResp, gymsResp] = await Promise.all([
          axios.get<Profile>("http://localhost:3000/profile", {
            withCredentials: true,
          }),
          gymId
            ? axios.get<GymDetails>(`http://localhost:3000/gyms/${gymId}`, {
                withCredentials: true,
              })
            : Promise.resolve(null),
          axios.get<Gym[]>("http://localhost:3000/gyms", {
            withCredentials: true,
          }),
        ]);

        if (!mounted) return;
        setProfile(profileResp.data);
        if (gymResp && "data" in gymResp) {
          setGym(gymResp.data);
          setSelectedGymId(String(gymResp.data.id));
        }
        setGyms(gymsResp.data);

        const schedulesResp = await axios.get<Schedule[]>(
          profileResp.data.role === "ADMIN"
            ? "http://localhost:3000/schedules"
            : "http://localhost:3000/my-schedules",
          { withCredentials: true },
        );

        if (!mounted) return;
        setSchedules(schedulesResp.data);
      } catch (error) {
        if (!mounted) return;
        setSchedules([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [gymId]);

  const resetForm = () => {
    setTitle("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setNotes("");
  };

  const startEditing = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setEditTitle(schedule.title);
    setEditDate(toDateInput(schedule.date));
    setEditStartTime(toTimeInput(schedule.startTime));
    setEditEndTime(toTimeInput(schedule.endTime));
  };

  const stopEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDate("");
    setEditStartTime("");
    setEditEndTime("");
  };

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const gymToUse = Number(fallbackSelectedGymId);
    if (!gymToUse || !title || !date || !startTime || !endTime) {
      alert("Pick a gym and fill all required fields.");
      return;
    }
    setSaving(true);
    try {
      await axios.post(
        `http://localhost:3000/gyms/${gymToUse}/schedules`,
        {
          title,
          date: buildDateTime(date, startTime),
          startTime: buildDateTime(date, startTime),
          endTime: buildDateTime(date, endTime),
          notes,
        },
        { withCredentials: true },
      );

      const schedulesResp = await axios.get<Schedule[]>(
        isAdmin
          ? "http://localhost:3000/schedules"
          : "http://localhost:3000/my-schedules",
        { withCredentials: true },
      );
      setSchedules(schedulesResp.data);
      resetForm();
    } catch (error: any) {
      alert(error?.response?.data?.error || "Failed to create schedule");
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (event: React.FormEvent, scheduleId: number) => {
    event.preventDefault();
    if (!editTitle || !editDate || !editStartTime || !editEndTime) {
      alert("Fill all schedule fields.");
      return;
    }
    setSaving(true);
    try {
      await axios.patch(
        `http://localhost:3000/schedules/${scheduleId}`,
        {
          title: editTitle,
          date: buildDateTime(editDate, editStartTime),
          startTime: buildDateTime(editDate, editStartTime),
          endTime: buildDateTime(editDate, editEndTime),
        },
        { withCredentials: true },
      );

      const schedulesResp = await axios.get<Schedule[]>(
        isAdmin
          ? "http://localhost:3000/schedules"
          : "http://localhost:3000/my-schedules",
        { withCredentials: true },
      );
      setSchedules(schedulesResp.data);
      stopEditing();
    } catch (error: any) {
      alert(error?.response?.data?.error || "Failed to update schedule");
    } finally {
      setSaving(false);
    }
  };

  const removeSchedule = async (scheduleId: number) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await axios.delete(`http://localhost:3000/schedules/${scheduleId}`, {
        withCredentials: true,
      });
      setSchedules((current) =>
        current.filter((schedule) => schedule.id !== scheduleId),
      );
    } catch (error: any) {
      alert(error?.response?.data?.error || "Failed to delete schedule");
    }
  };

  if (loading) {
    return (
      <div className="schedule-page-shell">
        <div className="schedule-page-loading">Loading schedules...</div>
      </div>
    );
  }

  return (
    <div className="schedule-page-shell">
      <div className="schedule-layout">
        <section className="schedule-panel schedule-form-panel">
          <Link
            to={gym ? `/gyms/${gym.id}` : "/gyms"}
            className="schedule-back-link"
          >
            ← Back to Gym
          </Link>

          <div className="schedule-panel-head">
            <h1>Create Schedule</h1>
            <p>
              {gym
                ? `Schedule your workout at ${gym.name}`
                : "Schedule your workout and keep your training organized"}
            </p>
          </div>

          {gym && (
            <div className="schedule-gym-card">
              <img
                src={gym.image || fallbackGymImage}
                alt={gym.name}
                className="schedule-gym-image"
              />
              <div>
                <div className="schedule-gym-name">{gym.name}</div>
                <div className="schedule-gym-location">{gym.location}</div>
              </div>
            </div>
          )}

          <form className="schedule-form" onSubmit={submitCreate}>
            {!gym && (
              <label className="schedule-field">
                Gym
                <select
                  value={selectedGymId}
                  onChange={(e) => setSelectedGymId(e.target.value)}
                >
                  <option value="">Select a gym</option>
                  {gyms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.location}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="schedule-field">
              Workout Title
              <input
                type="text"
                placeholder="Leg Day Training"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="schedule-field">
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <div className="schedule-row">
              <label className="schedule-field">
                Start Time
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </label>

              <label className="schedule-field">
                End Time
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </label>
            </div>

            <label className="schedule-field">
              Notes (optional)
              <textarea
                rows={4}
                placeholder="Focus on squats, deadlifts and leg press."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <div className="schedule-form-actions">
              <Link
                to={gym ? `/gyms/${gym.id}` : "/gyms"}
                className="schedule-secondary-btn"
              >
                Cancel
              </Link>
              <button
                className="schedule-primary-btn"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </form>
        </section>

        <section className="schedule-panel schedule-list-panel">
          <div className="schedule-panel-head">
            <h2>{isAdmin ? "All Schedules" : "My Schedules"}</h2>
            <p>
              {isAdmin
                ? "Admin view of every schedule in the system"
                : "Only schedules you created are shown here"}
            </p>
          </div>

          <div className="schedule-list">
            {visibleSchedules.length === 0 ? (
              <div className="schedule-empty">No schedules yet.</div>
            ) : (
              visibleSchedules.map((schedule) => {
                const gymImage = schedule.gym?.image || fallbackGymImage;
                const scheduleOwner =
                  schedule.user?.name || schedule.user?.email || "You";
                const isEditing = editingId === schedule.id;
                return (
                  <article key={schedule.id} className="schedule-card">
                    <img
                      src={gymImage}
                      alt={schedule.gym?.name || "Gym"}
                      className="schedule-card-image"
                    />

                    <div className="schedule-card-body">
                      <div className="schedule-card-main">
                        <div>
                          <h3>{schedule.gym?.name || "Gym"}</h3>
                          <div className="schedule-meta">
                            {schedule.gym?.location}
                          </div>
                        </div>
                        <div className="schedule-owner">{scheduleOwner}</div>
                      </div>

                      {isEditing ? (
                        <form
                          className="schedule-edit-form"
                          onSubmit={(event) => submitEdit(event, schedule.id)}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                          <div className="schedule-row">
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                            />
                            <input
                              type="time"
                              value={editStartTime}
                              onChange={(e) => setEditStartTime(e.target.value)}
                            />
                            <input
                              type="time"
                              value={editEndTime}
                              onChange={(e) => setEditEndTime(e.target.value)}
                            />
                          </div>
                          <div className="schedule-card-actions">
                            <button
                              type="submit"
                              className="schedule-primary-btn"
                              disabled={saving}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="schedule-secondary-btn"
                              onClick={stopEditing}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="schedule-title">{schedule.title}</div>
                          <div className="schedule-time-row">
                            <span>
                              📅 {new Date(schedule.date).toLocaleDateString()}
                            </span>
                            <span>
                              ⏰{" "}
                              {new Date(schedule.startTime).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}{" "}
                              -{" "}
                              {new Date(schedule.endTime).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </div>

                          <div className="schedule-card-actions">
                            {(isAdmin || profile?.id === schedule.userId) && (
                              <button
                                className="schedule-edit-btn"
                                type="button"
                                onClick={() => startEditing(schedule)}
                              >
                                Edit
                              </button>
                            )}
                            {(isAdmin || profile?.id === schedule.userId) && (
                              <button
                                className="schedule-delete-btn"
                                type="button"
                                onClick={() => removeSchedule(schedule.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SchedulePage;
