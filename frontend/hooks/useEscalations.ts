"use client";

import { useState, useEffect } from 'react';
import { Escalation } from '../types/escalation';
import { escalationService } from '../services/escalationService';

export function useEscalations() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const data = await escalationService.getEscalations();
      setEscalations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch escalations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const resolveEscalation = async (escId: number) => {
    try {
      setError(null);
      await escalationService.updateStatus(escId, 'Resolved');
      setEscalations(prev => prev.map(e => e.id === escId ? { ...e, status: 'Resolved' } : e));
      
      // Notify other tabs and components to re-query their local states
      window.dispatchEvent(new Event('intellimeet_db_update'));
    } catch (err: any) {
      setError(err.message || 'Failed to update escalation');
    }
  };

  return { escalations, loading, error, resolveEscalation, refetch: fetchEscalations };
}
