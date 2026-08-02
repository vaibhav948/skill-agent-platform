import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { skillApi, executionApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState({ skills: 0, executions: 0, published: 0 });
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, executionsRes] = await Promise.all([
          skillApi.getAll(),
          executionApi.getAll()
        ]);
        
        const skills = skillsRes.data;
        const executions = executionsRes.data;
        
        setStats({
          skills: skills.length,
          published: skills.filter(s => s.status === 'published').length,
          executions: executions.length
        });
        
        setRecentExecutions(executions.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Skills</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.skills}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Published Skills</h3>
          <p className="text-3xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Executions</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.executions}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Recent Executions</h3>
        </div>
        <div className="divide-y">
          {recentExecutions.length === 0 ? (
            <p className="px-6 py-4 text-gray-500">No executions yet</p>
          ) : (
            recentExecutions.map((exec) => (
              <div key={exec.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Execution #{exec.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Skill ID: {exec.skill_id} • Version: {exec.skill_version}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    exec.status === 'completed' ? 'bg-green-100 text-green-800' :
                    exec.status === 'failed' ? 'bg-red-100 text-red-800' :
                    exec.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {exec.status}
                  </span>
                  <Link
                    to={`/history`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;