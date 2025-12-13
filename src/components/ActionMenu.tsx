import React from 'react';

type ActionMenuProps = {
  zenMode: boolean;
  toggleZenMode: () => void;
  isTauri: boolean;
  onSelectFile: () => void;
};

export function ActionMenu({ zenMode, toggleZenMode, isTauri, onSelectFile }: ActionMenuProps) {
  return (
    <div className="action-menu" role="group" aria-label="Quick Actions">
      {/* Main Trigger (Zen Mode) */}
      <button 
        className="action-button zen-button" 
        onClick={toggleZenMode}
        title={zenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
      >
        {zenMode ? '🌸' : '🧘‍♀️'}
      </button>

      {/* Secondary Action (File Select) - Only in Tauri */}
      {isTauri && (
        <button 
          className="action-button file-button" 
          onClick={onSelectFile}
          title="Switch Tracker File"
          tabIndex={-1} /* Focus managed via visibility usually, but simple hover for now */
        >
          📂
        </button>
      )}
    </div>
  );
}
