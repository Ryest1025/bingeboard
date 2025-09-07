import React from "react";
import { AiRecommendations } from "@/components/ai-recommendations";

export default function RecommendationsCard() {
  return (
    <div className="glass-effect border-slate-700/50 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">AI Recommendations</h2>
      <AiRecommendations horizontal={true} />
    </div>
  );
}