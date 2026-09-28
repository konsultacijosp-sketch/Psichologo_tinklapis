import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./admin.css";

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("isAdminAuthenticated") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState("calendar");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [settings, setSettings] = useState({
    startDate: "",
    blockedDates: [],
    weeklySchedule: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 0: [] },
  });
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);

  const ADMIN_PASSWORD = "Oskaras1995+";

  const possibleHours = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];
  const daysMap = [
    { id: "1", name: "Pirmadienis" },
    { id: "2", name: "Antradienis" },
    { id: "3", name: "Trečiadienis" },
    { id: "4", name: "Ketvirtadienis" },
    { id: "5", name: "Penktadienis" },
    { id: "6", name: "Šeštadienis" },
    { id: "0", name: "Sekmadienis" },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("isAdminAuthenticated", "true");
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/appointments`).then((res) =>
        res.json(),
      ),
      fetch(`${import.meta.env.VITE_API_URL}/api/settings`).then((res) =>
        res.json(),
      ),
    ])
      .then(([apptData, settsData]) => {
        setAppointments(apptData);
        if (settsData && !settsData.error) setSettings(settsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Klaida gaunant duomenis:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleDeleteAppointment = (id) => {
    if (window.confirm("Ar tikrai norite atšaukti ir ištrinti šį vizitą?")) {
      fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${id}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (res.ok) {
            setAppointments(appointments.filter((item) => item._id !== id));
            setSelectedBooking(null);
          } else {
            alert("Nepavyko ištrinti registracijos.");
          }
        })
        .catch((err) => console.error("Klaida trinant:", err));
    }
  };

  const handleSaveSettings = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
      .then((res) => res.json())
      .then(() => {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      });
  };

  const addBlockedDate = () => {
    if (newBlockedDate && !settings.blockedDates.includes(newBlockedDate)) {
      setSettings({
        ...settings,
        blockedDates: [...settings.blockedDates, newBlockedDate].sort(),
      });
      setNewBlockedDate("");
    }
  };

  const removeBlockedDate = (dateToRemove) => {
    setSettings({
      ...settings,
      blockedDates: settings.blockedDates.filter((d) => d !== dateToRemove),
    });
  };

  const toggleTimeSlot = (dayId, time) => {
    const currentDaySlots = settings.weeklySchedule[dayId] || [];
    let newSlots;
    if (currentDaySlots.includes(time)) {
      newSlots = currentDaySlots.filter((t) => t !== time);
    } else {
      newSlots = [...currentDaySlots, time].sort();
    }
    setSettings({
      ...settings,
      weeklySchedule: {
        ...settings.weeklySchedule,
        [dayId]: newSlots,
      },
    });
  };

  const getDaysForCurrentWeek = () => {
    const days = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + weekOffset * 7);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  const weekDays = getDaysForCurrentWeek();
  const getBookingForSlot = (date, time) => {
    return appointments.find(
      (item) => item.date === date && item.time === time,
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <form className="admin-login-box" onSubmit={handleLogin}>
          <h2>Valdymo skydelis</h2>
          <p>Įveskite slaptažodį norėdami pasiekti sistemą:</p>
          <input
            type="password"
            placeholder="Slaptažodis..."
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="admin-login-input"
          />
          {loginError && (
            <p className="admin-login-error">Neteisingas slaptažodis!</p>
          )}
          <button
            type="submit"
            className="cal-today-btn"
            style={{ width: "100%" }}
          >
            Prisijungti
          </button>
          <Link
            to="/"
            className="admin-back-link"
            style={{ marginTop: "15px", display: "inline-block" }}
          >
            ← Atgal į pagrindinį puslapį
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Valdymo skydelis</h1>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <button
            className="cal-today-btn"
            onClick={() => {
              setIsAuthenticated(false);
              sessionStorage.removeItem("isAdminAuthenticated");
            }}
            style={{ background: "#dc2626" }}
          >
            Atsijungti
          </button>
          <Link to="/" className="admin-back-link">
            ← Atgal į puslapį
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
        <button
          className={`cal-nav-btn ${activeTab === "calendar" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("calendar")}
          style={{
            background: activeTab === "calendar" ? "#111" : "#fff",
            color: activeTab === "calendar" ? "#fff" : "#111",
            border: "1px solid #111",
          }}
        >
          📅 Vizitų kalendorius
        </button>
        <button
          className={`cal-nav-btn ${activeTab === "settings" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("settings")}
          style={{
            background: activeTab === "settings" ? "#111" : "#fff",
            color: activeTab === "settings" ? "#fff" : "#111",
            border: "1px solid #111",
          }}
        >
          ⚙️ Darbo laiko nustatymai
        </button>
      </div>

      {loading ? (
        <p>Kraunama...</p>
      ) : activeTab === "calendar" ? (
        <>
          <div className="calendar-nav-bar">
            <button
              className="cal-nav-btn"
              onClick={() => setWeekOffset(weekOffset - 1)}
            >
              ← Praeita savaitė
            </button>
            <span className="cal-current-range">
              {weekDays[0]} — {weekDays[6]}
            </span>
            <button
              className="cal-nav-btn"
              onClick={() => setWeekOffset(weekOffset + 1)}
            >
              Kita savaitė →
            </button>
            {weekOffset !== 0 && (
              <button
                className="cal-today-btn"
                onClick={() => setWeekOffset(0)}
              >
                Ši savaitė
              </button>
            )}
          </div>

          <div className="calendar-grid-wrapper">
            <div className="calendar-grid">
              <div className="cal-header-cell time-col-header">Laikas</div>
              {weekDays.map((dateStr) => {
                const dateObj = new Date(dateStr);
                const dayName = dateObj.toLocaleDateString("lt-LT", {
                  weekday: "short",
                });
                return (
                  <div key={dateStr} className="cal-header-cell">
                    <span className="cal-day-name">{dayName}</span>
                    <span className="cal-date-num">{dateStr}</span>
                  </div>
                );
              })}

              {possibleHours.map((time) => (
                <React.Fragment key={time}>
                  <div className="time-row-label">{time}</div>
                  {weekDays.map((dateStr) => {
                    const booking = getBookingForSlot(dateStr, time);
                    const dayOfWeek = new Date(dateStr).getDay().toString();
                    const isHourActive =
                      settings.weeklySchedule[dayOfWeek]?.includes(time);

                    return (
                      <div
                        key={dateStr + time}
                        className={`cal-slot-cell ${booking ? "booked clickable" : isHourActive ? "free" : ""}`}
                        style={{
                          background:
                            !booking && !isHourActive ? "#fefefe" : "",
                          opacity: !booking && !isHourActive ? 0.3 : 1,
                        }}
                        onClick={() => booking && setSelectedBooking(booking)}
                      >
                        {booking ? (
                          <div className="slot-info">
                            <strong>{booking.name}</strong>
                            <span className="slot-preview-text">
                              Žiūrėti info
                            </span>
                          </div>
                        ) : (
                          isHourActive && (
                            <span className="free-text">Laisva</span>
                          )
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div
          className="calendar-grid-wrapper"
          style={{ padding: "30px", maxWidth: "800px" }}
        >
          <h2 style={{ marginBottom: "20px" }}>
            1. Registracijos atidarymo data
          </h2>
          <div
            style={{
              marginBottom: "30px",
              paddingBottom: "30px",
              borderBottom: "1px solid #eee",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Nuo kada leisti registruotis?
            </label>
            <input
              type="date"
              value={settings.startDate}
              onChange={(e) =>
                setSettings({ ...settings, startDate: e.target.value })
              }
              style={{
                padding: "10px",
                width: "100%",
                maxWidth: "300px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <small
              style={{ color: "#666", display: "block", marginTop: "5px" }}
            >
              Pvz., jei pasirinksite Lapkričio 1 d., klientai nematys jokio
              laiko spalio mėnesiui.
            </small>
          </div>

          <h2 style={{ marginBottom: "20px" }}>
            2. Standartinis savaitės darbo grafikas
          </h2>
          <div
            style={{
              marginBottom: "30px",
              paddingBottom: "30px",
              borderBottom: "1px solid #eee",
            }}
          >
            <p
              style={{
                color: "#666",
                fontSize: "0.9rem",
                marginBottom: "15px",
              }}
            >
              Pažymėkite laikus, kuriais priimate klientus kiekvieną savaitės
              dieną. Jei dienai nepriskirta nė viena valanda – diena bus rodoma
              kaip nedarbo.
            </p>

            {daysMap.map((day) => (
              <div
                key={day.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "140px",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                >
                  {day.name}:
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    flex: 1,
                  }}
                >
                  {possibleHours.map((hour) => {
                    const isActive =
                      settings.weeklySchedule[day.id]?.includes(hour);
                    return (
                      <button
                        key={hour}
                        onClick={() => toggleTimeSlot(day.id, hour)}
                        style={{
                          padding: "6px 10px",
                          fontSize: "0.85rem",
                          borderRadius: "4px",
                          border: isActive
                            ? "2px solid #111"
                            : "1px solid #ddd",
                          background: isActive ? "#111" : "#fff",
                          color: isActive ? "#fff" : "#666",
                          cursor: "pointer",
                        }}
                      >
                        {hour}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ marginBottom: "20px" }}>
            3. Išimtinės atostogų dienos (Nedarbo)
          </h2>
          <div style={{ marginBottom: "25px" }}>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "15px",
                maxWidth: "400px",
              }}
            >
              <input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                style={{
                  padding: "10px",
                  flex: 1,
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <button
                onClick={addBlockedDate}
                className="cal-today-btn"
                style={{ background: "#111" }}
              >
                Užblokuoti
              </button>
            </div>

            {settings.blockedDates.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, maxWidth: "400px" }}>
                {settings.blockedDates.map((d) => (
                  <li
                    key={d}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      background: "#f9f9fb",
                      padding: "10px 15px",
                      marginBottom: "8px",
                      borderRadius: "4px",
                      border: "1px solid #eee",
                    }}
                  >
                    <span>{d}</span>
                    <button
                      onClick={() => removeBlockedDate(d)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Ištrinti
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#666", fontStyle: "italic" }}>
                Nėra pridėtų nedarbo dienų.
              </p>
            )}
          </div>

          <button
            onClick={handleSaveSettings}
            className="cal-today-btn"
            style={{
              padding: "14px 24px",
              fontSize: "1.05rem",
              background: "#4f46e5",
            }}
          >
            Išsaugoti visus nustatymus
          </button>
          {settingsSaved && (
            <p
              style={{
                color: "#22c55e",
                marginTop: "10px",
                fontWeight: "bold",
              }}
            >
              Nustatymai sėkmingai išsaugoti! Sistema atnaujinta.
            </p>
          )}
        </div>
      )}

      {selectedBooking && activeTab === "calendar" && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Kliento vizito informacija</h2>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedBooking(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Vardas, pavardė:</strong> {selectedBooking.name}
              </p>
              <p>
                <strong>El. paštas:</strong>{" "}
                <a href={`mailto:${selectedBooking.email}`}>
                  {selectedBooking.email}
                </a>
              </p>
              <p>
                <strong>Data:</strong> {selectedBooking.date}
              </p>
              <p>
                <strong>Laikas:</strong> {selectedBooking.time}
              </p>
              <p>
                <strong>Vizito priežastis / pastabos:</strong>
              </p>
              <div className="modal-reason-box">
                {selectedBooking.reason || "Kliento priežastis nenurodyta."}
              </div>
            </div>
            <div
              className="modal-footer"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <button
                className="cal-today-btn"
                style={{ background: "#dc2626" }}
                onClick={() => handleDeleteAppointment(selectedBooking._id)}
              >
                Atšaukti vizitą
              </button>
              <button
                className="cal-today-btn"
                style={{ background: "#111" }}
                onClick={() => setSelectedBooking(null)}
              >
                Uždaryti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
