"use client";

import React, { useState, useRef, useEffect } from "react";

interface EditMessageModalProps {
  messageId: string;
  currentText: string;
  onSave: (newText: string) => void;
  onCancel: () => void;
}

export default function EditMessageModal({
  messageId,
  currentText,
  onSave,
  onCancel,
}: EditMessageModalProps) {
  const [editText, setEditText] = useState(currentText);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== currentText) {
      onSave(trimmed);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-full max-w-md">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Edit Message</h3>
          
          <textarea
            ref={inputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-700/30 resize-none min-h-24"
            placeholder="Edit your message..."
          />
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!editText.trim() || editText.trim() === currentText}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
