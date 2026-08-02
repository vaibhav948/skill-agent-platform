import React from 'react';

const ExecutionLog = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <p className="text-gray-500">No logs yet</p>;
  }

  return (
    <div className="space-y-2">
      {logs.map((log, idx) => (
        <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
          <div className="flex items-center gap-2">
            <span className="font-mono text-gray-500">Step {log.step + 1}:</span>
            <span className="font-mono text-blue-600">{log.tool}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              log.status === 'completed' || log.status === 'approved' ? 'bg-green-100 text-green-800' :
              log.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {log.status}
            </span>
          </div>
          {log.reason && (
            <p className="text-gray-600 text-xs mt-1">Reason: {log.reason}</p>
          )}
          {log.params && (
            <p className="text-gray-500 text-xs">
              Params: {JSON.stringify(log.params)}
            </p>
          )}
          {log.result && (
            <pre className="mt-1 text-xs bg-white p-1 rounded border">
              {JSON.stringify(log.result, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExecutionLog;