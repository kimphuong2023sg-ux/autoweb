import React, { useState } from 'react';
import {
  Globe,
  RefreshCw,
  Rocket,
  Plus,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Edit,
  Trash2,
  UploadCloud,
  Zap,
  Loader2,
  RotateCcw,
  Eye,
  ExternalLink,
  ShieldCheck,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { ConnectedSite, WpInspectData } from '../types';

interface TopbarProps {
  currentSite: ConnectedSite | null;
  savedSites: ConnectedSite[];
  inspectData: WpInspectData | null;
  isLoading: boolean;
  isAutoInstallingPlugin?: boolean;
  isPushingCode?: boolean;
  showLivePreview?: boolean;
  onToggleLivePreview?: () => void;
  onSelectSite: (site: ConnectedSite) => void;
  onOpenConnectModal: () => void;
  onEditSite: (site: ConnectedSite) => void;
  onDeleteSite: (siteUrl: string) => void;
  onSync: () => void;
  onOpenDeployModal: () => void;
  onAutoInstallPlugin?: () => void;
  onPushPluginCode?: () => void;
  onResetSiteState?: () => void;
  currentUser?: { username: string; displayName?: string; role: string } | null;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentSite,
  savedSites,
  inspectData,
  isLoading,
  isAutoInstallingPlugin = false,
  isPushingCode = false,
  showLivePreview = false,
  onToggleLivePreview,
  onSelectSite,
  onOpenConnectModal,
  onEditSite,
  onDeleteSite,
  onSync,
  onOpenDeployModal,
  onAutoInstallPlugin,
  onPushPluginCode,
  onResetSiteState,
  currentUser,
  onOpenAdmin,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 text-lg leading-tight">Flatsome AutoTheme</h1>
            <span className="text-[11px] font-semibold tracking-wide bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              SEO BUILDER
            </span>
          </div>
          <p className="text-xs text-slate-500">Tự động cấu hình theme & render layout UX Builder chuẩn SEO</p>
        </div>
      </div>

      {/* Center: Site Selector & Connection Status */}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="max-w-[200px] truncate">
                {currentSite ? currentSite.siteUrl.replace(/^https?:\/\//, '') : 'Chọn website kết nối'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {currentSite && (
              <button
                onClick={() => onEditSite(currentSite)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-200/60 rounded-md transition"
                title="Sửa thông tin đăng nhập hoặc URL của website này"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Website của bạn</span>
                <span>{savedSites.length} site</span>
              </div>

              {savedSites.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-500">Chưa lưu website nào</div>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {savedSites.map((s, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition group ${
                        currentSite?.siteUrl === s.siteUrl ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectSite(s);
                          setDropdownOpen(false);
                        }}
                        className={`text-left flex-1 min-w-0 pr-2 truncate ${
                          currentSite?.siteUrl === s.siteUrl ? 'text-blue-600 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate">{s.siteUrl.replace(/^https?:\/\//, '')}</div>
                        {s.username && (
                          <div className="text-[10px] text-slate-400 font-normal">User: {s.username}</div>
                        )}
                      </button>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(false);
                            onEditSite(s);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded"
                          title="Sửa thông tin"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Xóa website ${s.siteUrl} khỏi danh sách?`)) {
                              onDeleteSite(s.siteUrl);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded"
                          title="Xóa khỏi danh sách"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-100 my-1 pt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenConnectModal();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 font-medium transition"
                >
                  <Plus className="w-4 h-4" /> Kết nối website mới
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Pill */}
        {inspectData ? (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Flatsome {inspectData.site?.theme_version || 'v3.x'}
          </div>
        ) : currentSite ? (
          <button
            onClick={() => onEditSite(currentSite)}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-full font-medium transition cursor-pointer"
            title="Bấm để kiểm tra hoặc sửa lại tài khoản/mật khẩu"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Chưa kết nối (Bấm sửa)</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Chưa kết nối
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {currentSite && !inspectData && onAutoInstallPlugin && (
          <button
            onClick={onAutoInstallPlugin}
            disabled={isAutoInstallingPlugin || isLoading}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3.5 py-2 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
            title="Tự động upload zip, giải nén và kích hoạt Plugin Flatsome SEO Bridge lên WordPress"
          >
            {isAutoInstallingPlugin ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang Cài Plugin...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Cài Plugin Lên WP</span>
              </>
            )}
          </button>
        )}

        {currentSite && inspectData && onAutoInstallPlugin && (
          <button
            onClick={() => {
              if (
                window.confirm(
                  'Bạn có chắc chắn muốn cập nhật và ghi đè Plugin Flatsome SEO Bridge lên phiên bản mới nhất từ file ZIP chuẩn trên website này?'
                )
              ) {
                onAutoInstallPlugin();
              }
            }}
            disabled={isAutoInstallingPlugin || isLoading}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
            title="Tải gói ZIP plugin mới nhất lên WordPress và ghi đè an toàn"
          >
            {isAutoInstallingPlugin ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Đang Cập Nhật Plugin...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                <span>📦 Cập Nhật Plugin (Ghi Đè)</span>
              </>
            )}
          </button>
        )}

        {currentSite && (
          <button
            onClick={onSync}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
            title="Đồng bộ lại trạng thái từ WordPress"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Quét & Đồng Bộ</span>
          </button>
        )}

        {currentSite && onResetSiteState && (
          <button
            onClick={onResetSiteState}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-lg transition cursor-pointer"
            title="Xóa dữ liệu lưu tạm của riêng website này trong tool, đưa về mặc định sạch để không bị lẫn cài đặt của website khác"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>🧹 Đặt Lại Mặc Định Site Này</span>
          </button>
        )}

        {currentSite && (
          <a
            href={currentSite.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg transition"
            title="Mở trang chủ website thật trên tab mới"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>🌐 Web Thật</span>
          </a>
        )}

        {onToggleLivePreview && (
          <button
            type="button"
            onClick={onToggleLivePreview}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition cursor-pointer ${
              showLivePreview
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
            }`}
            title={showLivePreview ? 'Đang mở Live Preview - Bấm để ẩn và mở rộng tối đa màn hình cài đặt' : 'Mở khung Live Preview bên phải'}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showLivePreview ? 'Ẩn Preview' : 'Mô Phỏng'}</span>
          </button>
        )}

        <button
          onClick={onOpenDeployModal}
          disabled={!currentSite}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2 rounded-lg shadow-sm hover:shadow transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title="Xuất bản hoặc cập nhật các thay đổi mới nhất lên website"
        >
          <Rocket className="w-4 h-4" />
          <span>Xuất Bản / Cập Nhật Web</span>
        </button>

        {/* User Profile & Admin & Logout Actions */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-200">
            {currentUser.role === 'admin' && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition cursor-pointer"
                title="Vào trang quản trị tài khoản, whitelist IP và nhật ký"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Quản Trị</span>
              </button>
            )}

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center uppercase">
                {currentUser.username ? currentUser.username.charAt(0) : 'U'}
              </div>
              <div className="leading-tight text-left">
                <div className="font-bold text-slate-800 max-w-[100px] truncate text-[11px]">
                  {currentUser.displayName || currentUser.username}
                </div>
                <div className="text-[9px] text-slate-400 font-medium">
                  {currentUser.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer border border-transparent hover:border-rose-100"
                title="Đăng xuất tài khoản"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
