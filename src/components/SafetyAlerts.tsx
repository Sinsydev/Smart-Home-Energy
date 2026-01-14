import React, { useEffect, useState } from "react";
import { getAlerts, AlertItem } from "../lib/safetyService";

export default function SafetyAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchAlerts() {
      setLoading(true);
      const data = await getAlerts();
      if (!mounted) return;
      setAlerts(data);
      setLoading(false);
    }
    fetchAlerts();

    const t = setInterval(fetchAlerts, 15000); // poll every 15s
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  function severityClass(s: string) {
    switch (s) {
      case "high":
        return "bg-red-600 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      default:
        return "bg-gray-300 text-black";
    }
  }

  return (
    <section className="p-4 rounded-md bg-white/70 shadow-sm" role="region" aria-label="Recent safety alerts" aria-live="polite">
      <h3 className="text-lg font-semibold mb-3">Recent Alerts</h3>

      {loading ? (
        <div>Loading alerts…</div>
      ) : alerts.length === 0 ? (
        <div className="text-sm text-gray-600">No alerts.</div>
      ) : (
        <ul className="flex flex-col gap-3">
          {alerts.map((a) => (
            <li key={a.id} className="flex items-start gap-3">
              <div className={`px-2 py-1 rounded ${severityClass(a.severity)} text-xs font-semibold`}>{a.severity.toUpperCase()}</div>
              <div className="flex-1">
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-gray-600">{new Date(a.time).toLocaleString()}</div>
                {a.description && <div className="text-sm mt-1">{a.description}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
