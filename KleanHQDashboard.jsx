/**
 * KleanHQ Dashboard — UI Prototype v1.0
 * ─────────────────────────────────────────────────────────────────
 * Claude Code setup:
 *   npx create-next-app@latest kleanhq --app --tailwind --typescript
 *   cd kleanhq
 *   cp KleanHQDashboard.jsx app/page.jsx   (or src/app/page.jsx)
 *   npm run dev → open http://localhost:3000
 *
 * Or drop into any Vite/React project:
 *   npm create vite@latest kleanhq -- --template react
 *   cd kleanhq && npm install
 *   cp KleanHQDashboard.jsx src/App.jsx
 *   Update src/main.jsx: import App from './App'
 *   npm run dev
 *
 * No external dependencies required — pure React + inline styles.
 * ─────────────────────────────────────────────────────────────────
 * Pages: Dashboard · Dialer · Leads (Board + List) · Clients · Jobs
 *        Revenue · Reviews · Settings
 * Features: Dialer modal · Client profiles · Kanban board ·
 *           Smart Gate toggles · Mobile bottom nav
 * ─────────────────────────────────────────────────────────────────
 */

"use client"; // required for Next.js App Router

import { useState } from "react";

// ── MOCK DATA ─────────────────────────────────────────────────────
const LEADS = [
  { id:1, name:"Carlos Mendez",  phone:"(786) 555-0123", service:"Weekly lawn + edging", value:120, status:"new",       ago:"2h ago",    es:true  },
  { id:2, name:"Patricia Walsh", phone:"(305) 555-0456", service:"Biweekly mow",         value:80,  status:"contacted", ago:"Yesterday", es:false },
  { id:3, name:"Roberto Sanz",   phone:"(954) 555-0789", service:"Full yard cleanup",    value:200, status:"quoted",    ago:"Mar 4",     es:true  },
  { id:4, name:"Ashley Kim",     phone:"(786) 555-1234", service:"Monthly plan",         value:150, status:"new",       ago:"3h ago",    es:false },
  { id:5, name:"Miguel Torres",  phone:"(305) 555-5678", service:"Hedge trimming",       value:95,  status:"contacted", ago:"Mar 3",     es:true  },
];

const CLIENTS = [
  { id:1, ini:"ML", name:"Maria Lopez",   phone:"(305) 555-0001", props:3, mrr:260, bal:0,   tag:"VIP",     last:"Today"  },
  { id:2, ini:"JS", name:"John Smith",    phone:"(786) 555-0002", props:1, mrr:120, bal:120, tag:null,      last:"Mar 5"  },
  { id:3, ini:"AR", name:"Ana Rodriguez", phone:"(954) 555-0003", props:2, mrr:180, bal:0,   tag:"Monthly", last:"Mar 4"  },
  { id:4, ini:"DC", name:"David Chen",    phone:"(305) 555-0004", props:1, mrr:80,  bal:80,  tag:null,      last:"Mar 1"  },
  { id:5, ini:"SW", name:"Sandra White",  phone:"(786) 555-0005", props:4, mrr:340, bal:0,   tag:"VIP",     last:"Feb 28" },
];

const JOBS = [
  { id:1, ini:"ML", client:"Maria Lopez",   addr:"123 SW 8th St",  svc:"Weekly Lawn Care", worker:"Jose M.", time:"9:00 AM",  st:"done",     total:65,  photos:4 },
  { id:2, ini:"JS", client:"John Smith",    addr:"456 Coral Way",  svc:"Mow + Edge",       worker:"You",     time:"11:30 AM", st:"active",   total:80,  photos:1 },
  { id:3, ini:"AR", client:"Ana Rodriguez", addr:"789 NW 5th Ave", svc:"Full Cleanup",     worker:"Jose M.", time:"2:00 PM",  st:"upcoming", total:150, photos:0 },
  { id:4, ini:"DC", client:"David Chen",    addr:"321 SW 12th",    svc:"Biweekly Mow",     worker:"You",     time:"4:00 PM",  st:"upcoming", total:80,  photos:0 },
];

const CALLS = [
  { name:"Carlos Mendez",  num:"(786) 555-0123", dur:"4:32", out:true,  ago:"2h ago"    },
  { name:"Maria Lopez",    num:"(305) 555-0001", dur:"1:15", out:false, ago:"Yesterday" },
  { name:"Patricia Walsh", num:"(305) 555-0456", dur:"2:48", out:true,  ago:"Mar 4"     },
];

const KANBAN = [
  { id:"new",       label:"New",       count:2 },
  { id:"contacted", label:"Contacted", count:2 },
  { id:"quoted",    label:"Quoted",    count:1 },
  { id:"won",       label:"Won",       count:0 },
  { id:"lost",      label:"Lost",      count:0 },
];

// ── HELPERS ───────────────────────────────────────────────────────
const $$ = n => "$" + (n || 0).toLocaleString();

const AVATAR_COLORS = {
  ML: "#7c3aed",
  JS: "#2563eb",
  AR: "#d97706",
  DC: "#059669",
  SW: "#db2777",
};

const JOB_COLORS = {
  done:     ["#d1fae5", "#065f46"],
  active:   ["#fef9c3", "#713f12"],
  upcoming: ["#e0e7ff", "#3730a3"],
};

// ── COMPONENTS ────────────────────────────────────────────────────

/** Circular avatar with initials */
function Av({ ini, sz = 38 }) {
  return (
    <div style={{
      width: sz, height: sz, borderRadius: sz * 0.3, flexShrink: 0,
      background: AVATAR_COLORS[ini] || "#7c3aed",
      color: "#fff", fontWeight: 800, fontSize: sz * 0.36,
      display: "flex", alignItems: "center", justifyContent: "center",
      letterSpacing: -0.5,
    }}>{ini}</div>
  );
}

/** Dialer modal — click outside or × to close */
function Dialer({ onClose }) {
  const [d, setD] = useState("");
  const KEYS = ["1","2","3","4","5","6","7","8","9","*","0","#"];
  return (
    <div
      style={{ position:"fixed", inset:0, zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}
    >
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)" }}/>
      <div
        style={{ position:"relative", width:340, borderRadius:32, overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,0.6)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* dark header */}
        <div style={{ background:"#111", padding:"28px 24px 22px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:"rgba(255,255,255,0.35)", marginBottom:8 }}>BUSINESS LINE</div>
              <div style={{ fontSize:26, fontWeight:900, color:"#fff", letterSpacing:0.5 }}>(786) 555-0100</div>
            </div>
            <button
              onClick={onClose}
              style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:12, width:36, height:36, color:"rgba(255,255,255,0.5)", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
            >×</button>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {[["🌐","Internet","$0.004/min"], ["📱","Cell","$0.018/min"]].map(([ic, lbl, cost]) => (
              <div key={lbl} style={{ flex:1, background:"rgba(255,255,255,0.06)", borderRadius:12, padding:"10px 12px" }}>
                <div style={{ fontWeight:700, fontSize:13, color:"rgba(255,255,255,0.75)" }}>{ic} {lbl}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:2 }}>{cost}</div>
              </div>
            ))}
          </div>
        </div>

        {/* white dialpad */}
        <div style={{ background:"#fff", padding:"22px 20px 26px" }}>
          <div style={{ background:"#f5f5f5", borderRadius:14, padding:"13px 20px", marginBottom:18, textAlign:"center", minHeight:50, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:28, fontWeight:700, color:d?"#111":"#ccc", letterSpacing:4 }}>{d || "· · ·"}</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
            {KEYS.map(k => (
              <button
                key={k}
                onClick={() => setD(p => p + k)}
                style={{ background:"#f5f5f5", border:"none", borderRadius:12, padding:"14px 0", fontSize:20, fontWeight:800, color:"#111", cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#eee"}
                onMouseLeave={e => e.currentTarget.style.background = "#f5f5f5"}
              >{k}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button
              onClick={() => setD(p => p.slice(0, -1))}
              style={{ width:52, background:"#f5f5f5", border:"none", borderRadius:12, fontSize:20, cursor:"pointer", flexShrink:0 }}
            >⌫</button>
            <button
              style={{ flex:1, background:d?"#111":"#e5e7eb", border:"none", borderRadius:12, padding:"14px 0", color:d?"#fff":"#aaa", fontWeight:800, fontSize:15, cursor:d?"pointer":"default", transition:"all .2s" }}
            >Call</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────
export default function KleanHQDashboard() {
  const [pg, setPg]         = useState("dashboard");
  const [dial, setDial]     = useState(false);
  const [lv, setLv]         = useState("board");        // leads view: board | list
  const [client, setClient] = useState(null);           // selected client for profile
  const [expanded, setExpanded] = useState(null);       // expanded lead card id

  const MRR      = CLIENTS.reduce((s, c) => s + c.mrr, 0);
  const newLeads = LEADS.filter(l => l.status === "new").length;

  const NAV = [
    { id:"dashboard", label:"Dashboard" },
    { id:"dialer",    label:"Dialer"    },
    { id:"leads",     label:"Leads", badge: newLeads },
    { id:"clients",   label:"Clients"  },
    { id:"jobs",      label:"Jobs"     },
    { id:"revenue",   label:"Revenue"  },
    { id:"reviews",   label:"Reviews"  },
    { id:"settings",  label:"Settings" },
  ];

  const go = id => { setPg(id); setClient(null); };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#fafafa", fontFamily:"-apple-system,'Helvetica Neue',Arial,sans-serif", color:"#111", fontSize:14 }}>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button, input { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }

        .sidebar {
          width: 220px; position: fixed; top: 0; left: 0; bottom: 0;
          background: #111; display: flex; flex-direction: column;
          padding: 20px 14px; z-index: 50;
        }
        .nv {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 9px 12px; border: none; border-radius: 10px;
          background: transparent; color: rgba(255,255,255,0.45);
          font-size: 13.5px; font-weight: 500; cursor: pointer;
          transition: all .15s; text-align: left; margin-bottom: 2px;
        }
        .nv:hover  { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
        .nv.on     { background: rgba(255,255,255,0.12); color: #fff; font-weight: 600; }

        .card    { background: #fff; border-radius: 16px; padding: 20px;    box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .bigcard { background: #fff; border-radius: 20px; padding: 24px;    box-shadow: 0 1px 4px rgba(0,0,0,0.06); }

        .gb  { background: #111; color: #fff; border: none; border-radius: 10px; padding: 9px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity .15s; display: inline-flex; align-items: center; gap: 6px; }
        .gb:hover { opacity: .85; }
        .gho { background: #fff; color: #555; border: 1px solid #e5e5e5; border-radius: 10px; padding: 8px 14px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; display: inline-flex; align-items: center; gap: 6px; }
        .gho:hover { border-color: #bbb; color: #111; }

        .row { cursor: pointer; border-radius: 12px; transition: background .1s; }
        .row:hover { background: #f5f5f5; }
        .tr:hover td { background: #f9f9f9; }

        .kc { background: #fff; border-radius: 14px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.07); cursor: pointer; margin-bottom: 8px; transition: all .15s; }
        .kc:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); transform: translateY(-1px); }

        .fade { animation: fi .18s ease; }
        @keyframes fi { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .main    { margin-left: 0 !important; padding-bottom: 68px !important; }
          .mnav    { display: flex !important; }
        }
        @media (min-width: 769px) { .mnav { display: none !important; } }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"2px 8px", marginBottom:28 }}>
          <div style={{ width:34, height:34, background:"#fff", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🌿</div>
          <div>
            <div style={{ fontWeight:800, fontSize:14, color:"#fff", letterSpacing:-0.3 }}>KleanHQ</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:1 }}>John's Lawn Care</div>
          </div>
        </div>

        {/* Nav */}
        {NAV.map(n => (
          <button key={n.id} className={`nv${pg === n.id ? " on" : ""}`} onClick={() => go(n.id)}>
            {n.label}
            {n.badge ? (
              <span style={{ background:"#ef4444", color:"#fff", borderRadius:99, minWidth:18, height:18, fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px" }}>
                {n.badge}
              </span>
            ) : null}
          </button>
        ))}

        <div style={{ flex:1 }}/>

        {/* MRR widget */}
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:14, padding:"16px 14px", marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, color:"rgba(255,255,255,0.3)", marginBottom:8 }}>MRR</div>
          <div style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:-1, lineHeight:1 }}>{$$(MRR)}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:5 }}>{CLIENTS.length} clients</div>
        </div>

        {/* Dialer button */}
        <button
          onClick={() => setDial(true)}
          style={{ width:"100%", background:"#22c55e", border:"none", borderRadius:12, padding:"12px 0", color:"#fff", fontWeight:700, fontSize:13.5, cursor:"pointer", transition:"opacity .15s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = ".9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >📞  Open Dialer</button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main" style={{ marginLeft:220, flex:1, minHeight:"100vh", display:"flex", flexDirection:"column" }}>

        {/* Topbar */}
        <div style={{ background:"#fff", borderBottom:"1px solid #f0f0f0", padding:"13px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:40 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:17, letterSpacing:-0.4 }}>{NAV.find(n => n.id === pg)?.label}</div>
            <div style={{ fontSize:11, color:"#aaa", marginTop:1 }}>Friday, March 6, 2026</div>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <span style={{ background:"#f0fdf4", color:"#15803d", borderRadius:99, padding:"5px 12px", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"inline-block" }}/>Live
            </span>
            <button onClick={() => setDial(true)} className="gb">📞 Dial</button>
            <div style={{ width:34, height:34, background:"#111", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:13, cursor:"pointer" }}>J</div>
          </div>
        </div>

        {/* ── PAGE CONTENT ── */}
        <div style={{ padding:"24px 28px", flex:1 }} className="fade">

          {/* ════════════════ DASHBOARD ════════════════ */}
          {pg === "dashboard" && <>
            {/* Stats row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
              {[
                { l:"Monthly Revenue",  v: $$(MRR),        hi:"↑ 12% vs last month",  hiC:"#16a34a" },
                { l:"Collected March",  v: "$3,180",        hi:"$200 outstanding",      hiC:"#d97706" },
                { l:"Jobs Today",       v: "4",             hi:"1 done · 3 remaining",  hiC:"#7c3aed" },
                { l:"New Leads",        v: String(newLeads),hi:"2 need reply",           hiC:"#2563eb" },
              ].map(s => (
                <div key={s.l} className="card">
                  <div style={{ fontSize:10, fontWeight:600, color:"#aaa", letterSpacing:1, marginBottom:12 }}>{s.l.toUpperCase()}</div>
                  <div style={{ fontSize:30, fontWeight:900, letterSpacing:-1, lineHeight:1, marginBottom:8 }}>{s.v}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:s.hiC }}>{s.hi}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:16, marginBottom:16 }}>
              {/* Today's jobs */}
              <div className="bigcard">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <span style={{ fontWeight:800, fontSize:15, letterSpacing:-0.3 }}>Today's Jobs</span>
                  <button onClick={() => go("jobs")} className="gho" style={{ padding:"5px 12px", fontSize:12 }}>View all</button>
                </div>
                {JOBS.map(j => (
                  <div key={j.id} className="row" style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", marginBottom:2 }}>
                    <Av ini={j.ini} sz={40}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>{j.client}</div>
                      <div style={{ fontSize:11, color:"#999", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{j.time} · {j.svc}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontWeight:800, fontSize:14, marginBottom:4 }}>{$$(j.total)}</div>
                      <span style={{ background:JOB_COLORS[j.st][0], color:JOB_COLORS[j.st][1], borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700 }}>
                        {j.st === "done" ? "✓ Done" : j.st === "active" ? "↻ Active" : "◷ Scheduled"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent leads */}
              <div className="bigcard">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <span style={{ fontWeight:800, fontSize:15, letterSpacing:-0.3 }}>Recent Leads</span>
                  <button onClick={() => go("leads")} className="gho" style={{ padding:"5px 12px", fontSize:12 }}>Board</button>
                </div>
                {LEADS.slice(0, 4).map(l => (
                  <div key={l.id} className="row" style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", marginBottom:2 }}>
                    <div style={{ width:32, height:32, borderRadius:9, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>👤</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>{l.name}{l.es ? <span style={{ fontSize:10, marginLeft:4 }}>🇪🇸</span> : null}</div>
                      <div style={{ fontSize:11, color:"#999", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.service}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontWeight:700, fontSize:13 }}>{$$(l.value)}<span style={{ fontSize:10, color:"#bbb", fontWeight:400 }}>/mo</span></div>
                      <div style={{ fontSize:10, color:"#bbb" }}>{l.ago}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bigcard">
              <div style={{ fontWeight:800, fontSize:15, letterSpacing:-0.3, marginBottom:14 }}>Quick Actions</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10 }}>
                {[
                  ["➕","New Job",          "#f0fdf4","#15803d"],
                  ["👤","Add Client",       "#eff6ff","#1d4ed8"],
                  ["📋","New Invoice",       "#fefce8","#a16207"],
                  ["💬","Send Message",      "#faf5ff","#7e22ce"],
                  ["🗺️","Route Optimizer",   "#fff1f2","#be123c"],
                  ["⭐","Request Review",    "#fff7ed","#c2410c"],
                ].map(([ic, lb, bg, fg]) => (
                  <button
                    key={lb}
                    style={{ background:bg, border:"none", borderRadius:14, padding:"15px 14px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", transition:"all .15s", textAlign:"left" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <span style={{ fontSize:22 }}>{ic}</span>
                    <span style={{ fontWeight:700, fontSize:13, color:fg }}>{lb}</span>
                  </button>
                ))}
              </div>
            </div>
          </>}

          {/* ════════════════ DIALER ════════════════ */}
          {pg === "dialer" && <div style={{ maxWidth:420, margin:"0 auto" }}>
            <div style={{ background:"#111", borderRadius:24, padding:"26px 24px 22px", color:"#fff", marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:600, letterSpacing:2, color:"rgba(255,255,255,0.3)", marginBottom:8 }}>BUSINESS LINE</div>
              <div style={{ fontSize:26, fontWeight:900, letterSpacing:0.5, marginBottom:4 }}>(786) 555-0100</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>Twilio · A2P Registered · WhatsApp Active</div>
            </div>
            <div className="bigcard" style={{ marginBottom:14 }}>
              <div style={{ background:"#f5f5f5", borderRadius:14, padding:"12px 20px", marginBottom:16, textAlign:"center", minHeight:50, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:26, fontWeight:700, color:"#ccc", letterSpacing:4 }}>· · ·</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
                {["1","2","3","4","5","6","7","8","9","*","0","#"].map(k => (
                  <button key={k}
                    style={{ background:"#f5f5f5", border:"none", borderRadius:12, padding:"14px 0", fontSize:20, fontWeight:700, color:"#111", cursor:"pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#eee"}
                    onMouseLeave={e => e.currentTarget.style.background = "#f5f5f5"}
                  >{k}</button>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ width:52, background:"#f5f5f5", border:"none", borderRadius:12, fontSize:18, cursor:"pointer" }}>⌫</button>
                <button onClick={() => setDial(true)} style={{ flex:1, background:"#22c55e", border:"none", borderRadius:12, padding:"13px 0", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer" }}>Call</button>
              </div>
            </div>
            <div className="bigcard">
              <div style={{ fontWeight:700, fontSize:14, letterSpacing:-0.3, marginBottom:14 }}>Recent Calls</div>
              {CALLS.map((c, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom: i < CALLS.length - 1 ? "1px solid #f5f5f5" : "" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{c.out ? "↑" : "↓"}</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{c.name}</div>
                      <div style={{ fontSize:11, color:"#999" }}>{c.num} · {c.ago}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:12, color:"#777", fontWeight:500 }}>{c.dur}</span>
                    <button className="gho" style={{ padding:"5px 10px", fontSize:11 }}>Redial</button>
                  </div>
                </div>
              ))}
            </div>
          </div>}

          {/* ════════════════ LEADS ════════════════ */}
          {pg === "leads" && <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              {/* Board / List toggle */}
              <div style={{ display:"flex", background:"#fff", borderRadius:12, padding:3, boxShadow:"0 1px 3px rgba(0,0,0,0.07)" }}>
                {[["board","Board"],["list","List"]].map(([v, l]) => (
                  <button key={v} onClick={() => setLv(v)}
                    style={{ padding:"7px 20px", borderRadius:10, background: lv === v ? "#111" : "transparent", color: lv === v ? "#fff" : "#777", fontWeight:600, fontSize:13, border:"none", cursor:"pointer", transition:"all .15s" }}
                  >{l}</button>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input style={{ background:"#fff", border:"1px solid #e5e5e5", borderRadius:10, padding:"9px 14px", fontSize:13, outline:"none", width:200 }} placeholder="Search leads..."/>
                <button className="gb">+ Add Lead</button>
              </div>
            </div>

            {/* BOARD VIEW */}
            {lv === "board" && (
              <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:8, minHeight:300 }}>
                {KANBAN.map(col => {
                  const items = LEADS.filter(l => l.status === col.id);
                  return (
                    <div key={col.id} style={{ minWidth:200, flex:1, background:"#f0f0f0", borderRadius:18, padding:"14px 12px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, padding:"0 2px" }}>
                        <span style={{ fontWeight:700, fontSize:12, color:"#555" }}>{col.label}</span>
                        <span style={{ background:"#fff", borderRadius:99, padding:"1px 9px", fontSize:11, fontWeight:700, color:"#777" }}>{items.length}</span>
                      </div>
                      {items.map(l => (
                        <div key={l.id} className="kc" onClick={() => setExpanded(expanded === l.id ? null : l.id)}>
                          <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{l.name}{l.es ? <span style={{ fontSize:10, marginLeft:4 }}>🇪🇸</span> : null}</div>
                          <div style={{ fontSize:11, color:"#999", marginBottom:10, lineHeight:1.4 }}>{l.service}</div>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <span style={{ fontWeight:800, fontSize:13 }}>{$$(l.value)}<span style={{ fontSize:10, color:"#bbb", fontWeight:400 }}>/mo</span></span>
                            <span style={{ fontSize:10, color:"#bbb" }}>{l.ago}</span>
                          </div>
                          {expanded === l.id && (
                            <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #f0f0f0", display:"flex", gap:6 }}>
                              <button onClick={e => { e.stopPropagation(); setDial(true); }} style={{ background:"#f0fdf4", color:"#15803d", border:"none", borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer" }}>📞 Call</button>
                              <button style={{ background:"#eff6ff", color:"#1d4ed8", border:"none", borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer" }}>💬 SMS</button>
                              <button style={{ background:"#111", color:"#fff", border:"none", borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer" }}>Convert</button>
                            </div>
                          )}
                        </div>
                      ))}
                      <button style={{ width:"100%", background:"transparent", border:"1px dashed #ccc", borderRadius:10, padding:"8px 0", color:"#bbb", fontSize:12, cursor:"pointer" }}>+ Add</button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* LIST VIEW */}
            {lv === "list" && (
              <div className="bigcard" style={{ padding:0, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid #f0f0f0" }}>
                      {["Name","Phone","Service","Value","Stage","Ago",""].map(h => (
                        <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:"#bbb", letterSpacing:0.8 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LEADS.map(l => (
                      <tr key={l.id} className="tr" style={{ borderBottom:"1px solid #f9f9f9" }}>
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ fontWeight:600, fontSize:13 }}>{l.name}{l.es ? " 🇪🇸" : ""}</div>
                        </td>
                        <td style={{ padding:"12px 16px", fontSize:12, color:"#777" }}>{l.phone}</td>
                        <td style={{ padding:"12px 16px", fontSize:12, color:"#555" }}>{l.service}</td>
                        <td style={{ padding:"12px 16px", fontWeight:700, fontSize:13 }}>{$$(l.value)}<span style={{ fontSize:10, color:"#bbb", fontWeight:400 }}>/mo</span></td>
                        <td style={{ padding:"12px 16px" }}>
                          <span style={{ background:"#f0f0f0", color:"#555", borderRadius:6, padding:"3px 9px", fontSize:11, fontWeight:600, textTransform:"capitalize" }}>{l.status}</span>
                        </td>
                        <td style={{ padding:"12px 16px", fontSize:11, color:"#bbb" }}>{l.ago}</td>
                        <td style={{ padding:"12px 16px" }}>
                          <div style={{ display:"flex", gap:6 }}>
                            <button onClick={() => setDial(true)} className="gho" style={{ padding:"5px 10px", fontSize:11 }}>📞</button>
                            <button className="gb" style={{ padding:"5px 12px", fontSize:11 }}>Convert</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>}

          {/* ════════════════ CLIENTS ════════════════ */}
          {pg === "clients" && <>
            {client ? (
              /* ── Client Profile ── */
              <>
                <button onClick={() => setClient(null)} className="gho" style={{ marginBottom:20 }}>← Back</button>
                <div className="bigcard" style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", gap:16, alignItems:"flex-start", flexWrap:"wrap" }}>
                    <Av ini={client.ini} sz={64}/>
                    <div style={{ flex:1, minWidth:200 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:6 }}>
                        <span style={{ fontWeight:900, fontSize:22, letterSpacing:-0.5 }}>{client.name}</span>
                        {client.tag ? <span style={{ background:"#fefce8", color:"#a16207", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{client.tag}</span> : null}
                      </div>
                      <div style={{ fontSize:13, color:"#888", marginBottom:14 }}>{client.phone} · {client.props} {client.props === 1 ? "property" : "properties"}</div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {[["📞 Call","#f0fdf4","#15803d"],["💬 Message","#eff6ff","#1d4ed8"],["📋 New Job","#fefce8","#a16207"],["💰 Charge","#faf5ff","#7e22ce"]].map(([lb, bg, fg]) => (
                          <button key={lb} style={{ background:bg, color:fg, border:"none", borderRadius:10, padding:"8px 14px", fontWeight:600, fontSize:12, cursor:"pointer" }}>{lb}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:10, fontWeight:600, color:"#bbb", letterSpacing:1, marginBottom:4 }}>LIFETIME VALUE</div>
                      <div style={{ fontSize:32, fontWeight:900, color:"#16a34a", letterSpacing:-1 }}>{$$(client.mrr * 14)}</div>
                      <div style={{ fontSize:12, color:"#bbb", marginTop:2 }}>{$$(client.mrr)}/mo</div>
                    </div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:14 }}>
                  {[
                    ["Properties", `${client.props} properties`,    "#f5f5f5", "#111"                                 ],
                    ["Monthly MRR", $$(client.mrr),                 "#f0fdf4", "#16a34a"                              ],
                    ["Balance",     client.bal > 0 ? `${$$(client.bal)} due` : "Paid up", "#f9fafb", client.bal > 0 ? "#dc2626" : "#16a34a"],
                  ].map(([lbl, val, bg, clr]) => (
                    <div key={lbl} style={{ background:bg, borderRadius:14, padding:16 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:"#bbb", letterSpacing:1, marginBottom:6 }}>{lbl.toUpperCase()}</div>
                      <div style={{ fontSize:18, fontWeight:800, color:clr }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div className="bigcard">
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Recent Jobs</div>
                  {JOBS.filter(j => j.client === client.name).map(j => (
                    <div key={j.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #f5f5f5" }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>{j.svc}</div>
                        <div style={{ fontSize:11, color:"#bbb" }}>{j.time} · {j.photos} photos · {j.worker}</div>
                      </div>
                      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                        <span style={{ background:JOB_COLORS[j.st][0], color:JOB_COLORS[j.st][1], borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700 }}>{j.st}</span>
                        <span style={{ fontWeight:800, fontSize:14 }}>{$$(j.total)}</span>
                      </div>
                    </div>
                  ))}
                  {!JOBS.find(j => j.client === client.name) && <div style={{ color:"#bbb", fontSize:13 }}>No jobs yet.</div>}
                </div>
              </>
            ) : (
              /* ── Client List ── */
              <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
                  <input style={{ background:"#fff", border:"1px solid #e5e5e5", borderRadius:10, padding:"9px 14px", fontSize:13, outline:"none", width:220 }} placeholder="Search clients..."/>
                  <button className="gb">+ Add Client</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {CLIENTS.map(c => (
                    <div key={c.id} onClick={() => setClient(c)} className="bigcard"
                      style={{ display:"flex", alignItems:"center", gap:14, cursor:"pointer", padding:"18px 20px", transition:"all .15s" }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"}
                    >
                      <Av ini={c.ini} sz={46}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                          <span style={{ fontWeight:700, fontSize:14 }}>{c.name}</span>
                          {c.tag ? <span style={{ background:"#fefce8", color:"#a16207", borderRadius:5, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{c.tag}</span> : null}
                        </div>
                        <div style={{ fontSize:12, color:"#bbb" }}>{c.phone} · {c.props} {c.props === 1 ? "property" : "properties"} · Last job: {c.last}</div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontWeight:900, fontSize:18, letterSpacing:-0.5, lineHeight:1, marginBottom:4 }}>{$$(c.mrr)}<span style={{ fontSize:11, color:"#bbb", fontWeight:400 }}>/mo</span></div>
                        {c.bal > 0
                          ? <span style={{ fontSize:11, color:"#dc2626", fontWeight:700 }}>{$$(c.bal)} due</span>
                          : <span style={{ fontSize:11, color:"#16a34a", fontWeight:600 }}>✓ Paid</span>}
                      </div>
                      <button onClick={e => { e.stopPropagation(); setDial(true); }} className="gho" style={{ padding:"8px 11px", fontSize:14, flexShrink:0 }}>📞</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>}

          {/* ════════════════ JOBS ════════════════ */}
          {pg === "jobs" && <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div style={{ display:"flex", background:"#fff", borderRadius:12, padding:3, boxShadow:"0 1px 3px rgba(0,0,0,0.07)" }}>
                {["All","Scheduled","Active","Done"].map((f, i) => (
                  <button key={f} style={{ padding:"7px 14px", borderRadius:10, background: i === 0 ? "#111" : "transparent", color: i === 0 ? "#fff" : "#777", fontWeight:600, fontSize:12, border:"none", cursor:"pointer" }}>{f}</button>
                ))}
              </div>
              <button className="gb">+ New Job</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {JOBS.map(j => (
                <div key={j.id} className="bigcard"
                  style={{ display:"flex", alignItems:"center", gap:14, cursor:"pointer", padding:"18px 20px", transition:"all .15s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"}
                >
                  <div style={{ width:50, height:50, borderRadius:16, background:JOB_COLORS[j.st][0], display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                    {j.st === "done" ? "✅" : j.st === "active" ? "⚙️" : "🗓"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <span style={{ fontWeight:700, fontSize:14 }}>{j.client}</span>
                      <span style={{ background:JOB_COLORS[j.st][0], color:JOB_COLORS[j.st][1], borderRadius:6, padding:"2px 9px", fontSize:10, fontWeight:700 }}>
                        {j.st === "done" ? "Done" : j.st === "active" ? "Active" : "Scheduled"}
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:"#bbb", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      📍 {j.addr} · {j.svc} · {j.time} · {j.worker}
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>
                    {j.photos > 0 ? <span style={{ fontSize:11, color:"#bbb" }}>📷 {j.photos}</span> : null}
                    <span style={{ fontWeight:900, fontSize:20, letterSpacing:-0.5 }}>{$$(j.total)}</span>
                    <button className="gho" style={{ padding:"7px 12px", fontSize:12 }}>View</button>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* ════════════════ REVENUE ════════════════ */}
          {pg === "revenue" && <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
              {[
                { l:"Recurring MRR",   v: $$(MRR),    hi:"Subscriptions", c:"#16a34a" },
                { l:"One-Time Jobs",   v: "$1,200",   hi:"This month",    c:"#7c3aed" },
                { l:"Total Collected", v: "$3,180",   hi:"March 2026",    c:"#2563eb" },
                { l:"Outstanding",     v: $$(CLIENTS.reduce((s,c)=>s+c.bal,0)), hi:"To collect", c:"#dc2626" },
              ].map(s => (
                <div key={s.l} className="card">
                  <div style={{ fontSize:10, fontWeight:600, color:"#bbb", letterSpacing:1, marginBottom:12 }}>{s.l.toUpperCase()}</div>
                  <div style={{ fontSize:28, fontWeight:900, letterSpacing:-1, lineHeight:1, marginBottom:8 }}>{s.v}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:s.c }}>{s.hi}</div>
                </div>
              ))}
            </div>
            <div className="bigcard">
              <div style={{ fontWeight:800, fontSize:15, marginBottom:18, letterSpacing:-0.3 }}>Top Clients</div>
              {[...CLIENTS].sort((a, b) => b.mrr - a.mrr).map((c, i) => (
                <div key={c.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 0", borderBottom: i < CLIENTS.length - 1 ? "1px solid #f5f5f5" : "" }}>
                  <span style={{ width:26, height:26, borderRadius:8, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, color:"#888", flexShrink:0 }}>#{i+1}</span>
                  <Av ini={c.ini} sz={38}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{c.name}</div>
                    <div style={{ fontSize:11, color:"#bbb" }}>{c.props} {c.props === 1 ? "property" : "properties"}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:900, fontSize:18, letterSpacing:-0.5, lineHeight:1, marginBottom:2 }}>{$$(c.mrr)}<span style={{ fontSize:11, color:"#bbb", fontWeight:400 }}>/mo</span></div>
                    <div style={{ fontSize:11, color:"#bbb" }}>{$$(c.mrr * 12)}/yr</div>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* ════════════════ REVIEWS ════════════════ */}
          {pg === "reviews" && <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
              {[
                { l:"Overall Rating", v:"4.8 ⭐", hi:"23 total reviews", c:"#d97706" },
                { l:"Google",         v:"4.9 ⭐", hi:"18 reviews",        c:"#2563eb" },
                { l:"Yelp",           v:"4.6 ⭐", hi:"5 reviews",         c:"#dc2626" },
                { l:"Gate Pass Rate", v:"94%",    hi:"Sent to public",    c:"#16a34a" },
              ].map(s => (
                <div key={s.l} className="card">
                  <div style={{ fontSize:10, fontWeight:600, color:"#bbb", letterSpacing:1, marginBottom:12 }}>{s.l.toUpperCase()}</div>
                  <div style={{ fontSize:28, fontWeight:900, letterSpacing:-1, lineHeight:1, marginBottom:8 }}>{s.v}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:s.c }}>{s.hi}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:16 }}>
              <div className="bigcard">
                <div style={{ fontWeight:800, fontSize:15, marginBottom:16 }}>Platforms</div>
                {[
                  ["🔵","Google Business","g.page/johns-lawn",  true ],
                  ["🔴","Yelp",           "yelp.com/biz/johns", true ],
                  ["🔵","Facebook",        "Not connected",      false],
                  ["🟢","Nextdoor",        "Not connected",      false],
                ].map(([ic, nm, url, on], i) => (
                  <div key={nm} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #f5f5f5" }}>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <div style={{ width:36, height:36, background:"#f5f5f5", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{ic}</div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>{nm}</div>
                        <div style={{ fontSize:11, color:"#bbb" }}>{url}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ background: on ? "#f0fdf4" : "#f5f5f5", color: on ? "#16a34a" : "#888", borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700 }}>{on ? "Active" : "Not set"}</span>
                      <button className="gho" style={{ padding:"5px 10px", fontSize:11 }}>{on ? "Edit" : "Connect"}</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bigcard">
                <div style={{ fontWeight:800, fontSize:15, marginBottom:6 }}>Smart Gate</div>
                <div style={{ fontSize:12, color:"#999", marginBottom:16, lineHeight:1.6 }}>Low ratings go private. High ratings go to Google & Yelp automatically.</div>
                {[
                  ["After completed job",    true ],
                  ["After monthly renewal",  false],
                  ["Smart gate active",      true ],
                  ["Landing page widget",    true ],
                ].map(([lbl, on]) => (
                  <div key={lbl} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:"1px solid #f5f5f5" }}>
                    <span style={{ fontSize:13, fontWeight:500, color:"#333" }}>{lbl}</span>
                    <div style={{ width:42, height:24, borderRadius:12, background: on ? "#22c55e" : "#e5e7eb", position:"relative", cursor:"pointer", flexShrink:0, transition:"background .2s" }}>
                      <div style={{ position:"absolute", top:3, left: on ? 21 : 3, width:18, height:18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.2)", transition:"left .2s" }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>}

          {/* ════════════════ SETTINGS ════════════════ */}
          {pg === "settings" && <div style={{ maxWidth:540 }}>
            {[
              { title:"Business Branding", fields:[["Business Name","John's Lawn Care","text"],["Tagline","Professional lawn care in Miami","text"],["Brand Color","#16a34a","color"],["Phone","(786) 555-0100","text"]] },
              { title:"Payment Methods",   fields:[["Zelle","(305) 555-0100","text"],["Cash App","$JohnsLawnMiami","text"],["Venmo","@JohnsLawn","text"],["Stripe Link","stripe.com/pay/johns","text"]] },
            ].map(sec => (
              <div key={sec.title} className="bigcard" style={{ marginBottom:14 }}>
                <div style={{ fontWeight:800, fontSize:15, marginBottom:18, letterSpacing:-0.3 }}>{sec.title}</div>
                {sec.fields.map(([lbl, val, type]) => (
                  <div key={lbl} style={{ marginBottom:14 }}>
                    <div style={{ fontSize:10, fontWeight:600, color:"#bbb", letterSpacing:1, marginBottom:6 }}>{lbl.toUpperCase()}</div>
                    {type === "color" ? (
                      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                        <input type="color" defaultValue={val} style={{ width:42, height:38, border:"1px solid #e5e5e5", borderRadius:10, cursor:"pointer", padding:3 }}/>
                        <input style={{ flex:1, background:"#fafafa", border:"1px solid #e5e5e5", borderRadius:10, padding:"9px 14px", fontSize:13, outline:"none" }} defaultValue={val}/>
                      </div>
                    ) : (
                      <input style={{ width:"100%", background:"#fafafa", border:"1px solid #e5e5e5", borderRadius:10, padding:"9px 14px", fontSize:13, outline:"none" }} defaultValue={val}/>
                    )}
                  </div>
                ))}
              </div>
            ))}
            <div className="bigcard" style={{ marginBottom:14 }}>
              <div style={{ fontWeight:800, fontSize:15, marginBottom:14 }}>Notifications</div>
              {[
                ["📱 SMS",     "Job + invoice alerts",          true],
                ["💬 WhatsApp","Spanish customers prefer this", true],
                ["📧 Email",   "Invoices + receipts",           true],
                ["🔔 Push",    "Real-time",                     true],
              ].map(([lbl, sub, on]) => (
                <div key={lbl} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:"1px solid #f5f5f5" }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13 }}>{lbl}</div>
                    <div style={{ fontSize:11, color:"#bbb" }}>{sub}</div>
                  </div>
                  <div style={{ width:42, height:24, borderRadius:12, background: on ? "#22c55e" : "#e5e7eb", position:"relative", cursor:"pointer", flexShrink:0 }}>
                    <div style={{ position:"absolute", top:3, left: on ? 21 : 3, width:18, height:18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
                  </div>
                </div>
              ))}
            </div>
            <button className="gb" style={{ width:"100%", justifyContent:"center", padding:"13px 0", fontSize:14, borderRadius:14 }}>Save Settings</button>
          </div>}

        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="mnav" style={{ position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:"1px solid #f0f0f0", zIndex:100, boxShadow:"0 -4px 16px rgba(0,0,0,0.06)" }}>
        {NAV.slice(0, 5).map(n => (
          <button key={n.id} onClick={() => go(n.id)}
            style={{ flex:1, padding:"9px 4px 11px", background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:3, color: pg === n.id ? "#111" : "#bbb", fontSize:9, fontWeight:700, cursor:"pointer", position:"relative" }}
          >
            {n.badge ? <span style={{ position:"absolute", top:4, right:"calc(50% - 16px)", background:"#ef4444", color:"#fff", borderRadius:99, padding:"0 4px", fontSize:9, fontWeight:800, lineHeight:"15px" }}>{n.badge}</span> : null}
            <span style={{ fontSize:18, lineHeight:1 }}>●</span>
            {n.label}
          </button>
        ))}
      </div>

      {/* ── DIALER MODAL ── */}
      {dial && <Dialer onClose={() => setDial(false)}/>}
    </div>
  );
}
