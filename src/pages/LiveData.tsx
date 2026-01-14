import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Define the shape of each data point
interface DataPoint {
  time: string;
  usage: number;
}

export default function LiveData() {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newPoint: DataPoint = {
        time: now.toLocaleTimeString().slice(0, 5),
        usage: Math.floor(Math.random() * 40) + 10, // simulate sensor value
      };

      // keep last 10 points
      setData((prev) => [...prev.slice(-10), newPoint]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentUsage = data[data.length - 1]?.usage ?? 0;
  const peakUsage = data.length ? Math.max(...data.map((d) => d.usage)) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-white text-xl font-semibold">Live Energy Usage</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-900/60 p-4 rounded-lg text-white shadow">
          <p className="text-xs text-white/70">Current Usage</p>
          <h2 className="text-2xl font-bold">{currentUsage} kW</h2>
        </div>

        <div className="bg-purple-900/60 p-4 rounded-lg text-white shadow">
          <p className="text-xs text-white/70">Highest Peak</p>
          <h2 className="text-2xl font-bold">{peakUsage} kW</h2>
        </div>

        <div className="bg-green-900/60 p-4 rounded-lg text-white shadow">
          <p className="text-xs text-white/70">Data Points</p>
          <h2 className="text-2xl font-bold">{data.length}</h2>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/10 p-4 rounded-lg shadow border border-white/10">
        <h2 className="text-white text-lg mb-3">Live Energy Flow Chart</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis dataKey="time" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="usage"
              stroke="#00d4ff"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

