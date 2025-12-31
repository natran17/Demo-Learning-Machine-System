import React, { useState } from 'react';
import NewCourseModal from './NewCourseModal';
import './header.css';

const Header = ({ user, onLogout, onCourseCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCourseCreated = (newCourse) => {
    console.log('New course created:', newCourse);
    if (onCourseCreated) {
      onCourseCreated(newCourse);
    }
  };

  return (
    <>
      <header className="content-header">
        <div className="studio-info">
          
          <h1>Hello, <span>{user.name}!</span></h1>
        </div>

        <div className="header-actions">
          <span className="role-badge">{user.role}</span>
          {user.role === 'teacher' && (
            <button 
              className="new-content-btn"
              onClick={() => setIsModalOpen(true)}
            >
              + New Content
            </button>
          )}
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <NewCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teacherId={user.id}
        onCourseCreated={handleCourseCreated}
      />
    </>
  );
};

export default Header;