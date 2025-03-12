import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useAnimation } from 'framer-motion';
import BackupManager from './components/BackupManager';
import { createBackup } from './utils/version';

// -----------------------------------------------------
// Orb and Background Helpers
// -----------------------------------------------------
const orbColorThemes = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-teal-500",
  "from-red-500 to-orange-500",
  "from-yellow-500 to-amber-500",
  "from-indigo-500 to-violet-500",
  "from-rose-500 to-fuchsia-500",
  "from-lime-500 to-emerald-500"
];

// useSlideOrbs now accepts an orbSpeed value that controls animation speed.
function useSlideOrbs(slideIndex, orbCount = 8, orbSpeed = 1) {
  return useMemo(() => {
    const newOrbs = [];
    for (let i = 0; i < orbCount; i++) {
      const baseDuration = 15 + i * 3;
      // A higher orbSpeed means faster movement (shorter animation duration).
      const duration = baseDuration / orbSpeed;
      newOrbs.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 400 - 200,
        theme: orbColorThemes[slideIndex % orbColorThemes.length],
        width: 300 + Math.random() * 200,
        height: 300 + Math.random() * 200,
        duration
      });
    }
    return newOrbs;
  }, [slideIndex, orbCount, orbSpeed]);
}

function OrbsContainer({ slideIndex, orbSpeed }) {
  const orbs = useSlideOrbs(slideIndex, 8, orbSpeed);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={slideIndex}
        className="absolute inset-0 pointer-events-none"
        style={{ perspective: '1200px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1, ease: 'easeInOut' }}
      >
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full bg-gradient-to-r ${orb.theme} opacity-40 blur-[120px]`}
            style={{
              transformStyle: 'preserve-3d',
              width: orb.width,
              height: orb.height,
            }}
            initial={{
              x: `${orb.x}%`,
              y: `${orb.y}%`,
              z: orb.z,
              rotateY: 0,
              rotateX: 0,
              scale: 2.8
            }}
            animate={{
              rotateY: [0, 360],
              rotateX: [0, 180, 360],
              scale: [0.8, 3.2, 0.8]
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// -----------------------------------------------------
// Static GIF Collection – 10 Unique Entries
// -----------------------------------------------------
const staticGifCollection = [
  { id: 1, previewUrl: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/200_s.gif", animatedUrl: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif", tags: ["innovation", "tech", "fun"] },
  { id: 2, previewUrl: "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/200_s.gif", animatedUrl: "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif", tags: ["breakthrough", "science", "excited"] },
  { id: 3, previewUrl: "https://media.giphy.com/media/l0Exk8EUzSLsrErEQ/200_s.gif", animatedUrl: "https://media.giphy.com/media/l0Exk8EUzSLsrErEQ/giphy.gif", tags: ["accessible", "creative", "happy"] },
  { id: 4, previewUrl: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/200_s.gif", animatedUrl: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif", tags: ["collaborative", "tech", "fun"] },
  { id: 5, previewUrl: "https://media.giphy.com/media/xUPGcjMBRovtz8D2U8/200_s.gif", animatedUrl: "https://media.giphy.com/media/xUPGcjMBRovtz8D2U8/giphy.gif", tags: ["party", "excited", "fun"] },
  { id: 6, previewUrl: "https://media.giphy.com/media/26tPplGWjN0xLybiU/200_s.gif", animatedUrl: "https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif", tags: ["celebration", "happy"] },
  { id: 7, previewUrl: "https://media.giphy.com/media/xT9DPpf0z8LfbMKlDG/200_s.gif", animatedUrl: "https://media.giphy.com/media/xT9DPpf0z8LfbMKlDG/giphy.gif", tags: ["funny", "meme"] },
  { id: 8, previewUrl: "https://media.giphy.com/media/3oEduIuNEVcS3UicOY/200_s.gif", animatedUrl: "https://media.giphy.com/media/3oEduIuNEVcS3UicOY/giphy.gif", tags: ["cute", "adorable"] },
  { id: 9, previewUrl: "https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/200_s.gif", animatedUrl: "https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/giphy.gif", tags: ["heartwarming", "sweet"] },
  { id: 10, previewUrl: "https://media.giphy.com/media/3oEjHV0z8d9dHkJ0tK/200_s.gif", animatedUrl: "https://media.giphy.com/media/3oEjHV0z8d9dHkJ0tK/giphy.gif", tags: ["energetic", "surprise"] }
];

// -----------------------------------------------------
// Fixed GIF Picker Panel (no search)
// -----------------------------------------------------
function GifPanelFixed({ pickerCollection, onSelectGif }) {
  return (
    <div className="gif-panel fixed right-4 top-1/2 transform -translate-y-1/2 w-48 bg-white p-2 rounded shadow-lg overflow-y-auto max-h-[80vh] z-50">
      <h4 className="font-bold text-gray-700 mb-2">GIF Picker</h4>
      <div className="flex flex-col gap-2">
        {pickerCollection.map(gif => (
          <img 
            key={gif.id}
            src={gif.previewUrl}
            alt="GIF Preview"
            className="w-full cursor-pointer"
            onClick={() => onSelectGif(gif.animatedUrl)}
          />
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------
// Edit Slides Modal Component
// -----------------------------------------------------
function EditSlidesModal({ isOpen, onClose, slides, onSave }) {
  const [editedSlides, setEditedSlides] = useState(slides.map(slide => slide.text || slide).join('\n'));
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [slideStyles, setSlideStyles] = useState(
    slides.map(slide => ({
      textColor: slide.textColor || '#FFFFFF',
      gradientStart: slide.gradientStart || '#FFFFFF',
      gradientEnd: slide.gradientEnd || '#FFFFFF',
      useGradient: slide.useGradient || false,
      fontWeight: slide.fontWeight || 'bold',
    }))
  );
  const textareaRef = useRef(null);

  // Focus the textarea when the modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Update slide styles when slides change
  useEffect(() => {
    const slideLines = editedSlides.split('\n').filter(line => line.trim().length > 0);
    
    // If we have more slides than styles, add default styles for new slides
    if (slideLines.length > slideStyles.length) {
      const newStyles = [...slideStyles];
      for (let i = slideStyles.length; i < slideLines.length; i++) {
        newStyles.push({
          textColor: '#FFFFFF',
          gradientStart: '#FFFFFF',
          gradientEnd: '#FFFFFF',
          useGradient: false,
          fontWeight: 'bold',
        });
      }
      setSlideStyles(newStyles);
    }
    
    // Update selected slide index if it's out of bounds
    if (selectedSlideIndex >= slideLines.length && slideLines.length > 0) {
      setSelectedSlideIndex(slideLines.length - 1);
    }
  }, [editedSlides, slideStyles.length, selectedSlideIndex]);

  const handleSave = () => {
    // Split the text by newlines and filter out empty lines
    const slideLines = editedSlides
      .split('\n')
      .map(slide => slide.trim())
      .filter(slide => slide.length > 0);
    
    // Create slide objects with text and style properties
    const newSlides = slideLines.map((text, index) => ({
      text,
      ...slideStyles[index < slideStyles.length ? index : slideStyles.length - 1]
    }));
    
    onSave(newSlides);
    onClose();
  };

  const handleSlideSelect = (index) => {
    setSelectedSlideIndex(index);
  };

  const handleStyleChange = (property, value) => {
    const newStyles = [...slideStyles];
    if (newStyles[selectedSlideIndex]) {
      newStyles[selectedSlideIndex] = {
        ...newStyles[selectedSlideIndex],
        [property]: value
      };
      setSlideStyles(newStyles);
    }
  };

  const handleToggleGradient = () => {
    const newStyles = [...slideStyles];
    if (newStyles[selectedSlideIndex]) {
      newStyles[selectedSlideIndex] = {
        ...newStyles[selectedSlideIndex],
        useGradient: !newStyles[selectedSlideIndex].useGradient
      };
      setSlideStyles(newStyles);
    }
  };

  const handleApplyToAll = () => {
    if (slideStyles[selectedSlideIndex]) {
      const currentStyle = slideStyles[selectedSlideIndex];
      const newStyles = slideStyles.map(() => ({ ...currentStyle }));
      setSlideStyles(newStyles);
    }
  };

  // Prevent keyboard shortcuts from triggering while modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      // Don't prevent default for copy/paste shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        return;
      }
      
      // Prevent Escape from bubbling (we handle it ourselves)
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      
      // Allow normal typing in the textarea
      if (e.target === textareaRef.current) {
        return;
      }
      
      // Prevent all other keyboard events from bubbling up
      e.stopPropagation();
    };
    
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const slideLines = editedSlides.split('\n').filter(line => line.trim().length > 0);
  const currentStyle = slideStyles[selectedSlideIndex] || {
    textColor: '#FFFFFF',
    gradientStart: '#FFFFFF',
    gradientEnd: '#FFFFFF',
    useGradient: false,
    fontWeight: 'bold',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <h2 className="text-white text-2xl font-bold mb-4">Edit Slides</h2>
        
        <div className="flex flex-col md:flex-row gap-6 mb-4 flex-1 overflow-hidden">
          {/* Left side: Text editor */}
          <div className="flex-1 overflow-hidden">
            <label className="text-white block mb-2">
              Enter each slide on a new line:
            </label>
            <textarea
              ref={textareaRef}
              value={editedSlides}
              onChange={(e) => setEditedSlides(e.target.value)}
              className="w-full h-[300px] p-3 bg-gray-700 text-white rounded resize-none"
              style={{ overflowY: 'auto' }}
            />
          </div>
          
          {/* Right side: Style editor */}
          <div className="flex-1 overflow-hidden">
            <div className="mb-4">
              <label className="text-white block mb-2">Select slide to style:</label>
              <div className="max-h-[100px] overflow-y-auto mb-4 bg-gray-700 rounded">
                {slideLines.map((line, index) => (
                  <div 
                    key={index}
                    className={`p-2 cursor-pointer hover:bg-gray-600 ${selectedSlideIndex === index ? 'bg-blue-900' : ''}`}
                    onClick={() => handleSlideSelect(index)}
                  >
                    <span className="text-white truncate block">{line.substring(0, 30)}{line.length > 30 ? '...' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {slideLines.length > 0 && (
              <>
                <div className="mb-4">
                  <label className="text-white block mb-2">Preview:</label>
                  <div 
                    className="p-4 rounded bg-gray-900 min-h-[80px] flex items-center justify-center"
                  >
                    <div 
                      className={`text-xl ${currentStyle.fontWeight}`}
                      style={
                        currentStyle.useGradient 
                          ? { 
                              background: `linear-gradient(to right, ${currentStyle.gradientStart}, ${currentStyle.gradientEnd})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            } 
                          : { color: currentStyle.textColor }
                      }
                    >
                      {slideLines[selectedSlideIndex]}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <input 
                      type="checkbox" 
                      id="useGradient"
                      checked={currentStyle.useGradient}
                      onChange={handleToggleGradient}
                      className="mr-2"
                    />
                    <label htmlFor="useGradient" className="text-white">Use Gradient</label>
                  </div>
                  
                  {currentStyle.useGradient ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-white block mb-1">Gradient Start:</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={currentStyle.gradientStart} 
                            onChange={(e) => handleStyleChange('gradientStart', e.target.value)} 
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <span className="text-white">{currentStyle.gradientStart}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-white block mb-1">Gradient End:</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={currentStyle.gradientEnd} 
                            onChange={(e) => handleStyleChange('gradientEnd', e.target.value)} 
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <span className="text-white">{currentStyle.gradientEnd}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-white block mb-1">Text Color:</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={currentStyle.textColor} 
                          onChange={(e) => handleStyleChange('textColor', e.target.value)} 
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <span className="text-white">{currentStyle.textColor}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="text-white block mb-1">Font Weight:</label>
                  <select
                    value={currentStyle.fontWeight}
                    onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="extrabold">Extra Bold</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                
                <button 
                  onClick={handleApplyToAll} 
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 mb-4"
                >
                  Apply Style to All Slides
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------
// Main VerticalSlideshow Component
// -----------------------------------------------------
const VerticalSlideshow = ({ currentSlide, setCurrentSlide }) => {
  // Slide text data.
  const [slidesData, setSlidesData] = useState([
    { 
      text: "This just made high-end AI way more affordable for everyday users.",
      textColor: "#FFFFFF",
      useGradient: false
    },
    { 
      text: "Turns out, even AI fans won't pay *any* price.",
      textColor: "#FFFFFF",
      useGradient: false
    },
    { 
      text: "For a few bucks, you can test if this AI actually *feels* smarter.",
      textColor: "#FFFFFF",
      useGradient: false
    },
    { 
      text: "Like it or not, AI is already part of daily life for millions.",
      textColor: "#FFFFFF",
      useGradient: false
    },
    { 
      text: "Is this really an upgrade, or does Claude 3.7 win?",
      textColor: "#FFFFFF",
      useGradient: false
    },
    { 
      text: "Time to see what this means for real creative work.",
      textColor: "#FFFFFF",
      useGradient: false
    }
  ]);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Backup manager state
  const [isBackupManagerOpen, setIsBackupManagerOpen] = useState(false);
  
  const totalSlides = slidesData.length;
  
  // Global size state: affects uploaded image and all dropped GIFs.
  const [imageSize, setImageSize] = useState(1);
  
  const [uploadedImage, setUploadedImage] = useState(null);
  const [removingImage, setRemovingImage] = useState(false);
  
  // Dropped GIFs in the main frame.
  const [droppedGifs, setDroppedGifs] = useState([]);
  
  // GIF Picker collection: starts with one GIF from our static collection.
  const [gifPickerCollection, setGifPickerCollection] = useState([ staticGifCollection[0] ]);
  
  const containerRef = useRef(null);
  const [newGifLink, setNewGifLink] = useState("");

  // Additional customization: Background theme and orb speed.
  const backgroundThemes = [
    { name: "Chic Blue", value: "#0D47A1" },
    { name: "Royal Blue", value: "#1565C0" },
    { name: "Midnight Blue", value: "#283593" },
    { name: "Deep Teal", value: "#00695C" },
    { name: "Classic Navy", value: "#1A237E" }
  ];
  const [selectedBackgroundTheme, setSelectedBackgroundTheme] = useState(backgroundThemes[0].value);
  const [orbSpeed, setOrbSpeed] = useState(1);

  // Animation controls for the slide text
  const textControls = useAnimation();
  
  // Animate to the base (default) state whenever the slide changes.
  useEffect(() => {
    textControls.start({
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "drop-shadow(0 0 25px rgba(255,255,255,0.5))",
      transition: {
        opacity: { duration: 0.6, ease: "easeInOut" },
        y: { duration: 0.6, ease: "easeInOut" },
        scale: { duration: 0.6, ease: "easeInOut" }
      }
    });
  }, [currentSlide, textControls]);
  
  // Draggable slide text.
  const baseX = useMotionValue(0);
  const baseY = useMotionValue(0);
  const springX = useSpring(baseX, { stiffness: 300, damping: 20 });
  const springY = useSpring(baseY, { stiffness: 300, damping: 20 });

  // Reset functionality
  const resetTextPosition = useCallback(() => {
    baseX.set(0);
    baseY.set(0);
  }, [baseX, baseY]);

  // WASD movement with RAF
  const keysPressed = useRef({ w: false, a: false, s: false, d: false });
  const lastTimeRef = useRef(null);
  const rafId = useRef(null);
  const movementSpeed = 0.5;

  // Update the text movement logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) keysPressed.current[key] = true;
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) keysPressed.current[key] = false;
    };

    function animate(time) {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      const movement = movementSpeed * delta;

      if (keysPressed.current.w) baseY.set(baseY.get() - movement);
      if (keysPressed.current.s) baseY.set(baseY.get() + movement);
      if (keysPressed.current.a) baseX.set(baseX.get() - movement);
      if (keysPressed.current.d) baseX.set(baseX.get() + movement);

      rafId.current = requestAnimationFrame(animate);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [baseX, baseY, movementSpeed]);

  // Add this effect for the backslash key reset
  useEffect(() => {
    const handleResetKey = (e) => {
      if (e.key === "\\") resetTextPosition();
    };
    window.addEventListener('keydown', handleResetKey);
    return () => window.removeEventListener('keydown', handleResetKey);
  }, [resetTextPosition]);

  // Update just the E key glow effect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'e') {
        textControls.start({
          filter: [
            "drop-shadow(0 0 0px rgba(255,255,255,0))",
            "drop-shadow(0 0 25px rgba(255,255,255,1))",
            "drop-shadow(0 0 0px rgba(255,255,255,0))"
          ],
          transition: {
            duration: 0.6,
            times: [0, 0.3, 1],
            ease: "easeInOut"
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [textControls]);

  // Slide navigation.
  const handleNext = () =>
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const handlePrevious = () =>
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  // Image upload handlers.
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = () => {
    setRemovingImage(true);
    setTimeout(() => {
      setUploadedImage(null);
      setRemovingImage(false);
    }, 600);
  };

  const progressWidth = `${((currentSlide + 1) / totalSlides) * 100}%`;

  // When a GIF is selected from the fixed picker, add it to the main frame.
  const handleGifSelect = (gifUrl) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = rect.width / 2 - 50;
      const y = rect.height / 2 - 50;
      setDroppedGifs(prev => [...prev, { id: Date.now(), url: gifUrl, x, y }]);
    }
  };

  // Add a new GIF by pasted link to the GIF picker.
  const handleAddNewGif = () => {
    if (newGifLink.trim() !== "") {
      const newGif = {
        id: Date.now(),
        previewUrl: newGifLink,
        animatedUrl: newGifLink,
        tags: ["custom"]
      };
      if (gifPickerCollection.length < 10) {
        setGifPickerCollection(prev => [...prev, newGif]);
      } else {
        alert("Maximum of 10 GIFs in the picker reached.");
      }
      setNewGifLink("");
    }
  };

  // Remove all dropped GIFs from the main frame.
  const handleRemoveAllGifs = () => {
    setDroppedGifs([]);
  };

  // Create automatic backup when slides change
  useEffect(() => {
    createBackup(slidesData);
  }, [slidesData]);

  // Handle saving edited slides
  const handleSaveSlides = (newSlides) => {
    setSlidesData(newSlides);
    
    // If current slide is now out of bounds, reset to first slide
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(0);
    }
    
    // Create a named backup after editing
    createBackup(newSlides, 'after-edit-' + new Date().toISOString().slice(0, 10));
  };
  
  // Handle restoring slides from backup
  const handleRestoreBackup = (restoredSlides) => {
    // Convert simple string slides to objects if needed
    const formattedSlides = restoredSlides.map(slide => 
      typeof slide === 'string' 
        ? { text: slide, textColor: "#FFFFFF", useGradient: false }
        : slide
    );
    
    setSlidesData(formattedSlides);
    
    // If current slide is now out of bounds, reset to first slide
    if (currentSlide >= formattedSlides.length) {
      setCurrentSlide(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Controls */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="p-2 border rounded" />
          {uploadedImage && (
            <button onClick={handleRemoveImage} className="p-2 bg-red-500 text-white rounded">
              Remove Image
            </button>
          )}
          <button onClick={() => setImageSize(imageSize + 0.1)} className="p-2 bg-green-500 text-white rounded">
            Increase Size
          </button>
          <button onClick={() => setImageSize(Math.max(0.1, imageSize - 0.1))} className="p-2 bg-yellow-500 text-black rounded">
            Decrease Size
          </button>
          <button onClick={handlePrevious} className="p-2 bg-gray-200 text-black rounded">
            Previous
          </button>
          <button onClick={handleNext} className="p-2 bg-gray-200 text-black rounded">
            Next
          </button>
          <button onClick={handleRemoveAllGifs} className="p-2 bg-red-600 text-white rounded">
            Remove All GIFs
          </button>
          <button onClick={resetTextPosition} className="p-2 bg-blue-500 text-white rounded">
            Reset Text Position ("\")
          </button>
          <button 
            onClick={() => setIsEditModalOpen(true)} 
            className="p-2 bg-purple-600 text-white rounded hover:bg-purple-500"
          >
            Edit Slides
          </button>
          <button 
            onClick={() => setIsBackupManagerOpen(true)} 
            className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            Manage Backups
          </button>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <div>
            <label className="text-white font-bold mr-2">Background Theme:</label>
            <select
              value={selectedBackgroundTheme}
              onChange={(e) => setSelectedBackgroundTheme(e.target.value)}
              className="p-1 border rounded"
            >
              {backgroundThemes.map(theme => (
                <option key={theme.value} value={theme.value}>{theme.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-white font-bold mr-2">Orb Speed:</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={orbSpeed}
              onChange={(e) => setOrbSpeed(Number(e.target.value))}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Slideshow Container */}
      <div
        ref={containerRef}
        className="relative aspect-[9/16] w-full max-w-xl overflow-hidden rounded-3xl shadow-xl flex flex-col p-4"
        style={{ backgroundColor: selectedBackgroundTheme }}
      >
        <OrbsContainer slideIndex={currentSlide} orbSpeed={orbSpeed} />
        
        <motion.div
          className="absolute z-20 text-white font-bold text-lg cursor-pointer"
          style={{ left: '31.8%', top: '5rem' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: [0.8, 1, 0.8], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
          whileHover={{ rotate: [0, -3, 3, 0], scale: 1.15, filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.9))' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          creativeworkflowlab.com
        </motion.div>

        <div className="flex-1 mt-24 mb-[100px] flex items-start justify-center px-8">
          <motion.div
            drag
            dragConstraints={containerRef}
            dragElastic={0.3}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            style={{ x: springX, y: springY }}
            whileTap={{ cursor: 'grabbing' }}
            className="cursor-grab"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 130, scale: 0.95, filter: "drop-shadow(0 0 0px rgba(255,255,255,0))" }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: [
                    "drop-shadow(0 0 0px rgba(255,255,255,0))",
                    "drop-shadow(0 0 25px rgba(255,255,255,1))",
                    "drop-shadow(0 0 0px rgba(255,255,255,0))"
                  ]
                }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{
                  opacity: { duration: 0.2, ease: "backInOut" },
                  y: { duration: 0.2, ease: "backInOut" },
                  scale: { duration: 0.2, ease: "backInOut" },
                  filter: { duration: 0.6, times: [0, 0.3, 1], ease: "easeInOut" }
                }}
                className={`text-left max-w-2xl p-8 ${slidesData[currentSlide].fontWeight || 'font-bold'} text-4xl leading-relaxed`}
                style={
                  slidesData[currentSlide].useGradient 
                    ? { 
                        background: `linear-gradient(to right, ${slidesData[currentSlide].gradientStart || '#FFFFFF'}, ${slidesData[currentSlide].gradientEnd || '#FFFFFF'})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      } 
                    : { color: slidesData[currentSlide].textColor || '#FFFFFF' }
                }
                whileHover={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.9))', scale: 1.05 }}
              >
                {slidesData[currentSlide].text || slidesData[currentSlide]}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {uploadedImage && (
            <motion.img
              src={uploadedImage}
              className="absolute cursor-grab z-30"
              drag
              dragConstraints={containerRef}
              dragElastic={0.3}
              animate={removingImage ? { x: '200%', opacity: 0 } : { scale: imageSize, filter: 'drop-shadow(0 0 25px rgba(255,255,255,1))' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          )}

          <AnimatePresence>
            {droppedGifs.map((gif) => (
              <motion.img
                key={gif.id}
                src={gif.url}
                alt="Dropped GIF"
                drag
                dragConstraints={containerRef}
                initial={{ x: gif.x, y: gif.y, opacity: 1, scale: imageSize }}
                animate={{ scale: imageSize }}
                whileHover={{ scale: imageSize * 1.1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                className="absolute cursor-pointer z-40"
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed GIF Picker Panel */}
      <GifPanelFixed onSelectGif={handleGifSelect} pickerCollection={gifPickerCollection} />

      {/* New GIF Link Input (fixed at bottom-right) */}
      <div className="fixed bottom-4 right-4 z-50 bg-white p-2 rounded shadow-lg flex items-center">
        <input 
          type="text"
          placeholder="Paste GIF link..."
          value={newGifLink}
          onChange={(e) => setNewGifLink(e.target.value)}
          className="p-1 border rounded mr-2"
        />
        <button onClick={handleAddNewGif} className="p-1 bg-blue-500 text-white rounded">
          Add GIF
        </button>
      </div>
      
      {/* Edit Slides Modal */}
      <EditSlidesModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        slides={slidesData}
        onSave={handleSaveSlides}
      />
      
      {/* Backup Manager */}
      {isBackupManagerOpen && (
        <BackupManager 
          slides={slidesData}
          onRestore={handleRestoreBackup}
          onClose={() => setIsBackupManagerOpen(false)}
        />
      )}
    </div>
  );
};

export default VerticalSlideshow;


