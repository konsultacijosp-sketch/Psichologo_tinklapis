import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import "./App.css";
import Registracija from "./pages/Registracija";
import Admin from "./pages/admin";
import NotFound from "./pages/NotFound";
import Privatumas from "./pages/Privatumas";
import { translations } from "./translations";

// Sutvarkytas, interaktyvus KET komponentas
function KET({ language }) {
  const [activeElementIndex, setActiveElementIndex] = useState(1);
  const t = translations[language]?.ket || translations.lt.ket;

  const currentInfo = t.model?.[activeElementIndex] || t.model?.[0] || {};

  return (
    <div className="ket-container">
      <div className="section-header">
        <span className="section-tag">{t.tag}</span>
        <h2 className="section-title">{t.title}</h2>
      </div>

      <p className="ket-intro">
        {t.intro1}
        <strong>{t.introBold}</strong>
        {t.intro2}
      </p>

      <div className="ket-model-wrapper">
        <div className="ket-diagram-cards">
          {t.model?.map((el, index) => (
            <button
              key={el.id}
              type="button"
              className={`model-card-btn ${activeElementIndex === index ? "active" : ""}`}
              onClick={() => setActiveElementIndex(index)}
            >
              <span className="model-step">{el.title}</span>
              <span className="model-sub">{el.subtitle}</span>
            </button>
          ))}
        </div>

        <div className="ket-detail-box">
          <div className="detail-tag">{t.exampleTag}</div>
          <h3 className="detail-title">
            {currentInfo.title} — {currentInfo.subtitle}
          </h3>
          <p className="detail-text">{currentInfo.desc}</p>
        </div>
      </div>

      <div className="ket-benefits-grid">
        {t.benefits?.map((benefit, index) => (
          <div className="benefit-col" key={index}>
            <h4>{benefit.title}</h4>
            <p>{benefit.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pagrindinis puslapis
function Home({ language, toggleLanguage }) {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const t = translations[language] || translations.lt;

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="page-wrapper">
      <header className="header">
        <div className="container nav-inner">
          <div className="brand">
            <span className="brand-name">Oskaras Jakšaitis-Brežinskas</span>
            <span className="brand-role">{t.role}</span>
          </div>

          <div className="nav-right">
            <button
              onClick={toggleLanguage}
              className="btn-outline-sm"
              style={{
                cursor: "pointer",
                marginRight: "12px",
                background: "transparent",
                border: "1px solid var(--black)",
                padding: "8px 12px",
              }}
            >
              {t.langBtn}
            </button>

            <Link to="/registracija" className="btn-outline-sm">
              {t.registerBtn}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-portrait">
              <div className="image-frame">
                <img
                  src="/profilio.jpg"
                  alt="Psichologas Oskaras Jakšaitis-Brežinskas"
                  className="portrait-img"
                />
              </div>
              <div className="experience-tag">{t.expTag}</div>
            </div>

            <div className="hero-content">
              <span className="section-tag">{t.heroTag}</span>
              <h1 className="hero-heading">{t.heroTitle}</h1>
              <p className="hero-lead">{t.heroLead}</p>

              <div className="quick-specs">
                <div className="spec-item">
                  <span className="spec-label">{t.specs.format}</span>
                  <span className="spec-value">{t.specs.formatVal}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{t.specs.duration}</span>
                  <span className="spec-value">{t.specs.durationVal}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{t.specs.price}</span>
                  <span className="spec-value">{t.specs.priceVal}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{t.specs.consulting}</span>
                  <span className="spec-value">{t.specs.consultingVal}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">{t.specs.education}</span>
                  <span className="spec-value">{t.specs.educationVal}</span>
                </div>
              </div>

              <div className="actions">
                <button
                  className="btn-dark"
                  onClick={() => navigate("/registracija")}
                >
                  {t.registerHeroBtn}
                </button>
                <a href="#ket" className="link-subtle">
                  {t.aboutCbt}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="temos" className="section border-top">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">{t.specialization.tag}</span>
              <h2 className="section-title">{t.specialization.title}</h2>
            </div>

            <div className="topics-grid">
              <div className="topic-block">
                <h3>{t.specialization.adultsTitle}</h3>
                <ul>
                  {t.specialization.adultsList.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="topic-block">
                <h3>{t.specialization.parentsTitle}</h3>
                <ul>
                  {t.specialization.parentsList.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section border-top bg-subtle">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">{t.process.tag}</span>
              <h2 className="section-title">{t.process.title}</h2>
            </div>

            <div className="steps-grid">
              {t.process.steps.map((step, idx) => (
                <div className="step-item" key={idx}>
                  <span className="step-num">0{idx + 1}</span>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ket" className="section border-top">
          <div className="container">
            <KET language={language} />
          </div>
        </section>

        <section className="section border-top bg-subtle">
          <div className="container faq-container">
            <div className="section-header">
              <span className="section-tag">{t.faq.tag}</span>
              <h2 className="section-title">{t.faq.title}</h2>
            </div>

            <div className="faq-list">
              {t.faq.items.map((faq, index) => (
                <div
                  key={index}
                  className={`faq-item ${openFaq === index ? "active" : ""}`}
                  onClick={() => toggleFaq(index)}
                >
                  <div className="faq-question">
                    <span>{faq.q}</span>
                    <span className="faq-icon">
                      {openFaq === index ? "−" : "+"}
                    </span>
                  </div>
                  {openFaq === index && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-banner border-top">
          <div className="container cta-inner">
            <h2>{t.cta.title}</h2>
            <p>{t.cta.subtitle}</p>
            <button
              className="btn-dark"
              onClick={() => navigate("/registracija")}
            >
              {t.registerHeroBtn}
            </button>
          </div>
        </section>
      </main>

      <footer className="footer border-top">
        <div className="container">
          <div
            style={{
              paddingBottom: "20px",
              marginBottom: "20px",
              borderBottom: "1px solid var(--gray-light)",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--gray-mid)",
                lineHeight: "1.5",
                textAlign: "center",
              }}
            >
              {t.footer.emergency}
            </p>
          </div>

          <div className="footer-inner">
            <p>
              © {new Date().getFullYear()} Oskaras Jakšaitis-Brežinskas.{" "}
              {t.footer.rights}
            </p>
            <div style={{ textAlign: "right" }}>
              <p className="footer-sub" style={{ marginBottom: "4px" }}>
                {t.footer.sub}
              </p>
              <Link
                to="/privatumas"
                style={{
                  color: "var(--gray-dark)",
                  fontSize: "0.85rem",
                  textDecoration: "underline",
                }}
              >
                {t.footer.privacy}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("appLanguage") || "lt";
  });

  // --- Pažadiname serverį vos atidarius svetainę fone (naudojant VITE_API_URL) ---
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/ping`).catch(() => {
      // Ignoruojame klaidas fone
    });
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const newLang = prev === "lt" ? "en" : "lt";
      localStorage.setItem("appLanguage", newLang);
      return newLang;
    });
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<Home language={language} toggleLanguage={toggleLanguage} />}
      />
      <Route
        path="/registracija"
        element={
          <Registracija language={language} toggleLanguage={toggleLanguage} />
        }
      />
      <Route path="/admin" element={<Admin />} />
      <Route
        path="/privatumas"
        element={
          <Privatumas language={language} toggleLanguage={toggleLanguage} />
        }
      />
      <Route path="*" element={<NotFound language={language} />} />
    </Routes>
  );
}

export default App;
