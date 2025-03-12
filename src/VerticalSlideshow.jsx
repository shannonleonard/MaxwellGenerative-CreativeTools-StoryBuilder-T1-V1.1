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
  const orbs = useSlideOrbs(slideIndex, 12, orbSpeed, themeOverride);
  // Always ensure a minimum blur for orbs
  const effectiveBlur = Math.max(20, blurAmount);
  
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 5 }}>
      {orbs.map((orb, index) => (
        <motion.div
          key={`orb-${index}`}
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
              `${(orb.x + 40) % 100}%`,
              `${orb.x}%`
            ],
            y: [
              `${orb.y}%`,
              `${(orb.y + 30) % 100}%`,
              `${(orb.y + 10) % 100}%`,
              `${orb.y}%`
            ],
            scale: [1, 1.05, 0.95, 1]
          }}
          transition={{
            duration: orb.duration,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      ))}
    </div>
  );
}

function ParticlesContainer({ slideIndex, orbSpeed, themeOverride = null, blurAmount = 0 }) {
  const [particles, setParticles] = useState([]);
  const theme = themeOverride || orbColorThemes[slideIndex % orbColorThemes.length];
  // Less aggressive blur for particles so they don't disappear completely
  const effectiveBlur = Math.max(5, Math.min(blurAmount / 3, 30));
  
  useEffect(() => {
    const newParticles = [];
    // Increase the number of particles for better visibility 
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 10 + Math.random() * 25,  // Much larger particles for better visibility
        // Make speed directly proportional to orbSpeed - more intuitive behavior
        duration: (5 + Math.random() * 5) / (Math.max(0.2, orbSpeed * 2)),
      });
    }
    setParticles(newParticles);
  }, [slideIndex, orbSpeed, themeOverride]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 5 }}>
      {particles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
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
            x: [0, Math.random() * 150 - 75, Math.random() * 150 - 75, 0],
            y: [0, Math.random() * 150 - 75, Math.random() * 150 - 75, 0],
            opacity: [0, 0.9, 0.9, 0],
            scale: [0, 1.5, 1.5, 0],
          }}
          transition={{
            duration: particle.duration,
            ease: "easeInOut",
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

function WavesContainer({ slideIndex, orbSpeed, themeOverride = null, blurAmount = 0 }) {
  const theme = themeOverride || orbColorThemes[slideIndex % orbColorThemes.length];
  // Make speed directly proportional to orbSpeed for more intuitive control
  const speed = Math.max(0.2, orbSpeed * 2); 
  // Always apply a strong blur to waves - minimum 30px
  const effectiveBlur = Math.max(30, blurAmount);
  
  const waveProps = useMemo(() => {
    return Array(4).fill().map((_, i) => ({
      amplitude: 20 + i * 10,
      frequency: 0.5 + i * 0.2,
      phase: i * Math.PI / 2,
      // Direct connection between speed slider and wave speed
      speed: (0.5 + i * 0.3) * speed,
      height: 15 + i * 10,
      opacity: 0.7 - i * 0.1,  // Increased opacity for better visibility
      blur: effectiveBlur
    }));
  }, [speed, effectiveBlur]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 5 }}>
      {waveProps.map((wave, i) => (
        <WaveComponent 
          key={i}
          theme={theme}
          blurAmount={wave.blur}
          {...wave}
        />
      ))}
    </div>
  );
}

function WaveComponent({ amplitude, frequency, phase, speed, height, opacity, theme, blurAmount }) {
  const animationControls = useAnimation();
  
  useEffect(() => {
    const animate = async () => {
      await animationControls.start({
        x: [0, -100],
        transition: { 
          duration: 10 / speed,
          ease: "easeInOut",
          repeat: Infinity
        }
      });
    };
    animate();
  }, [animationControls, speed]);

  const wavePoints = useMemo(() => {
    const points = [];
    for (let x = 0; x <= 100; x += 0.5) {
      const y = amplitude * Math.sin(frequency * x + phase);
      points.push(`${x}% ${50 + y}%`);
    }
    return points.join(', ');
  }, [amplitude, frequency, phase]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 5 }}>
      <motion.div
        className={`absolute w-[200%] h-full bg-gradient-to-r ${theme}`}
        style={{ 
          clipPath: `polygon(${wavePoints})`, 
          // Ensure blur is always applied and prominent
          filter: `blur(${blurAmount}px) hue-rotate(var(--hue-shift))`,
          zIndex: 5
        }}
        animate={animationControls}
      >
        <div 
          className="absolute bottom-0 w-full"
          style={{ height: `${height}%`, opacity }}
        />
      </motion.div>
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

const MemoizedWavesContainer = React.memo(WavesContainer, (prevProps, nextProps) => {
  return prevProps.slideIndex === nextProps.slideIndex && 
         prevProps.orbSpeed === nextProps.orbSpeed && 
         prevProps.themeOverride === nextProps.themeOverride && 
         prevProps.blurAmount === nextProps.blurAmount;
});

// Background animation styles
const backgroundAnimations = [
  { id: 'orbs', name: 'Floating Orbs', component: MemoizedOrbsContainer },
  { id: 'particles', name: 'Particles', component: MemoizedParticlesContainer },
  { id: 'waves', name: 'Wave Effect', component: MemoizedWavesContainer },
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
  const [editedSlides, setEditedSlides] = useState(slides.map(slide => slide.text || slide).join('\n'));
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [slideStyles, setSlideStyles] = useState(
    slides.map(slide => ({
      textColor: slide.textColor || '#FFFFFF',
      gradientStart: slide.gradientStart || '#FFFFFF',
      gradientEnd: slide.gradientEnd || '#FFFFFF',
      useGradient: slide.useGradient || false,
      fontWeight: slide.fontWeight || 'bold',
      backgroundColor: slide.backgroundColor || 'transparent',
      useCustomBackground: slide.useCustomBackground || false,
      transparentBackground: slide.transparentBackground !== undefined ? slide.transparentBackground : true
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
          backgroundColor: 'transparent',
          useCustomBackground: false,
          transparentBackground: true
        });
      }
      setSlideStyles(newStyles);
    }
    
    // Update selected slide index if it's out of bounds
    if (selectedSlideIndex >= slideLines.length && slideLines.length > 0) {
      setSelectedSlideIndex(slideLines.length - 1);
    }
  }, [editedSlides, slideStyles.length, selectedSlideIndex, slideStyles]);

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

  const handleToggleCustomBackground = () => {
    const newStyles = [...slideStyles];
    if (newStyles[selectedSlideIndex]) {
      newStyles[selectedSlideIndex] = {
        ...newStyles[selectedSlideIndex],
        useCustomBackground: !newStyles[selectedSlideIndex].useCustomBackground
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
    backgroundColor: 'transparent',
    useCustomBackground: false,
    transparentBackground: true
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
                    className={`p-4 rounded min-h-[80px] flex items-center justify-center ${currentStyle.transparentBackground ? 'bg-gray-600 bg-opacity-50' : ''}`}
                    style={{ 
                      backgroundColor: currentStyle.transparentBackground 
                        ? 'transparent' 
                        : currentStyle.useCustomBackground 
                          ? currentStyle.backgroundColor 
                          : 'rgba(17, 24, 39, 1)',
                      backgroundImage: currentStyle.transparentBackground 
                        ? 'linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444), linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444 75%, #444)'
                        : 'none',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 10px 10px',
                    }}
                  >
                    <div 
                      className={`text-xl font-${currentStyle.fontWeight} ${currentStyle.transparentBackground ? 'p-2' : ''}`}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <input 
                        type="checkbox" 
                        id="useGradient"
                        checked={currentStyle.useGradient}
                        onChange={handleToggleGradient}
                        className="mr-2"
                      />
                      <label htmlFor="useGradient" className="text-white">Use Gradient Text</label>
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
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <input 
                        type="checkbox" 
                        id="transparentBackground"
                        checked={currentStyle.transparentBackground}
                        onChange={(e) => handleStyleChange('transparentBackground', !currentStyle.transparentBackground)}
                        className="mr-2"
                        disabled={true}
                      />
                      <label htmlFor="transparentBackground" className="text-white opacity-50">Transparent Background (Disabled - Using Theme Colors)</label>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <input 
                        type="checkbox" 
                        id="useCustomBackground"
                        checked={currentStyle.useCustomBackground}
                        onChange={handleToggleCustomBackground}
                        className="mr-2"
                        disabled={true}
                      />
                      <label htmlFor="useCustomBackground" className="text-white opacity-50">Custom Background Color (Disabled - Using Theme Colors)</label>
                    </div>
                    
                    <div>
                      <label className="text-white block mb-1">Slide Background (Based on Theme):</label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded cursor-pointer border border-white"
                          style={{ backgroundColor: currentStyle.backgroundColor || '#000000' }}
                        ></div>
                        <span className="text-white">{currentStyle.backgroundColor || 'Theme Color'}</span>
                      </div>
                      <p className="text-white text-xs mt-1 opacity-70">
                        Each slide has a unique theme color from the selected theme palette.
                      </p>
                    </div>
                  </div>
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
  // Slide text data.
  const [slidesData, setSlidesData] = useState([
    { 
      text: "This just made high-end AI way more affordable for everyday users.",
      textColor: "#FFFFFF",
      useGradient: false,
      transparentBackground: true
    },
    { 
      text: "Turns out, even AI fans won't pay *any* price.",
      textColor: "#FFFFFF",
      useGradient: false,
      transparentBackground: true
    },
    { 
      text: "For a few bucks, you can test if this AI actually *feels* smarter.",
      textColor: "#FFFFFF",
      useGradient: false,
      transparentBackground: true
    },
    { 
      text: "Like it or not, AI is already part of daily life for millions.",
      textColor: "#FFFFFF",
      useGradient: false,
      transparentBackground: true
    },
    { 
      text: "Is this really an upgrade, or does Claude 3.7 win?",
      textColor: "#FFFFFF",
      useGradient: false,
      transparentBackground: true
    },
    { 
      text: "Time to see what this means for real creative work.",
      textColor: "#FFFFFF",
      useGradient: false,
      transparentBackground: true
    }
  ]);
  
  // Global text color
  const [globalTextColor, setGlobalTextColor] = useState("#FFFFFF");
  
  // Global color theme control - hue shift value (0-360)
  const [globalHueShift, setGlobalHueShift] = useState(0);
  
  // Store randomly generated slide colors
  const [slideColorMap, setSlideColorMap] = useState({});

  // Additional customization: Background theme and orb speed.
  const backgroundThemes = useMemo(() => [
    { 
      name: "Chic Blue", 
      value: "#0A2472", // Darker blue for better contrast with white
      orbTheme: "from-blue-600 to-indigo-800",
      particleColor: "blue-700",
      waveColor: "blue-800",
      slideColors: ["#0A2472", "#123388", "#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6"]
    },
    { 
      name: "Royal Purple", 
      value: "#3C096C", // Deep purple for high contrast
      orbTheme: "from-purple-600 to-violet-900",
      particleColor: "purple-700",
      waveColor: "purple-800",
      slideColors: ["#3C096C", "#4C1D95", "#5B21B6", "#6D28D9", "#7E22CE", "#8B5CF6"]
    },
    { 
      name: "Forest Green", 
      value: "#184E1C", // Dark green for readability
      orbTheme: "from-green-700 to-teal-900",
      particleColor: "green-800",
      waveColor: "green-900",
      slideColors: ["#184E1C", "#166534", "#15803D", "#16A34A", "#22C55E", "#4ADE80"]
    },
    { 
      name: "Deep Crimson", 
      value: "#630A10", // Dark red for contrast
      orbTheme: "from-red-700 to-rose-900",
      particleColor: "red-800",
      waveColor: "red-900",
      slideColors: ["#630A10", "#7F1D1D", "#991B1B", "#B91C1C", "#DC2626", "#EF4444"]
    },
    { 
      name: "Amber Gold", 
      value: "#7A4100", // Dark amber/brown for contrast with white
      orbTheme: "from-yellow-600 to-amber-900",
      particleColor: "amber-700",
      waveColor: "amber-800",
      slideColors: ["#7A4100", "#92400E", "#A16207", "#B45309", "#D97706", "#F59E0B"]
    }
  ], []);

  // Enhanced function to generate more varied complementary colors for slides
  const generateRandomSlideColor = useCallback((themeIndex, slideIndex) => {
    const theme = backgroundThemes[themeIndex];
    const baseColors = theme.slideColors;
    
    // Generate a color that's more distinctly different but still complementary
    const baseColor = baseColors[slideIndex % baseColors.length];
    
    // Convert hex to RGB
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // Create more significant variation while maintaining darkness and theme relationship
    // Increase hue shift range for more distinctive colors
    const hueShift = Math.floor(Math.random() * (80) - 40); // -40 to +40 degrees
    const satShift = Math.random() * 0.3 - 0.15; // -15% to +15%
    
    // Convert to HSL to manipulate
    let [h, s, l] = rgbToHsl(r, g, b);
    
    // Apply larger hue shift for more variety
    h = (h + hueShift + 360) % 360;
    
    // More dramatic saturation adjustment for variety
    s = Math.max(0.3, Math.min(0.9, s + satShift));
    
    // Keep lightness low for good contrast with white text, but vary slightly
    l = Math.max(0.12, Math.min(0.38, l + (Math.random() * 0.16 - 0.08)));
    
    // Convert back to RGB then hex
    const newColor = hslToHex(h, s, l);
    return newColor;
  }, [backgroundThemes]);
  
  // Function to convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: break;
      }
      
      h /= 6;
    }
    
    return [h * 360, s, l];
  };
  
  // Function to convert HSL to Hex
  const hslToHex = (h, s, l) => {
    h /= 360;
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };
  
  // Function to apply global text color to all slides
  const applyGlobalTextColor = (color) => {
    setGlobalTextColor(color);
    setSlidesData(prevSlides => 
      prevSlides.map(slide => ({
        ...slide,
        textColor: color,
        useGradient: false // Disable gradient when applying global color
      }))
    );
  };
  
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

  // Get or generate a slide color based on index
  const getSlideColor = useCallback((index) => {
    const colorKey = `${selectedThemeIndex}-${index}`;
    
    // If we don't have a color for this combination yet, generate one
    if (!slideColorMap[colorKey]) {
      const newColor = generateRandomSlideColor(selectedThemeIndex, index);
      
      // Update the color map
      setSlideColorMap(prev => ({
        ...prev,
        [colorKey]: newColor
      }));
      
      return shiftHue(newColor, globalHueShift);
    }
    
    // Return the existing color with hue shift applied
    return shiftHue(slideColorMap[colorKey], globalHueShift);
  }, [selectedThemeIndex, globalHueShift, slideColorMap, generateRandomSlideColor]);

  // Generate a new random color for EACH slide when changing themes
  useEffect(() => {
    // Clear the color map to force new colors when theme changes
    setSlideColorMap({});
    
    // Generate new colors for ALL slides
    if (slidesData.length > 0) {
      const newColorMap = {};
      
      // Pre-generate all colors
      slidesData.forEach((_, index) => {
        const colorKey = `${selectedThemeIndex}-${index}`;
        newColorMap[colorKey] = generateRandomSlideColor(selectedThemeIndex, index);
      });
      
      // Set all colors at once
      setSlideColorMap(newColorMap);
      
      // Update all slides with their new colors
      setSlidesData(prevSlides => 
        prevSlides.map((slide, index) => ({
          ...slide,
          transparentBackground: true,
          useCustomBackground: false,
          backgroundColor: newColorMap[`${selectedThemeIndex}-${index}`]
        }))
      );
    }
  }, [selectedThemeIndex, generateRandomSlideColor, slidesData, slidesData.length]);

  // Generate a new random color when changing slides
  useEffect(() => {
    // Generate a new color for the current slide
    const newColor = generateRandomSlideColor(selectedThemeIndex, currentSlide);
    const colorKey = `${selectedThemeIndex}-${currentSlide}`;
    
    // Update the color map
    setSlideColorMap(prev => ({
      ...prev,
      [colorKey]: newColor
    }));
    
    // Update the slide's background color
    setSlidesData(prevSlides => 
      prevSlides.map((slide, index) => 
        index === currentSlide 
          ? {
              ...slide,
              backgroundColor: newColor
            }
          : slide
      )
    );
  }, [currentSlide, selectedThemeIndex, generateRandomSlideColor]);

  // CSS Variables for theme colors
  useEffect(() => {
    // Apply CSS variables for the theme colors - light to dark ranges
    document.documentElement.style.setProperty('--pink-500', '#ec4899');
    document.documentElement.style.setProperty('--purple-500', '#a855f7');
    document.documentElement.style.setProperty('--purple-600', '#9333ea');
    document.documentElement.style.setProperty('--purple-700', '#7e22ce');
    document.documentElement.style.setProperty('--purple-800', '#6b21a8');
    document.documentElement.style.setProperty('--purple-900', '#581c87');
    
    document.documentElement.style.setProperty('--blue-500', '#3b82f6');
    document.documentElement.style.setProperty('--blue-600', '#2563eb');
    document.documentElement.style.setProperty('--blue-700', '#1d4ed8');
    document.documentElement.style.setProperty('--blue-800', '#1e40af');
    document.documentElement.style.setProperty('--blue-900', '#1e3a8a');
    
    document.documentElement.style.setProperty('--cyan-500', '#06b6d4');
    
    document.documentElement.style.setProperty('--green-500', '#22c55e');
    document.documentElement.style.setProperty('--green-700', '#15803d');
    document.documentElement.style.setProperty('--green-800', '#166534');
    document.documentElement.style.setProperty('--green-900', '#14532d');
    
    document.documentElement.style.setProperty('--teal-500', '#14b8a6');
    document.documentElement.style.setProperty('--teal-900', '#134e4a');
    
    document.documentElement.style.setProperty('--red-500', '#ef4444');
    document.documentElement.style.setProperty('--red-700', '#b91c1c');
    document.documentElement.style.setProperty('--red-800', '#991b1b');
    document.documentElement.style.setProperty('--red-900', '#7f1d1d');
    
    document.documentElement.style.setProperty('--rose-500', '#f43f5e');
    document.documentElement.style.setProperty('--rose-900', '#881337');
    
    document.documentElement.style.setProperty('--orange-500', '#f97316');
    
    document.documentElement.style.setProperty('--yellow-500', '#eab308');
    document.documentElement.style.setProperty('--yellow-600', '#ca8a04');
    
    document.documentElement.style.setProperty('--amber-500', '#f59e0b');
    document.documentElement.style.setProperty('--amber-700', '#b45309');
    document.documentElement.style.setProperty('--amber-800', '#92400e');
    document.documentElement.style.setProperty('--amber-900', '#78350f');
    
    document.documentElement.style.setProperty('--indigo-500', '#6366f1');
    document.documentElement.style.setProperty('--indigo-800', '#3730a3');
    
    document.documentElement.style.setProperty('--violet-500', '#8b5cf6');
    document.documentElement.style.setProperty('--violet-900', '#4c1d95');
    
    document.documentElement.style.setProperty('--fuchsia-500', '#d946ef');
    
    document.documentElement.style.setProperty('--lime-500', '#84cc16');
    
    document.documentElement.style.setProperty('--emerald-500', '#10b981');
    
    // Set the initial hue-shift variable
    document.documentElement.style.setProperty('--hue-shift', `${globalHueShift}deg`);
  }, [globalHueShift]);

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

  // Update the text movement logic with better cleanup
  useEffect(() => {
    // Prevent multiple animation frames
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    
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
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      // Reset time reference to prevent delta time jumps between mounts
      lastTimeRef.current = null;
    };
  }, [baseX, baseY, movementSpeed]);

  // Fix the E key glow effect with proper cleanup
  useEffect(() => {
    let isActive = true; // Flag to prevent stale animations
    
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'e' && isActive) {
        // Cancel any previous animations to prevent queuing
        textControls.stop();
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
    
    return () => {
      isActive = false; // Prevent animations after unmount
      window.removeEventListener('keydown', handleKeyDown);
      // Clean up any hanging animations
      textControls.stop();
    };
  }, [textControls]);

  // Add back the backslash key reset effect
  useEffect(() => {
    const handleResetKey = (e) => {
      if (e.key === "\\") resetTextPosition();
    };
    window.addEventListener('keydown', handleResetKey);
    return () => window.removeEventListener('keydown', handleResetKey);
  }, [resetTextPosition]);

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

  // Handle saving edited slides - preserve slide index colors and transparency
  const handleSaveSlides = (newSlides) => {
    // Apply theme colors to slides based on their index
    const slidesWithColors = newSlides.map((slide, index) => ({
      ...slide,
      transparentBackground: true,
      backgroundColor: getSlideColor(index)
    }));
    
    setSlidesData(slidesWithColors);
    
    // If current slide is now out of bounds, reset to first slide
    if (currentSlide >= slidesWithColors.length) {
      setCurrentSlide(0);
    }
    
    // Create a named backup after editing
    createBackup(slidesWithColors, 'after-edit-' + new Date().toISOString().slice(0, 10));
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
            <label className="text-white font-bold mr-2">Global Text Color:</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={globalTextColor} 
                onChange={(e) => applyGlobalTextColor(e.target.value)} 
                className="w-8 h-8 rounded cursor-pointer"
              />
              <span className="text-white">{globalTextColor}</span>
            </div>
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
            {backgroundAnimationType === 'waves' && (
              <MemoizedWavesContainer 
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
                className={`text-left max-w-2xl p-8 text-4xl leading-relaxed rounded-lg font-${slidesData[currentSlide].fontWeight || 'bold'}`}
                style={{
                  ...(slidesData[currentSlide].useGradient 
                    ? { 
                        background: `linear-gradient(to right, ${slidesData[currentSlide].gradientStart || '#FFFFFF'}, ${slidesData[currentSlide].gradientEnd || '#FFFFFF'})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      } 
                    : { color: slidesData[currentSlide].textColor || '#FFFFFF' }),
                  ...(slidesData[currentSlide].transparentBackground 
                    ? {} 
                    : { 
                        backgroundColor: getSlideColor(currentSlide),
                        filter: `hue-rotate(var(--hue-shift))`
                      })
                }}
                whileHover={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.7))', scale: 1.03 }}
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


