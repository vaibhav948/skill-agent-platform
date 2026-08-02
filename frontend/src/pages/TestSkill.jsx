import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { skillApi, executionApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TestSkill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [versions, setVersions] = useState([]);  // ✅ NEW: Store version history
  const [input, setInput] = useState('{\n  "query": "test"\n}');
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(1);

  useEffect(() => {
    if (id) {
      // ✅ Fetch skill and version history
      Promise.all([
        skillApi.get(id),
        skillApi.getVersions(id).catch(() => [])
      ]).then(([skillRes, versionsRes]) => {
        setSkill(skillRes.data);
        setSelectedVersion(skillRes.data.version || 1);
        setVersions(versionsRes.data || []);
      });
    }
  }, [id]);

  useEffect(() => {
    if (execution && ['pending', 'running'].includes(execution.status)) {
      const interval = setInterval(() => {
        executionApi.get(execution.id).then(res => {
          setExecution(res.data);
          if (['completed', 'failed', 'cancelled'].includes(res.data.status)) {
            clearInterval(interval);
            setPolling(null);
            if (res.data.status === 'completed') {
              toast.success('Execution completed!');
            } else if (res.data.status === 'failed') {
              toast.error('Execution failed: ' + (res.data.error_message || 'Unknown error'));
            }
          }
        });
      }, 2000);
      setPolling(interval);
    }
    return () => {
      if (polling) clearInterval(polling);
    };
  }, [execution]);

  const handleExecute = async () => {
    try {
      const inputData = JSON.parse(input);
      setLoading(true);
      const response = await executionApi.create({
        skill_id: parseInt(id),
        skill_version: selectedVersion,
        input_data: inputData
      });
      setExecution(response.data);
      toast.success(`Execution started with version ${selectedVersion}!`);
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON input');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to start execution');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (stepId, approved) => {
    try {
      await executionApi.approve(execution.id, stepId, approved);
      toast.success(approved ? 'Step approved!' : 'Step rejected');
      const res = await executionApi.get(execution.id);
      setExecution(res.data);
    } catch (error) {
      toast.error('Failed to process approval');
    }
  };

  const handleCancel = async () => {
    try {
      await executionApi.cancel(execution.id);
      toast.success('Execution cancelled');
      const res = await executionApi.get(execution.id);
      setExecution(res.data);
    } catch (error) {
      toast.error('Failed to cancel execution');
    }
  };

  // ✅ Get version-specific data
  const getVersionData = (versionNumber) => {
    if (versions.length > 0) {
      const found = versions.find(v => v.version === versionNumber);
      if (found) return found;
    }
    // Fallback to current skill data
    return {
      purpose: skill?.purpose || 'Not set',
      max_steps: skill?.max_steps || 10,
      allowed_tools: skill?.allowed_tools || [],
      requires_approval: skill?.requires_approval || [],
      change_summary: null
    };
  };

  if (!skill) {
    return <LoadingSpinner />;
  }

  const versionOptions = [];
  if (skill && skill.version) {
    for (let i = 1; i <= skill.version; i++) {
      versionOptions.push(i);
    }
  }

  // ✅ Get data for selected version
  const versionData = getVersionData(selectedVersion);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test: {skill.name}</h2>
          <p className="text-gray-600">v{skill.version} • {skill.status}</p>
        </div>
        <button
          onClick={() => navigate('/skills')}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Input</h3>
          
          {/* Version Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill Version
            </label>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {versionOptions.map((v) => (
                <option key={v} value={v}>
                  v{v} {v === skill.version ? '(Latest)' : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {selectedVersion === skill.version 
                ? 'Running the latest version' 
                : `Running older version v${selectedVersion}`}
            </p>
          </div>

          {/* ✅ Version Info Display - Using version-specific data */}
          <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  Version {selectedVersion} Details
                </p>
                
                {/* ✅ Display version-specific purpose */}
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Purpose:</span> {versionData.purpose || 'Not set'}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Max Steps:</span> {versionData.max_steps || 10}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Tools:</span> {versionData.allowed_tools?.join(', ') || 'None'}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Approval Required:</span> {versionData.requires_approval?.length > 0 ? versionData.requires_approval.join(', ') : 'None'}
                </p>
                
                {/* ✅ Show change summary if available */}
                {versionData.change_summary && (
                  <p className="text-xs text-blue-600 mt-1">
                    📝 {versionData.change_summary}
                  </p>
                )}
                
                {selectedVersion !== skill.version && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ This is an older version (v{skill.version} is latest)
                  </p>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded ml-2 ${
                selectedVersion === skill.version 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {selectedVersion === skill.version ? '✅ Latest' : '📦 Older'}
              </span>
            </div>
          </div>

          <div className="h-64 border rounded overflow-hidden">
            <Editor
              language="json"
              theme="vs-dark"
              value={input}
              onChange={(value) => setInput(value)}
              options={{ minimap: { enabled: false } }}
            />
          </div>
          <button
            onClick={handleExecute}
            disabled={loading}
            className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Starting...' : `Execute Skill (v${selectedVersion})`}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Execution Status</h3>
          {execution ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  execution.status === 'completed' ? 'bg-green-100 text-green-800' :
                  execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                  execution.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  execution.status === 'awaiting_approval' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {execution.status}
                </span>
              </div>
              
              <div className="text-sm text-gray-500">
                Executed with version: <span className="font-semibold text-gray-700">v{execution.skill_version}</span>
              </div>
              
              {execution.status === 'awaiting_approval' && execution.execution_log && (
                <div className="border rounded p-4 bg-yellow-50">
                  <p className="text-sm font-medium text-yellow-800 mb-2">Approval Required</p>
                  {execution.execution_log.map((log, idx) => (
                    log.status === 'awaiting_approval' && (
                      <div key={idx} className="space-y-2">
                        <p className="text-sm">
                          Tool: <span className="font-mono">{log.tool}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Params: <span className="font-mono">{JSON.stringify(log.params)}</span>
                        </p>
                        {log.reason && (
                          <p className="text-sm text-gray-600">Reason: {log.reason}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleApprove(`${execution.id}_${log.step}`, true)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprove(`${execution.id}_${log.step}`, false)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}

              {execution.error_message && (
                <div className="border border-red-300 rounded p-4 bg-red-50">
                  <p className="text-sm text-red-800">Error: {execution.error_message}</p>
                </div>
              )}

              {execution.output_data && (
                <div className="border rounded p-4 bg-green-50">
                  <p className="text-sm font-medium text-green-800 mb-2">Output</p>
                  {execution.output_data.results && Array.isArray(execution.output_data.results) ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {execution.output_data.results.map((result, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border border-green-200">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-800 capitalize text-sm">
                              {result.topic?.replace(/_/g, ' ') || 'Untitled'}
                            </h4>
                            {result.relevance !== undefined && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                Relevance: {result.relevance}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 mt-1 max-h-20 overflow-y-auto whitespace-pre-wrap">
                            {result.content?.trim() || 'No content'}
                          </div>
                        </div>
                      ))}
                      {execution.output_data.message && (
                        <p className="text-xs text-gray-500">{execution.output_data.message}</p>
                      )}
                    </div>
                  ) : (
                    <pre className="text-sm bg-white p-2 rounded border whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {JSON.stringify(execution.output_data, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {execution.execution_log && execution.execution_log.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Execution Log</p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {execution.execution_log.map((log, idx) => (
                      <div key={idx} className="text-xs border-b py-1">
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
                          <span className="text-gray-500 ml-2">
                            → {JSON.stringify(log.result).slice(0, 50)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {['pending', 'running'].includes(execution.status) && (
                <button
                  onClick={handleCancel}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Cancel Execution
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No execution started yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestSkill;