import React from 'react';

function VerticalSlideshow({ currentSlide, setCurrentSlide }) {
  return (
    <div className="vertical-slideshow">
      {/* Removed the loading bar that was here */}
      {/* Previous code might have been:
          <div className="loading-bar">Loading...</div>
      */}

      {/* Your existing slide content */}
      <div className="slide-content">
        {/* ... existing slide content ... */}
      </div>
      
      {/* Move the Creative Workflow Lab URL 50px down by adding margin-top */}
      <div className="creative-workflow-lab-url mt-[50px]">
        <a href="https://creativeworkflowlab.com" target="_blank" rel="noreferrer">
          Creative Workflow Lab
        </a>
      </div>

      {/* Other navigation or related controls */}
    </div>
  );
}

export default VerticalSlideshow; 