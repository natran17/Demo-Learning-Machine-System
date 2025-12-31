import React, { useState, useEffect } from 'react';
import './teachersubmissionview.css';

const TeacherSubmissionsModal = ({ isOpen, onClose, assignment, course }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grade, setGrade] = useState('');
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && assignment) {
      fetchSubmissions();
    }
  }, [isOpen, assignment]);

  useEffect(() => {
    if (selectedSubmission) {
      setGrade(selectedSubmission.grade || '');
      setTeacherFeedback(selectedSubmission.teacher_feedback || '');
    }
  }, [selectedSubmission]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:3000/api/assignments/${assignment.id}/all-submissions`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (submission) => {
    setSelectedSubmission(submission);
  };

  const handleBack = () => {
    setSelectedSubmission(null);
    setGrade('');
    setTeacherFeedback('');
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;

    setSaving(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/submissions/${selectedSubmission.id}/grade`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grade: grade ? parseInt(grade) : null,
            teacherFeedback: teacherFeedback,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save grade');
      }

      alert('Grade and feedback saved successfully!');
      
      await fetchSubmissions();
      handleBack();
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Failed to save grade. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedSubmission(null);
    setSubmissions([]);
    setGrade('');
    setTeacherFeedback('');
    onClose();
  };

  if (!isOpen || !assignment) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content teacher-submissions-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        {!selectedSubmission ? (
          <>
            <div className="modal-header">
              <h2>{assignment.title} - Submissions</h2>
              <button className="close-btn" onClick={handleClose}>×</button>
            </div>

            <div className="assignment-info">
              <p>{assignment.description}</p>
              {assignment.due_date && (
                <div className="due-date-info">
                  📅 Due: {new Date(assignment.due_date).toLocaleString()}
                </div>
              )}
            </div>

            {loading ? (
              <div className="loading-state">Loading submissions...</div>
            ) : error ? (
              <div className="error-state">Error: {error}</div>
            ) : submissions.length === 0 ? (
              <div className="empty-state">
                <p>No submissions yet</p>
                <small>Students haven't submitted their work for this assignment.</small>
              </div>
            ) : (
              <div className="submissions-list">
                <div className="list-header">
                  <strong>{submissions.length}</strong> submission{submissions.length !== 1 ? 's' : ''}
                </div>
                {submissions.map((submission) => (
                  <div 
                    key={submission.id} 
                    className="student-submission-item"
                    onClick={() => handleStudentClick(submission)}
                  >
                    <div className="student-info">
                      <div className="student-avatar">
                        {submission.student_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="student-details">
                        <strong>{submission.student_name || 'Unknown Student'}</strong>
                        <small>Submitted {new Date(submission.submitted_at).toLocaleString()}</small>
                        {submission.updated_at && submission.updated_at !== submission.submitted_at && (
                          <small className="revised-tag">✏️ Revised {new Date(submission.updated_at).toLocaleString()}</small>
                        )}
                      </div>
                    </div>
                    <div className="submission-status">
                      {submission.grade ? (
                        <span className="graded-badge">✓ Graded: {submission.grade}%</span>
                      ) : (
                        <span className="pending-badge">Pending Review</span>
                      )}
                      <span className="view-arrow">→</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="modal-header">
              <button className="back-btn" onClick={handleBack}>
                ← Back to Submissions
              </button>
              <button className="close-btn" onClick={handleClose}>×</button>
            </div>

            <div className="submission-view">
              <div className="submission-header">
                <div className="student-info-large">
                  <div className="student-avatar-large">
                    {selectedSubmission.student_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3>{selectedSubmission.student_name || 'Unknown Student'}</h3>
                    <small>Submitted {new Date(selectedSubmission.submitted_at).toLocaleString()}</small>
                  </div>
                </div>
              </div>

              <div className="submission-content-box">
                <h4>Student's Work</h4>
                <div className="submission-text">
                  {selectedSubmission.content}
                </div>
              </div>

              <div className="teacher-grading-section">
                <h4>Your Feedback & Grade</h4>
                <div className="grading-form">
                  <div className="form-group">
                    <label>Grade (%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      placeholder="Enter grade"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Teacher Feedback</label>
                    <textarea 
                      rows="4" 
                      placeholder="Provide your feedback to the student..."
                      value={teacherFeedback}
                      onChange={(e) => setTeacherFeedback(e.target.value)}
                    />
                  </div>
                  <button 
                    className="save-grade-btn"
                    onClick={handleSaveGrade}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Grade & Feedback'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherSubmissionsModal;