 import React from "react";

/**
 * Status types for maintenance lifecycle
 */
type MaintenanceStatus =
  | "normal"
  | "scheduled"
  | "ongoing"
  | "completed";

interface MaintenanceItem {
  id: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  startTime: string;
  endTime: string;
  affectedServices: string[];
}

/**
 * Mock data (replace with API later)
 */
const currentMaintenance: MaintenanceItem | null = {
  id: "1",
  title: "Scheduled System Maintenance",
  description:
    "We are performing routine maintenance to improve system performance and reliability.",
  status: "scheduled",
  startTime: "10 Jan 2026, 10:00 AM",
  endTime: "10 Jan 2026, 02:00 PM",
  affectedServices: ["Live Monitoring", "Energy Reports"],
};

const maintenanceHistory: MaintenanceItem[] = [
  {
    id: "2",
    title: "Network Upgrade",
    description: "Upgrade of network infrastructure.",
    status: "completed",
    startTime: "02 Jan 2026, 01:00 AM",
    endTime: "02 Jan 2026, 03:00 AM",
    affectedServices: ["Dashboard"],
  },
];

/**
 * Status UI configuration
 */
function getStatusConfig(status: MaintenanceStatus) {
  switch (status) {
    case "ongoing":
      return {
        label: "Maintenance in Progress",
        className: "bg-red-100 text-red-700 border-red-300",
      };
    case "scheduled":
      return {
        label: "Scheduled Maintenance",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      };
    case "completed":
      return {
        label: "Maintenance Completed",
        className: "bg-gray-100 text-gray-700 border-gray-300",
      };
    default:
      return {
        label: "All Systems Operational",
        className: "bg-green-100 text-green-700 border-green-300",
      };
  }
}

export default function Maintenance() {
  const status: MaintenanceStatus =
    currentMaintenance?.status ?? "normal";

  const statusConfig = getStatusConfig(status);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Maintenance</h1>

      {/* Status Banner */}
      <div
        className={`border rounded-lg px-4 py-3 mb-6 ${statusConfig.className}`}
      >
        <p className="font-medium">{statusConfig.label}</p>
      </div>

      {/* Current Maintenance */}
      {currentMaintenance && (
        <div className="bg-white border rounded-lg p-5 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">
            {currentMaintenance.title}
          </h2>

          <p className="text-gray-600 mb-4">
            {currentMaintenance.description}
          </p>

          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>Start:</strong> {currentMaintenance.startTime}
            </p>
            <p>
              <strong>End:</strong> {currentMaintenance.endTime}
            </p>
          </div>

          <div className="mt-4">
            <p className="font-medium mb-1">Affected Features:</p>
            <ul className="list-disc list-inside text-gray-700">
              {currentMaintenance.affectedServices.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Maintenance History */}
      {maintenanceHistory.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Past Maintenance
          </h2>

          <div className="space-y-3">
            {maintenanceHistory.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {item.startTime} – {item.endTime}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

