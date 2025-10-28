import React from 'react';

interface LeaveTableModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const LeaveTableModal: React.FC<LeaveTableModalProps> = ({
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Leave Table?</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to leave the table? If you're in an active round, you will be folded automatically.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Leave Table
          </button>
        </div>
      </div>
    </div>
  );
};