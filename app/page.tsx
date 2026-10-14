"use client";
import { useEffect, useRef, useState } from "react";
import {
  CarFront,
  ArrowUpRight,
  RefreshCw,
  LocateFixed,
  Layers,
  MapPin,
  Fuel,
  Navigation,
  Check,
  AlertCircle,
} from "lucide-react";
type Car = {
  id: number;
  latitude: number;
  longitude: number;
  discount: number;
  fuel: string;
};
export default function Home() {
  const [lang, setLang] = useState<"en" | "he">("he");
  const he = lang === "he";
  const t = (en: string, hebrew: string) => (he ? hebrew : en);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("autotel-language");
      if (saved === "he" || saved === "en") setLang(saved);
    } catch {}
  }, []);

  function toggleLanguage() {
    const next = he ? "en" : "he";
    setLang(next);
    try {
      localStorage.setItem("autotel-language", next);
    } catch {}
  }

  const [cars, setCars] = useState<Car[]>([]),
    [filter, setFilter] = useState<number>(50),
    [selected, setSelected] = useState<number | null>(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [updated, setUpdated] = useState(""),
    [ready, setReady] = useState(false),
    [geoError, setGeoError] = useState("");
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = he ? "rtl" : "ltr";
    const zoomIn = document.querySelector(".leaflet-control-zoom-in");
    const zoomOut = document.querySelector(".leaflet-control-zoom-out");
    zoomIn?.setAttribute("title", he ? "התקרבות" : "Zoom in");
    zoomIn?.setAttribute("aria-label", he ? "התקרבות" : "Zoom in");
    zoomOut?.setAttribute("title", he ? "התרחקות" : "Zoom out");
    zoomOut?.setAttribute("aria-label", he ? "התרחקות" : "Zoom out");
  }, [lang, ready]);
  const map = useRef<any>(null),
    layer = useRef<any>(null),
    pins = useRef<any>({}),
    initial = useRef(true),
    user = useRef<any>(null);
  const filtered = cars.filter((c) => filter === 0 || c.discount === filter);
  const inFlight = useRef(false);
  async function refresh() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/vehicles");
      const d: any = await r.json();
      if (!r.ok) throw Error(d.error);
      setCars(d.vehicles);
      setUpdated(d.updatedAt);
    } catch (e: any) {
      setError(e.message || "Could not load cars. Please try again.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "/vendor/leaflet.js";
    s.onload = () => {
      const L = (window as any).L;
      if (map.current) return;
      map.current = L.map("map", { zoomControl: false }).setView(
        [32.08535, 34.7818],
        13,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map.current);
      L.control.zoom({ position: "bottomright" }).addTo(map.current);
      layer.current = L.layerGroup().addTo(map.current);
      setReady(true);
    };
    s.onerror = () => setGeoError("map");
    document.body.appendChild(s);
    return () => {
      map.current?.remove();
      map.current = null;
      s.remove();
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const L = (window as any).L;
    layer.current.clearLayers();
    pins.current = {};
    filtered.forEach((c) => {
      const marker = L.marker([c.latitude, c.longitude], {
        icon: L.divIcon({
          className: "discount-pin" + (selected === c.id ? " active" : ""),
          html: `<span>${c.discount}%<small>${t("OFF", "הנחה")}</small></span>`,
          iconSize: [55, 48],
          iconAnchor: [27, 48],
        }),
        keyboard: true,
        title: `${t("Car", "רכב")} ${c.id}, ${c.discount}% ${t("off", "הנחה")}`,
      })
        .addTo(layer.current)
        .on("click", () => {
          setSelected(c.id);
          document
            .getElementById("car-" + c.id)
            ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      pins.current[c.id] = marker;
    });
    if (initial.current && filtered.length) {
      fit();
      initial.current = false;
    }
  }, [cars, filter, ready, selected, lang]);
  function fit() {
    if (map.current && filtered.length)
      map.current.fitBounds(
        filtered.map((c) => [c.latitude, c.longitude]),
        { padding: [65, 65], maxZoom: 14 },
      );
  }
  function select(c: Car) {
    setSelected(c.id);
    map.current?.flyTo([c.latitude, c.longitude], 16, { duration: 0.7 });
  }
  function locate() {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("unsupported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const L = (window as any).L;
        if (!map.current) return;
        user.current?.remove();
        user.current = L.circleMarker([p.coords.latitude, p.coords.longitude], {
          radius: 8,
          color: "white",
          weight: 3,
          fillColor: "#2574f5",
          fillOpacity: 1,
        }).addTo(map.current);
        map.current.flyTo([p.coords.latitude, p.coords.longitude], 14);
      },
      () => setGeoError("location"),
      { timeout: 10000 },
    );
  }
  return (
    <div className="app" dir={he ? "rtl" : "ltr"}>
      <header>
        <a dir={he ? "rtl" : "ltr"} className="brand" href="/">
          <span className="logo">
            <CarFront size={24} />
          </span>
          <span>{t("Auto Tachles", "אוטו תכל׳ס")}</span>
          <span className="brand-tag">
            {t("DISCOUNT FINDER", "איתור הנחות")}
          </span>
        </a>
        <div className="city">
          <span />
          Tel Aviv–Yafo <span className="hebrew">תל אביב–יפו</span>
        </div>
        <a
          className="official"
          href="https://www.autotel.co.il/"
          target="_blank"
          rel="noreferrer"
        >
          {t("AutoTel website", "לאתר אוטותל")} <ArrowUpRight size={16} />
        </a>
        <button
          className="language-toggle"
          onClick={toggleLanguage}
          aria-label={t("Switch to Hebrew", "Switch to English")}
          lang={he ? "en" : "he"}
        >
          {he ? "English" : "עברית"}
        </button>
      </header>
      <main>
        <aside>
          <div className="intro">
            <div className="notice" role="note">
              {t(
                "DEMO — All vehicles, locations, discounts and fuel levels are fictional. Not for booking or navigation.",
                "אתר הדגמה — כל הרכבים, המיקומים, ההנחות ומפלסי הדלק פיקטיביים. לא להזמנה או לניווט.",
              )}
            </div>
            <div className="eyebrow">
              {t("THE CITY. FOR LESS.", "העיר שלכם. בפחות כסף.")}
            </div>
            <h1>
              {t("Your next ride.", "הנסיעה הבאה שלכם.")}
              <br />
              <span>{t("A better price.", "במחיר טוב יותר.")}</span>
            </h1>
            <p>
              {t(
                "Find discounted AutoTel cars around you.",
                "מצאו רכבי אוטותל בהנחה באזורכם.",
              )}
              <br />
              {t("Pick a pin. Get going.", "בחרו רכב במפה וצאו לדרך.")}
            </p>
          </div>
          <section className="filters">
            <label>{t("SHOW DISCOUNTS", "סינון לפי הנחה")}</label>
            <div className="chips">
              {[50, 30, 20, 0].map((n) => (
                <button
                  key={n}
                  className={filter === n ? "chosen" : ""}
                  onClick={() => {
                    setFilter(n);
                    setSelected(null);
                    initial.current = true;
                  }}
                >
                  {filter === n && <Check size={13} />}{" "}
                  {n === 0 ? t("All offers", "כל ההנחות") : n + "%"}
                </button>
              ))}
            </div>
          </section>
          <div className="results-head">
            <h2>
              {busy && !updated
                ? t("Finding cars…", "מחפשים רכבים…")
                : filtered.length + t(" demo cars", " רכבים לדוגמה")}
            </h2>
            <span>
              {filter
                ? filter + t("% off", "% הנחה")
                : t("Discounted", "בהנחה")}
            </span>
          </div>
          <div className="list" aria-live="polite">
            {error && (
              <div className="notice">
                <AlertCircle size={19} />
                <div>
                  {t(
                    "Demo data could not load. Please try again.",
                    "לא ניתן לטעון כרגע את נתוני ההדגמה. נסו שוב.",
                  )}
                  {updated && (
                    <p>
                      {t(
                        "Showing the last successful results. Availability may have changed.",
                        "מוצגות התוצאות מהעדכון האחרון. ייתכן שהזמינות השתנתה.",
                      )}
                    </p>
                  )}
                  <button onClick={refresh} disabled={busy}>
                    {t("Try again", "נסו שוב")}
                  </button>
                </div>
              </div>
            )}
            {!busy && !error && !filtered.length && (
              <div className="empty">
                <CarFront size={32} />
                <h3>
                  {t("No matching cars right now", "אין כרגע רכבים תואמים")}
                </h3>
                <p>
                  {t(
                    "Try another discount or refresh shortly.",
                    "בחרו הנחה אחרת או נסו לרענן בעוד רגע.",
                  )}
                </p>
              </div>
            )}
            {filtered.map((c) => (
              <article
                id={"car-" + c.id}
                key={c.id}
                className={"car-card " + (selected === c.id ? "selected" : "")}
              >
                <button
                  className="car-main"
                  onClick={() => select(c)}
                  aria-label={t(
                    "Show car " + c.id + " on map",
                    "הצגת רכב " + c.id + " במפה",
                  )}
                >
                  <span className="car-icon">
                    <CarFront size={28} />
                  </span>
                  <span className="car-info">
                    <strong>
                      {t("Demo car", "רכב לדוגמה")} <bdi>#{c.id}</bdi>
                    </strong>
                    <span>
                      <MapPin size={12} />{" "}
                      <bdi>
                        {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                      </bdi>
                    </span>
                  </span>
                  <span className="badge">
                    {c.discount}%<small>{t("OFF", "הנחה")}</small>
                  </span>
                </button>
                <div className="car-bottom">
                  <span>
                    <Fuel size={13} />
                    {(
                      {
                        high: t("High fuel", "מפלס דלק גבוה"),
                        med: t("Medium fuel", "מפלס דלק בינוני"),
                        low: t("Low fuel", "מפלס דלק נמוך"),
                      } as any
                    )[c.fuel] || t("Fuel not reported", "אין נתוני דלק")}
                  </span>
                  <a
                    href={
                      "https://www.google.com/maps/dir/?api=1&destination=" +
                      c.latitude +
                      "," +
                      c.longitude +
                      "&travelmode=walking"
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("Demo directions", "הוראות הגעה לדוגמה")}{" "}
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div className="aside-footer">
            <span className={"status-dot " + (error ? "warn" : "")} />
            {t("Demo · fictional vehicles", "דמו · רכבים פיקטיביים")}
            <span>{t("No live data", "ללא נתונים חיים")}</span>
          </div>
        </aside>
        <section
          className="map-panel"
          aria-label={t("Discounted cars map", "מפת רכבים בהנחה")}
        >
          <div id="map" dir="ltr" />
          <div className="map-top">
            <div className="map-label">
              <span className="status-dot" />{" "}
              {filter
                ? filter + t("% off cars", "% הנחה על רכבים")
                : t("All discounted cars", "כל הרכבים בהנחה")}
              <span className="divider" /> {t("Mock data", "נתונים פיקטיביים")}
            </div>
            <button
              className="refresh"
              aria-label={t("Refresh cars", "רענון רכבים")}
              onClick={refresh}
              disabled={busy}
            >
              <RefreshCw size={16} className={busy ? "spin" : ""} />
              {busy ? t("Refreshing", "מרעננים") : t("Refresh", "רענון")}
            </button>
          </div>
          <div className="map-actions">
            <button
              onClick={fit}
              title={t("Show all matching cars", "הצגת כל הרכבים התואמים")}
              aria-label={t("Show all matching cars", "הצגת כל הרכבים התואמים")}
            >
              <Layers size={20} />
            </button>
            <button
              onClick={locate}
              title={t("My location", "המיקום שלי")}
              aria-label={t("My location", "המיקום שלי")}
            >
              <LocateFixed size={20} />
            </button>
          </div>
          {geoError && (
            <div className="geo-error" role="alert">
              {geoError === "map"
                ? t(
                    "Map could not load. Car directions are still available below.",
                    "המפה לא נטענה. הוראות ההגעה לרכבים עדיין זמינות.",
                  )
                : geoError === "unsupported"
                  ? t(
                      "Location is not supported by this browser.",
                      "הדפדפן אינו תומך באיתור מיקום.",
                    )
                  : t(
                      "Location unavailable. Allow location access in your browser and try again.",
                      "המיקום אינו זמין. אפשרו גישה למיקום בדפדפן ונסו שוב.",
                    )}
              <button onClick={() => setGeoError("")}>
                {t("Dismiss", "סגירה")}
              </button>
            </div>
          )}
          <div className="map-note">
            <Navigation size={17} />
            <div>
              <strong>
                {t("A little walk. A better deal.", "קצת הליכה. הרבה חיסכון.")}
              </strong>
              <span>
                {t(
                  "Select a car to see it on the map and get walking directions.",
                  "בחרו רכב כדי לראות אותו במפה ולקבל הוראות הליכה.",
                )}
              </span>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <span>
          {t(
            "Independent finder \u00b7 Not affiliated with AutoTel",
            "כלי עצמאי · אינו קשור לאוטותל",
          )}
        </span>
        <span>
          {t(
            "Demonstration only. All vehicle data is fictional; no connection to the AutoTel API.",
            "להמחשה בלבד. כל נתוני הרכבים פיקטיביים; אין חיבור לממשק הנתונים של אוטותל.",
          )}
        </span>
        <a
          className="github-link"
          href="https://github.com/yhaggai/auto-tachles"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("View source on GitHub", "צפייה בקוד המקור ב־GitHub")}
        >
          <span dir="ltr">GitHub</span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </footer>
    </div>
  );
}
