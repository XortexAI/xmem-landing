import { X, Calendar, Clock, FileText, Tag, Brain } from "lucide-react";
import type { MemoryNode } from "@/hooks/useMemoryGraph";

interface MemoryDetailsProps {
  node: MemoryNode | null;
  onClose: () => void;
}

const NODE_COLORS = {
  temporal: "#00e5ff",
  profile: "#ff00ea",
  summary: "#4ade80",
};

const NODE_LABELS = {
  temporal: "Event",
  profile: "Profile",
  summary: "Summary",
};

export function MemoryDetails({ node, onClose }: MemoryDetailsProps) {
  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6">
        <Brain className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm text-center">
          Click on a memory node in the brain visualization to view details
        </p>
      </div>
    );
  }

  const color = NODE_COLORS[node.type];
  const typeLabel = NODE_LABELS[node.type];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: `${color}30` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color }}
          >
            {typeLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title/Label */}
        <div>
          <h3 className="text-white font-medium text-lg leading-snug">
            {node.label}
          </h3>
        </div>

        {/* Temporal-specific fields */}
        {node.type === "temporal" && (
          <div className="space-y-3">
            {node.metadata.event_name && (
              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 mt-0.5" style={{ color }} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                    Event
                  </p>
                  <p className="text-sm text-gray-200">{node.metadata.event_name}</p>
                </div>
              </div>
            )}

            {node.metadata.date && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-0.5" style={{ color }} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                    Date
                  </p>
                  <p className="text-sm text-gray-200">
                    {node.metadata.date}
                    {node.metadata.year && `, ${node.metadata.year}`}
                  </p>
                </div>
              </div>
            )}

            {node.metadata.time && (
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-0.5" style={{ color }} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                    Time
                  </p>
                  <p className="text-sm text-gray-200">{node.metadata.time}</p>
                </div>
              </div>
            )}

            {node.metadata.date_expression && (
              <div className="mt-2 p-2 rounded bg-gray-800/50 border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Natural Date</p>
                <p className="text-sm text-gray-300 italic">
                  &ldquo;{node.metadata.date_expression}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Profile-specific fields */}
        {node.type === "profile" && (
          <div className="space-y-3">
            {node.metadata.topic && (
              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 mt-0.5" style={{ color }} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                    Topic
                  </p>
                  <p className="text-sm text-gray-200 capitalize">
                    {node.metadata.topic}
                  </p>
                </div>
              </div>
            )}

            {node.metadata.sub_topic && (
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 mt-0.5" style={{ color }} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                    Sub-topic
                  </p>
                  <p className="text-sm text-gray-200 capitalize">
                    {node.metadata.sub_topic}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description (common to all types) */}
        {node.metadata.description && (
          <div className="pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Description
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {node.metadata.description}
            </p>
          </div>
        )}

        {/* Content (for profile/summary) */}
        {node.metadata.content && (
          <div className="pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Content
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {node.metadata.content}
            </p>
          </div>
        )}

        {/* Node ID (for debugging/technical users) */}
        <div className="pt-4 mt-4 border-t border-gray-800">
          <p className="text-[10px] text-gray-600 font-mono">ID: {node.id}</p>
        </div>
      </div>
    </div>
  );
}
