"use client";

import { useState, useEffect } from 'react';
import { ProjectRisk, ProjectHealth } from '../types/risk';
import { Task } from '../types/meeting';
import { riskService } from '../services/riskService';

export function useRisks() {
  const [projects, setProjects] = useState<ProjectHealth[]>([]);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pData, rData, tData] = await Promise.all([
        riskService.getProjects(),
        riskService.getRisks(),
        riskService.getTasks()
      ]);
      setProjects(pData);
      setRisks(rData);
      setTasks(tData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch risk data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to custom updates to re-query the local data
    const handleUpdate = () => {
      fetchData();
    };

    window.addEventListener('intellimeet_db_update', handleUpdate);
    return () => {
      window.removeEventListener('intellimeet_db_update', handleUpdate);
    };
  }, []);

  const completeTask = async (taskId: number) => {
    try {
      setError(null);
      await riskService.updateTaskStatus(taskId, 'Completed');
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t));
      
      // Notify other tabs and components to re-query their local states
      window.dispatchEvent(new Event('intellimeet_db_update'));
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  return { projects, risks, tasks, loading, error, completeTask, refetch: fetchData };
}
