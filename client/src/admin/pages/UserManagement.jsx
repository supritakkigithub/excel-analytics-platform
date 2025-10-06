import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import AdminTable from "../components/AdminTable";
import AdminActionsMenu from "../../components/AdminActionsMenu";
import ConfirmDialog from "../components/ConfirmDialog";
import EditUserModal from "../components/EditUserModal";
import axios from "axios";
import { getSocket } from "../../utils/socket";

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Signup Date" },
  { key: "updatedAt", label: "Last Login" },
  { key: "actions", label: "Actions" },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const [deletingUserId, setDeletingUserId] = useState(null);
  const [resettingUserId, setResettingUserId] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, type: null, user: null });

  const [toast, setToast] = useState({ open: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast({ open: false, message: "", type: "info" }), 2500);
  };

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const navigate = useNavigate();

  // Admin guard (client-side)
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Read initial state from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const p = parseInt(params.get('page') || '1', 10);
    const l = parseInt(params.get('limit') || '10', 10);
    const s = params.get('search') || '';
    const r = params.get('role') || 'All';
    const st = params.get('status') || 'All';
    const so = params.get('sort') || 'createdAt';
    const o = params.get('order') || 'desc';
    setPage(p); setLimit(l); setSearchInput(s); setSearch(s); setRole(r); setStatus(st); setSort(so); setOrder(o);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state to URL
  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), sort, order });
    if (search) params.set('search', search);
    if (role !== 'All') params.set('role', role); else params.delete('role');
    if (status !== 'All') params.set('status', status); else params.delete('status');
    navigate({ search: params.toString() }, { replace: true });
  }, [page, limit, sort, order, search, role, status, navigate]);

  // Debounce search input -> search param
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setSearch(searchInput); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit, sort, order, search: search || undefined, role: role === 'All' ? undefined : role, status: status === 'All' ? undefined : status };
      const res = await axios.get("/api/users/all", { headers: { Authorization: `Bearer ${token}` }, params });
      const data = res.data;
      const list = Array.isArray(data) ? data : data.users || [];
      setUsers(list);
      if (!Array.isArray(data)) { setTotal(data.total || 0); setTotalPages(data.totalPages || 1); } else { setTotal(list.length); setTotalPages(1); }
      setError("");
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, order, search, role, status, token]);

  useEffect(() => {
    fetchUsers();
    const socket = getSocket();
    socket.emit('join:admin');
    const refresh = () => fetchUsers();
    socket.on('users:updated', refresh);
    socket.on('users:status', refresh);
    socket.on('users:deleted', refresh);
    socket.on('users:reset-sent', refresh);
    return () => {
      socket.off('users:updated', refresh);
      socket.off('users:status', refresh);
      socket.off('users:deleted', refresh);
      socket.off('users:reset-sent', refresh);
    };
  }, [fetchUsers]);

  const saveEdit = async (payload) => {
    try {
      await axios.put(`/api/users/${editUser._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setEditUser(null);
      showToast('User updated', 'success');
      fetchUsers();
    } catch (err) {
      showToast('Failed to update user', 'error');
    }
  };

  const handleBlock = (u) => setConfirm({ open: true, type: 'status', user: u });
  const handleDelete = (uId) => setConfirm({ open: true, type: 'delete', user: { _id: uId } });
  const handleReset = (uId) => setConfirm({ open: true, type: 'reset', user: { _id: uId } });

  const doConfirm = async () => {
    const { type, user: u } = confirm;
    try {
      if (type === 'status') {
        await axios.patch(`/api/users/${u._id}/status`, {}, { headers: { Authorization: `Bearer ${token}` } });
        showToast('Status updated', 'success');
      } else if (type === 'delete') {
        await axios.delete(`/api/users/${u._id}`, { headers: { Authorization: `Bearer ${token}` } });
        showToast('User deleted', 'success');
      } else if (type === 'reset') {
        await axios.post(`/api/users/${u._id}/reset-password`, {}, { headers: { Authorization: `Bearer ${token}` } });
        showToast('Reset link sent', 'success');
      }
      setConfirm({ open: false, type: null, user: null });
      fetchUsers();
    } catch (err) {
      showToast('Action failed', 'error');
      setConfirm({ open: false, type: null, user: null });
    }
  };

  const toggleSort = (field) => {
    if (sort === field) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSort(field); setOrder('desc'); }
  };

  return (
    <AdminLayout title="User Management" breadcrumb="Admin / Users" user={user}>
      {/* Toast */}
      {toast.open && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow text-white ${toast.type==='success'?'bg-green-600':toast.type==='error'?'bg-red-600':'bg-blue-600'}`}>{toast.message}</div>
      )}

      <div className="flex flex-wrap gap-4 items-end mb-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Search</label>
          <input type="text" value={searchInput} onChange={(e)=>{ setPage(1); setSearchInput(e.target.value); }} placeholder="Name or email..." className="border rounded px-2 py-1 w-48 dark:bg-gray-700 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Role</label>
          <select value={role} onChange={(e)=>{ setPage(1); setRole(e.target.value); }} className="border rounded px-2 py-1 w-36 dark:bg-gray-700 dark:text-white">
            {['All','user','admin'].map(r=> <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Status</label>
          <select value={status} onChange={(e)=>{ setPage(1); setStatus(e.target.value); }} className="border rounded px-2 py-1 w-36 dark:bg-gray-700 dark:text-white">
            {['All','active','blocked'].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Page Size</label>
          <select value={limit} onChange={(e)=>{ setPage(1); setLimit(parseInt(e.target.value,10)); }} className="border rounded px-2 py-1 w-28 dark:bg-gray-700 dark:text-white">
            {[10,20,50].map(n=> <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading users...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <AdminTable
          columns={columns}
          data={users}
          renderRow={(u) => (
            <tr key={u._id}>
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
                  onView={()=>{}}
                  onEdit={()=>setEditUser(u)}
                  onBlock={()=>handleBlock(u)}
                  onDelete={()=>handleDelete(u._id)}
                  onResetPassword={()=>handleReset(u._id)}
                  deletingUserId={deletingUserId}
                  resettingUserId={resettingUserId}
                />
              </td>
            </tr>
          )}
          renderHeaderExtras={() => (
            <tr className="bg-blue-100 dark:bg-blue-800">
              <th onClick={()=>toggleSort('name')} className="px-2 py-1 cursor-pointer">Sort Name {sort==='name' ? (order==='asc'?'▲':'▼'):''}</th>
              <th onClick={()=>toggleSort('email')} className="px-2 py-1 cursor-pointer">Sort Email {sort==='email' ? (order==='asc'?'▲':'▼'):''}</th>
              <th onClick={()=>toggleSort('createdAt')} className="px-2 py-1 cursor-pointer">Sort Date {sort==='createdAt' ? (order==='asc'?'▲':'▼'):''}</th>
            </tr>
          )}
        />
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Prev</button>
        {Array.from({length: totalPages}, (_,i)=>i+1).slice(Math.max(0,page-3), Math.min(totalPages, page+2)).map(p=> (
          <button key={p} onClick={()=>setPage(p)} className={`px-3 py-1 rounded ${p===page ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>{p}</button>
        ))}
        <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Next</button>
        <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">Total: {total}</span>
      </div>

      {/* Modals */}
      <EditUserModal open={!!editUser} user={editUser} onSave={saveEdit} onCancel={()=>setEditUser(null)} />
      <ConfirmDialog open={confirm.open} title="Please Confirm" message={confirm.type==='status' ? 'Toggle user status?' : confirm.type==='delete' ? 'Delete this user? This cannot be undone.' : 'Send reset password email to this user?'} onConfirm={doConfirm} onCancel={()=>setConfirm({ open:false, type:null, user:null })} />
    </AdminLayout>
  );
};

export default UserManagement; 