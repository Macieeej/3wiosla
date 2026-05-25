"use client";
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

// ─── SCROLL ANIMATION HOOK ───────────────────────────────────────────────────
function useFadeIn() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Fallback: make visible after 1s regardless
    const fallback = setTimeout(() => el.classList.add("is-visible"), 1000);
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          clearTimeout(fallback);
          obs.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -50px 0px" }
    );
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);
  return ref;
}

// ─── LIGHTBOX ────────────────────────────────────────────────────────────────
function Lightbox({ images, index, onClose }: { images: string[]; index: number; onClose: () => void }) {
  const [idx, setIdx] = useState(index);
  const prev = () => setIdx(i => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIdx(i => (i === images.length - 1 ? 0 : i + 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [idx]);

  if (typeof document === "undefined") return null;
  return ReactDOM.createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img key={idx} src={images[idx]} onClick={e => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", animation: "fadeIn 0.25s ease", boxShadow: "0 20px 80px rgba(0,0,0,0.6)" }} />
      <button onClick={e => { e.stopPropagation(); prev(); }} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 52, height: 52, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button onClick={e => { e.stopPropagation(); next(); }} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 52, height: 52, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", fontSize: 20 }}>✕</button>
      <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, letterSpacing: 2 }}>{idx + 1} / {images.length}</div>
    </div>,
    document.body
  );
}

// ─── WING CARD ───────────────────────────────────────────────────────────────
function WingCard({ wing }: { wing: { tag: string; sub: string; desc: string; features: string[]; images: string[] } }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const prev = () => setIdx(i => (i === 0 ? wing.images.length - 1 : i - 1));
  const next = () => setIdx(i => (i === wing.images.length - 1 ? 0 : i + 1));

  return (
    <div style={{ background: "#fff", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)"; }}
    >
      {lightbox !== null && <Lightbox images={wing.images} index={lightbox} onClose={() => setLightbox(null)} />}
      <div style={{ height: 260, position: "relative", overflow: "hidden", background: "#e8e0d0" }}>
        <img key={idx} src={wing.images[idx]} alt={`${wing.tag} - zdjęcie ${idx + 1}`} onClick={() => setLightbox(idx)} style={{ width: "100%", height: "100%", objectFit: "cover", animation: "fadeIn 0.35s ease", cursor: "zoom-in" }} />
        <button onClick={prev} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", backdropFilter: "blur(4px)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button onClick={next} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", backdropFilter: "blur(4px)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div style={{ position: "absolute", bottom: 12, right: 14, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, backdropFilter: "blur(4px)" }}>{idx + 1} / {wing.images.length}</div>
        <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
          {wing.images.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 18 : 7, height: 7, borderRadius: 4, border: "none", cursor: "pointer", background: i === idx ? "#b8956a" : "rgba(255,255,255,0.6)", padding: 0, transition: "all 0.25s" }}/>
          ))}
        </div>
      </div>
      <div style={{ padding: "32px 32px 36px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#b8956a", margin: "0 0 8px" }}>{wing.tag}</p>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "#1a2420", margin: "0 0 14px", lineHeight: 1.3 }}>{wing.sub}</h3>
        <p style={{ fontSize: 15, color: "#6b7b74", lineHeight: 1.8, margin: "0 0 24px" }}>{wing.desc}</p>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
          {wing.features.map(f => (
            <li key={f} style={{ fontSize: 13, color: "#2d5a40", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ color: "#b8956a" }}>✓</span> {f}
            </li>
          ))}
        </ul>
        <a href="https://www.booking.com/hotel/pl/3-wiosla.pl.html" target="_blank" rel="noreferrer"
          style={{ display: "inline-block", background: "#2d5a40", color: "#fff", padding: "13px 30px", textDecoration: "none", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", transition: "background 0.2s" }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#1a3528"}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#2d5a40"}
        >Zarezerwuj</a>
      </div>
    </div>
  );
}

// ─── CONTACT FORM ────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setStatus("success"); setForm({ name: "", email: "", phone: "", message: "" }); }
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", border: "1px solid #ddd", background: "#fff", fontSize: 15, fontFamily: "'Raleway', sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#fff", marginBottom: 8 };

  if (status === "success") return (
    <div style={{ background: "#f0f9f4", border: "1px solid #2d5a40", padding: "28px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
      <p style={{ color: "#2d5a40", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Wiadomość wysłana!</p>
      <p style={{ color: "#4a5a54", fontSize: 14 }}>Odpiszemy na adres <strong>{form.email || "podany email"}</strong> wkrótce.</p>
      <button onClick={() => setStatus("idle")} style={{ marginTop: 16, background: "none", border: "1px solid #2d5a40", color: "#2d5a40", padding: "8px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Wyślij kolejną</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div><label style={labelStyle}>Imię i nazwisko</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = "#2d5a40")} onBlur={e => (e.currentTarget.style.borderColor = "#ddd")} required /></div>
      <div><label style={labelStyle}>Adres e-mail</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = "#2d5a40")} onBlur={e => (e.currentTarget.style.borderColor = "#ddd")} required /></div>
      <div><label style={labelStyle}>Telefon</label><input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} onFocus={e => (e.currentTarget.style.borderColor = "#2d5a40")} onBlur={e => (e.currentTarget.style.borderColor = "#ddd")} required /></div>
      <div><label style={labelStyle}>Wiadomość</label><textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} onFocus={e => (e.currentTarget.style.borderColor = "#2d5a40")} onBlur={e => (e.currentTarget.style.borderColor = "#ddd")} required /></div>
      {status === "error" && <p style={{ color: "#c0392b", fontSize: 13, margin: 0 }}>❌ Błąd wysyłania. Spróbuj ponownie lub napisz na rezerwacje@brzozowazatoka.pl</p>}
      <button type="submit" disabled={status === "sending"} style={{ background: status === "sending" ? "#6b7b74" : "#2d5a40", color: "#fff", padding: "15px 32px", border: "none", cursor: status === "sending" ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", alignSelf: "flex-start", transition: "background 0.2s" }}>
        {status === "sending" ? "Wysyłanie..." : "Wyślij wiadomość"}
      </button>
    </form>
  );
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const HERO_IMAGES = ["/hero/img1.jpg", "/hero/img2.jpg", "/hero/img3.jpg"];
const GALLERY_IMAGES = ["/galeria/img2.jpg", "/galeria/img3.jpg", "/galeria/img4.jpg", "/galeria/img5.jpg", "/galeria/img7.jpg"];

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 7000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const refFeatures = useFadeIn();
  const refAbout    = useFadeIn();
  const refRooms    = useFadeIn();
  const refGallery  = useFadeIn();
  const refReviews  = useFadeIn();
  const refContact  = useFadeIn();

  return (
    <>
      {/* ── FIXED BACKGROUND SLIDESHOW ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        {HERO_IMAGES.map((src, i) => (
          <div key={src} style={{ position: "absolute", inset: 0, opacity: i === heroIdx ? 1 : 0, transition: "opacity 2s ease-in-out" }}>
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", animation: "heroZoom 7s ease-in-out infinite alternate" }} />
          </div>
        ))}
        {/* Permanent dark overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(5,18,12,0.62)" }} />
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{ position: "relative", zIndex: 1, fontFamily: "'Raleway', sans-serif", color: "#1a2420" }}>

        {/* NAV */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? "rgba(250,248,243,0.97)" : "transparent", backdropFilter: scrolled ? "blur(8px)" : "none", borderBottom: scrolled ? "1px solid #e8e0d0" : "none", transition: "all 0.3s ease", padding: "0 2rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
            <div onClick={() => scrollTo("hero")} style={{ cursor: "pointer" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: scrolled ? "#2d5a40" : "#fff", letterSpacing: 1, transition: "color 0.3s" }}>3 Wiosła</span>
            </div>
            <div style={{ display: "flex", gap: 32, alignItems: "center" }} className="nav-desktop">
              {[["pokoje","Pokoje"],["galeria","Galeria"],["opinie","Opinie"],["kontakt","Kontakt"]].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Raleway', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: scrolled ? "#2d5a40" : "#fff", transition: "color 0.3s" }}>{label}</button>
              ))}
              <a href="https://www.facebook.com/profile.php?id=61553811644181" target="_blank" rel="noreferrer" style={{ color: scrolled ? "#2d5a40" : "#fff", textDecoration: "none", transition: "color 0.3s" }} title="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: scrolled ? "#2d5a40" : "#fff" }} className="nav-mobile">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
          {menuOpen && (
            <div style={{ background: "#faf8f3", borderTop: "1px solid #e8e0d0", padding: "1rem 2rem 1.5rem" }}>
              {[["pokoje","Pokoje"],["galeria","Galeria"],["opinie","Opinie"],["kontakt","Kontakt"]].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontFamily: "'Raleway', sans-serif", fontSize: 15, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#2d5a40", padding: "10px 0" }}>{label}</button>
              ))}
            </div>
          )}
        </nav>

        {/* HERO — transparent, shows fixed background */}
        <section id="hero" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", position: "relative" }}>
          <div style={{ textAlign: "center", padding: "0 1.5rem", maxWidth: 800, margin: "0 auto" }}>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, letterSpacing: 5, textTransform: "uppercase", marginBottom: 20, fontWeight: 600 }}>Jezioro Brenno · Wielkopolska</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(52px, 10vw, 96px)", fontWeight: 300, color: "#fff", lineHeight: 1.05, margin: "0 0 12px", letterSpacing: -1 }}>3 Wiosła</h1>
            <div style={{ width: 60, height: 1, background: "#b8956a", margin: "0 auto 24px" }}/>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 300, lineHeight: 1.7, marginBottom: 44 }}>
              Domek nad jeziorem w sercu Wielkopolski.<br/>Spokój, natura i niezapomniane chwile.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://www.booking.com/hotel/pl/3-wiosla.pl.html" target="_blank" rel="noreferrer"
                style={{ background: "#b8956a", color: "#fff", padding: "15px 36px", textDecoration: "none", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#a07d55"}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#b8956a"}
              >Zarezerwuj teraz</a>
              <button onClick={() => scrollTo("pokoje")}
                style={{ background: "transparent", color: "#fff", padding: "15px 36px", fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.6)", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
              >Zobacz pokoje</button>
            </div>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
              <a href="https://share.google/vSupUeWfV16cUlA5Q" target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", padding: "10px 18px", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <span style={{ color: "#fbbc04", fontSize: 16 }}>★★★★★</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Google</span>
              </a>
              <a href="https://www.booking.com/hotel/pl/3-wiosla.pl.html" target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", padding: "10px 18px", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <span style={{ color: "#003580", background: "#fff", fontSize: 12, fontWeight: 800, padding: "2px 6px" }}>booking</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}></span>
              </a>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 32 }}>
              {HERO_IMAGES.map((_, i) => (
                <button key={i} onClick={() => setHeroIdx(i)} style={{ width: i === heroIdx ? 24 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer", background: i === heroIdx ? "#b8956a" : "rgba(255,255,255,0.4)", padding: 0, transition: "all 0.4s" }}/>
              ))}
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)" }}>
            <div style={{ width: 24, height: 38, border: "2px solid rgba(255,255,255,0.4)", borderRadius: 12, display: "flex", justifyContent: "center", paddingTop: 6 }}>
              <div style={{ width: 3, height: 8, background: "rgba(255,255,255,0.6)", borderRadius: 2, animation: "scrollBob 1.5s ease-in-out infinite" }}/>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section ref={refFeatures as React.RefObject<HTMLElement>} className="fade-in-section" style={{ background: "transparent", padding: "40px 2rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "16px", textAlign: "center" }}>
            {[["🌊","Nad jeziorem"],["🏠","Prywatny dom"],["🌲","Blisko natury"],["🏊️","Basen"],["🛶","Sprzęt wodny"],["🚗","Parking"],["📶","Wi-Fi"]].map(([icon, label]) => (
              <div key={label} style={{ color: "#d0e4d8" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#b8c9b0" }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* O NAS */}
        <section ref={refAbout as React.RefObject<HTMLElement>} className="fade-in-section" style={{ padding: "100px 2rem", background: "transparent" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <p style={{ color: "#b8956a", fontSize: 12, letterSpacing: 5, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>O nas</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.2, margin: "0 0 24px" }}>Twój azyl nad Jeziorem Brenno</h2>
            <div style={{ width: 50, height: 1, background: "#b8956a", margin: "0 auto 32px" }}/>
            <p style={{ fontSize: 17, lineHeight: 1.9, color: "rgba(255,255,255,0.85)", maxWidth: 680, margin: "0 auto" }}>
              <strong style={{ color: "#b8d4bc" }}>3 Wiosła</strong> to wyjątkowe miejsce wypoczynku położone nad malowniczym Jeziorem Brenno w Wielkopolsce.
              Oferujemy dwuskrzydłowy budynek z ośmioma apartamentami 4/5 osobowymi. Łącznie może pomieścić 38 osób. Dom posiada 2 całkowicie niezależne od siebie skrzydła gdzie mogą przebywać w tym samym czasie dwie niezależne grupy - każda ma swoją część na wyłączność.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.9, color: "rgba(255,255,255,0.85)", maxWidth: 680, margin: "16px auto 0" }}>
              Bezpośredni dostęp do jeziora, czyste powietrze i cisza sprawią, że nie będziesz chciał wracać do domu. Idealny na rodzinny relaks, imprezę okolicznościową lub spokojny wypoczynek z dala od miejskiego zgiełku.
            </p>
          </div>
        </section>

        {/* POKOJE */}
        <section id="pokoje" ref={refRooms as React.RefObject<HTMLElement>} className="fade-in-section" style={{ padding: "80px 2rem 100px", background: "transparent" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ color: "#b8956a", fontSize: 12, letterSpacing: 5, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Noclegi</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 400, color: "#fff", margin: 0 }}>Nasze Pokoje</h2>
              <div style={{ width: 50, height: 1, background: "#b8956a", margin: "20px auto 0" }}/>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 40 }}>
              {[
                { tag: "Skrzydło Południowe", sub: "Dom z 5 sypialniami, dla 24 gości", desc: "Przestronny dom - idealny na duże rodzinne zjazdy, imprezy urodzinowe lub wyjazdy integracyjne. Pięć sypialni z tarasami, w pełni wyposażona kuchnia i przestronny salon.", features: ["5 sypialni", "Do 24 gości", "Salon z widokiem na las oraz altana", "Pełna kuchnia", "Bilard", "Parking", "Wi-Fi"], images: [1,3,4,5,6,7,8,9,10,11,12,13].map(n => `/poludnie/img${n}.jpg`), key: "poludnie" },
                { tag: "Skrzydło Północne", sub: "Dom z 3 sypialniami, dla 14 gości", desc: "Kameralny i przytulny dom - idealny dla rodziny lub grupy znajomych. Trzy sypialnie z tarasami, w pełni wyposażona kuchnia i przestronny salon.", features: ["3 sypialnie", "Do 14 gości", "Salon oraz altana przy lesie", "Pełna kuchnia", "Bilard", "Parking", "Wi-Fi"], images: [1,2,3,4,5,8,9,10,11,12,13].map(n => `/polnoc/img${n}.jpg`), key: "polnoc" },
              ].map((wing) => <WingCard key={wing.key} wing={wing} />)}
            </div>
          </div>
        </section>

        {/* GALERIA */}
        <section id="galeria" ref={refGallery as React.RefObject<HTMLElement>} className="fade-in-section" style={{ padding: "100px 2rem", background: "transparent" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ color: "#b8956a", fontSize: 12, letterSpacing: 5, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Zdjęcia</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 400, color: "#fff", margin: 0 }}>Galeria</h2>
              <div style={{ width: 50, height: 1, background: "#b8956a", margin: "20px auto 0" }}/>
            </div>
            {lightboxIdx !== null && <Lightbox images={GALLERY_IMAGES} index={lightboxIdx} onClose={() => setLightboxIdx(null)} />}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "240px 240px", gap: 12 }}>
              {[
                { url: GALLERY_IMAGES[0], gridRow: "span 2", gridColumn: "span 1" },
                { url: GALLERY_IMAGES[1], gridRow: "span 1", gridColumn: "span 1" },
                { url: GALLERY_IMAGES[2], gridRow: "span 1", gridColumn: "span 1" },
                { url: GALLERY_IMAGES[3], gridRow: "span 1", gridColumn: "span 1" },
                { url: GALLERY_IMAGES[4], gridRow: "span 1", gridColumn: "span 1" },
              ].map((img, i) => (
                <div key={i} onClick={() => setLightboxIdx(i)} style={{ overflow: "hidden", gridRow: img.gridRow, gridColumn: img.gridColumn, cursor: "zoom-in" }}>
                  <img src={img.url} alt={`Zdjęcie ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  />
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <a href="https://www.facebook.com/profile.php?id=61553811644181" target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "#2d5a40", textDecoration: "none", fontSize: 14, fontWeight: 700, letterSpacing: 1, border: "1px solid #2d5a40", padding: "12px 28px", transition: "background 0.2s, color 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#2d5a40"; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#2d5a40"; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                Więcej na Facebooku
              </a>
            </div>
          </div>
        </section>

        {/* OPINIE */}
        <section id="opinie" ref={refReviews as React.RefObject<HTMLElement>} className="fade-in-section" style={{ padding: "100px 2rem", background: "transparent" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ color: "#b8956a", fontSize: 12, letterSpacing: 5, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Co mówią goście</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 400, color: "#fff", margin: 0 }}>Opinie</h2>
              <div style={{ width: 50, height: 1, background: "#b8956a", margin: "20px auto 0" }}/>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 48 }}>
              {[
                { text: "Super miejsce, można wypożyczyć kajaki, miejsce na grilla, do tego bilard, dobrze wyposażona kuchnia. Idealne na wyjazd większą ekipą", author: "Piotr", platform: "Google", stars: 5 },
                { text: "Ośrodek położony obok lasu i jeziora, widoki piękne. Pokoje ładne, kuchnia super wyposażona. Basen z podgrzewaną wodą - wielki plus :) W barze pysze jedzenie i zimne piwko. Obsługa super, właściciele bardzo mili. Polecam jak najbardziej 🌹", author: "Iza", platform: "Google", stars: 5 },
                { text: "Świąteczne spotkanie dla 25 osób, komfortowe warunki świętowania i wypoczynku. Piękna okolica, świetnie wyposażona kuchnia i pokoje, WiFi darmowe i dobry zasięg. Plus telewizja z różnymi platformami, z rozrywki to dostępny bilard i gry planszowe. Parking i dojazd ok. Świetny kontakt z właścicielem, wszystko do uzgodnienia, super ceny. Serdecznie polecamy wypoczynek.", author: "Rafał", platform: "Google", stars: 5 },
                { text: "Wybralismy się na spotanicze wakację 5osobową grupą, bylismy zaskoczeni pobytem. Bardzo nam się podobał basen, przemiła obsługa i wygodna lokalizacja. Serdecznie polecamy!", author: "Samanta", platform: "Booking.com", stars: 5 },
                { text: "Super domek dla większej ilości osób. Bardzo dobry kontakt z właścicielem, z którym można było wszystko dogadać. Dźwiękoszczelne pokoje i domek. Czystość i okolice bardzo przyjemne :)", author: "Natalia", platform: "Booking.com", stars: 5 },
                { text: "Spędziliśmy wraz ze znajomymi miło czas w obiekcie. Niezaprzeczalnie dodatkowym atutem tego miejsca jest podgrzewany basen dostępny od maja do października. Łóżka są bardzo wygodne, a sam apartament przestronny. Do naszego apartamentu przydzielony był duży taras z widokiem na zieleń. Wspólna przestrzeń umożliwia zrobienie sobie śniadania czy obiadu lub po prostu spędzenie fajnego czasu z innymi odwiedzającymi. Zdecydowanie polecam te miejsce!", author: "Amanda", platform: "Booking.com", stars: 5 },
              ].map((review) => (
                <div key={review.author} style={{ background: "rgba(255,255,255,0.06)", padding: "28px", border: "1px solid rgba(255,255,255,0.08)", transition: "background 0.3s, transform 0.3s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                >
                  <div style={{ color: "#fbbc04", fontSize: 16, marginBottom: 14, letterSpacing: 2 }}>{"★".repeat(review.stars)}</div>
                  <p style={{ color: "#c8ddd4", fontSize: 15, lineHeight: 1.8, fontStyle: "italic", margin: "0 0 20px" }}>&ldquo;{review.text}&rdquo;</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#8aa89e", fontSize: 13, fontWeight: 600 }}>— {review.author}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: review.platform === "Google" ? "#fbbc04" : "#003580", background: review.platform === "Google" ? "rgba(251,188,4,0.12)" : "#fff", padding: "4px 10px" }}>{review.platform}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://share.google/vSupUeWfV16cUlA5Q" target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#1a2420", padding: "14px 24px", textDecoration: "none", fontSize: 13, fontWeight: 700, letterSpacing: 1, transition: "transform 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"}
              ><span style={{ color: "#fbbc04" }}>★</span> Zobacz opinie Google</a>
              <a href="https://www.booking.com/hotel/pl/3-wiosla.pl.html" target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#003580", color: "#fff", padding: "14px 24px", textDecoration: "none", fontSize: 13, fontWeight: 700, letterSpacing: 1, transition: "transform 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"}
              ><span style={{ fontSize: 11, background: "#fff", color: "#003580", padding: "2px 5px", fontWeight: 900 }}>b</span> Zobacz opinie Booking.com</a>
            </div>
          </div>
        </section>

        {/* KONTAKT */}
        <section id="kontakt" ref={refContact as React.RefObject<HTMLElement>} className="fade-in-section" style={{ padding: "100px 2rem", background: "transparent" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ color: "#b8956a", fontSize: 12, letterSpacing: 5, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Napisz do nas</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 400, color: "#fff", margin: 0 }}>Kontakt</h2>
              <div style={{ width: 50, height: 1, background: "#b8956a", margin: "20px auto 0" }}/>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40, alignItems: "start" }}>
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: "#fff", margin: "0 0 28px" }}>Dane kontaktowe</h3>
                {[
                  { icon: "📍", label: "Adres", value: "ul. Plażowa 32\n64-150 Brenno, Polska", link: "https://maps.google.com/?q=Plażowa+32,+Brenno" },
                  { icon: "📞", label: "Telefon", value: "+48 735 977 169", link: "tel:+48735977169" },
                  { icon: "✉️", label: "E-mail", value: "rezerwacje@brzozowazatoka.pl", link: "mailto:rezerwacje@brzozowazatoka.pl" },
                ].map(({ icon, label, value, link }) => (
                  <div key={label} style={{ display: "flex", gap: 16, marginBottom: 28 }}>
                    <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#b8956a", marginBottom: 4 }}>{label}</div>
                      <a href={link} style={{ color: "#fff", textDecoration: "none", fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-line" }}>{value}</a>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <a href="https://www.facebook.com/profile.php?id=61553811644181" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, background: "#1877f2", color: "#fff", textDecoration: "none", padding: "10px 16px", fontSize: 13, fontWeight: 600, transition: "background 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#1560c0"}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#1877f2"}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                    3 Wiosła
                  </a>
                  <a href="https://www.facebook.com/BrzozowaZatoka" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, background: "#1877f2", color: "#fff", textDecoration: "none", padding: "10px 16px", fontSize: 13, fontWeight: 600, transition: "background 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#1560c0"}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#1877f2"}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                    Brzozowa Zatoka
                  </a>
                </div>
              </div>
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: "#fff", margin: "0 0 28px" }}>Wyślij wiadomość</h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: "rgba(17,29,24,0.98)", color: "#8aa89e", padding: "40px 2rem 200px", textAlign: "center" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#c8ddd4", margin: "0 0 8px" }}>3 Wiosła</p>
          <p style={{ fontSize: 13, margin: "0 0 20px" }}>ul. Plażowa 32, 64-150 Brenno · <a href="tel:+48735977169" style={{ color: "#8aa89e", textDecoration: "none" }}>+48 735 977 169</a></p>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 24 }}>
            <a href="https://www.facebook.com/profile.php?id=61553811644181" target="_blank" rel="noreferrer" style={{ color: "#8aa89e", textDecoration: "none", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>Facebook</a>
            <a href="https://www.booking.com/hotel/pl/3-wiosla.pl.html" target="_blank" rel="noreferrer" style={{ color: "#8aa89e", textDecoration: "none", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>Booking.com</a>
          </div>
          <p style={{ fontSize: 12, color: "#4a5a54", margin: 0 }}>© {new Date().getFullYear()} 3 Wiosła. Wszelkie prawa zastrzeżone.</p>
        </footer>

        {/* STICKY BOOKING BUTTON */}
        <a href="https://www.booking.com/hotel/pl/3-wiosla.pl.html" target="_blank" rel="noreferrer" className="sticky-booking-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Zarezerwuj teraz
        </a>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Raleway:wght@300;400;600;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          @keyframes scrollBob { 0%,100% { transform: translateY(0); opacity:1; } 50% { transform: translateY(6px); opacity:0.4; } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes heroZoom { from { transform: scale(1.0); } to { transform: scale(1.08); } }
          @keyframes glowPulse {
            0%, 100% { box-shadow: 0 8px 32px rgba(184,149,106,0.5), 0 0 0 0 rgba(184,149,106,0.4); }
            50% { box-shadow: 0 12px 48px rgba(184,149,106,0.8), 0 0 0 10px rgba(184,149,106,0); }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .fade-in-section { opacity: 0; transform: translateY(40px); transition: opacity 0.9s ease, transform 0.9s ease; }
          .fade-in-section.is-visible { opacity: 1; transform: translateY(0); }
          .sticky-booking-btn {
            position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
            z-index: 200; color: #fff; text-decoration: none;
            padding: 40px 120px; font-size: 30px; font-weight: 700;
            letter-spacing: 5px; text-transform: uppercase;
            display: flex; align-items: center; gap: 12px;
            white-space: nowrap; border-radius: 2px;
            background: linear-gradient(105deg, #b8956a 40%, #e8c99a 50%, #b8956a 60%);
            background-size: 200% auto;
            animation: glowPulse 5s ease-in-out infinite, shimmer 10s linear infinite;
            transition: transform 0.2s;
            font-family: 'Raleway', sans-serif;
          }
          .sticky-booking-btn:hover {
            transform: translateX(-50%) translateY(-3px) scale(1.03);
            animation: shimmer 5s linear infinite;
          }
          @media (max-width: 768px) {
            .nav-desktop { display: none !important; }
            .nav-mobile { display: block !important; }
            .sticky-booking-btn { padding: 24px 48px; font-size: 19px; letter-spacing: 3px; bottom: 16px; }
          }
        `}</style>
      </div>
    </>
  );
}