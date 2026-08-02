import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // ✅ Add this
import { executionApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const History = () => {
  const navigate = useNavigate();  // ✅ Add this
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [rerunning, setRerunning] = useState(null);

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    try {
      const response = await executionApi.getAll();
      setExecutions(response.data);
    } catch (error) {
      console.error('Error fetching executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
      awaiting_approval: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleRerun = async (execution) => {
    if (!window.confirm(`Rerun this execution? (Skill v${execution.skill_version})`)) {
      return;
    }

    setRerunning(execution.id);
    try {
      const response = await executionApi.create({
        skill_id: execution.skill_id,
        skill_version: execution.skill_version,
        input_data: execution.input_data
      });
      
      toast.success(`✅ Rerun started! (v${execution.skill_version})`);
      await fetchExecutions();
      
    } catch (error) {
      toast.error('Failed to rerun execution');
      console.error('Rerun error:', error);
    } finally {
      setRerunning(null);
    }
  };

  // ✅ Handle compare navigation
  const handleCompare = (skillId) => {
    navigate(`/skills/${skillId}/compare`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Execution History</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skill
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {executions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No executions found
                </td>
              </tr>
            ) : (
              executions.map((exec) => (
                <React.Fragment key={exec.id}>
                  <tr 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === exec.id ? null : exec.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      #{exec.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Skill {exec.skill_id} (v{exec.skill_version})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(exec.status)}`}>
                        {exec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(exec.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(expandedId === exec.id ? null : exec.id);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {expandedId === exec.id ? 'Hide Details' : 'Show Details'}
                      </button>
                      
                      {/* ✅ Rerun Button */}
                      {exec.status === 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRerun(exec);
                          }}
                          disabled={rerunning === exec.id}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                        >
                          {rerunning === exec.id ? '⏳ Rerunning...' : '🔄 Rerun'}
                        </button>
                      )}
                      
                      {/* ✅ Compare Button - NEW */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompare(exec.skill_id);
                        }}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        📊 Compare
                      </button>
                    </td>
                  </tr>
                  {expandedId === exec.id && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 bg-gray-50">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-gray-700">Skill Version</p>
                            <span className="text-sm font-semibold text-blue-600">v{exec.skill_version}</span>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700">Input Data</p>
                            <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                              {JSON.stringify(exec.input_data, null, 2)}
                            </pre>
                          </div>
                          
                          {exec.plan && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Plan</p>
                              <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                                {JSON.stringify(exec.plan, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {exec.execution_log && exec.execution_log.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Execution Log</p>
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {exec.execution_log.map((log, idx) => (
                                  <div key={idx} className="text-sm bg-white p-2 rounded border">
                                    <span className="font-mono text-gray-500">Step {log.step + 1}:</span>
                                    <span className="font-mono text-blue-600 ml-2">{log.tool}</span>
                                    <span className={`ml-2 ${
                                      log.status === 'completed' || log.status === 'approved' ? 'text-green-600' :
                                      log.status === 'failed' ? 'text-red-600' :
                                      'text-yellow-600'
                                    }`}>
                                      {log.status}
                                    </span>
                                    {log.result && (
                                      <pre className="mt-1 text-xs bg-gray-50 p-1 rounded overflow-x-auto">
                                        {JSON.stringify(log.result, null, 2)}
                                      </pre>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {exec.error_message && (
                            <div className="border border-red-300 rounded p-2 bg-red-50">
                              <p className="text-sm text-red-800">Error: {exec.error_message}</p>
                            </div>
                          )}
                          
                          {exec.output_data && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Output</p>
                              <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                                {JSON.stringify(exec.output_data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;