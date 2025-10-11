import { useAtom } from "jotai";
import { debugModeAtom } from "@/store/Store";

interface DebugLabelProps {
  origin?: string;
  starter?: string;
  leftParticipant?: string;
  offsetX?: string | number;
  className?: string;
  style?: "inline" | "absolute";
}

export const DebugLabel = ({ 
  origin, 
  leftParticipant, 
  offsetX,
  starter,
  className = "",
  style = "inline"
}: DebugLabelProps) => {
  const [debugMode] = useAtom(debugModeAtom);
  
  if (!debugMode) return null;
  
  const parts: string[] = [];
  if (origin) parts.push(`o:${origin}`);
  if (leftParticipant) parts.push(`l:${leftParticipant}`);
  if (offsetX !== undefined) parts.push(`x:${offsetX}`);
  if (starter) parts.push(`s:${starter}`);
  
  const debugText = `[${parts.join(', ')}]`;
  
  const baseClasses = "text-xs text-gray-500 pointer-events-none";
  const styleClasses = style === "absolute" 
    ? "absolute z-10" 
    : "ml-2";
  
  return (
    <span className={`${baseClasses} ${styleClasses} ${className}`}>
      {debugText}
    </span>
  );
};
