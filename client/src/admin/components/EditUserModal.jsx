import React, { useState, useEffect } from "react";

const roles = ["user", "admin"];

const EditUserModal = ({ open, user, onSave, onCancel }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && user) {
      setName(user.name || "");
      setRole(user.role || "user");
      setError("");
    }
  }, [open, user]);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) { setError("Name is required"); return; }
    if (!roles.includes(role)) { setError("Invalid role"); return; }
    onSave({ name: name.trim(), role });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="bg-white dark:bg-gray-800 rounded shadow-lg w-full max-w-md p-5" onClick={(e)=>e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Edit User</h3>
        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
        <div className="mb-3">
          <label className="block text-xs font-semibold mb-1">Name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border rounded px-2 py-1 dark:bg-gray-700 dark:text-white" />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1">Role</label>
          <select value={role} onChange={(e)=>setRole(e.target.value)} className="w-full border rounded px-2 py-1 dark:bg-gray-700 dark:text-white">
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Cancel</button>
          <button onClick={handleSave} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;


