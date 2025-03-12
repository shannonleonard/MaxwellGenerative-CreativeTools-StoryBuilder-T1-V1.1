import React, { useState, useEffect } from 'react';
import { getVersion, formatVersion, getVersionHistory, recordVersionUse } from '../utils/version';

const VersionInfo = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);
  const currentVersion = getVersion();

  useEffect(() => {
    // Record this version use
    recordVersionUse();
    
    // Load version history
    setVersionHistory(getVersionHistory());
  }, []);

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="relative">
      <div 
        className="text-white text-xs opacity-70 hover:opacity-100 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        {formatVersion(currentVersion)}
      </div>
      
      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-lg p-3 w-64 z-50">
          <h3 className="text-white font-bold mb-2">Version Information</h3>
          <p className="text-gray-300 text-sm mb-2">
            Current version: {formatVersion(currentVersion)}
          </p>
          
          {versionHistory.length > 0 && (
            <>
              <h4 className="text-white text-xs font-semibold mt-3 mb-1">Recent Usage</h4>
              <div className="max-h-32 overflow-y-auto">
                {versionHistory.map((item, index) => (
                  <div key={index} className="text-gray-400 text-xs mb-1">
                    {formatVersion(item.version)} • {formatDate(item.timestamp)}
                  </div>
                ))}
              </div>
            </>
          )}
          
          <div className="mt-3 text-center">
            <a 
              href="https://github.com/ShannonLeonard/MaxwellGenerative-CreativeTools-StoryBuilder-T1-V1.1/blob/main/CHANGELOG.md" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs"
            >
              View Changelog
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionInfo; 