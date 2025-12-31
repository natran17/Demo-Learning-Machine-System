import React, { useState, useEffect } from 'react';
import './submissions.css';

const SubmissionModal = ({ isOpen, onClose, assignment, course, onSubmitted }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hasExistingSubmission, setHasExistingSubmission] = useState(false);
  const [teacherFeedback, setTeacherFeedback] = useState(null); 
  const [grade, setGrade] = useState(null);

  useEffect(() => {
    if (isOpen && assignment) {
      fetchExistingSubmission();
    }
  }, [isOpen, assignment]);

  const fetchExistingSubmission = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(
        `http://localhost:3000/api/assignments/${assignment.id}/submission/${user.id}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        setHasExistingSubmission(true);
        setTeacherFeedback(data.teacherFeedback);
        setGrade(data.grade);
      } else {
        setContent('');
        setHasExistingSubmission(false);
      }
    } catch (error) {
      // No existing submission
      setContent('');
      setHasExistingSubmission(false);
    }
  };

  if (!isOpen || !assignment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await fetch(`http://localhost:3000/api/assignments/${assignment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.id,
          content: content,
          courseTitle: course.title,
          courseDescription: course.description,
          aiPrompt: assignment.ai_prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit assignment');
      }

      const result = await response.json();
      
      setAiFeedback(result.aiFeedback);
      setSubmitted(true);
      setHasExistingSubmission(true);
      
      if (onSubmitted) {
        onSubmitted(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevise = () => {
    setSubmitted(false);
    setAiFeedback(null);
    // Keep the content so they can revise it
  };

  const handleClose = () => {
    setContent('');
    setAiFeedback(null);
    setSubmitted(false);
    setError('');
    setHasExistingSubmission(false);
    setTeacherFeedback(null);
    setGrade(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content submission-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{submitted ? 'Submission Updated!' : assignment.title}</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        {!submitted ? (
          <>
            <div className="assignment-details">
              <h3>Assignment Description</h3>
              <p>{assignment.description}</p>
              {assignment.due_date && (
                <div className="due-date">
                  Due: {new Date(assignment.due_date).toLocaleString()}
                </div>
              )}
              {hasExistingSubmission && (
                <div className="existing-notice">
                  You have an existing submission. You can revise and resubmit to get new AI feedback.
                </div>
              )}
            </div>

            {(grade !== null || teacherFeedback) && (
              <div className="teacher-feedback-section">
                <h3>
                  <span className="teacher-badge">Teacher's Feedback</span>
                </h3>
                {grade !== null && (
                  <div className="teacher-grade">
                    <strong>Grade:</strong> {grade}%
                  </div>
                )}
                {teacherFeedback && (
                  <div className="teacher-comment">
                    <strong>Comments:</strong>
                    <p>{teacherFeedback}</p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="content">Your Submission *</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type or paste your work here..."
                  rows="15"
                  required
                  disabled={loading}
                />
                <small>
                  {hasExistingSubmission 
                    ? '💡 Your previous submission is loaded above. Make your revisions and resubmit to get fresh AI feedback.'
                    : 'Write your complete response to the assignment above.'}
                </small>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Getting AI Feedback...
                    </>
                  ) : (
                    <>{hasExistingSubmission ? 'Resubmit & Get New Feedback' : 'Submit & Get AI Feedback'}</>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="feedback-section">
            <div className="success-message">
              ✅ Your submission has been {hasExistingSubmission ? 'updated' : 'saved'}!
            </div>

            <div className="ai-feedback-box">
              <h3>
                <span className="ai-badge">✨ AI Feedback</span>
              </h3>
              <div className="feedback-content" dangerouslySetInnerHTML={{ __html: aiFeedback }} />
            </div>

            <div className="revision-options">
              <p><strong>What would you like to do next?</strong></p>
              <div className="option-buttons">
                <button className="revise-btn" onClick={handleRevise}>
                  Revise Based on Feedback
                </button>
                <button className="done-btn-secondary" onClick={handleClose}>
                  Done 
                </button>
              </div>
              <small className="revision-note">
                💡 You can revise and resubmit as many times as you want. Each time you'll get fresh AI feedback. Your teacher will only see your latest submission.
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionModal;