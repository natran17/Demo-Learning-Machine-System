import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NewAssignmentModal from './newassignment.jsx';
import SubmissionModal from './submissions.jsx';
import TeacherSubmissionsModal from './teachersubmissionsview.jsx';
import './CoursePage.css';

const CoursePage = ({ user, onLogout }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [studentGrades, setStudentGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAssignments = async () => {
    try {
      const assignmentsRes = await fetch(`http://localhost:3000/api/courses/${courseId}/assignments`);
      if (!assignmentsRes.ok) throw new Error('Failed to fetch assignments');
      const assignmentsData = await assignmentsRes.json();
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);

      if (user.role === 'student') {
        const gradesRes = await fetch(`http://localhost:3000/api/courses/${courseId}/student/${user.id}/grades`);
        if (gradesRes.ok) {
          const gradesData = await gradesRes.json();
          // Convert to map: assignmentId -> grade
          const gradesMap = {};
          gradesData.forEach(submission => {
            gradesMap[submission.assignment_id] = submission;
          });
          setStudentGrades(gradesMap);
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseRes = await fetch(`http://localhost:3000/api/courses/${courseId}/details`);
        if (!courseRes.ok) throw new Error('Failed to fetch course');
        const courseData = await courseRes.json();
        setCourse(courseData);

        await fetchAssignments();
      } catch (error) {
        console.error('Error fetching course data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);




  const handleAssignmentCreated = () => {
    fetchAssignments();
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    setDeletingId(assignmentId);
    
    try {
      const response = await fetch(`http://localhost:3000/api/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }

      await fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAssignmentClick = (assignment) => {
    if (user.role === 'student') {
      setSelectedAssignment(assignment);
      setIsSubmissionModalOpen(true);
    } else if (user.role === 'teacher') {
      setSelectedAssignment(assignment);
      setIsTeacherModalOpen(true);
    }
  };

  const handleSubmissionComplete = () => {
    // Optionally refresh assignments or show submission status
    fetchAssignments();
  };

  if (loading) {
    return <div className="course-page">Loading...</div>;
  }

  if (error) {
    return <div className="course-page">Error: {error}</div>;
  }

  if (!course) {
    return <div className="course-page">Course not found</div>;
  }

  return (
    <div className="course-page">
      <header className="course-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
        <div className="header-right">
          <span className="user-name">{user.name}</span>
          <span className="role-badge">{user.role}</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="course-info">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
      </div>

      <div className="assignments-section">
        <div className="section-header">
          <h2>Assignments</h2>
          {user.role === 'teacher' && (
            <button 
              className="create-assignment-btn"
              onClick={() => setIsModalOpen(true)}
            >
              + New Assignment
            </button>
          )}
        </div>

        {assignments.length === 0 ? (
          <div className="empty-state">
            {user.role === 'teacher' 
              ? 'No assignments yet. Create your first assignment!' 
              : 'No assignments available.'}
          </div>
        ) : (
          <div className="assignments-list">
            {assignments.map(assignment => (
              <div 
                key={assignment.id} 
                className={`assignment-card ${user.role === 'student' ? 'clickable' : ''}`}
                onClick={() => handleAssignmentClick(assignment)}
              >
                <div className="assignment-content">
                  <h3>{assignment.title}</h3>
                  <p>{assignment.description}</p>
                  <div className="assignment-meta">
                    <span>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</span>
                    {assignment.ai_prompt && (
                      <span className="ai-indicator">✨ AI-Assisted</span>
                    )}
                  </div>
                </div>

                {user.role === 'student' && studentGrades[assignment.id] && (
                  <div className="student-grade-display">
                    {studentGrades[assignment.id].grade !== null ? (
                      <>
                        <div className="grade-score">{studentGrades[assignment.id].grade}%</div>
                        <div className="grade-label">Grade</div>
                      </>
                    ) : (
                      <>
                        <div className="submitted-icon">✓</div>
                        <div className="grade-label">Submitted</div>
                      </>
                    )}
                  </div>
                )}
                
                {user.role === 'teacher' && (
                  <button 
                    className="delete-assignment-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAssignment(assignment.id);
                    }}
                    disabled={deletingId === assignment.id}
                  >
                    {deletingId === assignment.id ? '...' : '🗑️'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {user.role === 'teacher' && (
        <>
          <NewAssignmentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            courseId={courseId}
            onAssignmentCreated={handleAssignmentCreated}
          />
          <TeacherSubmissionsModal
            isOpen={isTeacherModalOpen}
            onClose={() => setIsTeacherModalOpen(false)}
            assignment={selectedAssignment}
            course={course}
          />
        </>
      )}

      {user.role === 'student' && (
        <SubmissionModal
          isOpen={isSubmissionModalOpen}
          onClose={() => setIsSubmissionModalOpen(false)}
          assignment={selectedAssignment}
          course={course}
          onSubmitted={handleSubmissionComplete}
        />
      )}

      
    </div>
  );
};

export default CoursePage;