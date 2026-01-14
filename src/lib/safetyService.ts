export type Severity = "low" | "medium" | "high";

export interface AlertItem {
  id: string;
  severity: Severity;
  title: string;
  time: string; // ISO
  description?: string;
}

export interface MetricPoint {
  timestamp: number; // epoch ms
  value: number;
}

// Simple in-memory mock data generator
const seedAlerts: AlertItem[] = [
  {
    id: "a1",
    severity: "high",
    title: "Smoke detected in Kitchen",
    time: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    description: "Smoke sensor triggered in kitchen area."
  },
  {
    id: "a2",
    severity: "medium",
    title: "Door left open",
    time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    description: "Main entrance door still open for 45 minutes."
  },
  {
    id: "a3",
    severity: "low",
    title: "Low battery: Motion Sensor",
    time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    description: "Replace battery within 48 hours."
  }
];

let metricBase = Array.from({ length: 20 }).map((_, i) => ({
  timestamp: Date.now() - (19 - i) * 5000,
  value: 50 + Math.round(Math.sin(i / 2) * 10 + Math.random() * 5)
}));

export async function getAlerts(): Promise<AlertItem[]> {
  // emulate network delay
  await new Promise((r) => setTimeout(r, 250));
  return [...seedAlerts];
}

export async function getLiveMetrics(): Promise<MetricPoint[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...metricBase];
}

export async function getLatestMetric(): Promise<MetricPoint> {
  await new Promise((r) => setTimeout(r, 120));
  const last = metricBase[metricBase.length - 1];
  const next = {
    timestamp: Date.now(),
    value: Math.max(0, Math.round(last.value + (Math.random() - 0.4) * 6))
  };
  metricBase.push(next);
  // keep base small
  if (metricBase.length > 40) metricBase = metricBase.slice(-40);
  return next;
}
