import React from "react";
import "./NotFound.css";
import { Link } from "react-router-dom";
import { translations } from "../translations";

function NotFound({ language = "lt" }) {
  const t = translations[language].notFound;

  return (
    <div className="not-found-page">
      <h1 className="not-found-title">{t.title}</h1>
      <p className="not-found-desc">{t.desc}</p>
      <Link to="/" className="btn-dark not-found-link">
        {t.backBtn}
      </Link>
    </div>
  );
}

export default NotFound;
