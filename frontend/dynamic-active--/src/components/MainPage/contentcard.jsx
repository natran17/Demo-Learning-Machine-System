import React from 'react';
import { useNavigate } from 'react-router-dom';
import './contentcard.css';

const ContentCard = ({ content }) => {
  const navigate = useNavigate();
  
  const { 
    id,
    title, 
    description,
    createdAt 
  } = content;

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  ];

  const gradient = gradients[Math.floor(Math.random() * gradients.length)];

  const handleClick = () => {
    navigate(`/course/${id}`);
  };

  return (
    <div className="content-card" onClick={handleClick}>
      <div className="card-image" style={{ background: gradient }}>
        {/* <div className="card-badge">0 Assigned 👥</div> */}
        {/* <div className="card-illustration">
          <div className="illustration-elements">
            
          </div>
        </div> */}
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
          {description || 'No description'}
        </p>
        {/* <div className="card-tags">
          <span className="tag">Course</span>
          <span className="tag urgency">Active</span>
          <button className="assign-btn" onClick={(e) => e.stopPropagation()}>👤</button>
        </div> */}
        <div className="card-footer">
          <span className="edit-time">
            Created {createdAt ? new Date(createdAt).toLocaleDateString() : 'Recently'}
          </span>
          <button className="more-btn" onClick={(e) => e.stopPropagation()}>⋯</button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;