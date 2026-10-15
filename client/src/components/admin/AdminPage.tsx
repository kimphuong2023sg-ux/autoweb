import React, { useState, useEffect } from 'react';
import { authFetch, clearAuth, AuthUser } from '../../utils/auth';
import {
  Users,
  ShieldCheck,
  ClipboardList,
  Plus,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Key,
  Trash2,
  Lock,
  Unlock,
  Power,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Search,
  Activity,
  Radio,
  Clock,
  Sparkles,
  Server
} from 'lucide-react';

interface AdminPageProps {
  currentUser: AuthUser | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ currentUser, onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'whitelist' | 'logs'>('users');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Users Tab State
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    displayName: '',
    role: 'member',
    status: 'active',
    allowedIpsText: '',
  });

  // Password Reset Modal State
  const [passwordModalUser, setPasswordModalUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Whitelist Tab State
  const [whitelistConfig, setWhitelistConfig] = useState<{
    enabled: boolean;
    list: any[];
    currentIp: string;
  }>({ enabled: false, list: [], currentIp: '' });
  const [newIpInput, setNewIpInput] = useState('');
  const [newIpDescInput, setNewIpDescInput] = useState('');

  // Logs Tab State
  const [logs, setLogs] = useState<any[]>([]);

  // Tự động tắt thông báo sau 4 giây
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Tải dữ liệu theo tab
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      if (activeTab === 'users') loadUsers();
      if (activeTab === 'whitelist') loadWhitelist();
      if (activeTab === 'logs') loadLogs();
    }
  }, [activeTab, currentUser]);

  // Realtime polling nhẹ nhàng mỗi 5 giây cho tab users
  useEffect(() => {
    if (currentUser?.role === 'admin' && activeTab === 'users') {
      const interval = setInterval(() => {
        loadUsers(true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser, activeTab]);

  const loadUsers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await authFetch('/api/admin/users', {}, 'admin');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else if (!silent) {
        setErrorMsg(data.error || data.message || 'Không thể tải danh sách tài khoản');
      }
    } catch (e) {
      if (!silent) setErrorMsg('Lỗi kết nối khi tải danh sách người dùng!');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadWhitelist = async () => {
    setLoading(true);
    try {
      const [resWl, resIp] = await Promise.all([
        authFetch('/api/admin/ip-whitelist', {}, 'admin'),
        authFetch('/api/auth/my-ip', {}, 'admin'),
      ]);
      const dataWl = await resWl.json();
      const dataIp = await resIp.json();

      setWhitelistConfig({
        enabled: dataWl.ipWhitelistEnabled || false,
        list: dataWl.ipWhitelist || [],
        currentIp: dataIp.ip || '127.0.0.1',
      });
    } catch (e) {
      setErrorMsg('Lỗi kết nối khi tải cấu hình Whitelist IP!');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/audit-logs?limit=150', {}, 'admin');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      setErrorMsg('Lỗi kết nối khi tải nhật ký hoạt động!');
    } finally {
      setLoading(false);
    }
  };

  // --- THAO TÁC USER ---

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.username.trim() || !newUserForm.password) {
      setErrorMsg('Vui lòng nhập Tên đăng nhập và Mật khẩu!');
      return;
    }

    try {
      const allowedIps = newUserForm.allowedIpsText
        ? newUserForm.allowedIpsText.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const res = await authFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          username: newUserForm.username.trim(),
          password: newUserForm.password,
          displayName: newUserForm.displayName.trim() || newUserForm.username.trim(),
          role: newUserForm.role,
          status: newUserForm.status,
          allowedIps,
        }),
      }, 'admin');

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Đã tạo tài khoản "${newUserForm.username}" thành công!`);
        setShowAddModal(false);
        setNewUserForm({
          username: '',
          password: '',
          displayName: '',
          role: 'member',
          status: 'active',
          allowedIpsText: '',
        });
        loadUsers();
      } else {
        setErrorMsg(data.error || data.message || 'Không thể tạo tài khoản!');
      }
    } catch (e) {
      setErrorMsg('Lỗi kết nối khi tạo tài khoản!');
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
    const actionText = newStatus === 'blocked' ? 'Khóa' : 'Kích hoạt lại';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${user.username}" không?`)) {
      return;
    }

    try {
      const res = await authFetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      }, 'admin');
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Đã ${actionText.toLowerCase()} tài khoản "${user.username}" thành công!`);
        loadUsers(true);
      } else {
        setErrorMsg(data.error || 'Thao tác không thành công!');
      }
    } catch (e) {
      setErrorMsg('Lỗi kết nối!');
    }
  };

  const handleKickUser = async (user: any) => {
    if (!window.confirm(`Đá phiên đăng nhập của "${user.username}"? Người dùng này sẽ bị đăng xuất ngay lập tức.`)) {
      return;
    }

    try {
      const res = await authFetch(`/api/admin/users/${user.id}/kick`, {
        method: 'POST',
      }, 'admin');
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Đã hủy phiên làm việc của "${user.username}"!`);
        loadUsers(true);
      }
    } catch (e) {
      setErrorMsg('Lỗi kết nối!');
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (user.username === 'admin') {
      alert('Không được phép xóa tài khoản Root Admin!');
      return;
    }

    if (!window.confirm(`XÁC NHẬN XÓA: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${user.username}"?`)) {
      return;
    }

    try {
      const res = await authFetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      }, 'admin');
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Đã xóa tài khoản "${user.username}"!`);
        loadUsers();
      } else {
        setErrorMsg(data.error || 'Không thể xóa tài khoản!');
      }
    } catch (e) {
      setErrorMsg('Lỗi kết nối!');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newPasswordInput || newPasswordInput.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      const res = await authFetch(`/api/admin/users/${passwordModalUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ newPassword: newPasswordInput.trim() }),
      }, 'admin');
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Đã cập nhật mật khẩu mới cho "${passwordModalUser.username}"!`);
        setPasswordModalUser(null);
        setNewPasswordInput('');
        loadUsers(true);
      } else {
        setErrorMsg(data.error || 'Không thể đổi mật khẩu!');
      }
    } catch (e) {
      setErrorMsg('Lỗi kết nối!');
    }
  };

  // --- THAO TÁC WHITELIST IP ---

  const handleToggleGlobalWhitelist = async () => {
    const nextState = !whitelistConfig.enabled;
    if (nextState) {
      const confirmOn = window.confirm(
        `BẬT BẢO VỆ WHITELIST IP:\nKhi tính năng này bật, chỉ những địa chỉ IP nằm trong danh sách Whitelist mới được phép truy cập hệ thống.\n\nIP hiện tại của bạn là: ${whitelistConfig.currentIp}\nHệ thống đã tự động đưa IP localhost và IP nội bộ vào danh sách an toàn. Bạn có muốn kích hoạt ngay không?`
      );
      if (!confirmOn) return;
    }

    try {
      const res = await authFetch('/api/admin/ip-whitelist/toggle', {
        method: 'PUT',
        body: JSON.stringify({ enabled: nextState }),
      }, 'admin');
      const data = await res.json();
      if (data.success) {
        setWhitelistConfig((prev) => ({ ...prev, enabled: nextState }));
        setSuccessMsg(`Đã ${nextState ? 'BẬT' : 'TẮT'} tính năng Whitelist IP toàn hệ thống!`);
      }
    } catch (e) {
      setErrorMsg('Lỗi kết nối khi cập nhật Whitelist IP!');
    }
  };

  const handleAddIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpInput.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ IP hoặc dải IP!');
      return;
    }

    try {
      const res = await authFetch('/api/admin/ip-whitelist', {
        method: 'POST',
        body: JSON.stringify({
          ip: newIpInput.trim(),
          description: newIpDescInput.trim(),
        }),
      }, 'admin');
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Đã thêm IP "${newIpInput.trim()}" vào Whitelist!`);
        setNewIpInput('');
        setNewIpDescInput('');
        loadWhitelist();
      } else {
        setErrorMsg(data.error || 'Không thể thêm IP!');
      }
    } catch (e) {
      setErrorMsg('Lỗi kết nối!');
    }
  };

  const handleToggleIpItem = async (ipItem: any) => {
    try {
      const res = await authFetch(`/api/admin/ip-whitelist/${ipItem.id}/toggle`, {
        method: 'PUT',
      }, 'admin');
      const data = await res.json();
      if (data.success) {
        loadWhitelist();
      }
    } catch (e) {
      setErrorMsg('Lỗi kết nối!');
    }
  };

  const handleDeleteIpItem = async (ipItem: any) => {
    if (!window.confirm(`Xóa địa chỉ IP "${ipItem.ip}" khỏi Whitelist?`)) return;

    try {
      const res = await authFetch(`/api/admin/ip-whitelist/${ipItem.id}`, {
        method: 'DELETE',
      }, 'admin');
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Đã xóa IP "${ipItem.ip}"!`);
        loadWhitelist();
      }
    } catch (e) {
      setErrorMsg('Lỗi kết nối!');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.displayName && u.displayName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar Sáng, Thanh Lịch */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                  AutoWeb Admin
                </h1>
                <span className="bg-indigo-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full tracking-wide">
                  PORTAL QUẢN TRỊ
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Phân quyền tài khoản, giám sát bảo mật & nhật ký hệ thống
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('/')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Vào Tool Làm Việc</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Thông báo Alert Toast */}
      {errorMsg && (
        <div className="max-w-7xl mx-auto w-full px-4 pt-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-700 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="max-w-7xl mx-auto w-full px-4 pt-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-700 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Tài Khoản & Nhân Viên</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('whitelist')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'whitelist'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Bảo Mật IP (Whitelist)</span>
              {whitelistConfig.enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Nhật Ký Hoạt Động</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeTab === 'users') loadUsers();
                if (activeTab === 'whitelist') loadWhitelist();
                if (activeTab === 'logs') loadLogs();
              }}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {activeTab === 'users' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cấp Tài Khoản Mới</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm theo username hoặc tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition"
                />
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online:{' '}
                  <strong>{users.filter((u) => u.isOnline).length}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300" /> Tổng:{' '}
                  <strong>{users.length}</strong>
                </span>
              </div>
            </div>

            {/* Bảng danh sách người dùng */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Tài Khoản</th>
                      <th className="py-3 px-4">Vai Trò</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4">Trực Tuyến</th>
                      <th className="py-3 px-4">IP Đăng Nhập Cuối</th>
                      <th className="py-3 px-4">Ngày Tạo</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Không tìm thấy tài khoản nào phù hợp
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>@{u.username}</span>
                              {u.username === 'admin' && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 rounded font-extrabold">
                                  ROOT
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{u.displayName}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                u.role === 'admin'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {u.role === 'admin' ? 'Quản Trị Viên' : 'Nhân Viên'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                                u.status === 'blocked'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {u.status === 'blocked' ? 'Bị Khóa' : 'Hoạt Động'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  u.presence === 'online'
                                    ? 'bg-emerald-500 animate-pulse'
                                    : u.presence === 'idle'
                                    ? 'bg-amber-400'
                                    : 'bg-slate-300'
                                }`}
                              />
                              <span className="capitalize text-[11px] font-medium text-slate-700">
                                {u.presence === 'online'
                                  ? 'Online'
                                  : u.presence === 'idle'
                                  ? 'Vắng mặt'
                                  : 'Offline'}
                              </span>
                            </div>
                            {u.lastActiveAgoSec !== null && u.lastActiveAgoSec < 3600 && (
                              <div className="text-[10px] text-slate-400">
                                {u.lastActiveAgoSec < 60
                                  ? `${u.lastActiveAgoSec}s trước`
                                  : `${Math.round(u.lastActiveAgoSec / 60)} phút trước`}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-mono text-[11px] text-slate-700">
                              {u.lastLoginIp || '—'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-[11px] text-slate-500">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Đổi Mật Khẩu */}
                              <button
                                onClick={() => {
                                  setPasswordModalUser(u);
                                  setNewPasswordInput('');
                                }}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                title="Đổi mật khẩu"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              {/* Đá phiên */}
                              <button
                                onClick={() => handleKickUser(u)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                title="Đá phiên đăng nhập (buộc đăng xuất)"
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>

                              {/* Khóa / Mở khóa */}
                              {u.username !== 'admin' && (
                                <button
                                  onClick={() => handleToggleUserStatus(u)}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    u.status === 'blocked'
                                      ? 'text-emerald-600 hover:bg-emerald-50'
                                      : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                  }`}
                                  title={u.status === 'blocked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                >
                                  {u.status === 'blocked' ? (
                                    <Unlock className="w-3.5 h-3.5" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}

                              {/* Xóa user */}
                              {u.username !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="Xóa vĩnh viễn"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IP WHITELIST */}
        {activeTab === 'whitelist' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cột trái: Cài đặt và Bật/Tắt Whitelist */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Bảo Vệ Whitelist IP</h3>
                  <button
                    onClick={handleToggleGlobalWhitelist}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      whitelistConfig.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        whitelistConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {whitelistConfig.enabled ? (
                    <span className="text-indigo-600 font-semibold">
                      🛡️ Chế độ bảo vệ đang BẬT. Chỉ các IP được cho phép mới có thể đăng nhập.
                    </span>
                  ) : (
                    <span>
                      ⚪ Chế độ bảo vệ đang TẮT. Mọi người dùng có tài khoản đều có thể đăng nhập từ mọi IP.
                    </span>
                  )}
                </p>

                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  <div className="font-semibold text-slate-800 mb-1">IP của bạn hiện tại:</div>
                  <div className="font-mono font-bold text-indigo-600 text-sm">
                    {whitelistConfig.currentIp}
                  </div>
                </div>
              </div>

              {/* Form Thêm IP Mới */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Thêm IP / Dải IP Mới</h3>
                <form onSubmit={handleAddIp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Địa chỉ IP hoặc Dải IP
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 14.232.100.5 hoặc 192.168.1.*"
                      value={newIpInput}
                      onChange={(e) => setNewIpInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-indigo-500 outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Mô tả / Ghi chú
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Văn phòng công ty, Nhà riêng..."
                      value={newIpDescInput}
                      onChange={(e) => setNewIpDescInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
                  >
                    + Thêm Vào Whitelist
                  </button>
                </form>
              </div>
            </div>

            {/* Cột phải: Danh sách IP Whitelist */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">
                    Danh Sách IP Được Cho Phép ({whitelistConfig.list.length})
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {whitelistConfig.list.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Chưa có địa chỉ IP nào trong danh sách Whitelist
                    </div>
                  ) : (
                    whitelistConfig.list.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-800">
                              {item.ip}
                            </span>
                            {item.ip === whitelistConfig.currentIp && (
                              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                BẠN
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.description || 'Không có mô tả'} • Thêm ngày{' '}
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleIpItem(item)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                              item.enabled !== false
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {item.enabled !== false ? 'Kích Hoạt' : 'Vô Hiệu'}
                          </button>

                          <button
                            onClick={() => handleDeleteIpItem(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Xóa IP này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-600" />
                <span>Nhật Ký Bảo Mật & Hoạt Động Hệ Thống</span>
              </div>
              <span className="text-[11px] text-slate-400">Hiển thị {logs.length} bản ghi gần nhất</span>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Thời Gian</th>
                    <th className="py-2.5 px-4">Tài Khoản</th>
                    <th className="py-2.5 px-4">Địa Chỉ IP</th>
                    <th className="py-2.5 px-4">Hành Động</th>
                    <th className="py-2.5 px-4">Chi Tiết</th>
                    <th className="py-2.5 px-4">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                        Chưa có bản ghi hoạt động nào
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-4 whitespace-nowrap text-slate-500">
                          {new Date(log.timestamp).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">
                          @{log.username}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {log.ip}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-sans text-slate-700 max-w-md truncate">
                          {log.detail}
                        </td>
                        <td className="py-2.5 px-4 font-sans">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'success'
                                ? 'bg-emerald-50 text-emerald-700'
                                : log.status === 'blocked'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL THÊM USER MỚI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Cấp Tài Khoản Mới</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên Đăng Nhập (Username) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: nguyenvan_a"
                  value={newUserForm.username}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, username: e.target.value.toLowerCase().trim() })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-indigo-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật Khẩu Ban Đầu *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự..."
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên Hiển Thị (Họ & Tên)
                </label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A"
                  value={newUserForm.displayName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, displayName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vai Trò (Role)
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-indigo-500 outline-hidden bg-white"
                  >
                    <option value="member">Nhân Viên Dùng Tool</option>
                    <option value="admin">Quản Trị Viên (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trạng Thái
                  </label>
                  <select
                    value={newUserForm.status}
                    onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-indigo-500 outline-hidden bg-white"
                  >
                    <option value="active">Hoạt Động</option>
                    <option value="blocked">Tạm Khóa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giới Hạn IP Riêng (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Phân cách bởi dấu phẩy, để trống nếu cho phép mọi IP"
                  value={newUserForm.allowedIpsText}
                  onChange={(e) => setNewUserForm({ ...newUserForm, allowedIpsText: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-indigo-500 outline-hidden font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ĐỔI MẬT KHẨU USER */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>Đổi Mật Khẩu</span>
              </h3>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Đặt lại mật khẩu cho tài khoản: <strong className="text-slate-900 font-bold">@{passwordModalUser.username}</strong>
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật Khẩu Mới
                </label>
                <input
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
