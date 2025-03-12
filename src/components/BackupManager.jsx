import React, { useState, useEffect } from 'react';
import { 
  getBackups, 
  createBackup, 
  restoreBackup, 
  deleteBackup, 
  clearAllBackups,
  formatVersion 
} from '../utils/version';

const BackupManager = ({ slides, onRestore, onClose }) => {
  const [backups, setBackups] = useState({});
  const [backupName, setBackupName] = useState('');
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');

  // Load backups on mount
  useEffect(() => {
    loadBackups();
  }, []);

  // Load backups from localStorage
  const loadBackups = () => {
    const loadedBackups = getBackups();
    setBackups(loadedBackups);
  };

  // Create a new backup
  const handleCreateBackup = () => {
    if (isCreating) {
      if (!backupName.trim()) {
        setMessage('Please enter a backup name');
        return;
      }

      const result = createBackup(slides, backupName);
      if (result) {
        setMessage(`Backup "${backupName}" created successfully`);
        setBackupName('');
        setIsCreating(false);
        loadBackups();
      } else {
        setMessage('Failed to create backup');
      }
    } else {
      setIsCreating(true);
    }
  };

  // Restore a backup
  const handleRestoreBackup = () => {
    if (!selectedBackup) {
      setMessage('Please select a backup to restore');
      return;
    }

    const restoredSlides = restoreBackup(selectedBackup);
    if (restoredSlides) {
      onRestore(restoredSlides);
      setMessage(`Backup "${selectedBackup}" restored successfully`);
    } else {
      setMessage('Failed to restore backup');
    }
  };

  // Delete a backup
  const handleDeleteBackup = () => {
    if (!selectedBackup) {
      setMessage('Please select a backup to delete');
      return;
    }

    const result = deleteBackup(selectedBackup);
    if (result) {
      setMessage(`Backup "${selectedBackup}" deleted successfully`);
      setSelectedBackup(null);
      loadBackups();
    } else {
      setMessage('Failed to delete backup');
    }
  };

  // Clear all backups
  const handleClearAllBackups = () => {
    if (Object.keys(backups).length === 0) {
      setMessage('No backups to clear');
      return;
    }

    // Confirm before clearing all backups
    const confirmClear = window.confirm('Are you sure you want to delete ALL backups? This cannot be undone.');
    if (confirmClear) {
      const result = clearAllBackups();
      if (result) {
        setMessage('All backups cleared successfully');
        setSelectedBackup(null);
        loadBackups();
      } else {
        setMessage('Failed to clear backups');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <h2 className="text-white text-2xl font-bold mb-4">Manage Backups</h2>
        
        {/* Message display */}
        {message && (
          <div className="mb-4 p-2 bg-blue-500 text-white rounded">
            {message}
          </div>
        )}
        
        {/* Create backup form */}
        <div className="mb-4 flex items-center">
          {isCreating ? (
            <>
              <input
                type="text"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="Enter backup name"
                className="flex-grow p-2 rounded mr-2 bg-gray-700 text-white"
              />
              <button
                onClick={handleCreateBackup}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={handleCreateBackup}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
            >
              Create New Backup
            </button>
          )}
        </div>
        
        {/* Backup list */}
        <div className="flex-1 overflow-auto mb-4">
          {Object.keys(backups).length === 0 ? (
            <div className="text-gray-400 italic">No backups found</div>
          ) : (
            <ul className="bg-gray-700 rounded p-2 h-full overflow-auto">
              {Object.entries(backups).map(([name, backup]) => (
                <li
                  key={name}
                  className={`p-2 mb-1 cursor-pointer rounded hover:bg-gray-600 ${
                    selectedBackup === name ? 'bg-blue-900' : ''
                  }`}
                  onClick={() => setSelectedBackup(name)}
                >
                  <div className="flex justify-between">
                    <div className="font-bold text-white">{name}</div>
                    <div className="text-gray-400 text-sm">
                      {new Date(backup.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm">
                    Version: {formatVersion(backup.version)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between">
          <div>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 mr-2"
            >
              Close
            </button>
            <button
              onClick={handleClearAllBackups}
              className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600"
              disabled={Object.keys(backups).length === 0}
            >
              Clear All Backups
            </button>
          </div>
          <div>
            <button
              onClick={handleDeleteBackup}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 mr-2"
              disabled={!selectedBackup}
            >
              Delete
            </button>
            <button
              onClick={handleRestoreBackup}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
              disabled={!selectedBackup}
            >
              Restore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager; 