import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

const parseDateOnly = (value: string) => {
  const [year, month, day] = toDateInput(value).split("-").map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseDateTime = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildDateOnly = (date: Date | null) => {
  if (!date) return "";
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString();
};

const buildDateTime = (date: Date | null, time: Date | null) => {
  if (!date || !time) return "";
  const combined = new Date(date);
  combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return combined.toISOString();
};

const timeLabel = (value: Date | null) => {
  if (!value) return "Select time";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
};

const timeOptions = Array.from({ length: 96 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const label = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return {
    value: new Date(2000, 0, 1, hours, minutes),
    label,
  };
});

type PickerInputProps = {
  value?: string;
  onClick?: () => void;
  placeholder: string;
  icon: ReactNode;
};

const PickerInput = forwardRef<HTMLButtonElement, PickerInputProps>(
  ({ value, onClick, placeholder, icon }, ref) => (
    <button
      type="button"
      className="schedule-picker-button"
      onClick={onClick}
      ref={ref}
    >
      <span className={`schedule-picker-text ${value ? "" : "is-placeholder"}`}>
        {value || placeholder}
      </span>
      <span className="schedule-picker-icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  ),
);

PickerInput.displayName = "PickerInput";

type TimePickerProps = {
  label: string;
  value: Date | null;
  open: boolean;
  onToggle: () => void;
  onSelect: (next: Date) => void;
};

const TimePicker = ({
  label,
  value,
  open,
  onToggle,
  onSelect,
}: TimePickerProps) => {
  return (
    <div className="schedule-time-picker">
      <button
        type="button"
        className="schedule-time-button"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span
          className={`schedule-time-button-text ${value ? "" : "is-placeholder"}`}
        >
          {value ? timeLabel(value) : label}
        </span>
        <span className="schedule-time-button-icon" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M12 7v5l4 2"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div className="schedule-time-menu" role="listbox" aria-label={label}>
          {timeOptions.map((option) => {
            const isSelected =
              value?.getHours() === option.value.getHours() &&
              value?.getMinutes() === option.value.getMinutes();
            return (
              <button
                key={option.label}
                type="button"
                className={`schedule-time-option ${isSelected ? "is-active" : ""}`}
                onClick={() => onSelect(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

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
  const [openTimePicker, setOpenTimePicker] = useState<string | null>(null);
  const [selectedGymId, setSelectedGymId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [editStartTime, setEditStartTime] = useState<Date | null>(null);
  const [editEndTime, setEditEndTime] = useState<Date | null>(null);

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
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setNotes("");
  };

  const startEditing = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setEditTitle(schedule.title);
    setEditDate(parseDateOnly(schedule.date));
    setEditStartTime(parseDateTime(schedule.startTime));
    setEditEndTime(parseDateTime(schedule.endTime));
  };

  const stopEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDate(null);
    setEditStartTime(null);
    setEditEndTime(null);
    setOpenTimePicker(null);
  };

  const toggleTimePicker = (key: string) => {
    setOpenTimePicker((current) => (current === key ? null : key));
  };

  const pickTime = (key: string, value: Date) => {
    if (key === "create-start") setStartTime(value);
    if (key === "create-end") setEndTime(value);
    if (key === "edit-start") setEditStartTime(value);
    if (key === "edit-end") setEditEndTime(value);
    setOpenTimePicker(null);
  };

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setOpenTimePicker(null);
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
          date: buildDateOnly(date),
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
    setOpenTimePicker(null);
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
          date: buildDateOnly(editDate),
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
              <DatePicker
                selected={date}
                onChange={(value: Date | null) => setDate(value)}
                customInput={
                  <PickerInput
                    placeholder="Select date"
                    icon={
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
                          height="18"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M16 2v4M8 2v4M3 10h18"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                  />
                }
                placeholderText="Select date"
                dateFormat="M/d/yyyy"
                calendarStartDay={0}
                popperPlacement="bottom-start"
                showPopperArrow={false}
                wrapperClassName="schedule-picker-wrapper"
              />
            </label>

            <div className="schedule-row">
              <label className="schedule-field">
                Start Time
                <TimePicker
                  label="Select time"
                  value={startTime}
                  open={openTimePicker === "create-start"}
                  onToggle={() => toggleTimePicker("create-start")}
                  onSelect={(value) => pickTime("create-start", value)}
                />
              </label>

              <label className="schedule-field">
                End Time
                <TimePicker
                  label="Select time"
                  value={endTime}
                  open={openTimePicker === "create-end"}
                  onToggle={() => toggleTimePicker("create-end")}
                  onSelect={(value) => pickTime("create-end", value)}
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
                          <div className="schedule-edit-row">
                            <DatePicker
                              selected={editDate}
                              onChange={(value: Date | null) =>
                                setEditDate(value)
                              }
                              customInput={
                                <PickerInput
                                  placeholder="Select date"
                                  icon={
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
                                        height="18"
                                        rx="2"
                                        stroke="currentColor"
                                        strokeWidth="1.2"
                                      />
                                      <path
                                        d="M16 2v4M8 2v4M3 10h18"
                                        stroke="currentColor"
                                        strokeWidth="1.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  }
                                />
                              }
                              placeholderText="Select date"
                              dateFormat="M/d/yyyy"
                              popperPlacement="bottom-start"
                              showPopperArrow={false}
                              wrapperClassName="schedule-picker-wrapper"
                            />
                            <TimePicker
                              label="Select time"
                              value={editStartTime}
                              open={openTimePicker === "edit-start"}
                              onToggle={() => toggleTimePicker("edit-start")}
                              onSelect={(value) =>
                                pickTime("edit-start", value)
                              }
                            />
                            <TimePicker
                              label="Select time"
                              value={editEndTime}
                              open={openTimePicker === "edit-end"}
                              onToggle={() => toggleTimePicker("edit-end")}
                              onSelect={(value) => pickTime("edit-end", value)}
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
                              <svg
                                className="schedule-inline-icon"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect
                                  x="3"
                                  y="4"
                                  width="18"
                                  height="18"
                                  rx="2"
                                  stroke="currentColor"
                                  strokeWidth="1.2"
                                />
                                <path
                                  d="M3 10h18"
                                  stroke="currentColor"
                                  strokeWidth="1.2"
                                  strokeLinecap="round"
                                />
                              </svg>{" "}
                              {new Date(schedule.date).toLocaleDateString()}
                            </span>
                            <span>
                              <svg
                                className="schedule-inline-icon"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="9"
                                  stroke="currentColor"
                                  strokeWidth="1.2"
                                />
                                <path
                                  d="M12 7v5l4 2"
                                  stroke="currentColor"
                                  strokeWidth="1.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>{" "}
                              {new Date(schedule.startTime).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                              {" - "}
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
