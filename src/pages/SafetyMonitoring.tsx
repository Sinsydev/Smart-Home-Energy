import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type AlertSeverity = "info" | "warning" | "critical";

type AlertItem = {
  id: string;
  time: string;
  message: string;
  severity: AlertSeverity;
  acknowledged?: boolean;
};

const STORAGE_THRESH = "safety_thresholds_v1";
const STORAGE_EVENTS = "safety_events_v1";

type Thresholds = {
  temp: number;
  inverterTemp: number;
  smoke: number;
  motionCount: number;
  doorOpen: boolean;
};

const defaultThresholds: Thresholds = {
  temp: 55,
  inverterTemp: 70,
  smoke: 0.6,
  motionCount: 5,
  doorOpen: true,
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function SafetyMonitoring() {
  const [temp, setTemp] = useState(36 + Math.random() * 6);
  const [inverterTemp, setInverterTemp] = useState(40 + Math.random() * 6);
  const [smokeProb, setSmokeProb] = useState(Math.random() * 0.2);
  const [motionCount, setMotionCount] = useState(0);
  const [doorsOpen, setDoorsOpen] = useState<{ id: string; label: string; open: boolean }[]>([
    { id: "d1", label: "Main Gate", open: false },
    { id: "d2", label: "Garage", open: false },
  ]);

  const [tempHistory, setTempHistory] = useState<number[]>(() => Array.from({ length: 24 }, () => Math.round(300 + Math.random() * 60)));
  const [events, setEvents] = useState<AlertItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_EVENTS);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('Failed to load events', err);
      return [];
    }
  });

  const [thresholds, setThresholds] = useState<Thresholds>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_THRESH);
      return raw ? JSON.parse(raw) : defaultThresholds;
    } catch (err) {
      console.warn('Failed to read thresholds', err);
      return defaultThresholds;
    }
  });

  // sensors map (position in %)
  type Sensor = { id: string; label: string; type: "temp" | "smoke" | "motion" | "door"; x: number; y: number; disabled?: boolean };
  const SENSORS_KEY = "safety_sensors_v1"; // stored as Record<planId, Sensor[]>
  const PLANS_KEY = "safety_plans_v1";
  type Plan = { id: string; label: string; src?: string };

  // load plans
  const [plans, setPlans] = useState<Plan[]>(() => {
    try {
      const raw = localStorage.getItem(PLANS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn('Failed to read plans', err);
    }
    return [{ id: 'default', label: 'Default plan' }];
  });
  const [activePlanId, setActivePlanId] = useState<string>(plans[0]?.id ?? 'default');

  // sensors for active plan
  const [sensors, setSensors] = useState<Sensor[]>(() => {
    try {
      const raw = localStorage.getItem(SENSORS_KEY);
      if (!raw) return [
        { id: "s-solar", label: "Solar Array", type: "temp", x: 20, y: 20 },
        { id: "s-inv", label: "Inverter", type: "temp", x: 70, y: 26 },
        { id: "s-gate", label: "Main Gate", type: "door", x: 50, y: 84 },
        { id: "s-smoke-1", label: "Living Room", type: "smoke", x: 34, y: 48 },
      ];
      const parsed = JSON.parse(raw);
      // support legacy array
      if (Array.isArray(parsed)) return parsed;
      // parsed is a map
      return parsed[plans[0]?.id ?? 'default'] ?? [];
    } catch (err) {
      console.warn('Failed to read sensors', err);
      return [];
    }
  });
  const [sensorsMap, setSensorsMap] = useState<Record<string, Sensor[]>>(() => {
    try {
      const raw = localStorage.getItem(SENSORS_KEY);
      if (!raw) return { [plans[0]?.id ?? 'default']: sensors };
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return { [plans[0]?.id ?? 'default']: parsed };
      return parsed;
    } catch (err) {
      console.warn('Failed to read sensors map', err);
      return { [plans[0]?.id ?? 'default']: sensors };
    }
  });

  const [addMode, setAddMode] = useState(false);
  const [newSensorType, setNewSensorType] = useState<Sensor['type']>("temp");
  const [newSensorLabel, setNewSensorLabel] = useState("");
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  // plans persistence
  useEffect(() => {
    try {
      localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
    } catch (err) {
      console.warn('Failed to persist plans', err);
    }
  }, [plans]);

  // when sensors change, update map for active plan and persist
  useEffect(() => {
    setSensorsMap((m) => {
      const copy = { ...m, [activePlanId]: sensors };
      try {
        localStorage.setItem(SENSORS_KEY, JSON.stringify(copy));
      } catch (err) {
        console.warn('Failed to persist sensors', err);
      }
      return copy;
    });
  }, [sensors, activePlanId]);

  // when active plan changes, load sensors for that plan
  useEffect(() => {
    setSensors(sensorsMap[activePlanId] ?? []);
  }, [activePlanId, sensorsMap]);

  const addPlanFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result ?? "");
      const p = { id: uid(), label: file.name, src };
      setPlans((s) => [p, ...s]);
      setActivePlanId(p.id);
    };
    reader.readAsDataURL(file);
  };

  const removePlan = (id: string) => {
    setPlans((s) => s.filter((p) => p.id !== id));
    setSensorsMap((m) => {
      const copy = { ...m };
      delete copy[id];
      try {
        localStorage.setItem(SENSORS_KEY, JSON.stringify(copy));
      } catch (err) {
        console.warn('Failed to persist sensors after plan removal', err);
      }
      return copy;
    });
    if (activePlanId === id) setActivePlanId(plans[0]?.id ?? 'default');
  };

  const sensorSeverity = (s: Sensor) => {
    if (s.disabled) return "disabled";
    if (s.type === "temp") {
      if (temp > thresholds.temp) return "critical";
      if (temp > thresholds.temp - 5) return "warning";
      return "ok";
    }
    if (s.type === "smoke") {
      if (smokeProb > thresholds.smoke) return "critical";
      if (smokeProb > thresholds.smoke - 0.15) return "warning";
      return "ok";
    }
    if (s.type === "motion") {
      if (motionCount > thresholds.motionCount * 1.5) return "critical";
      if (motionCount > thresholds.motionCount) return "warning";
      return "ok";
    }
    if (s.type === "door") {
      const open = doorsOpen.find((d) => d.label === s.label)?.open ?? false;
      return open ? "warning" : "ok";
    }
    return "ok";
  };

  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (addMode) {
      const rect = (e.target as HTMLDivElement).getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      const label = newSensorLabel || `Sensor ${sensors.length + 1}`;
      setSensors((s) => [{ id: uid(), label, type: newSensorType, x, y }, ...s]);
      setNewSensorLabel("");
      setAddMode(false);
      return;
    }
    // clicking map when not in add mode closes the sensor popup
    setSelectedSensor(null);
  }; 

  const toggleSensorDisabled = (id: string) => setSensors((s) => s.map((x) => (x.id === id ? { ...x, disabled: !x.disabled } : x)));

  const triggerSensorAlarm = (s: Sensor) => {
    const severity: AlertSeverity = s.type === "temp" || s.type === "smoke" ? "critical" : "info";
    const message = `Sensor ${s.label} triggered (${s.type})`;
    const ev: AlertItem = { id: uid(), time: new Date().toISOString(), message, severity };
    setEvents((e) => {
      const next = [ev, ...e].slice(0, 200);
      try {
        localStorage.setItem(STORAGE_EVENTS, JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to persist event', err);
      }
      return next;
    });
  };


  // handlers for sensor popup

  const handleRename = () => {
    if (!selectedSensor) return;
    setSensors((arr) => arr.map((x) => (x.id === selectedSensor.id ? { ...x, label: renameValue } : x)));
    setSelectedSensor((s) => (s ? { ...s, label: renameValue } : s));
  };

  const handleRemove = () => {
    if (!selectedSensor) return;
    if (!window.confirm(`Remove sensor "${selectedSensor.label}"?`)) return;
    setSensors((arr) => arr.filter((x) => x.id !== selectedSensor.id));
    setSelectedSensor(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedSensor(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);


  // simulation tick
  useEffect(() => {
    const id = setInterval(() => {
      setTemp((t) => Math.max(10, +(t + (Math.random() - 0.45) * 0.8).toFixed(2)));
      setInverterTemp((t) => Math.max(10, +(t + (Math.random() - 0.4) * 0.9).toFixed(2)));
      setSmokeProb(() => Math.max(0, +(Math.random() * 0.2 + Math.random() * 0.05).toFixed(2)));
      setMotionCount(() => Math.round(Math.random() * 8));
      if (Math.random() > 0.92) {
        setDoorsOpen((d) => d.map((x, i) => (Math.random() > 0.75 && i === 0 ? { ...x, open: !x.open } : x)));
      }
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // push to history and detect alerts whenever a tick happens
  useEffect(() => {
    setTempHistory((s) => [...s.slice(-47), Math.round(temp * 10)]);

    const checks: AlertItem[] = [];
    if (temp > thresholds.temp) {
      checks.push({
        id: uid(),
        time: new Date().toISOString(),
        message: `Temperature too high: ${temp}°C (threshold ${thresholds.temp}°C)`,
        severity: "critical",
      });
    }
    if (inverterTemp > thresholds.inverterTemp) {
      checks.push({
        id: uid(),
        time: new Date().toISOString(),
        message: `Inverter temp high: ${inverterTemp}°C (threshold ${thresholds.inverterTemp}°C)`,
        severity: "warning",
      });
    }
    if (smokeProb > thresholds.smoke) {
      checks.push({
        id: uid(),
        time: new Date().toISOString(),
        message: `Smoke likelihood high: ${(smokeProb * 100).toFixed(0)}%`,
        severity: "critical",
      });
    }
    if (motionCount > thresholds.motionCount) {
      checks.push({
        id: uid(),
        time: new Date().toISOString(),
        message: `Unusual motion: ${motionCount} events`,
        severity: "info",
      });
    }
    if (thresholds.doorOpen) {
      const openDoor = doorsOpen.find((d) => d.open);
      if (openDoor) {
        checks.push({
          id: uid(),
          time: new Date().toISOString(),
          message: `Door open: ${openDoor.label}`,
          severity: "warning",
        });
      }
    }

    if (checks.length) {
      setEvents((e) => {
        const up = [...checks, ...e].slice(0, 200);
        try {
          localStorage.setItem(STORAGE_EVENTS, JSON.stringify(up));
        } catch (err) {
          console.warn('Failed to save events', err);
        }
        return up;
      });
    }
  }, [temp, inverterTemp, smokeProb, motionCount, doorsOpen, thresholds]);

  // save sensors
  useEffect(() => {
    try {
      localStorage.setItem(SENSORS_KEY, JSON.stringify(sensors));
    } catch (err) {
      console.warn('Failed to persist sensors', err);
    }
  }, [sensors]);

  // persist thresholds
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THRESH, JSON.stringify(thresholds));
    } catch (err) {
      console.warn('Failed to persist thresholds', err);
    }
  }, [thresholds]);

  const clearEvents = () => {
    setEvents([]);
    localStorage.removeItem(STORAGE_EVENTS);
  };

  const acknowledge = (id: string) => {
    setEvents((e) => e.map((it) => (it.id === id ? { ...it, acknowledged: true } : it)));
  };

  const exportEvents = () => {
    const csv = events
      .map((ev) => `${ev.time},${ev.severity},"${ev.message.replace(/"/g, '""')}"`)
      .join("\n");
    const url = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    window.open(url, "_blank");
  };

  const tempValues = useMemo(() => tempHistory, [tempHistory]);

  const sparkPoints = (values: number[], width = 360, height = 100) => {
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

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Safety Monitoring</h2>
          <p className="text-white/80 mt-1">Live sensor overview, alerts and thresholds.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={exportEvents} className="px-3 py-2 rounded bg-white/6">Export events</button>
          <button onClick={clearEvents} className="px-3 py-2 rounded bg-white/6">Clear events</button>
        </div>
      </div>

      {/* Active Alerts */}
      <div>
        {events.length > 0 && (
          <div className="bg-red-900/80 p-3 rounded text-white/90 mb-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{events.filter((e) => !e.acknowledged).length} Active Alerts</div>
              <div className="text-sm text-white/80">Most recent: {new Date(events[0].time).toLocaleTimeString()}</div>
            </div>
            <div className="mt-2 space-y-2">
              {events.slice(0, 4).map((ev) => (
                <div key={ev.id} className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{ev.severity.toUpperCase()}</div>
                    <div className="text-sm">{ev.message}</div>
                    <div className="text-xs text-white/70 mt-1">{new Date(ev.time).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    {!ev.acknowledged && <button onClick={() => acknowledge(ev.id)} className="px-2 py-1 rounded bg-white/10">Acknowledge</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-white/80">Temperature (recent)</div>
              <div className="text-2xl font-bold text-white">{temp.toFixed(1)} °C</div>
            </div>

            <div className="text-sm text-white/60">Threshold: {thresholds.temp} °C</div>
          </div>

          <div className="w-full overflow-hidden">
            <svg className="w-full h-40 md:h-56" viewBox="0 0 360 100" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#f97316"
                strokeWidth={2}
                points={sparkPoints(tempValues, 360, 100)}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded bg-white/6">
              <div className="text-sm text-white/70">Inverter Temp</div>
              <div className="text-xl font-semibold text-white">{inverterTemp.toFixed(1)} °C</div>
              <div className="text-xs text-white/60 mt-1">Threshold: {thresholds.inverterTemp} °C</div>
            </div>

            <div className="p-3 rounded bg-white/6">
              <div className="text-sm text-white/70">Smoke Likelihood</div>
              <div className="text-xl font-semibold text-white">{Math.round(smokeProb * 100)}%</div>
              <div className="text-xs text-white/60 mt-1">Threshold: {Math.round(thresholds.smoke * 100)}%</div>
            </div>

            <div className="p-3 rounded bg-white/6">
              <div className="text-sm text-white/70">Motion (recent)</div>
              <div className="text-xl font-semibold text-white">{motionCount}</div>
              <div className="text-xs text-white/60 mt-1">Threshold: {thresholds.motionCount}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-white/80">Sensors</div>
              <div className="text-xs text-white/60">Realtime</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/80">Temperature</div>
                  <div className="text-sm text-white/60">{temp.toFixed(1)} °C</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={thresholds.temp} onChange={(e) => setThresholds((s) => ({ ...s, temp: Number(e.target.value) }))} className="w-20 p-1 rounded bg-white/6 text-black" />
                  <button onClick={() => setThresholds((s) => ({ ...s, temp: defaultThresholds.temp }))} className="px-2 py-1 rounded bg-white/6">Reset</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/80">Inverter Temp</div>
                  <div className="text-sm text-white/60">{inverterTemp.toFixed(1)} °C</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={thresholds.inverterTemp} onChange={(e) => setThresholds((s) => ({ ...s, inverterTemp: Number(e.target.value) }))} className="w-20 p-1 rounded bg-white/6 text-black" />
                  <button onClick={() => setThresholds((s) => ({ ...s, inverterTemp: defaultThresholds.inverterTemp }))} className="px-2 py-1 rounded bg-white/6">Reset</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/80">Smoke</div>
                  <div className="text-sm text-white/60">{Math.round(smokeProb * 100)}%</div>
                </div>
                <div className="flex items-center gap-2">
                  <input step="0.05" min={0} max={1} type="number" value={thresholds.smoke} onChange={(e) => setThresholds((s) => ({ ...s, smoke: Number(e.target.value) }))} className="w-20 p-1 rounded bg-white/6 text-black" />
                  <button onClick={() => setThresholds((s) => ({ ...s, smoke: defaultThresholds.smoke }))} className="px-2 py-1 rounded bg-white/6">Reset</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/80">Motion</div>
                  <div className="text-sm text-white/60">{motionCount}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={thresholds.motionCount} onChange={(e) => setThresholds((s) => ({ ...s, motionCount: Number(e.target.value) }))} className="w-20 p-1 rounded bg-white/6 text-black" />
                  <button onClick={() => setThresholds((s) => ({ ...s, motionCount: defaultThresholds.motionCount }))} className="px-2 py-1 rounded bg-white/6">Reset</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/80">Doors</div>
                  <div className="text-sm text-white/60">{doorsOpen.filter((d) => d.open).length} open</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={thresholds.doorOpen} onChange={(e) => setThresholds((s) => ({ ...s, doorOpen: e.target.checked }))} />
                    Alert on open
                  </label>
                </div>
              </div>

            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-white/80">Sensor Map</div>
              <div className="text-xs text-white/60">Place sensors on plan</div>
            </div>

<div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/70">Plan:</label>
                  <select value={activePlanId} onChange={(e) => setActivePlanId(e.target.value)} className="p-2 rounded bg-white/6 text-black">
                    {plans.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                  <button onClick={() => document.getElementById('plan-upload')?.click()} className="px-2 py-2 rounded bg-white/6">Upload plan</button>
                  <input id="plan-upload" type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) addPlanFromFile(f); e.currentTarget.value = ''; }} className="hidden" />
                  {plans.length > 1 && activePlanId !== 'default' && (
                    <button onClick={() => removePlan(activePlanId)} className="px-2 py-2 rounded bg-red-600 text-white">Remove plan</button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select value={newSensorType} onChange={(e) => setNewSensorType(e.target.value as unknown as Sensor['type'])} className="p-2 rounded bg-white/6 text-black">
                    <option value="temp">Temp</option>
                    <option value="smoke">Smoke</option>
                    <option value="motion">Motion</option>
                    <option value="door">Door</option>
                  </select>
                  <input value={newSensorLabel} onChange={(e) => setNewSensorLabel(e.target.value)} placeholder="Label (optional)" className="p-2 rounded bg-white/6 text-black" />
                  <button onClick={() => setAddMode((s) => !s)} className={`px-3 py-2 rounded ${addMode ? 'bg-yellow-500 text-black' : 'bg-white/6'}`}>{addMode ? 'Click map to place' : 'Add sensor'}</button>
                  <button onClick={() => setSensors([])} className="px-3 py-2 rounded bg-white/6">Clear map</button>
                </div>
            </div>

            <div onClick={onMapClick} className={`relative bg-white/6 rounded h-40 md:h-64 overflow-hidden border border-white/6 ${addMode ? 'ring-2 ring-yellow-400' : ''}`} style={{ backgroundImage: plans.find(p => p.id === activePlanId)?.src ? `url(${plans.find(p => p.id === activePlanId)?.src})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 p-4 text-xs text-white/60">Floor plan (click to add sensor)</div>

              {sensors.map((s) => {
                const sev = sensorSeverity(s);
                const color = s.disabled ? '#94a3b8' : sev === 'critical' ? '#ef4444' : sev === 'warning' ? '#f59e0b' : '#10b981';
                return (
                  <button
                    key={s.id}
                    title={`${s.label} (${s.type})`}
                    onClick={(e) => { e.stopPropagation(); setSelectedSensor(s); setRenameValue(s.label); }}                      onDoubleClick={(e) => { e.stopPropagation(); triggerSensorAlarm(s); }}                    className="absolute rounded-full w-8 h-8 flex items-center justify-center text-xs font-semibold"
                    style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%,-50%)', background: color }}
                  >
                    {s.label.split(' ').map((p) => p[0]).slice(0,2).join('')}
                  </button>
                );
              })}

              {selectedSensor && (
                <div className="absolute z-10" style={{ left: `${selectedSensor.x}%`, top: `${selectedSensor.y}%`, transform: 'translate(-50%,-110%)', minWidth: 220 }}>
                  <div className="bg-white p-3 rounded shadow text-black">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{selectedSensor.label}</div>
                        <div className="text-xs text-gray-600">{selectedSensor.type}</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedSensor(null); }} className="text-sm px-1">✕</button>
                    </div>

                    <div className="mt-2 text-sm space-y-2">
                      <div>Status: <strong>{selectedSensor.disabled ? 'disabled' : sensorSeverity(selectedSensor)}</strong></div>
                      <div className="flex gap-2">
                        <button onClick={() => { triggerSensorAlarm(selectedSensor); setSelectedSensor(null); }} className="px-2 py-1 rounded bg-red-500 text-white text-xs">Simulate Alarm</button>
                        <button onClick={() => { toggleSensorDisabled(selectedSensor.id); setSelectedSensor(s => s ? { ...s, disabled: !s.disabled } : s); }} className="px-2 py-1 rounded bg-white/6 text-xs">Toggle Disabled</button>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="p-1 rounded border text-sm" />
                        <button onClick={() => { handleRename(); }} className="px-2 py-1 rounded bg-blue-600 text-white text-xs">Save</button>
                        <button onClick={() => { handleRemove(); }} className="px-2 py-1 rounded bg-red-600 text-white text-xs">Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div className="text-xs text-white/60 mt-2">Click a sensor to toggle disabled state. Use the small 'simulate alarm' controls from the events panel (coming soon).</div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">            <div className="text-sm text-white/80 mb-2">Event log</div>
            <div className="h-48 overflow-auto text-sm text-white/70 space-y-2">
              {events.length === 0 && <div className="text-white/60">No recent events</div>}
              {events.map((ev) => (
                <div key={ev.id} className={`p-2 rounded ${ev.acknowledged ? 'bg-white/6' : 'bg-white/8'}`}>
                  <div className="text-xs text-white/60">{new Date(ev.time).toLocaleString()}</div>
                  <div className="font-semibold">{ev.severity.toUpperCase()}</div>
                  <div className="text-sm mt-1">{ev.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
