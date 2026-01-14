import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaTools, FaShieldAlt, FaStream, FaPhoneAlt, FaUser } from "react-icons/fa";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    if (mobileOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Debug: log route changes so we can verify navigation events
  useEffect(() => {
    console.log("Dashboard route:", location.pathname);
  }, [location.pathname]);

  const items = [
    { to: "maindashboard", label: "Dashboard", icon: <FaStream /> },
    { to: "maintenance", label: "Maintenance", icon: <FaTools /> },
    { to: "safety-monitoring", label: "Safety Monitoring", icon: <FaShieldAlt /> },
    { to: "contact", label: "Contact", icon: <FaPhoneAlt /> },
    { to: "profile", label: "Profile", icon: <FaUser /> },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, oklch(12.9% 0.042 264.695), oklch(13% 0.028 261.692))" }}>
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-blue-900/80 backdrop-blur-md border-r border-white/10 shadow-lg">
        <div className="p-5 border-b border-white/10">
          <h1 className="text-lg font-bold text-white">Smart Home & Energy</h1>
          <p className="text-xs text-white/80">Maintenance & Safety Monitoring</p>
        </div>

        <nav className="p-4 flex flex-col gap-2">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={`/dashboard/${it.to}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition ${
                  isActive ? "bg-blue-600 text-white" : "text-white/90 hover:bg-white/5"
                }`
              }
            >
              <span className="text-lg">{it.icon}</span>
              <span className="font-medium">{it.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-white/5">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login", { replace: true });
            }}
            className="w-full px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-blue-900/90 p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 p-2">
              <h2 className="text-lg font-bold text-white">Menu</h2>
              <button onClick={() => setMobileOpen(false)} className="text-white/70 p-1 rounded">
                ✕
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {items.map((it) => (
                <NavLink
                  key={it.to}
                  to={`/dashboard/${it.to}`}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md ${
                      isActive ? "bg-blue-600 text-white" : "text-white/90 hover:bg-white/5"
                    }`
                  }
                >
                  <span className="text-lg">{it.icon}</span>
                  <span className="font-medium">{it.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/8 bg-blue-950/30 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded bg-white/6 text-white"
            >
              ☰
            </button>
            <div className="text-white text-lg font-semibold">System Dashboard</div>
          </div>
          <div className="text-white/80 text-sm">Welcome back</div>
        </header>

        <section className="p-6 min-h-[calc(100vh-64px)]">
          <Outlet />
        </section>
      </main>
    </div>
  );
}









