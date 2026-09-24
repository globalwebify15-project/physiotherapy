import Link from "next/link";

export default function HomePage() {
  const services = [
    "Stroke / Paralysis",
    "Parkinson's / Alzheimer's",
    "Facial / Bell's Palsy",
    "Vestibular Dysfunction",
    "Cervical Spondylosis",
    "Lumbar Spondylosis",
    "OA (Knee Pain)",
    "Tennis / Golfer's Elbow",
    "Frozen Shoulder",
    "CP Child",
    "Developmental Delay",
    "Autism",
    "Prenatal & Postnatal Physiotherapy",
    "Knee / Hip Replacement Rehab",
    "Sports Injury Management",
  ];

  const endpoints = [
    { name: "Services API (15 Services)", path: "/api/services" },
    { name: "Therapists API (Doctor Profiles)", path: "/api/therapists" },
    { name: "Appointments API", path: "/api/appointments" },
    { name: "CMS Content & FAQ API", path: "/api/cms" },
    { name: "Patient Records API", path: "/api/patients" },
    { name: "Clinic Reviews API", path: "/api/reviews" },
  ];

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #334155", paddingBottom: 24, marginBottom: 32 }}>
        <div style={{ display: "inline-block", padding: "6px 14px", background: "#0284c722", color: "#38bdf8", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          🟢 API Server Online • v1.0.0
        </div>
        <h1 style={{ fontSize: 32, margin: "0 0 8px 0", color: "#ffffff", fontWeight: 700 }}>
          Dr. Bariyar&apos;s Physiotherapy & Rehabilitation
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 16, margin: 0 }}>
          Backend REST API & Database Services Portal
        </p>
      </header>

      {/* Schedule & Info Banner */}
      <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "1px solid #334155", borderRadius: 16, padding: 24, marginBottom: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          <div>
            <div style={{ color: "#38bdf8", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Clinic Schedule</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", marginTop: 4 }}>9:00 AM – 7:00 PM</div>
            <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}>Monday – Sunday (Daily)</div>
          </div>
          <div>
            <div style={{ color: "#38bdf8", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Chief Physiotherapist</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", marginTop: 4 }}>Dr. Rajnish Bariyar</div>
            <div style={{ color: "#94a3b8", fontSize: 13 }}>BPT, MIAP, JSCPT • Founder</div>
          </div>
          <div>
            <div style={{ color: "#38bdf8", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Co-Founder & Director</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", marginTop: 4 }}>Dr. Priyanka Bariyar</div>
            <div style={{ color: "#94a3b8", fontSize: 13 }}>BPT, MIAP, JSCPT • Pediatric & Neuro Specialist</div>
          </div>
        </div>
      </div>

      {/* Live API Endpoints */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, color: "#f8fafc", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span>⚡</span> Live JSON Endpoints
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          {endpoints.map((ep) => (
            <a
              key={ep.path}
              href={ep.path}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "16px 20px",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 12,
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.2s, background 0.2s",
              }}
            >
              <div style={{ fontWeight: 600, color: "#ffffff", fontSize: 15 }}>{ep.name}</div>
              <div style={{ color: "#38bdf8", fontSize: 13, fontFamily: "monospace", marginTop: 4 }}>{ep.path} →</div>
            </a>
          ))}
        </div>
      </section>

      {/* 15 Clinical Services */}
      <section>
        <h2 style={{ fontSize: 20, color: "#f8fafc", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span>🩺</span> Active Clinical Services ({services.length})
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {services.map((service, idx) => (
            <div
              key={service}
              style={{
                background: "#1e293b80",
                border: "1px solid #334155",
                borderRadius: 10,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ color: "#38bdf8", fontWeight: 700, fontSize: 13, minWidth: 24 }}>#{idx + 1}</span>
              <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 500 }}>{service}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
