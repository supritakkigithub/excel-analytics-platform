import React, { useEffect, useState } from "react";
import SidebarLayout from "../components/SidebarLayout";
import MotionWrapper from "../components/MotionWrapper";
import axios from "axios";
import Spinner from "../components/Spinner";
import AdminActionsMenu from "../components/AdminActionsMenu";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "user" });
  const [confirmBlock, setConfirmBlock] = useState(null);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockError, setBlockError] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [resettingUserId, setResettingUserId] = useState(null);
  const [profileTab, setProfileTab] = useState('info');
  const [userUploads, setUserUploads] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadsError, setUploadsError] = useState('');
  const [userHistory, setUserHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmReset, setConfirmReset] = useState(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/users/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = Array.isArray(res.data) ? res.data : res.data.users || [];
        console.log("Fetched users:", usersData); // Debug log
        setUsers(usersData);
      } catch (err) {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "admin") fetchUsers();
  }, [token, user && user.role]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });
  console.log("Filtered users:", filtered); // Debug log

  const handleView = (u) => {
    setSelectedUser(u);
    setShowModal(true);
    setProfileTab('info');
    // Fetch uploads
    setUploadsLoading(true);
    setUploadsError('');
    axios.get(`/api/uploads/user/${u._id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUserUploads(res.data))
      .catch(() => setUploadsError('Failed to load uploads.'))
      .finally(() => setUploadsLoading(false));
    // Fetch history
    setHistoryLoading(true);
    setHistoryError('');
    axios.get(`/api/users/${u._id}/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUserHistory(res.data))
      .catch(() => setHistoryError('Failed to load history.'))
      .finally(() => setHistoryLoading(false));
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleEdit = (u) => {
    setEditUser(u);
    setEditForm({ name: u.name, email: u.email, role: u.role });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditUser(null);
    setEditForm({ name: "", email: "", role: "user" });
    setEditError("");
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const res = await axios.put(`/api/users/${editUser._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update user in table
      setUsers((prev) => prev.map((u) => (u._id === editUser._id ? { ...u, ...editForm } : u)));
      closeEditModal();
    } catch (err) {
      setEditError("Failed to update user.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleBlock = (u) => {
    setConfirmBlock(u);
    setBlockError("");
  };

  const closeBlockDialog = () => {
    setConfirmBlock(null);
    setBlockError("");
  };

  const confirmBlockUser = async () => {
    setBlockLoading(true);
    setBlockError("");
    try {
      const res = await axios.patch(`/api/users/${confirmBlock._id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.map((u) => (u._id === confirmBlock._id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u)));
      closeBlockDialog();
    } catch (err) {
      setBlockError("Failed to update user status.");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setDeletingUserId(userId);
    try {
      await axios.delete(`/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      alert('User deleted successfully.');
    } catch (err) {
      alert('Failed to delete user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleResetPassword = async (userId) => {
    setResettingUserId(userId);
    try {
      await axios.post(`/api/users/${userId}/reset-password`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Password reset email sent.');
    } catch (err) {
      alert('Failed to send reset email.');
    } finally {
      setResettingUserId(null);
    }
  };

  if (user?.role !== "admin") {
    return (
      <SidebarLayout>
        <MotionWrapper>
          <div className="min-h-[85vh] bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto bg-white shadow p-6 rounded-md">
              <h2 className="text-2xl font-bold text-blue-700 mb-6">Access Denied</h2>
              <p className="text-gray-600">You do not have permission to view this page.</p>
            </div>
          </div>
        </MotionWrapper>
      </SidebarLayout>
    );
  }

  // Delete Confirmation Modal
  const renderDeleteModal = () => confirmDelete && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setConfirmDelete(null)}>&times;</button>
        <h3 className="text-xl font-bold mb-4 text-red-700">Delete User</h3>
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={() => setConfirmDelete(null)}>Cancel</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => { setConfirmDelete(null); handleDeleteUser(confirmDelete); }}
            disabled={deletingUserId === confirmDelete}
          >
            {deletingUserId === confirmDelete ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );

  // Reset Confirmation Modal
  const renderResetModal = () => confirmReset && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setConfirmReset(null)}>&times;</button>
        <h3 className="text-xl font-bold mb-4 text-gray-700">Reset Password</h3>
        <p>Send a password reset email to <strong>{confirmReset.name}</strong> ({confirmReset.email})?</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={() => setConfirmReset(null)}>Cancel</button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            onClick={() => { setConfirmReset(null); handleResetPassword(confirmReset._id); }}
            disabled={resettingUserId === confirmReset._id}
          >
            {resettingUserId === confirmReset._id ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <SidebarLayout>
      <MotionWrapper>
        <div className="min-h-[85vh] bg-gray-100 dark:bg-blue-950 p-6 transition-colors duration-300">
          <div className="max-w-7xl mx-auto bg-white dark:bg-[#10172a] shadow p-6 rounded-xl transition-colors duration-300">
            <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-200 mb-6">Admin Panel – User Management</h2>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-4 px-4 py-2 rounded border border-gray-300 dark:border-blue-800 dark:bg-blue-900 dark:text-gray-100"
            />
            {loading ? (
              <Spinner />
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : filtered.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-blue-900 text-sm border rounded-xl transition-colors duration-300">
                  <thead>
                    <tr className="bg-blue-600 text-white dark:bg-blue-800">
                      <th className="px-4 py-2 border">Name</th>
                      <th className="px-4 py-2 border">Email</th>
                      <th className="px-4 py-2 border">Role</th>
                      <th className="px-4 py-2 border">Status</th>
                      <th className="px-4 py-2 border">Signup Date</th>
                      <th className="px-4 py-2 border">Last Login</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u, idx) => {
                      console.log("[AdminPanel] u.name:", u.name, typeof u.name);
                      console.log("[AdminPanel] u.email:", u.email, typeof u.email);
                      console.log("[AdminPanel] u.role:", u.role, typeof u.role);
                      console.log("[AdminPanel] u.status:", u.status, typeof u.status);
                      console.log("[AdminPanel] u.createdAt:", u.createdAt, typeof u.createdAt);
                      console.log("[AdminPanel] u.updatedAt:", u.updatedAt, typeof u.updatedAt);
                      return (
                        <tr key={String(u._id)} className={`border-t transition-colors duration-200 ${idx % 2 === 0 ? 'bg-white dark:bg-blue-950' : 'bg-gray-50 dark:bg-blue-900'} hover:bg-blue-50 dark:hover:bg-blue-800`}>
                          <td className="px-4 py-2 border text-gray-900 dark:text-gray-100">{u.name}</td>
                          <td className="px-4 py-2 border text-gray-900 dark:text-gray-100">{u.email}</td>
                          <td className="px-4 py-2 border text-gray-900 dark:text-gray-100">{u.role}</td>
                          <td className="px-4 py-2 border">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${u.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'}`}>{u.status === 'active' ? 'Active' : 'Blocked'}</span>
                          </td>
                          <td className="px-4 py-2 border text-gray-900 dark:text-gray-100">{new Date(u.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-2 border text-gray-900 dark:text-gray-100">{u.updatedAt ? new Date(u.updatedAt).toLocaleString() : "-"}</td>
                          <td className="px-4 py-2 border">
                            <AdminActionsMenu
                              user={u}
                              onView={handleView}
                              onEdit={handleEdit}
                              onBlock={handleBlock}
                              onDelete={() => setConfirmDelete(u._id)}
                              onResetPassword={() => setConfirmReset(u)}
                              deletingUserId={deletingUserId}
                              resettingUserId={resettingUserId}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* View Profile Modal */}
          {showModal && selectedUser && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full relative">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={closeModal}>&times;</button>
                <h3 className="text-xl font-bold mb-4 text-blue-700">User Profile</h3>
                <div className="mb-4 flex gap-4 border-b pb-2">
                  <button className={`px-3 py-1 rounded ${profileTab === 'info' ? 'bg-blue-100 text-blue-700 font-semibold' : 'bg-gray-100 text-gray-700'}`} onClick={() => setProfileTab('info')}>Info</button>
                  <button className={`px-3 py-1 rounded ${profileTab === 'uploads' ? 'bg-blue-100 text-blue-700 font-semibold' : 'bg-gray-100 text-gray-700'}`} onClick={() => setProfileTab('uploads')}>Uploads</button>
                  <button className={`px-3 py-1 rounded ${profileTab === 'history' ? 'bg-blue-100 text-blue-700 font-semibold' : 'bg-gray-100 text-gray-700'}`} onClick={() => setProfileTab('history')}>History</button>
                </div>
                {profileTab === 'info' && (
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {selectedUser.name}</div>
                    <div><strong>Email:</strong> {selectedUser.email}</div>
                    <div><strong>Role:</strong> {selectedUser.role}</div>
                    <div><strong>Signup Date:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</div>
                    <div><strong>Last Login:</strong> {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : "-"}</div>
                  </div>
                )}
                {profileTab === 'uploads' && (
                  <div>
                    {uploadsLoading ? <Spinner /> : uploadsError ? <div className="text-red-500">{uploadsError}</div> : userUploads.length === 0 ? <div className="text-gray-600">No uploads found.</div> : (
                      <table className="min-w-full text-xs border mt-2">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-1 border">Name</th>
                            <th className="px-2 py-1 border">Size</th>
                            <th className="px-2 py-1 border">Uploaded At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userUploads.map(upload => (
                            <tr key={String(upload._id)} className="border-t">
                              <td className="px-2 py-1 border">{upload.name}</td>
                              <td className="px-2 py-1 border">{upload.size}</td>
                              <td className="px-2 py-1 border">{new Date(upload.uploadedAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
                {profileTab === 'history' && (
                  <div>
                    {historyLoading ? <Spinner /> : historyError ? <div className="text-red-500">{historyError}</div> : userHistory.length === 0 ? <div className="text-gray-600">No history found.</div> : (
                      <table className="min-w-full text-xs border mt-2">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-1 border">Action</th>
                            <th className="px-2 py-1 border">Details</th>
                            <th className="px-2 py-1 border">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userHistory.map(h => (
                            <tr key={String(h._id)} className="border-t">
                              <td className="px-2 py-1 border">{h.action}</td>
                              <td className="px-2 py-1 border">{h.details || '-'}</td>
                              <td className="px-2 py-1 border">{new Date(h.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
                <div className="mt-6 text-right">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          )}
          {/* Edit User Modal */}
          {showEditModal && editUser && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={closeEditModal}>&times;</button>
                <h3 className="text-xl font-bold mb-4 text-green-700">Edit User</h3>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className="w-full px-3 py-2 border rounded" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Role</label>
                    <select name="role" value={editForm.role} onChange={handleEditChange} className="w-full px-3 py-2 border rounded">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {editError && <div className="text-red-500">{editError}</div>}
                  <div className="flex justify-end gap-2">
                    <button type="button" className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={closeEditModal}>Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Block/Unblock Confirmation Dialog */}
          {confirmBlock && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={closeBlockDialog}>&times;</button>
                <h3 className="text-xl font-bold mb-4 text-yellow-700">{confirmBlock.status === 'active' ? 'Block User' : 'Unblock User'}</h3>
                <p>Are you sure you want to {confirmBlock.status === 'active' ? 'block' : 'unblock'} <strong>{confirmBlock.name}</strong>?</p>
                {blockError && <div className="text-red-500 mt-2">{blockError}</div>}
                <div className="mt-6 flex justify-end gap-2">
                  <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={closeBlockDialog}>Cancel</button>
                  <button className={`px-4 py-2 ${confirmBlock.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-700 hover:bg-gray-800'} text-white rounded`} onClick={confirmBlockUser} disabled={blockLoading}>{blockLoading ? 'Processing...' : confirmBlock.status === 'active' ? 'Block' : 'Unblock'}</button>
                </div>
              </div>
            </div>
          )}
          {renderDeleteModal()}
          {renderResetModal()}
        </div>
      </MotionWrapper>
    </SidebarLayout>
  );
};

export default AdminPanel;
