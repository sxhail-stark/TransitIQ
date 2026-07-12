import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export const ActivityTimeline: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.get("/activity");
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="bg-surface-container border border-surface-variant rounded-xl p-lg shadow-md font-sans space-y-lg">
      <div className="border-b border-surface-variant pb-md">
        <h3 className="font-headline-md text-title-md text-on-background">System Audit Logs</h3>
        <p className="text-sm text-on-surface-variant mt-xs">
          Chronological record of all updates, dispatches, expense records, and security auth activities.
        </p>
      </div>

      {isLoading ? (
        <div className="py-xl text-center text-on-surface-variant font-label-md text-xs">
          Loading audit trails...
        </div>
      ) : logs.length > 0 ? (
        <div className="relative border-l-2 border-surface-variant ml-4 pl-lg space-y-lg">
          {logs.map((log) => (
            <div key={log.id} className="relative">
              {/* Timeline marker node dot */}
              <div className="absolute -left-[33px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-md"></div>
              
              <div className="p-md rounded bg-surface-container-low border border-surface-variant/40 hover:border-surface-variant transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-xs mb-xs">
                  <span className="inline-block px-2 py-0.5 bg-surface-container-high rounded text-[10px] uppercase font-bold text-primary border border-surface-variant">
                    {log.action.replace("_", " ")}
                  </span>
                  <span className="font-label-md text-[11px] text-on-surface-variant">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                
                <p className="font-body-md text-sm text-on-background">{log.description}</p>
                
                {log.user && (
                  <span className="font-label-md text-[11px] text-on-surface-variant block mt-sm">
                    Operator: {log.user.full_name} ({log.user.role})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-xl text-center text-on-surface-variant font-body-md">
          No audit entries recorded in database.
        </div>
      )}
    </div>
  );
};
