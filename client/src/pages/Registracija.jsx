import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Registracija.css";

function Registracija() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("appLanguage") || "lt";
  });

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const [name, setName] = useState(
    () => localStorage.getItem("savedName") || "",
  );
  const [email, setEmail] = useState(
    () => localStorage.getItem("savedEmail") || "",
  );
  const [reason, setReason] = useState("");

  const [bookedSlots, setBookedSlots] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/appointments`).then((res) =>
        res.json(),
      ),
      fetch(`${import.meta.env.VITE_API_URL}/api/settings`).then((res) =>
        res.json(),
      ),
    ])
      .then(([apptData, settsData]) => {
        setBookedSlots(apptData);
        if (settsData && !settsData.error) {
          setSettings(settsData);
          // Starto data kalendoriui atverti
          const today = new Date();
          const configuredStart = settsData.startDate
            ? new Date(settsData.startDate)
            : today;
          if (configuredStart > today) {
            setCurrentMonthDate(configuredStart);
          }
        }
      })
      .catch((err) => console.error("Klaida gaunant duomenis:", err));
  }, []);

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 7 : day;
  };

  const generateCalendarDays = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 1; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      );
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonthDate(
      new Date(
        currentMonthDate.getFullYear(),
        currentMonthDate.getMonth() - 1,
        1,
      ),
    );
  };
  const handleNextMonth = () => {
    setCurrentMonthDate(
      new Date(
        currentMonthDate.getFullYear(),
        currentMonthDate.getMonth() + 1,
        1,
      ),
    );
  };

  const minAllowedDate = new Date();
  const configuredStartDate =
    settings && settings.startDate
      ? new Date(settings.startDate)
      : minAllowedDate;
  const absoluteMinMonth =
    minAllowedDate > configuredStartDate ? minAllowedDate : configuredStartDate;

  const isPrevDisabled =
    currentMonthDate.getFullYear() === absoluteMinMonth.getFullYear() &&
    currentMonthDate.getMonth() === absoluteMinMonth.getMonth();

  const monthName = currentMonthDate.toLocaleString(
    language === "lt" ? "lt-LT" : "en-US",
    { month: "long", year: "numeric" },
  );
  const formattedMonthName =
    monthName.charAt(0).toUpperCase() + monthName.slice(1);
  const weekDaysHeaders =
    language === "lt"
      ? ["Pr", "An", "Tr", "Kt", "Pn", "Št", "Sk"]
      : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  // --- KIEK LAIKŲ YRA KONKREČIAI DIENAI ---
  const getAvailableSlotsForDate = (dateStr) => {
    if (!settings || !settings.weeklySchedule) return [];
    const dayOfWeek = new Date(dateStr).getDay().toString();
    return settings.weeklySchedule[dayOfWeek] || [];
  };

  const getDayAvailabilityStatus = (dateStr) => {
    if (!settings) return "past";
    if (
      dateStr < todayStr ||
      (settings.startDate && dateStr < settings.startDate)
    )
      return "past";
    if (settings.blockedDates && settings.blockedDates.includes(dateStr))
      return "past";

    const dailySlots = getAvailableSlotsForDate(dateStr);
    if (dailySlots.length === 0) return "past"; // Administratorius nepridėjo valandų šiai dienai (nedarbo)

    const bookedCount = bookedSlots.filter(
      (slot) => slot.date === dateStr,
    ).length;

    if (bookedCount === 0) return "high";
    if (bookedCount >= dailySlots.length) return "full";
    return "medium";
  };

  const isSlotBooked = (date, time) => {
    return bookedSlots.some((slot) => slot.date === date && slot.time === time);
  };

  const getLocalTimeStr = (dateStr, timeStr) => {
    if (!dateStr) return null;
    try {
      const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (
        !userTZ ||
        userTZ === "Europe/Vilnius" ||
        userTZ === "Europe/Riga" ||
        userTZ === "Europe/Tallinn" ||
        userTZ === "Europe/Helsinki"
      )
        return null;

      const d = new Date(`${dateStr}T12:00:00Z`);
      const formatterOpts = { hour: "numeric", hour12: false };

      const vilniusHour = parseInt(
        new Intl.DateTimeFormat("en-GB", {
          ...formatterOpts,
          timeZone: "Europe/Vilnius",
        }).format(d),
        10,
      );
      const localHour = parseInt(
        new Intl.DateTimeFormat("en-GB", {
          ...formatterOpts,
          timeZone: userTZ,
        }).format(d),
        10,
      );

      let diff = localHour - vilniusHour;
      if (diff === 0) return null;
      if (diff > 12) diff -= 24;
      if (diff < -12) diff += 24;

      const [h, m] = timeStr.split(":").map(Number);
      let localH = h + diff;

      if (localH < 0) localH += 24;
      if (localH >= 24) localH -= 24;

      return `${localH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    } catch (e) {
      return null;
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert(
        language === "en"
          ? "Please select a date and time."
          : "Prašome pasirinkti datą ir laiką.",
      );
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    fetch(`${import.meta.env.VITE_API_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedDate,
        time: selectedTime,
        name,
        email,
        reason,
        language,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Klaida registruojantis");
        return data;
      })
      .then(() => {
        localStorage.setItem("savedName", name);
        localStorage.setItem("savedEmail", email);
        setSuccess(true);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setLoading(false);
      });
  };

  const toggleLanguage = () => {
    const newLang = language === "lt" ? "en" : "lt";
    setLanguage(newLang);
    localStorage.setItem("appLanguage", newLang);
  };

  const userLocalTimeText = getLocalTimeStr(selectedDate, selectedTime);
  const calendarDays = generateCalendarDays();
  const activeDateSlots = getAvailableSlotsForDate(selectedDate); // Paimam laikus tik šiai datai

  return (
    <div className="registration-page">
      <div className="container reg-container">
        <div className="reg-header">
          <Link to="/" className="back-link">
            {language === "en" ? "← Back to Home" : "← Atgal į pagrindinį"}
          </Link>
          <button className="lang-toggle-btn" onClick={toggleLanguage}>
            {language.toUpperCase()}
          </button>
        </div>

        <div className="reg-box slide-in">
          <span className="reg-tag">
            {language === "en"
              ? "Consultation Booking"
              : "Konsultacijos rezervacija"}
          </span>
          <h1 className="reg-title">
            {language === "en"
              ? "Schedule a Session"
              : "Užsiregistruoti vizitui"}
          </h1>
          <p className="reg-subtitle">
            {language === "en"
              ? "Select a convenient date and time for your psychological consultation."
              : "Pasirinkite jums patogią datą ir laiką psichologo konsultacijai."}
          </p>

          {success ? (
            <div className="success-message">
              <h3>
                {language === "en"
                  ? "Booking Successful!"
                  : "Registracija sėkminga!"}
              </h3>
              <p>
                {language === "en"
                  ? `A confirmation email has been sent to ${email}. See you soon!`
                  : `Patvirtinimo laiškas išsiųstas adresu ${email}. Iki susitikimo!`}
              </p>
              <Link
                to="/"
                className="btn-dark step-btn"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                {language === "en" ? "Return to Home" : "Grįžti į pradžią"}
              </Link>
            </div>
          ) : (
            <>
              {errorMessage && (
                <p style={{ color: "#dc2626", marginBottom: "15px" }}>
                  {errorMessage}
                </p>
              )}

              {step === 1 ? (
                <form onSubmit={handleNextStep} className="reg-form">
                  <div className="form-group date-group">
                    <label>
                      {language === "en" ? "Select Date" : "Pasirinkite datą"}
                    </label>

                    <div className="date-picker-header">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        disabled={isPrevDisabled}
                      >
                        ←
                      </button>
                      <span style={{ fontWeight: 600, fontSize: "1rem" }}>
                        {formattedMonthName}
                      </span>
                      <button type="button" onClick={handleNextMonth}>
                        →
                      </button>
                    </div>

                    <div className="calendar-weekdays">
                      {weekDaysHeaders.map((day) => (
                        <div key={day} className="weekday-cell">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="date-grid month-grid">
                      {calendarDays.map((dateStr, index) => {
                        if (!dateStr)
                          return (
                            <div
                              key={`empty-${index}`}
                              className="date-cell empty-cell"
                            ></div>
                          );

                        const dateNum = dateStr.split("-")[2];
                        const status = getDayAvailabilityStatus(dateStr);
                        const isSelected = selectedDate === dateStr;
                        const isDisabled =
                          status === "full" || status === "past";

                        return (
                          <button
                            type="button"
                            key={dateStr}
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setSelectedTime("");
                            }}
                            className={`date-cell month-cell status-${status} ${isSelected ? "selected" : ""}`}
                            disabled={isDisabled}
                          >
                            <span className="date-cell-num">
                              {parseInt(dateNum, 10)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="date-legend">
                      <div className="legend-item">
                        <span className="legend-dot status-high"></span>
                        {language === "en" ? "Available" : "Laisva"}
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot status-medium"></span>
                        {language === "en" ? "Few spots left" : "Liko nedaug"}
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot status-full"></span>
                        {language === "en"
                          ? "Fully booked / Closed"
                          : "Užimta / Nedirbama"}
                      </div>
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="form-group slide-in">
                      <label>
                        {language === "en"
                          ? "Select Time (Lithuanian Time)"
                          : "Pasirinkite laiką (Lietuvos laiku)"}
                      </label>
                      <div className="time-grid">
                        {/* Rodome tik tai dienai priskirtus laikus iš Admino nustatymų! */}
                        {activeDateSlots.map((time) => {
                          const booked = isSlotBooked(selectedDate, time);
                          const isSelected = selectedTime === time;
                          const convertedTime = getLocalTimeStr(
                            selectedDate,
                            time,
                          );

                          return (
                            <button
                              type="button"
                              key={time}
                              disabled={booked}
                              className={`time-btn ${booked ? "booked" : ""} ${isSelected ? "selected" : ""}`}
                              onClick={() => setSelectedTime(time)}
                            >
                              <span className="time-main">{time}</span>
                              {convertedTime && !booked && (
                                <span className="time-local">
                                  ({convertedTime})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-dark step-btn submit-btn"
                    disabled={!selectedDate || !selectedTime}
                  >
                    {language === "en" ? "Next Step" : "Toliau"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="reg-form">
                  <div className="summary-box">
                    <div>
                      <span className="summary-label">
                        {language === "en"
                          ? "Selected Date & Time"
                          : "Pasirinktas laikas"}
                      </span>
                      <strong>
                        {selectedDate} {selectedTime}
                        {userLocalTimeText && (
                          <span
                            style={{
                              color: "var(--gray-dark)",
                              fontSize: "0.9em",
                              fontWeight: "normal",
                              marginLeft: "6px",
                            }}
                          >
                            {language === "en"
                              ? `(${userLocalTimeText} your time)`
                              : `(${userLocalTimeText} Jūsų laiku)`}
                          </span>
                        )}
                      </strong>
                    </div>
                    <button
                      type="button"
                      className="change-btn"
                      onClick={() => setStep(1)}
                    >
                      {language === "en" ? "Change" : "Keisti"}
                    </button>
                  </div>

                  <div className="form-group">
                    <label>
                      {language === "en" ? "Full Name" : "Vardas, pavardė"}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={
                        language === "en"
                          ? "Your name..."
                          : "Įveskite vardą ir pavardę..."
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      {language === "en" ? "Email Address" : "El. paštas"}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="pastas@pavyzdys.lt"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      {language === "en"
                        ? "Reason / Notes (Optional)"
                        : "Vizito priežastis / pastabos (nebūtina)"}
                    </label>
                    <textarea
                      rows="4"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={
                        language === "en"
                          ? "Briefly describe..."
                          : "Trumpai aprašykite..."
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-dark submit-btn step-btn"
                    disabled={loading}
                  >
                    {loading
                      ? language === "en"
                        ? "Submitting..."
                        : "Siunčiama..."
                      : language === "en"
                        ? "Confirm Booking"
                        : "Patvirtinti registraciją"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Registracija;
