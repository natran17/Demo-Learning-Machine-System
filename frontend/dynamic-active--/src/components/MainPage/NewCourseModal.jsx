import React, { useState } from 'react';
import './NewCourseModal.css';

const NewCourseModal = ({ isOpen, onClose, teacherId, onCourseCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    studentEmails: '',
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
      // Create the course
      const response = await fetch('http://localhost:3000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          teacherId: teacherId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      const newCourse = await response.json();

      // If student emails provided, enroll them
      if (formData.studentEmails.trim()) {
        const emails = formData.studentEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email);

        // TODO: You'll need to create an enrollment endpoint
        // For now, we'll just create the course
        console.log('Students to enroll:', emails);
      }

      // Reset form
      setFormData({ title: '', description: '', studentEmails: '' });
      
      // Notify parent component
      onCourseCreated(newCourse);
      
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Course</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Course Name *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Mathematics 101"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Course description..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="studentEmails">Student Emails (comma-separated)</label>
            <textarea
              id="studentEmails"
              name="studentEmails"
              value={formData.studentEmails}
              onChange={handleChange}
              placeholder="student1@email.com, student2@email.com"
              rows="3"
            />
            <small>Students will be enrolled in this course</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="create-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCourseModal;