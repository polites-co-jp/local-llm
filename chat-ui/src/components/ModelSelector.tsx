"use client";

import { useEffect, useState } from "react";
import { fetchModels, type Model } from "@/lib/api";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModels()
      .then((data) => {
        setModels(data);
        if (data.length > 0 && !selectedModel) {
          onModelChange(data[0].name);
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="text-red-400 text-sm px-3 py-2">
        Failed to load models: {error}
      </div>
    );
  }

  return (
    <select
      value={selectedModel}
      onChange={(e) => onModelChange(e.target.value)}
      className="bg-gray-800 text-white border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {models.length === 0 && (
        <option value="">Loading...</option>
      )}
      {models.map((m) => (
        <option key={m.name} value={m.name}>
          {m.name} ({m.parameter_size})
        </option>
      ))}
    </select>
  );
}
