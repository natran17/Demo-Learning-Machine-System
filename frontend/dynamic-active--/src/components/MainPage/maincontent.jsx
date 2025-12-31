import React, { useState } from 'react';
import Header from './header';
import ContentTabs from './contenttabs';
import FiltersBar from './filtersbar';
import ContentGrid from './contentgrid';
import './maincontent.css';

const MainContent = ({ user, onLogout }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCourseCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <main className="main-content">
      <Header user={user} onLogout={onLogout} onCourseCreated={handleCourseCreated} />
      {/* <ContentTabs /> */}
      {/* <FiltersBar /> */}
      <ContentGrid key={refreshTrigger} />
    </main>
  );
};

export default MainContent;