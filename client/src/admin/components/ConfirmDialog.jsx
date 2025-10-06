import React from "react";

const ConfirmDialog = ({ open, title = "Confirm", message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="bg-white dark:bg-gray-800 rounded shadow-lg w-full max-w-md p-5" onClick={(e)=>e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{cancelText}</button>
          <button onClick={onConfirm} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;


