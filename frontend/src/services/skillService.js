// Additional service functions if needed
import { skillApi } from './api';

export const validateSkill = (skill) => {
  const errors = [];
  
  if (!skill.name || skill.name.length < 3) {
    errors.push('Name must be at least 3 characters');
  }
  
  if (!skill.purpose || skill.purpose.length < 10) {
    errors.push('Purpose must be at least 10 characters');
  }
  
  if (!skill.instructions || skill.instructions.length < 20) {
    errors.push('Instructions must be at least 20 characters');
  }
  
  if (!skill.allowed_tools || skill.allowed_tools.length === 0) {
    errors.push('At least one tool must be selected');
  }
  
  if (skill.max_steps < 1 || skill.max_steps > 50) {
    errors.push('Max steps must be between 1 and 50');
  }
  
  return errors;
};

export const skillService = {
  validate: validateSkill,
};