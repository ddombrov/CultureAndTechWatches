import type React from "react";
import type { Watch } from "@/lib/types";

interface WatchCardProps {
  watch: Watch;
  isStarter?: boolean;
  actionButton?: React.ReactNode;
}

export default function WatchCard({
  watch,
  isStarter = false,
  actionButton,
}: WatchCardProps) {
  return (
    <div className="bg-blue-800 rounded-lg p-4 h-full flex flex-col hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-yellow-400">{watch.name}</h3>
        <div className="text-sm bg-blue-700 px-2 py-1 rounded">
          ${watch.value}
        </div>
      </div>

      {isStarter && (
        <div className="bg-yellow-500 text-blue-950 text-xs font-bold uppercase px-2 py-1 rounded mb-3 inline-block">
          Starter Watch
        </div>
      )}

      {watch.id === "basic" && (
        <div className="bg-blue-600 text-white text-xs font-bold uppercase px-2 py-1 rounded mb-3 inline-block">
          Standard Issue
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 mt-4 flex-grow">
        {Object.entries(watch.stats).map(([stat, value]) => (
          <div key={stat} className="flex justify-between items-center">
            <span className="text-xs uppercase text-blue-300">{stat}</span>
            <div className="flex items-center">
              <div className="w-16 h-2 bg-blue-900 rounded-full overflow-hidden mr-2">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${value * 10}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-blue-100">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {actionButton && <div className="mt-auto">{actionButton}</div>}
    </div>
  );
}
