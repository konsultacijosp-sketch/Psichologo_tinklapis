const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Appointment = require("./models/Appointment");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Sėkmingai prisijungta prie MongoDB duomenų bazės!");
    app.listen(PORT, () => {
      console.log(`Serveris veikia ant porto: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Klaida jungiantis prie MongoDB:", err);
  });

// --- Maršrutas serverio pažadinimui (Preemptive ping) ---
app.get("/api/ping", (req, res) => res.status(200).send("Pabudau!"));

// BAZINIS SAVAITĖS TVARKARAŠTIS (Jei dar nėra išsaugoto)
const defaultWeeklySchedule = {
  1: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"], // Pirmadienis
  2: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"], // Antradienis
  3: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"], // Trečiadienis
  4: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"], // Ketvirtadienis
  5: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"], // Penktadienis
  6: [], // Šeštadienis (Nedirbama)
  0: [], // Sekmadienis (Nedirbama)
};

// --- Nustatymų duomenų bazės modelis ---
const settingsSchema = new mongoose.Schema({
  startDate: { type: String, default: "" },
  blockedDates: { type: [String], default: [] },
  weeklySchedule: { type: Object, default: defaultWeeklySchedule },
});
const Settings = mongoose.model("Settings", settingsSchema);

// NUSTATYMŲ MARŠRUTAI
app.get("/api/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        startDate: "",
        blockedDates: [],
        weeklySchedule: defaultWeeklySchedule,
      });
    }
    if (
      !settings.weeklySchedule ||
      Object.keys(settings.weeklySchedule).length === 0
    ) {
      settings.weeklySchedule = defaultWeeklySchedule;
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Klaida gaunant nustatymus" });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    settings.startDate = req.body.startDate;
    settings.blockedDates = req.body.blockedDates;
    settings.weeklySchedule = req.body.weeklySchedule;

    settings.markModified("weeklySchedule");
    await settings.save();

    res.json({ message: "Nustatymai išsaugoti!", settings });
  } catch (error) {
    res.status(500).json({ error: "Klaida išsaugant nustatymus" });
  }
});

// VIZITŲ MARŠRUTAI
app.get("/api/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find({});
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Nepavyko gauti užimtų laikų" });
  }
});

app.post("/api/appointments", async (req, res) => {
  try {
    const { date, time, name, email, reason } = req.body;
    const existing = await Appointment.findOne({ date, time });
    if (existing) {
      return res.status(400).json({ error: "Šis laikas jau yra užimtas." });
    }

    const newAppointment = new Appointment({ date, time, name, email, reason });
    await newAppointment.save();

    res.status(201).json({
      message: "Registracija sėkmingai išsaugota!",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Klaida išsaugant:", error);
    res.status(500).json({ error: "Serverio klaida išsaugant registraciją" });
  }
});

app.delete("/api/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Appointment.findByIdAndDelete(id);
    res.json({ message: "Registracija sėkmingai ištrinta!" });
  } catch (error) {
    console.error("Klaida trinant registraciją:", error);
    res.status(500).json({ error: "Serverio klaida trinant registraciją" });
  }
});

module.exports = app;
