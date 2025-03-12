/**
 * Version utility for StoryBuilder
 * Provides version information and backup functionality
 */

import packageJson from '../../package.json';

// Get the current version from package.json
export const getVersion = () => {
  return packageJson.version;
};

// Parse version components
export const parseVersion = (version = packageJson.version) => {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major, minor, patch };
};

// Format version with optional prefix
export const formatVersion = (version = packageJson.version, prefix = 'v') => {
  return `${prefix}${version}`;
};

// Check if current version is newer than provided version
export const isNewerVersion = (oldVersion, currentVersion = packageJson.version) => {
  const old = parseVersion(oldVersion);
  const current = parseVersion(currentVersion);
  
  if (current.major > old.major) return true;
  if (current.major < old.major) return false;
  
  if (current.minor > old.minor) return true;
  if (current.minor < old.minor) return false;
  
  return current.patch > old.patch;
};

// Get version history from local storage
export const getVersionHistory = () => {
  try {
    const history = localStorage.getItem('versionHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error retrieving version history:', error);
    return [];
  }
};

// Add current version to history
export const recordVersionUse = () => {
  try {
    const history = getVersionHistory();
    const currentVersion = getVersion();
    const timestamp = new Date().toISOString();
    
    // Add to history if it's a new version or first use of the day
    const today = timestamp.split('T')[0];
    const alreadyRecordedToday = history.some(item => 
      item.version === currentVersion && item.timestamp.startsWith(today)
    );
    
    if (!alreadyRecordedToday) {
      history.push({ version: currentVersion, timestamp });
      localStorage.setItem('versionHistory', JSON.stringify(history.slice(-10))); // Keep last 10 entries
    }
  } catch (error) {
    console.error('Error recording version use:', error);
  }
};

// Create a manual backup of current slides
export const createBackup = (slides, name = 'manual') => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = name === 'manual' ? `backup-${timestamp}` : name;
    const backups = JSON.parse(localStorage.getItem('slideBackups') || '{}');
    
    // Add the new backup
    backups[backupName] = {
      slides: [...slides],
      timestamp: new Date().toISOString(),
      version: getVersion()
    };
    
    // Keep only the last 10 backups
    const backupEntries = Object.entries(backups);
    if (backupEntries.length > 10) {
      // Sort by timestamp (newest first)
      backupEntries.sort((a, b) => 
        new Date(b[1].timestamp) - new Date(a[1].timestamp)
      );
      
      // Create a new object with only the 10 most recent backups
      const recentBackups = {};
      backupEntries.slice(0, 10).forEach(([key, value]) => {
        recentBackups[key] = value;
      });
      
      // Save the limited backups
      localStorage.setItem('slideBackups', JSON.stringify(recentBackups));
      return backupName;
    }
    
    // Save all backups if we have 10 or fewer
    localStorage.setItem('slideBackups', JSON.stringify(backups));
    return backupName;
  } catch (error) {
    console.error('Error creating backup:', error);
    return null;
  }
};

// Get all backups
export const getBackups = () => {
  try {
    return JSON.parse(localStorage.getItem('slideBackups') || '{}');
  } catch (error) {
    console.error('Error retrieving backups:', error);
    return {};
  }
};

// Restore a backup
export const restoreBackup = (backupName) => {
  try {
    const backups = getBackups();
    return backups[backupName]?.slides || null;
  } catch (error) {
    console.error('Error restoring backup:', error);
    return null;
  }
};

// Delete a backup
export const deleteBackup = (backupName) => {
  try {
    const backups = getBackups();
    if (backups[backupName]) {
      delete backups[backupName];
      localStorage.setItem('slideBackups', JSON.stringify(backups));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting backup:', error);
    return false;
  }
}; 