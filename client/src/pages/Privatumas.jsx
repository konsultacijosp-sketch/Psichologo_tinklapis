import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { translations } from "../translations";
import "./Registracija.css"; // Baziniam išdėstymui (konteineriai, mygtukai)
import "./Privatumas.css"; // Specifiniams privatumo stiliams

function Privatumas({ language = "lt", toggleLanguage }) {
  const t = translations[language].privacy;
  const langBtnText = translations[language].langBtn;

  // Automatiškai slenkame į viršų, kai atidaromas puslapis
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="registration-page privacy-page-wrapper">
      <div className="container reg-container">
        <div className="reg-header">
          <Link to="/" className="back-link">
            {t.back}
          </Link>
          <button onClick={toggleLanguage} className="lang-toggle-btn">
            {langBtnText}
          </button>
        </div>

        <div className="reg-box privacy-box">
          <h1 className="reg-title privacy-title">{t.title}</h1>
          <p className="privacy-date">{t.lastUpdated}</p>

          <div className="privacy-content">
            {t.sections.map((section, index) => (
              <div key={index}>
                <h3 className="privacy-heading">{section.heading}</h3>
                <p className="privacy-text">{section.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Privatumas;
