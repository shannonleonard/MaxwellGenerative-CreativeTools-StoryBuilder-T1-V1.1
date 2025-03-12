import React, { useState, useEffect } from 'react';
import { 
  getBackups, 
  createBackup, 
  restoreBackup, 
  deleteBackup, 
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

  // Format date for display
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-2xl font-bold">Backup Manager</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className="mb-4 p-2 bg-blue-900 text-white rounded">
            {message}
          </div>
        )}

        <div className="mb-4">
          {isCreating ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="Enter backup name"
                className="flex-1 p-2 bg-gray-700 text-white rounded"
              />
              <button
                onClick={handleCreateBackup}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
              >
                Save
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleCreateBackup}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Create New Backup
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto mb-4">
          <h3 className="text-white text-lg font-semibold mb-2">Available Backups</h3>
          {Object.keys(backups).length === 0 ? (
            <p className="text-gray-400">No backups available</p>
          ) : (
            <div className="bg-gray-700 rounded overflow-hidden">
              {Object.entries(backups).map(([name, data]) => (
                <div
                  key={name}
                  className={`p-3 border-b border-gray-600 cursor-pointer hover:bg-gray-600 ${
                    selectedBackup === name ? 'bg-blue-900' : ''
                  }`}
                  onClick={() => setSelectedBackup(name)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-white">{name}</span>
                    <span className="text-gray-300 text-sm">
                      {formatVersion(data.version)}
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {formatDate(data.timestamp)} • {data.slides.length} slides
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleDeleteBackup}
            disabled={!selectedBackup}
            className={`px-4 py-2 rounded ${
              selectedBackup
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Delete Selected
          </button>
          <button
            onClick={handleRestoreBackup}
            disabled={!selectedBackup}
            className={`px-4 py-2 rounded ${
              selectedBackup
                ? 'bg-green-600 text-white hover:bg-green-500'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Restore Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupManager; 