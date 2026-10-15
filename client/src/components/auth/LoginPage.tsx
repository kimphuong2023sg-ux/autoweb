import React, { useState, useEffect } from 'react';
import { getApiUrl, setToken, setUser, AuthUser } from '../../utils/auth';
import { ShieldCheck, User, Lock, Eye, EyeOff, LogIn, AlertCircle, Sparkles, Globe, Cpu } from 'lucide-react';

interface LoginPageProps {
  portal?: 'auto' | 'admin' | 'tool';
  onLoginSuccess: (data: { user: AuthUser; token: string }) => void;
  onNavigate?: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  portal = 'auto',
  onLoginSuccess,
  onNavigate,
}) => {
  const [activePortal, setActivePortal] = useState<'tool' | 'admin'>(() => {
    if (portal === 'admin') return 'admin';
    if (portal === 'tool') return 'tool';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (path === '/admin' || path.startsWith('/admin/') || hash === '#/admin') ? 'admin' : 'tool';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [clientIp, setClientIp] = useState('Đang phát hiện...');
  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);

  // Nhận diện IP máy hiện tại
  useEffect(() => {
    fetch(getApiUrl('/api/auth/my-ip'))
      .then((res) => res.json())
      .then((data) => {
        if (data.ip) setClientIp(data.ip);
        if (typeof data.isWhitelisted === 'boolean') setIsWhitelisted(data.isWhitelisted);
      })
      .catch(() => setClientIp('127.0.0.1'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorInfo('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!');
      return;
    }

    setLoading(true);
    setErrorInfo(null);

    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          portal: activePortal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorInfo(data.message || data.error || 'Đăng nhập không thành công!');
        return;
      }

      // Lưu thông tin phiên đăng nhập
      const scope = activePortal === 'admin' ? 'admin' : 'user';
      setToken(data.token, scope);
      setUser(data.user, scope);

      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } catch (err: any) {
      setErrorInfo('Lỗi kết nối tới máy chủ. Vui lòng kiểm tra lại dịch vụ Backend đang chạy!');
    } finally {
      setLoading(false);
    }
  };

  const handlePortalSwitch = (p: 'tool' | 'admin') => {
    setActivePortal(p);
    setErrorInfo(null);
    if (onNavigate) {
      onNavigate(p === 'admin' ? '/admin' : '/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col justify-center items-center p-4 selection:bg-blue-500 selection:text-white font-sans text-slate-800">
      {/* Background soft glow elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-lg shadow-blue-500/10 border border-slate-200/80 mb-3 text-blue-600">
            {activePortal === 'admin' ? <ShieldCheck className="w-7 h-7 text-indigo-600" /> : <Cpu className="w-7 h-7 text-blue-600" />}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
            AutoWeb Flatsome SEO
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống Tự Động Hóa Giao Diện Chuẩn SEO & Quản Lý Doanh Nghiệp
          </p>
        </div>

        {/* Card chính (UI Sáng - Clean White Card) */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/90 overflow-hidden">
          {/* Cổng đăng nhập Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 border-b border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handlePortalSwitch('tool')}
              className={`py-2 px-3 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortal === 'tool'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Cổng Tool Làm Việc</span>
            </button>
            <button
              type="button"
              onClick={() => handlePortalSwitch('admin')}
              className={`py-2 px-3 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePortal === 'admin'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cổng Quản Trị (Admin)</span>
            </button>
          </div>

          <div className="p-6 md:p-8">
            {/* Tiêu đề cổng */}
            <div className="mb-5 text-center">
              <h2 className="text-base font-bold text-slate-800">
                {activePortal === 'admin' ? 'Đăng Nhập Quản Trị Hệ Thống' : 'Đăng Nhập Hệ Thống AutoWeb'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activePortal === 'admin'
                  ? 'Khu vực quản lý tài khoản nhân viên, whitelist IP và nhật ký'
                  : 'Khu vực làm việc khởi tạo giao diện và kết nối WordPress'}
              </p>
            </div>

            {/* Thông báo lỗi nếu có */}
            {errorInfo && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <div className="leading-relaxed">{errorInfo}</div>
              </div>
            )}

            {/* Form đăng nhập */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên Đăng Nhập
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên tài khoản..."
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mật Khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition bg-white text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                  activePortal === 'admin'
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang Xác Thực...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{activePortal === 'admin' ? 'Đăng Nhập Quản Trị' : 'Đăng Nhập Làm Việc'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick credentials helper for root admin */}
            <div className="mt-5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Tài khoản Quản trị viên mặc định:</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>User: <strong className="text-slate-800">admin</strong></span>
                <span>Pass: <strong className="text-slate-800">admin@123456</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin@123456');
                  }}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Điền nhanh
                </button>
              </div>
            </div>
          </div>

          {/* Footer thông tin IP máy khách */}
          <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>IP của bạn: <strong className="text-slate-700">{clientIp}</strong></span>
            </span>
            {isWhitelisted !== null && (
              <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                isWhitelisted ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                {isWhitelisted ? '✓ IP Cho Phép' : 'Chưa Whitelist'}
              </span>
            )}
          </div>
        </div>

        {/* Chân trang bản quyền */}
        <div className="text-center mt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} AutoWeb Flatsome SEO Engine • Phân quyền & Bảo mật đa tầng
        </div>
      </div>
    </div>
  );
};
