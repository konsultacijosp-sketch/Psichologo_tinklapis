const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Resend } = require("resend");
require("dotenv").config();

const Appointment = require("./models/Appointment");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Inicializuojame Resend API klientą su raktu iš Render Environment (EMAIL_PASS kintamojo)
const resend = new Resend(process.env.EMAIL_PASS);

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
    // Apsauga, jei sena bazė neturi tvarkaraščio
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

    // Pranešame Mongoose, kad objektas pasikeitė
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
    const { date, time, name, email, reason, language } = req.body;
    const existing = await Appointment.findOne({ date, time });
    if (existing) {
      return res.status(400).json({ error: "Šis laikas jau yra užimtas." });
    }

    const newAppointment = new Appointment({ date, time, name, email, reason });
    await newAppointment.save();

    let clientSubject = "Registracijos patvirtinimas – Psichologo konsultacija";
    let clientText = `Sveiki, ${name},\n\nJūsų registracija pas psichologą Oskarą Jakšaitį-Brežinską sėkmingai patvirtinta!\n\nData: ${date}\nLaikas: ${time}\n\nIki susitikimo!`;

    if (language === "en") {
      clientSubject = "Booking Confirmation – Psychologist Consultation";
      clientText = `Hello, ${name},\n\nYour appointment with psychologist Oskaras Jakšaitis-Brežinskas has been successfully confirmed!\n\nDate: ${date}\nTime: ${time}\n\nSee you soon!`;
    }

    // Siunčiame laišką klientui per Resend API
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: clientSubject,
        text: clientText,
      });
      console.log("Laiškas klientui sėkmingai išsiųstas per Resend!");
    } catch (mailError) {
      console.error("Klaida siunčiant laišką klientui:", mailError);
    }

    // Siunčiame pranešimą adminui per Resend API
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: process.env.EMAIL_USER,
        subject: `Nauja registracija: ${name} (${date} ${time})`,
        text: `Gavote naują vizito registraciją!\n\nVardas: ${name}\nEl. paštas: ${email}\nData: ${date}\nLaikas: ${time}\nPriežastis: ${reason || "Nenurodyta"}\n\nPrisijunkite prie /admin valdymo skydelio peržiūrėti daugiau.`,
      });
      console.log("Admin pranešimas sėkmingai išsiųstas per Resend!");
    } catch (mailError) {
      console.error("Klaida siunčiant pranešimą adminui:", mailError);
    }

    res.status(201).json({
      message: "Registracija sėkmingai išsaugota ir laiškai išsiųsti!",
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
