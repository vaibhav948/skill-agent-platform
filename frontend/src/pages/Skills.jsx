import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { skillApi } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await skillApi.getAll();
      setSkills(response.data);
    } catch (error) {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    
    try {
      await skillApi.delete(id);
      toast.success('Skill deleted');
      fetchSkills();
    } catch (error) {
      toast.error('Failed to delete skill');
    }
  };

  const filteredSkills = filter === 'all' 
    ? skills 
    : skills.filter(s => s.status === filter);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <Link
            to="/skills/new"
            className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
          >
            + New Skill
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No skills found. Create your first skill!
          </div>
        ) : (
          filteredSkills.map((skill) => (
            <div key={skill.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {skill.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    skill.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {skill.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {skill.purpose}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    v{skill.version}
                  </span>
                  <span className="text-xs text-gray-500">
                    {skill.allowed_tools?.length || 0} tools
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/skills/${skill.id}/test`}
                    className="flex-1 bg-blue-500 text-white text-center px-3 py-2 rounded text-sm hover:bg-blue-600"
                  >
                    Test
                  </Link>
                  <Link
                    to={`/skills/${skill.id}/edit`}
                    className="flex-1 border border-gray-300 text-center px-3 py-2 rounded text-sm hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Skills;