import { useAtomValue } from "jotai";
import {
  coordinatesAtom,
  verticalCoordinatesAtom,
} from "@/store/Store";
import { useMemo, useState } from "react";

const useDebugEnabled = () =>
  typeof window !== "undefined" && Boolean(localStorage?.zenumlDebug);

export const StatementCoordinateDebug = () => {
  const debugEnabled = useDebugEnabled();
  const verticalCoordinates = useAtomValue(verticalCoordinatesAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("");

  const rows = useMemo(() => {
    if (!verticalCoordinates) return [];
    return verticalCoordinates
      .entries()
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => a.top - b.top);
  }, [verticalCoordinates]);

  const filteredRows = useMemo(() => {
    if (!filter) return rows;
    const normalized = filter.toLowerCase();
    return rows.filter(
      (row) =>
        row.key.includes(normalized) ||
        row.kind.toLowerCase().includes(normalized),
    );
  }, [rows, filter]);

  if (!debugEnabled || !verticalCoordinates) {
    return null;
  }

  const copyToClipboard = () => {
    const payload = JSON.stringify(Object.fromEntries(verticalCoordinates.entries()), null, 2);
    navigator.clipboard?.writeText(payload).catch((err) =>
      console.warn("Failed to copy statement coordinates", err),
    );
  };

  const logToConsole = () => {
    // Assemble a compact table for the console to aid visual diffing
    const table = rows.map((row) => ({
      key: row.key,
      kind: row.kind,
      top: Math.round(row.top),
      height: Math.round(row.height),
      anchors: row.anchors,
    }));
    console.table(table);
  };

  const summary = `${rows.length} statements | participants: ${coordinates.orderedParticipantNames().length}`;

  return (
    <div className="hide-export absolute bottom-3 right-3 z-50 text-xs">
      <div className="bg-black/70 text-white rounded shadow-lg p-2 w-64">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">Y-Map Debug</span>
          <button
            className="px-1 py-0.5 text-[10px] border border-white/40 rounded"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "Hide" : "Show"}
          </button>
        </div>
        <div className="mt-1 text-[10px] opacity-80">{summary}</div>
        {expanded && (
          <div className="mt-2 space-y-2">
            <div className="flex gap-2">
              <input
                className="flex-1 px-1 py-0.5 rounded text-black"
                placeholder="Filter (key/type)"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <button
                className="px-1 text-[10px] border border-white/40 rounded"
                onClick={copyToClipboard}
              >
                Copy
              </button>
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 px-1 text-[10px] border border-white/40 rounded"
                onClick={logToConsole}
              >
                Log table
              </button>
              <button
                className="flex-1 px-1 text-[10px] border border-white/40 rounded"
                onClick={() => setFilter("")}
              >
                Clear
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto border border-white/20 rounded">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-left border-b border-white/20">
                    <th className="px-1 py-0.5">Kind</th>
                    <th className="px-1 py-0.5">Top</th>
                    <th className="px-1 py-0.5">H</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.slice(0, 50).map((row) => (
                    <tr key={row.key} className="border-b border-white/10 last:border-0">
                      <td className="px-1 py-0.5">{row.kind}</td>
                      <td className="px-1 py-0.5">{Math.round(row.top)}</td>
                      <td className="px-1 py-0.5">{Math.round(row.height)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[10px] opacity-70">
              Showing {Math.min(filteredRows.length, 50)} / {filteredRows.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
