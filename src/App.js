import React, { useState, useEffect, useRef } from 'react';
import VerticalSlideshow from './VerticalSlideshow';

// Global error handler
if (typeof window !== 'undefined') {
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error caught:', { message, source, lineno, colno, error });
    // Attempt to show fallback UI if something goes wrong
    document.body.innerHTML = `
      <div style="position: fixed; inset: 0; background-color: #0A2472; color: white; 
                  display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2rem; text-align: center;">
        <h2>Something went wrong</h2>
        <p>The application encountered an error. Please reload the page.</p>
        <div style="margin-top: 2rem;">
          <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #3B82F6; color: white; 
                  border: none; border-radius: 0.25rem; cursor: pointer;">
            Reload Page
          </button>
        </div>
      </div>
    `;
    return true; // Prevents default error handling
  };
}

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlidesRef = useRef(0);
  
  // Try-catch to log any initialization errors
  try {
    // The totalSlides value is now handled inside the VerticalSlideshow component
    // based on the number of lines in the slide text

    // Modified handlers to enable looping behavior
    const handleNext = () => {
      setCurrentSlide((prev) => {
        // Loop back to the first slide when reaching the end
        if (prev + 1 >= totalSlidesRef.current) return 0;
        return prev + 1;
      });
    };
    
    const handlePrevious = () => {
      setCurrentSlide((prev) => {
        // Loop to the last slide when going backward from the first slide
        if (prev <= 0) return totalSlidesRef.current - 1;
        return prev - 1;
      });
    };

    // Function to update total slides value from the slideshow component
    const updateTotalSlides = (count) => {
      totalSlidesRef.current = count;
    };

    useEffect(() => {
      const handleKeyPress = (e) => {
        if (e.key === 'ArrowRight') handleNext();
        else if (e.key === 'ArrowLeft') handlePrevious();
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    return (
      <div className="App min-h-screen bg-gray-900">
        <VerticalSlideshow 
          currentSlide={currentSlide} 
          setCurrentSlide={setCurrentSlide}
          onSlidesCountChange={updateTotalSlides}
        />
      </div>
    );
  } catch (error) {
    console.error("Fatal error in App component:", error);
    return (
      <div className="min-h-screen bg-blue-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Application Error</h1>
        <p className="mb-4">Sorry, something went wrong while loading the application.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          Reload Application
        </button>
      </div>
    );
  }
}

export default App;
