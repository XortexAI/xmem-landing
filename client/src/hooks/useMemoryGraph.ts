import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_XMEM_API_URL || "http://localhost:8000";

export interface MemoryNode {
  id: string;
  type: 'temporal' | 'profile' | 'summary';
  label: string;
  metadata: {
    event_name?: string;
    date?: string;
    year?: string;
    description?: string;
    time?: string;
    date_expression?: string;
    content?: string;
    topic?: string;
    sub_topic?: string;
  };
  position_hint?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface MemoryEdge {
  source: string;
  target: string;
  type: 'temporal' | 'semantic' | 'date_cluster';
  strength: number;
}

export interface MemoryGraphData {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
  total_memories: number;
  domains: string[];
}

export interface MemoryGraphResponse {
  status: 'ok' | 'error';
  data?: MemoryGraphData;
  error?: string;
  elapsed_ms?: number;
}

interface UseMemoryGraphResult {
  data: MemoryGraphData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMemoryGraph(token: string | null): UseMemoryGraphResult {
  const [data, setData] = useState<MemoryGraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemoryGraph = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/memory-graph`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
        throw new Error('Failed to fetch memory graph');
      }

      const result: MemoryGraphResponse = await response.json();

      if (result.status === 'error') {
        throw new Error(result.error || 'Unknown error');
      }

      if (result.data) {
        setData(result.data);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error('Error fetching memory graph:', err);
      setError(err instanceof Error ? err.message : 'Failed to load memories');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMemoryGraph();
  }, [fetchMemoryGraph]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchMemoryGraph,
  };
}
