import React, { useState } from 'react';
import VerticalSlideshow from './VerticalSlideshow';

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="App min-h-screen bg-gray-900">
      <VerticalSlideshow currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} />
    </div>
  );
}

export default App;
