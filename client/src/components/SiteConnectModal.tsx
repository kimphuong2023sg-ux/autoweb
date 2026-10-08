import React, { useState, useEffect } from 'react';
import { X, Globe, User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, Key, Trash2, UploadCloud } from 'lucide-react';
import { ConnectedSite } from '../types';

interface SiteConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (site: ConnectedSite) => Promise<void>;
  onAutoInstall?: (site: ConnectedSite) => Promise<void>;
  editingSite?: ConnectedSite | null;
  onDeleteSite?: (siteUrl: string) => void;
}

export const SiteConnectModal: React.FC<SiteConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  onAutoInstall,
  editingSite,
  onDeleteSite,
}) => {
  const [siteUrl, setSiteUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useTokenMode, setUseTokenMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoInstalling, setIsAutoInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingSite) {
      setSiteUrl(editingSite.siteUrl || '');
      setUsername(editingSite.username || '');
      setPassword(editingSite.password || '');
      setToken(editingSite.token || '');
      setUseTokenMode(Boolean(editingSite.token && !editingSite.username));
    } else {
      setSiteUrl('');
      setUsername('');
      setPassword('');
      setToken('');
      setUseTokenMode(false);
    }
    setError(null);
  }, [editingSite, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteUrl.trim()) {
      setError('Vui lòng nhập Website URL');
      return;
    }

    if (!useTokenMode && (!username.trim() || !password.trim())) {
      setError('Vui lòng nhập Tên đăng nhập và Mật khẩu WordPress');
      return;
    }

    if (useTokenMode && !token.trim()) {
      setError('Vui lòng nhập Secret API Token');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Sanitize URL (auto strip /wp-admin, /wp-login.php, trailing slashes)
      let cleanUrl = siteUrl.trim();
      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'https://' + cleanUrl;
      }
      cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
      cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');
      cleanUrl = cleanUrl.replace(/\/+$/, '');

      await onConnect({
        siteUrl: cleanUrl,
        username: username.trim(),
        password: password.trim(),
        token: token.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối đến website. Vui lòng kiểm tra lại URL, tài khoản và mật khẩu!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoInstall = async () => {
    if (!siteUrl.trim()) {
      setError('Vui lòng nhập Website URL');
      return;
    }
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập Tên đăng nhập và Mật khẩu WordPress (Admin) để tự động cài plugin!');
      return;
    }

    try {
      setIsAutoInstalling(true);
      setError(null);

      let cleanUrl = siteUrl.trim();
      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'https://' + cleanUrl;
      }
      cleanUrl = cleanUrl.replace(/\/wp-admin(\/.*)?$/i, '');
      cleanUrl = cleanUrl.replace(/\/wp-login\.php.*$/i, '');
      cleanUrl = cleanUrl.replace(/\/+$/, '');

      const siteObj: ConnectedSite = {
        siteUrl: cleanUrl,
        username: username.trim(),
        password: password.trim(),
        token: token.trim(),
      };

      if (onAutoInstall) {
        await onAutoInstall(siteObj);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tự động cài plugin lên WordPress');
    } finally {
      setIsAutoInstalling(false);
    }
  };

  const handleDelete = () => {
    if (editingSite && onDeleteSite) {
      if (window.confirm(`Bạn có chắc chắn muốn xóa website ${editingSite.siteUrl} khỏi danh sách?`)) {
        onDeleteSite(editingSite.siteUrl);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {editingSite ? 'Sửa Thông Tin Kết Nối Website' : 'Kết Nối Website WordPress'}
              </h3>
              <p className="text-xs text-slate-500">
                {editingSite ? 'Cập nhật lại URL, tài khoản hoặc mật khẩu' : 'Đăng nhập bằng tài khoản Quản trị viên (Admin)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2">
              <span className="shrink-0 font-bold">⚠️</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Website URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Website URL
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://mexvip.sh"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white text-sm rounded-lg px-3.5 py-2.5 outline-hidden transition text-slate-900 font-medium placeholder:text-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Bạn có thể dán link trang chủ hoặc link <code className="bg-slate-100 px-1 py-0.5 rounded">/wp-admin</code> (hệ thống sẽ tự động xử lý).
            </p>
          </div>

          {!useTokenMode ? (
            <>
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tên Đăng Nhập WordPress (Username)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="admin hoặc email quản trị"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white text-sm rounded-lg px-3.5 py-2.5 outline-hidden transition text-slate-900 font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mật Khẩu WordPress (Password)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu đăng nhập WP..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white text-sm rounded-lg pl-3.5 pr-10 py-2.5 outline-hidden transition text-slate-900 font-medium placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Secret Token Alternative */
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span>Secret API Token</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Dán token 32 ký tự tại đây..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white text-sm rounded-lg px-3.5 py-2.5 outline-hidden transition text-slate-900 font-mono placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Lấy tại: WP Admin ➔ Công cụ (Tools) ➔ Flatsome SEO Bridge
              </p>
            </div>
          )}

          {/* Toggle between Username/Password and Token */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setUseTokenMode(!useTokenMode)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition"
            >
              {useTokenMode ? '➔ Đăng nhập bằng Tài khoản & Mật khẩu' : '➔ Hoặc dùng Secret API Token'}
            </button>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Thông tin đăng nhập được gửi trực tiếp và an toàn từ máy của bạn tới website mục tiêu.
            </p>
          </div>

          {/* 1-Click Auto Install Option */}
          {!useTokenMode && onAutoInstall && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAutoInstall}
                disabled={isLoading || isAutoInstalling}
                className="w-full py-2.5 px-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isAutoInstalling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Đang tải lên, giải nén & kích hoạt plugin...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    <span>🚀 Tự Động Cài & Kích Hoạt Plugin Lên WP (1-Click)</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-1">
                Tự động đăng nhập, tải file ZIP và kích hoạt plugin ngay lập tức không cần vào WP Admin.
              </p>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {editingSite && onDeleteSite && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg flex items-center gap-1 transition"
                  title="Xóa website này khỏi danh sách đã lưu"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa site này
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang kết nối...</span>
                  </>
                ) : (
                  <>
                    <span>{editingSite ? 'Cập Nhật & Kết Nối Lại' : 'Kết Nối & Quét Web'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
