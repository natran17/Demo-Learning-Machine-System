import React from 'react';
import './contenttabs.css';

const ContentTabs = () => {
  const tabs = ['Folder', 'Page', 'Course', 'Quiz', 'Assignment', 'Learning Path', 'Wiki'];

  return (
    <nav className="content-tabs">
      {tabs.map((tab, index) => (
        <a 
          key={index}
          href="#" 
          className={`tab ${tab === 'Learning Path' ? 'active' : ''}`}
        >
          {tab}
        </a>
      ))}
    </nav>
  );
};

export default ContentTabs;