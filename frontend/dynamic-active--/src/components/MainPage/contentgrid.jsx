import React, { useState, useEffect } from 'react';
import ContentCard from './contentcard';
import './contentgrid.css';

const ContentGrid = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetch(`http://localhost:3000/api/courses/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        setContents(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, []);

  if (loading) {
    return <div className="content-grid-wrapper">Loading courses...</div>;
  }

  if (error) {
    return <div className="content-grid-wrapper">Error: {error}</div>;
  }

  return (
    <div className="content-grid-wrapper">
      <div className="content-count">
        <strong>{contents.length}</strong> courses
        {/* <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search..." />
        </div> */}
      </div>

      <div className="cards-grid">
        {contents.map((content) => (
          <ContentCard key={content.id} content={content} />
        ))}
      </div>
    </div>
  );
};

export default ContentGrid;