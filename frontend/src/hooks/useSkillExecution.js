import { useState, useEffect } from 'react';
import { executionApi } from '../services/api';

export const useSkillExecution = (skillId) => {
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (inputData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await executionApi.create({
        skill_id: skillId,
        input_data: inputData
      });
      setExecution(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Execution failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (!execution) return;
    try {
      const response = await executionApi.get(execution.id);
      setExecution(response.data);
    } catch (err) {
      setError('Failed to refresh execution status');
    }
  };

  const approve = async (stepId, approved) => {
    if (!execution) return;
    try {
      await executionApi.approve(execution.id, stepId, approved);
      await refresh();
    } catch (err) {
      setError('Failed to process approval');
    }
  };

  const cancel = async () => {
    if (!execution) return;
    try {
      await executionApi.cancel(execution.id);
      await refresh();
    } catch (err) {
      setError('Failed to cancel execution');
    }
  };

  // Auto-refresh when running
  useEffect(() => {
    let interval;
    if (execution && ['pending', 'running'].includes(execution.status)) {
      interval = setInterval(refresh, 2000);
    }
    return () => clearInterval(interval);
  }, [execution]);

  return {
    execution,
    loading,
    error,
    execute,
    refresh,
    approve,
    cancel,
    isRunning: execution && ['pending', 'running'].includes(execution.status),
    isComplete: execution && ['completed', 'failed', 'cancelled'].includes(execution.status),
  };
};

export default useSkillExecution;