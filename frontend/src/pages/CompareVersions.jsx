import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { skillApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CompareVersions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedV1, setSelectedV1] = useState(null);
  const [selectedV2, setSelectedV2] = useState(null);
  const [version1Data, setVersion1Data] = useState(null);
  const [version2Data, setVersion2Data] = useState(null);

  useEffect(() => {
    if (id) {
      // Get skill details
      skillApi.get(id).then(res => {
        setSkill(res.data);
        // Get all versions
        skillApi.getVersions(id).then(vRes => {
          const versionList = vRes.data;
          setVersions(versionList);
          if (versionList.length >= 2) {
            setSelectedV1(versionList[versionList.length - 1]); // Oldest
            setSelectedV2(versionList[0]); // Latest
            setVersion1Data(versionList[versionList.length - 1]);
            setVersion2Data(versionList[0]);
          } else if (versionList.length === 1) {
            setSelectedV1(versionList[0]);
            setSelectedV2(versionList[0]);
            setVersion1Data(versionList[0]);
            setVersion2Data(versionList[0]);
          }
          setLoading(false);
        });
      });
    }
  }, [id]);

  // Handle version selection
  const handleVersionChange = (versionNum, isFirst) => {
    const version = versions.find(v => v.version === versionNum);
    if (isFirst) {
      setSelectedV1(version);
      setVersion1Data(version);
    } else {
      setSelectedV2(version);
      setVersion2Data(version);
    }
  };

  // Check if field changed between versions
  const isChanged = (field) => {
    if (!version1Data || !version2Data) return false;
    return JSON.stringify(version1Data[field]) !== JSON.stringify(version2Data[field]);
  };

  // Format field value
  const formatValue = (value) => {
    if (Array.isArray(value)) return value.join(', ') || 'None';
    if (typeof value === 'object') return JSON.stringify(value);
    return value || 'Not set';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Compare Versions: {skill?.name}
          </h2>
          <p className="text-gray-600">Current version: v{skill?.version}</p>
        </div>
        <button
          onClick={() => navigate('/history')}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      {/* Version Selectors */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Version 1 (Older)
          </label>
          <select
            value={selectedV1?.version || ''}
            onChange={(e) => handleVersionChange(parseInt(e.target.value), true)}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            {versions.map((v) => (
              <option key={v.version} value={v.version}>
                v{v.version} {v.version === skill?.version ? '(Latest)' : ''}
                {v.change_summary ? ` - ${v.change_summary}` : ''}
              </option>
            ))}
          </select>
          {selectedV1 && (
            <p className="text-xs text-gray-500 mt-1">
              Created: {new Date(selectedV1.created_at).toLocaleString()}
            </p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Version 2 (Newer)
          </label>
          <select
            value={selectedV2?.version || ''}
            onChange={(e) => handleVersionChange(parseInt(e.target.value), false)}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            {versions.map((v) => (
              <option key={v.version} value={v.version}>
                v{v.version} {v.version === skill?.version ? '(Latest)' : ''}
                {v.change_summary ? ` - ${v.change_summary}` : ''}
              </option>
            ))}
          </select>
          {selectedV2 && (
            <p className="text-xs text-gray-500 mt-1">
              Created: {new Date(selectedV2.created_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Field
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                v{selectedV1?.version || '?'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                v{selectedV2?.version || '?'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[
              { key: 'purpose', label: 'Purpose' },
              { key: 'instructions', label: 'Instructions' },
              { key: 'max_steps', label: 'Max Steps' },
              { key: 'allowed_tools', label: 'Tools' },
              { key: 'requires_approval', label: 'Approval Required' },
            ].map((field) => {
              const changed = isChanged(field.key);
              return (
                <tr key={field.key} className={changed ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {field.label}
                    {changed && (
                      <span className="ml-2 text-xs text-yellow-600">🟡 Changed</span>
                    )}
                  </td>
                  <td className={`px-6 py-4 text-sm ${changed ? 'bg-red-50 text-gray-700' : 'text-gray-500'}`}>
                    <div className="max-h-20 overflow-y-auto whitespace-pre-wrap">
                      {formatValue(version1Data?.[field.key])}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${changed ? 'bg-green-50 text-gray-700' : 'text-gray-500'}`}>
                    <div className="max-h-20 overflow-y-auto whitespace-pre-wrap">
                      {formatValue(version2Data?.[field.key])}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {changed ? (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        🔄 Changed
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        ✅ Same
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Change Summary */}
      {selectedV2?.change_summary && (
        <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm font-medium text-blue-800">📝 Change Summary</p>
          <p className="text-sm text-blue-700 mt-1">{selectedV2.change_summary}</p>
          <p className="text-xs text-blue-500 mt-2">
            Version v{selectedV2.version} created at {new Date(selectedV2.created_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompareVersions;