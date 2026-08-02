import React from 'react';

const ApprovalModal = ({ isOpen, onClose, onApprove, onReject, step }) => {
  if (!isOpen || !step) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Required</h3>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Tool</p>
            <p className="font-mono text-sm">{step.tool}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Parameters</p>
            <pre className="text-sm bg-gray-50 p-2 rounded border">
              {JSON.stringify(step.params, null, 2)}
            </pre>
          </div>
          
          {step.reason && (
            <div>
              <p className="text-sm text-gray-500">Reason</p>
              <p className="text-sm">{step.reason}</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              onApprove();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={() => {
              onReject();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reject
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;