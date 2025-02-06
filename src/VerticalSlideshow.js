import React from 'react';
const slides = [
"Slide 1 content",
"Slide 2 content",
"Slide 3 content",
"Slide 4 content",
"Slide 5 content",
"Slide 6 content",
"Slide 7 content",
"Slide 8 content",
"Slide 9 content",
"Slide 10 content",
"Slide 11 content",
"Slide 12 content",
"Slide 13 content",
"Slide 14 content",
"Slide 15 content"
];
function VerticalSlideshow({ currentSlide, setCurrentSlide }) {
return (
<div className="vertical-slideshow flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
{/ Slide Content /}
<div className="slide-content p-4 mb-4 border border-gray-700 rounded">
<h2 className="text-xl font-bold">Slide {currentSlide + 1}</h2>
<p className="mt-2">{slides[currentSlide]}</p>
</div>
{/ Navigation Buttons /}
<div className="navigation flex space-x-4">
<button
onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
>
Previous
</button>
<button
onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
>
Next
</button>
</div>
{/ Creative Workflow Lab Link with 50px top margin /}
<div className="creative-workflow-lab-url mt-[50px]">
<a href="https://creativeworkflowlab.com" target="blank" rel="noreferrer" className="underline text-lg">
Creative Workflow Lab
</a>
</div>
</div>
);
}
export default VerticalSlideshow;