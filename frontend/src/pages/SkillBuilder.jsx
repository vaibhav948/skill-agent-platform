import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { skillApi, toolApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SkillBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableTools, setAvailableTools] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [approvalTools, setApprovalTools] = useState([]);
  const [schemaError, setSchemaError] = useState(null);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      purpose: '',
      instructions: '',
      input_schema: '{\n  "type": "object",\n  "properties": {\n    "query": {\n      "type": "string"\n    }\n  }\n}',
      output_schema: '{\n  "type": "object",\n  "properties": {\n    "result": {\n      "type": "string"\n    }\n  }\n}',
      examples: '[\n  "Example 1",\n  "Example 2"\n]',
      max_steps: 10,
      status: 'draft'
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const toolsRes = await toolApi.getAll();
        setAvailableTools(toolsRes.data.tools || []);
        
        if (id) {
          const skillRes = await skillApi.get(id);
          const skill = skillRes.data;
          setValue('name', skill.name);
          setValue('purpose', skill.purpose);
          setValue('instructions', skill.instructions);
          setValue('input_schema', JSON.stringify(skill.input_schema, null, 2));
          setValue('output_schema', JSON.stringify(skill.output_schema, null, 2));
          setValue('examples', JSON.stringify(skill.examples, null, 2));
          setValue('max_steps', skill.max_steps);
          setValue('status', skill.status);
          setSelectedTools(skill.allowed_tools || []);
          setApprovalTools(skill.requires_approval || []);
        }
      } catch (error) {
        toast.error('Failed to load data');
      }
    };
    
    fetchData();
  }, [id, setValue]);

  const validateJSON = (value) => {
    try {
      JSON.parse(value);
      setSchemaError(null);
      return true;
    } catch (e) {
      setSchemaError(e.message);
      return false;
    }
  };

  const onSubmit = async (data) => {
    // Validate JSON schemas
    if (!validateJSON(data.input_schema)) {
      toast.error('Invalid input schema JSON');
      return;
    }
    if (!validateJSON(data.output_schema)) {
      toast.error('Invalid output schema JSON');
      return;
    }
    if (!validateJSON(data.examples)) {
      toast.error('Invalid examples JSON');
      return;
    }

    setLoading(true);
    try {
      const skillData = {
        ...data,
        allowed_tools: selectedTools,
        requires_approval: approvalTools,
        input_schema: JSON.parse(data.input_schema),
        output_schema: JSON.parse(data.output_schema),
        examples: JSON.parse(data.examples),
      };
      
      if (id) {
        await skillApi.update(id, skillData);
        toast.success('Skill updated successfully!');
      } else {
        await skillApi.create(skillData);
        toast.success('Skill created successfully!');
      }
      navigate('/skills');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleTool = (toolName) => {
    setSelectedTools(prev =>
      prev.includes(toolName)
        ? prev.filter(t => t !== toolName)
        : [...prev, toolName]
    );
    // Remove from approval tools if deselected
    if (selectedTools.includes(toolName)) {
      setApprovalTools(prev => prev.filter(t => t !== toolName));
    }
  };

  const toggleApproval = (toolName) => {
    setApprovalTools(prev =>
      prev.includes(toolName)
        ? prev.filter(t => t !== toolName)
        : [...prev, toolName]
    );
  };

  if (loading && id) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Edit Skill' : 'Create New Skill'}
      </h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Name *
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                className={`w-full border rounded px-3 py-2 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g., Data Analysis Assistant"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Steps *
              </label>
              <input
                type="number"
                {...register('max_steps', { required: 'Max steps is required', min: 1 })}
                className={`w-full border rounded px-3 py-2 ${errors.max_steps ? 'border-red-500' : ''}`}
              />
              {errors.max_steps && (
                <p className="text-red-500 text-xs mt-1">{errors.max_steps.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose *
            </label>
            <input
              {...register('purpose', { required: 'Purpose is required' })}
              className={`w-full border rounded px-3 py-2 ${errors.purpose ? 'border-red-500' : ''}`}
              placeholder="What does this skill do?"
            />
            {errors.purpose && (
              <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions *
            </label>
            <textarea
              {...register('instructions', { required: 'Instructions are required' })}
              rows="3"
              className={`w-full border rounded px-3 py-2 ${errors.instructions ? 'border-red-500' : ''}`}
              placeholder="How should the AI execute this skill?"
            />
            {errors.instructions && (
              <p className="text-red-500 text-xs mt-1">{errors.instructions.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Schema (JSON)
              </label>
              <div className="h-48 border rounded overflow-hidden">
                <Editor
                  language="json"
                  theme="vs-dark"
                  value={watch('input_schema')}
                  onChange={(value) => setValue('input_schema', value)}
                  options={{ minimap: { enabled: false } }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Schema (JSON)
              </label>
              <div className="h-48 border rounded overflow-hidden">
                <Editor
                  language="json"
                  theme="vs-dark"
                  value={watch('output_schema')}
                  onChange={(value) => setValue('output_schema', value)}
                  options={{ minimap: { enabled: false } }}
                />
              </div>
            </div>
          </div>
          {schemaError && (
            <p className="text-red-500 text-sm">Invalid JSON: {schemaError}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Examples (JSON array)
            </label>
            <div className="h-32 border rounded overflow-hidden">
              <Editor
                language="json"
                theme="vs-dark"
                value={watch('examples')}
                onChange={(value) => setValue('examples', value)}
                options={{ minimap: { enabled: false } }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Tools
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTools.map(tool => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTools.includes(tool)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          {selectedTools.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tools Requiring Approval
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedTools.map(tool => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => toggleApproval(tool)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      approvalTools.includes(tool)
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tool} {approvalTools.includes(tool) ? '🔒' : '🔓'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select {...register('status')} className="w-48 border rounded px-3 py-2">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : id ? 'Update Skill' : 'Create Skill'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/skills')}
            className="px-6 py-2 border rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SkillBuilder;