import React, { useState } from 'react';
import './newassignment.css';

const NewAssignmentModal = ({ isOpen, onClose, courseId, onAssignmentCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    aiPrompt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/api/courses/${courseId}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          aiPrompt: formData.aiPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }

      const newAssignment = await response.json();

      // Reset form
      setFormData({ title: '', description: '', dueDate: '', aiPrompt: '' });
      
      // Notify parent
      onAssignmentCreated(newAssignment);
      
      // Close modal
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content assignment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Assignment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Assignment Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Write about your favorite day at school"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide clear instructions ..."
              rows="5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group ai-prompt-section">
            <label htmlFor="aiPrompt">
              <span className="ai-badge">✨ AI Assistant</span> 
                What should the AI focus on when helping students?
            </label>
            <textarea
              id="aiPrompt"
              name="aiPrompt"
              value={formData.aiPrompt}
              onChange={handleChange}
              placeholder="e.g. 'Focus on proper essay structure, thesis statements, and evidence-based arguments. Help students understand the process of photosynthesis and its importance to ecosystems.'"
              rows="4"
            />
            
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="create-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAssignmentModal;