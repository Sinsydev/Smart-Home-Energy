import { useState, useEffect } from "react";
import { motion } from "framer-motion";
type TimePoint = { t: string; value: number };

interface SolarData {
  generation: number; // kW
  consumption: number; // kW
  battery: number; // percent
  grid: number; // kW (to/from grid)
  flow: TimePoint[];
  byPanel: number[]; // kW per panel
}

export default function MainDashboard() {
  const [data, setData] = useState<SolarData>({
    generation: 3.6,
    consumption: 2.8,
    battery: 72,
    grid: 0.8,
    flow: Array.from({ length: 24 }, (_, i) => ({ t: `${i}:00`, value: Math.round(300 + Math.sin(i / 3) * 80) })),
    byPanel: [0.6, 0.55, 0.7, 0.65, 0.5],
  });

  // simulate live updates
  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const gen = Math.max(0, +(prev.generation + (Math.random() - 0.45) * 0.25).toFixed(2));
        const cons = Math.max(0, +(prev.consumption + (Math.random() - 0.5) * 0.15).toFixed(2));
        const battery = Math.min(100, Math.max(0, Math.round(prev.battery + (gen - cons) * 2 * (Math.random() * 0.7))));
        const grid = +(gen - cons - (battery > 90 ? 0.2 : 0)).toFixed(2);
        const nextFlow = [...prev.flow.slice(-23), { t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), value: Math.round(gen * 100) }];
        const byPanel = prev.byPanel.map((v) => Math.max(0, +(v + (Math.random() - 0.45) * 0.08).toFixed(2)));
        return { generation: gen, consumption: cons, battery, grid, flow: nextFlow, byPanel };
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const sparklinePoints = (values: number[], width = 320, height = 64) => {
    if (!values.length) return "";
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const areaPath = (values: number[], width = 480, height = 160) => {
    if (!values.length) return "";
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const step = width / (values.length - 1);
    let d = `M 0 ${height - ((values[0] - min) / range) * height}`;
    values.forEach((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      d += ` L ${x} ${y}`;
    });
    d += ` L ${width} ${height} L 0 ${height} Z`;
    return d;
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Solar Energy Dashboard</h1>
            <p className="text-white/80 mt-1">Live overview of generation, storage and consumption</p>
          </div>
          <div className="text-sm text-white/70">Updated: {new Date().toLocaleTimeString()}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main charts */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm text-white/80">Current Generation</div>
                  <div className="text-3xl font-bold text-white">{data.generation} kW</div>
                  <div className="text-sm text-white/60">Consumption: {data.consumption} kW • Grid: {data.grid} kW</div>
                </div>
                <div className="w-24 sm:w-36 md:w-48">
                  <svg width="100%" viewBox="0 0 320 64" className="block h-12 md:h-16 lg:h-20">
                    <polyline
                      fill="none"
                      stroke="#f97316"
                      strokeWidth={3}
                      points={sparklinePoints(data.flow.map((f) => f.value), 320, 64)}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeOpacity={0.95}
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-3">
                <svg width="100%" viewBox="0 0 480 160" preserveAspectRatio="none" className="w-full h-32 md:h-40 lg:h-48">
                  <path d={areaPath(data.flow.map((f) => f.value), 480, 160)} fill="rgba(124,58,237,0.16)" stroke="none" />
                  <polyline
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    points={sparklinePoints(data.flow.map((f) => f.value), 480, 160)}
                  />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/6">
                <div className="text-sm text-white/80">Battery</div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-16 h-16 md:w-20 md:h-20">
                      <path d="M18 2a16 16 0 1 0 0 32 16 16 0 0 0 0-32" fill="#0f172a" />
                      <circle cx="18" cy="18" r="12" fill="none" stroke="#0f172a" strokeWidth="0" />
                      <circle
                        cx="18"
                        cy="18"
                        r="10"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray={`${(data.battery / 100) * 63} 63`}
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                    <div className="absolute text-center text-sm">
                      <div className="text-white font-semibold">{data.battery}%</div>
                      <div className="text-xs text-white/70">SOC</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Est. backup</div>
                    <div className="text-xl font-semibold text-white">~{Math.round((data.battery / 100) * 4)} hrs</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/6">
                <div className="text-sm text-white/80">Today</div>
                <div className="text-2xl font-bold text-white mt-2">{Math.round(data.flow.reduce((s, f) => s + f.value, 0) / 1000)} kWh</div>
                <div className="text-sm text-white/60 mt-1">Generated • {data.generation} kW now</div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/6">
                <div className="text-sm text-white/80">Grid</div>
                <div className="text-2xl font-bold text-white mt-2">{data.grid} kW</div>
                <div className="text-sm text-white/60 mt-1">Positive: exporting • Negative: importing</div>
              </div>
            </div>
          </div>

          {/* Right column widgets */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-white/80">Panels</div>
                <div className="text-xs text-white/60">Realtime</div>
              </div>
              <div className="space-y-2">
                {data.byPanel.map((v, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-white/10 rounded" />
                    <div className="flex-1">
                      <div className="text-sm text-white/80">Panel {i + 1}</div>
                      <div className="w-full h-2 bg-white/6 rounded mt-1 overflow-hidden">
                        <div className="h-2 bg-yellow-400" style={{ width: `${Math.min(100, (v / 1.2) * 100)}%` }} />
                      </div>
                    </div>
                    <div className="text-sm text-white">{v} kW</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-sm text-white/80 mb-2">Recent Events</div>
              <ul className="text-sm text-white/70 space-y-2">
                <li>Solar noon peak at {data.flow[data.flow.length - 1]?.t}</li>
                <li>Battery SOC changed to {data.battery}%</li>
                <li>Grid feed {data.grid > 0 ? 'exporting' : 'importing'} {Math.abs(data.grid)} kW</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}




