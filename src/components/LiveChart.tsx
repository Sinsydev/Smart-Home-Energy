import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getLiveMetrics, getLatestMetric, MetricPoint } from "../lib/safetyService";

export default function LiveChart() {
  const [data, setData] = useState<MetricPoint[]>([]);

  useEffect(() => {
    let mounted = true;

    async function fetch() {
      const d = await getLiveMetrics();
      if (!mounted) return;
      setData(d);
    }

    fetch();
    const t = setInterval(async () => {
      const next = await getLatestMetric();
      if (!mounted) return;
      setData((prev) => [...prev.slice(-39), next]);
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  const chartData = data.map((d) => ({ time: new Date(d.timestamp).toLocaleTimeString(), value: d.value }));

  return (
    <section className="p-4 rounded-md bg-white/70 shadow-sm h-full" role="region" aria-label="Live safety metric">
      <h3 className="text-lg font-semibold mb-3">Live Safety Metric</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="time" minTickGap={30} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
