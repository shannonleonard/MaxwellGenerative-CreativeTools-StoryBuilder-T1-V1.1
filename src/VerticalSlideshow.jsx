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

// Define the components first before using them
function OrbsContainer({ slideIndex, orbSpeed, themeOverride = null, blurAmount = 90 }) {
  const orbs = useSlideOrbs(slideIndex, 6, orbSpeed, themeOverride); // Use 6 orbs instead of 12
  const effectiveBlur = Math.max(20, blurAmount);
  
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 5 }}>
      {orbs.map((orb, index) => (
        <motion.div
          key={`orb-${slideIndex}-${index}`}
          className={`absolute rounded-full bg-gradient-to-br ${orb.theme} opacity-80`}
          style={{
            width: orb.width,
            height: orb.height,
            x: `${orb.x}%`,
            y: `${orb.y}%`,
            filter: `blur(${effectiveBlur}px) hue-rotate(var(--hue-shift))`,
            zIndex: 5
          }}
          animate={{
            x: [
              `${orb.x}%`,
              `${(orb.x + 20) % 100}%`,
              `${orb.x}%`
            ],
            y: [
              `${orb.y}%`,
              `${(orb.y + 30) % 100}%`,
              `${orb.y}%`
            ],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: orb.duration,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      ))}
    </div>
  );
}

function ParticlesContainer({ slideIndex, orbSpeed, themeOverride = null, blurAmount = 0 }) {
  // Use fewer particles for better performance
  const particleCount = 50; // Reduced from 100
  const theme = themeOverride || orbColorThemes[slideIndex % orbColorThemes.length];
  const effectiveBlur = Math.max(5, Math.min(blurAmount / 3, 30));
  
  // Generate particles with memoization
  const particles = useMemo(() => {
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 10 + Math.random() * 25,
        duration: (5 + Math.random() * 5) / (Math.max(0.2, orbSpeed * 2)),
      });
    }
    return newParticles;
  }, [particleCount, orbSpeed]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 5 }}>
      {particles.map((particle) => (
        <motion.div
          key={`particle-${slideIndex}-${particle.id}`}
          className={`absolute rounded-full bg-gradient-to-br ${theme} opacity-90`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            filter: `blur(${effectiveBlur}px) hue-rotate(var(--hue-shift))`,
            zIndex: 5
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0, 0.9, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: particle.duration,
            ease: "easeInOut",
            repeat: Infinity,
            delay: Math.random()
          }}
        />
      ))}
    </div>
  );
}

const MemoizedOrbsContainer = React.memo(OrbsContainer, (prevProps, nextProps) => {
  return prevProps.slideIndex === nextProps.slideIndex && 
         prevProps.orbSpeed === nextProps.orbSpeed && 
         prevProps.themeOverride === nextProps.themeOverride && 
         prevProps.blurAmount === nextProps.blurAmount;
});

const MemoizedParticlesContainer = React.memo(ParticlesContainer, (prevProps, nextProps) => {
  return prevProps.slideIndex === nextProps.slideIndex && 
         prevProps.orbSpeed === nextProps.orbSpeed && 
         prevProps.themeOverride === nextProps.themeOverride && 
         prevProps.blurAmount === nextProps.blurAmount;
});

// Background animation styles - remove waves option
const backgroundAnimations = [
  { id: 'orbs', name: 'Floating Orbs', component: MemoizedOrbsContainer },
  { id: 'particles', name: 'Particles', component: MemoizedParticlesContainer },
  { id: 'none', name: 'None (Static)', component: null }
];

// useSlideOrbs now accepts an orbSpeed value that controls animation speed.
function useSlideOrbs(slideIndex, orbCount = 12, orbSpeed = 1, themeOverride = null) {
  return useMemo(() => {
    const newOrbs = [];
    // More direct relationship between speed slider and actual speed
    const effectiveSpeed = orbSpeed * 2; 
    
    for (let i = 0; i < orbCount; i++) {
      const baseDuration = 20 + i * 3;
      // Direct relationship between slider and duration
      const duration = baseDuration / effectiveSpeed;
      
      newOrbs.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 400 - 200,
        theme: themeOverride || orbColorThemes[slideIndex % orbColorThemes.length],
        width: 250 + Math.random() * 300,
        height: 250 + Math.random() * 300,
        duration
      });
    }
    return newOrbs;
  }, [slideIndex, orbCount, orbSpeed, themeOverride]);
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
  const [editedSlides, setEditedSlides] = useState(slides.join('\n'));
  const textareaRef = useRef(null);

  // Focus the textarea when the modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSave = () => {
    // Split the text by newlines and filter out empty lines
    const slideLines = editedSlides
      .split('\n')
      .map(slide => slide.trim())
      .filter(slide => slide.length > 0);
    
    onSave(slideLines);
    onClose();
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <h2 className="text-white text-2xl font-bold mb-4">Edit Slides</h2>
        
        <div className="flex-1 overflow-hidden mb-4">
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

// Create a proper error boundary as a class component
class AnimationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.error("Animation error:", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    // Reset error state when currentSlide changes
    if (prevProps.currentSlide !== this.props.currentSlide) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI if animation fails
      return (
        <div className="absolute inset-0 bg-opacity-50" style={{ 
          zIndex: 5, 
          backgroundColor: this.props.backgroundColor
        }}>
          {/* Simple background with no animations */}
        </div>
      );
    }

    return this.props.children;
  }
}

// -----------------------------------------------------
// Main VerticalSlideshow Component
// -----------------------------------------------------
const VerticalSlideshow = ({ currentSlide, setCurrentSlide }) => {
  // Slide text data - simplified to just text strings
  const [slidesData, setSlidesData] = useState([
    "This just made high-end AI way more affordable for everyday users.",
    "Turns out, even AI fans won't pay *any* price.",
    "For a few bucks, you can test if this AI actually *feels* smarter.",
    "Like it or not, AI is already part of daily life for millions.",
    "Is this really an upgrade, or does Claude 3.7 win?",
    "Time to see what this means for real creative work."
  ]);
  
  // Global text styling
  const [globalTextColor, setGlobalTextColor] = useState("#FFFFFF");
  const [globalFontWeight, setGlobalFontWeight] = useState("bold");
  
  // Global color theme control - hue shift value (0-360)
  const [globalHueShift, setGlobalHueShift] = useState(0);
  
  // Additional customization: Background theme and orb speed.
  const backgroundThemes = useMemo(() => [
    { 
      name: "Chic Blue", 
      value: "#0A2472", // Darker blue for better contrast with white
      orbTheme: "from-blue-600 to-indigo-800",
      particleColor: "blue-700",
      slideColors: ["#0A2472", "#123388", "#1E40AF", "#1D4ED8", "#2563EB"]
    },
    { 
      name: "Royal Purple", 
      value: "#3C096C", // Deep purple for high contrast
      orbTheme: "from-purple-600 to-violet-900",
      particleColor: "purple-700",
      slideColors: ["#3C096C", "#4C1D95", "#5B21B6", "#6D28D9", "#7E22CE"]
    },
    { 
      name: "Forest Green", 
      value: "#184E1C", // Dark green for readability
      orbTheme: "from-green-700 to-teal-900",
      particleColor: "green-800",
      slideColors: ["#184E1C", "#166534", "#15803D", "#16A34A", "#22C55E"]
    },
    { 
      name: "Deep Crimson", 
      value: "#630A10", // Dark red for contrast
      orbTheme: "from-red-700 to-rose-900",
      particleColor: "red-800",
      slideColors: ["#630A10", "#7F1D1D", "#991B1B", "#B91C1C", "#DC2626"]
    },
    { 
      name: "Amber Gold", 
      value: "#7A4100", // Dark amber/brown for contrast with white
      orbTheme: "from-yellow-600 to-amber-900",
      particleColor: "amber-700",
      slideColors: ["#7A4100", "#92400E", "#A16207", "#B45309", "#D97706"]
    }
  ], []);

  // Store slide colors in a simplified way
  const [slideBackgroundColor, setSlideBackgroundColor] = useState(null);
  
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

  // Animation controls and refs - defined early to fix ESLint warnings
  const textControls = useAnimation();
  const baseX = useMotionValue(0);
  const baseY = useMotionValue(0);
  const springX = useSpring(baseX, { stiffness: 300, damping: 20 });
  const springY = useSpring(baseY, { stiffness: 300, damping: 20 });
  const keysPressed = useRef({ w: false, a: false, s: false, d: false });
  const lastTimeRef = useRef(null);
  const rafId = useRef(null);
  
  // Function to generate a color with a shifted hue
  const shiftHue = (baseColor, shift) => {
    // Simple CSS variable to adjust on the fly
    document.documentElement.style.setProperty('--hue-shift', `${shift}deg`);
    return baseColor;
  };

  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  const [orbSpeed, setOrbSpeed] = useState(1);
  const [backgroundAnimationType, setBackgroundAnimationType] = useState('orbs');
  const [blurAmount, setBlurAmount] = useState(50); // Default blur amount in pixels

  // For performance and to avoid recreating these objects
  const selectedTheme = useMemo(() => 
    backgroundThemes[selectedThemeIndex], [backgroundThemes, selectedThemeIndex]);

  // Use a simpler color approach without the complex mapping and lookups
  // Set color directly when theme or slide changes
  useEffect(() => {
    if (backgroundThemes[selectedThemeIndex] && backgroundThemes[selectedThemeIndex].slideColors) {
      const colors = backgroundThemes[selectedThemeIndex].slideColors;
      const color = colors[currentSlide % colors.length];
      setSlideBackgroundColor(shiftHue(color, globalHueShift));
    }
  }, [currentSlide, selectedThemeIndex, globalHueShift, backgroundThemes]);

  // Cleanup animation resources on unmount and when changing slides
  // Single cleanupAnimations effect to prevent animation leaks
  useEffect(() => {
    // Reset all animations when slide changes
    if (textControls) {
      textControls.set({
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "drop-shadow(0 0 25px rgba(255,255,255,0.5))"
      });
    }
    
    // Return cleanup function
    return () => {
      // Cancel any outstanding animation frames
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      
      // Stop any active animations
      if (textControls) {
        textControls.stop();
      }
    };
  }, [currentSlide, textControls]);

  // Reset functionality
  const resetTextPosition = useCallback(() => {
    baseX.set(0);
    baseY.set(0);
  }, [baseX, baseY]);

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

  // Handle saving edited slides - much simpler now
  const handleSaveSlides = (newSlides) => {
    setSlidesData(newSlides);
    
    // If current slide is now out of bounds, reset to first slide
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(0);
    }
    
    // Create a named backup after editing
    createBackup(newSlides, 'after-edit-' + new Date().toISOString().slice(0, 10));
  };
  
  // Simplified backup restore
  const handleRestoreBackup = (restoredSlides) => {
    // Always ensure we have an array of strings
    const formattedSlides = Array.isArray(restoredSlides) ? 
      restoredSlides.map(slide => typeof slide === 'string' ? slide : 
        (slide && slide.text) ? slide.text : String(slide)
      ) : [];
    
    setSlidesData(formattedSlides);
    
    // If current slide is now out of bounds, reset to first slide
    if (currentSlide >= formattedSlides.length) {
      setCurrentSlide(0);
    }
  };

  // Define CSS variables for theme colors at the very beginning to avoid hoisting issues
  useEffect(() => {
    // Set the initial hue-shift variable
    document.documentElement.style.setProperty('--hue-shift', `${globalHueShift}deg`);
  }, [globalHueShift]);

  // Allow text movement with WASD keys
  useEffect(() => {
    // Increase movement speed for more noticeable movement
    const movementSpeed = 2.5; // Increased from 0.5
    
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        keysPressed.current[key] = true;
        // Prevent default behavior (like scrolling) for these keys
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        keysPressed.current[key] = false;
      }
    };

    function animate(time) {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = Math.min(time - lastTimeRef.current, 100); // Cap delta to prevent jumps
      lastTimeRef.current = time;
      const movement = movementSpeed * delta;

      if (keysPressed.current.w) baseY.set(baseY.get() - movement);
      if (keysPressed.current.s) baseY.set(baseY.get() + movement);
      if (keysPressed.current.a) baseX.set(baseX.get() - movement);
      if (keysPressed.current.d) baseX.set(baseX.get() + movement);

      rafId.current = requestAnimationFrame(animate);
    }

    // Add passive: false to ensure preventDefault works correctly
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      lastTimeRef.current = null;
      // Reset all keys when unmounting
      keysPressed.current = { w: false, a: false, s: false, d: false };
    };
  }, [baseX, baseY]);

  // Add back the backslash key reset effect
  useEffect(() => {
    const handleResetKey = (e) => {
      if (e.key === "\\") resetTextPosition();
    };
    window.addEventListener('keydown', handleResetKey);
    return () => window.removeEventListener('keydown', handleResetKey);
  }, [resetTextPosition]);

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
          <button 
            onClick={() => createBackup(slidesData, 'manual-' + new Date().toISOString().slice(0, 10))} 
            className="p-2 bg-green-600 text-white rounded hover:bg-green-500"
          >
            Create Backup
          </button>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <div>
            <label className="text-white font-bold mr-2">Background Theme:</label>
            <select
              value={selectedThemeIndex}
              onChange={(e) => setSelectedThemeIndex(Number(e.target.value))}
              className="p-1 border rounded"
            >
              {backgroundThemes.map((theme, index) => (
                <option key={index} value={index}>{theme.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-white font-bold mr-2">Color Shift:</label>
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={globalHueShift}
              onChange={(e) => setGlobalHueShift(Number(e.target.value))}
              className="cursor-pointer"
            />
            <span className="text-white ml-1">{globalHueShift}°</span>
          </div>
          <div>
            <label className="text-white font-bold mr-2">Background Animation:</label>
            <select
              value={backgroundAnimationType}
              onChange={(e) => setBackgroundAnimationType(e.target.value)}
              className="p-1 border rounded"
            >
              {backgroundAnimations.map(animation => (
                <option key={animation.id} value={animation.id}>{animation.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-white font-bold mr-2">Animation Speed:</label>
            <input
              type="range"
              min="0.2"
              max="4"
              step="0.2"
              value={orbSpeed}
              onChange={(e) => setOrbSpeed(Number(e.target.value))}
              className="cursor-pointer"
            />
            <span className="text-white ml-1">{orbSpeed.toFixed(1)}x</span>
          </div>
          <div>
            <label className="text-white font-bold mr-2">Animation Blur:</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={blurAmount}
              onChange={(e) => setBlurAmount(Number(e.target.value))}
              className="cursor-pointer"
            />
            <span className="text-white ml-1">{blurAmount}px</span>
          </div>
          {/* Global Text Color Control */}
          <div>
            <label className="text-white font-bold mr-2">Text Color:</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={globalTextColor} 
                onChange={(e) => setGlobalTextColor(e.target.value)} 
                className="w-8 h-8 rounded cursor-pointer"
              />
              <span className="text-white">{globalTextColor}</span>
            </div>
          </div>
          {/* Global Font Weight Control */}
          <div>
            <label className="text-white font-bold mr-2">Font Weight:</label>
            <select
              value={globalFontWeight}
              onChange={(e) => setGlobalFontWeight(e.target.value)}
              className="p-1 border rounded"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="extrabold">Extra Bold</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>
      </div>

      {/* Slideshow Container */}
      <div
        ref={containerRef}
        className="relative aspect-[9/16] w-full max-w-xl overflow-hidden rounded-3xl shadow-xl flex flex-col p-4"
        style={{ backgroundColor: selectedTheme.value, position: 'relative' }}
      >
        {/* Background layer - z-index: 1 */}
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundColor: selectedTheme.value,
            filter: `hue-rotate(var(--hue-shift))`,
            zIndex: 1
          }}
        ></div>
        
        {/* Animation layer - above background (z-index: 5), below content */}
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 5 }}>
          {/* Render the appropriate background animation with error boundary */}
          <AnimationErrorBoundary currentSlide={currentSlide} backgroundColor={selectedTheme.value}>
            {backgroundAnimationType === 'orbs' && (
              <MemoizedOrbsContainer 
                slideIndex={currentSlide} 
                orbSpeed={orbSpeed} 
                themeOverride={selectedTheme.orbTheme} 
                blurAmount={blurAmount}
              />
            )}
            {backgroundAnimationType === 'particles' && (
              <MemoizedParticlesContainer 
                slideIndex={currentSlide} 
                orbSpeed={orbSpeed} 
                themeOverride={selectedTheme.orbTheme} 
                blurAmount={blurAmount}
              />
            )}
          </AnimationErrorBoundary>
        </div>
        
        {/* Website title - z-index: 20 */}
        <motion.div
          className="absolute text-white font-bold text-lg cursor-pointer"
          style={{ left: '31.8%', top: '5rem', zIndex: 20 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: [0.8, 1, 0.8], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
          whileHover={{ rotate: [0, -3, 3, 0], scale: 1.15, filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.9))' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          creativeworkflowlab.com
        </motion.div>

        {/* Content layer - slide text on top (z-index: 30) */}
        <div className="flex-1 mt-24 mb-[100px] flex items-start justify-center px-8 relative" style={{ zIndex: 30 }}>
          <motion.div
            drag
            dragConstraints={containerRef}
            dragElastic={0.3}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            style={{ x: springX, y: springY }}
            whileTap={{ cursor: 'grabbing' }}
            className="cursor-grab"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))"
                }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{
                  opacity: { duration: 0.15, ease: "easeInOut" },
                  y: { duration: 0.15, ease: "easeInOut" },
                  scale: { duration: 0.15, ease: "easeInOut" }
                }}
                className={`text-left max-w-2xl p-8 text-4xl leading-relaxed rounded-lg font-${globalFontWeight}`}
                style={{
                  color: globalTextColor,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
                whileHover={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.7))', scale: 1.03 }}
              >
                {slidesData[currentSlide]}
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


