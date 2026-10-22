import React, { useState, useRef } from 'react';
import {
  Type,
  Box,
  Eye,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles,
  RefreshCw,
  Rocket,
  Palette,
  Layout,
  ListOrdered,
  Tag,
  Table,
  Check,
  Code,
  Flame,
  BookOpen,
  Columns,
  ArrowRight,
  Share2,
  UserCheck,
  Camera,
  Upload,
  ImageIcon,
  FolderCheck,
  Compass,
  ChevronRight
} from 'lucide-react';
import { ConnectedSite, SubpageStylingConfig, getInitialSubpageStyling, WpMediaItem } from '../../types';
import { api } from '../../services/api';
import { WpMediaPickerModal } from '../common/WpMediaPickerModal';

interface StepSubpageStylingProps {
  currentSite: ConnectedSite;
  styling: SubpageStylingConfig;
  onChangeStyling: (newStyling: SubpageStylingConfig) => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onAutoInstallPlugin?: () => void;
  isAutoInstallingPlugin?: boolean;
}

export const StepSubpageStyling: React.FC<StepSubpageStylingProps> = ({
  currentSite,
  styling,
  onChangeStyling,
  onNextStep,
  onPrevStep,
  onAutoInstallPlugin,
  isAutoInstallingPlugin,
}) => {
  const [activeTab, setActiveTab] = useState<'typography' | 'frames' | 'posts' | 'preview'>('typography');
  const [previewMode, setPreviewMode] = useState<'post' | 'page'>('post');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const authorAvatarPresets = [
    {
      name: 'Chuyên gia Nữ (Mặc định)',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
    {
      name: 'Chuyên gia Nam (Doanh nhân)',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    },
    {
      name: 'Chuyên gia Nam (Trẻ trung)',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    },
    {
      name: 'Biên tập viên Nữ (Á Âu)',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    },
    {
      name: 'Huy hiệu Casino VIP 3D',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80',
    },
  ];

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước ảnh đại diện vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

      if (!currentSite?.siteUrl) {
        onChangeStyling({ ...styling, postAuthorAvatar: base64 });
        return;
      }

      try {
        setIsUploadingAvatar(true);
        setAvatarUploadError(null);
        setAvatarUploadSuccess(false);

        const res = await api.uploadMedia(currentSite, {
          filename: file.name,
          fileData: base64,
          title: `Author Avatar - ${file.name}`,
          altText: 'Author Avatar',
        });

        if (res && res.media) {
          onChangeStyling({
            ...styling,
            postAuthorAvatar: res.media.url,
          });
          setAvatarUploadSuccess(true);
          setTimeout(() => setAvatarUploadSuccess(false), 4000);
        }
      } catch (err: any) {
        setAvatarUploadError(err.message || 'Lỗi khi tải ảnh đại diện lên WordPress');
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveToWordPress = async () => {
    if (!currentSite?.siteUrl) return;
    try {
      setIsSaving(true);
      setSaveSuccess(null);
      setSaveError(null);

      const completeStyling: SubpageStylingConfig = {
        ...getInitialSubpageStyling(),
        ...styling,
        postLayout: styling.postLayout || 'right-sidebar',
        relatedPostsEnabled: styling.relatedPostsEnabled ?? true,
        relatedPostsTitle: styling.relatedPostsTitle || 'Artículos Relacionados',
        relatedPostsCount: styling.relatedPostsCount || 3,
        relatedPostsColumns: styling.relatedPostsColumns || 3,
        relatedPostsSource: styling.relatedPostsSource || 'category',
        sidebarEnabled: styling.sidebarEnabled ?? true,
        sidebarSticky: styling.sidebarSticky ?? true,
        sidebarSuggestedPostsEnabled: styling.sidebarSuggestedPostsEnabled ?? true,
        sidebarSuggestedPostsTitle: styling.sidebarSuggestedPostsTitle || 'Artículos Recomendados',
        sidebarSuggestedPostsCount: styling.sidebarSuggestedPostsCount || 5,
        sidebarCtaEnabled: styling.sidebarCtaEnabled ?? true,
        sidebarCtaTitle: styling.sidebarCtaTitle || 'Bono Exclusivo 100%',
        sidebarCtaDesc: styling.sidebarCtaDesc || 'Regístrate hoy y duplica tu primer depósito.',
        sidebarCtaBtnText: styling.sidebarCtaBtnText || 'REGÍSTRATE AHORA',
        sidebarCtaBtnLink: styling.sidebarCtaBtnLink || '#register',
        sidebarCleanOnly: styling.sidebarCleanOnly ?? true,
        postShareEnabled: styling.postShareEnabled ?? true,
        postShareTitle: styling.postShareTitle ?? 'Compartir este artículo',
        postShareNetworks: styling.postShareNetworks || ['facebook', 'twitter', 'whatsapp', 'telegram', 'email', 'pinterest', 'linkedin'],
        postShareStyle: styling.postShareStyle || 'outline',
        postShareAlign: styling.postShareAlign || 'center',
        postAuthorBoxEnabled: styling.postAuthorBoxEnabled ?? true,
        postAuthorName: styling.postAuthorName || '',
        postAuthorRole: styling.postAuthorRole || 'Chuyên Gia Đánh Giá & Phân Tích Casino',
        postAuthorAvatar: styling.postAuthorAvatar || '',
        postAuthorBio: styling.postAuthorBio || '',
        postAuthorLink: styling.postAuthorLink || '',
        postAuthorBadge: styling.postAuthorBadge || 'Tác Giả Đã Xác Minh',
        postNavEnabled: styling.postNavEnabled ?? true,
        postFooterMetaEnabled: styling.postFooterMetaEnabled ?? false,
        stripArchiveTitlePrefix: styling.stripArchiveTitlePrefix ?? true,
        hideArchiveCategoryBadge: styling.hideArchiveCategoryBadge ?? true,
        breadcrumbsEnabled: styling.breadcrumbsEnabled ?? true,
        breadcrumbsOnPosts: styling.breadcrumbsOnPosts ?? true,
        breadcrumbsOnCategories: styling.breadcrumbsOnCategories ?? true,
        breadcrumbsOnPages: styling.breadcrumbsOnPages ?? false,
      };

      const res = await api.saveSubpageStyling(currentSite, completeStyling);
      onChangeStyling(completeStyling);
      setSaveSuccess(res?.message || 'Đã xuất bản thành công cấu hình style trang con & bài viết lên WordPress!');
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: any) {
      setSaveError(err.message || 'Lỗi khi lưu cấu hình lên WordPress');
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (preset: 'dark_gold_casino' | 'modern_neon_blue' | 'clean_light') => {
    if (preset === 'dark_gold_casino') {
      onChangeStyling({
        ...styling,
        themeMode: 'dark',
        textColor: '#cbd5e1',
        boldColor: '#fde047',
        heading1Color: '#ffffff',
        heading2Color: '#38bdf8',
        heading3Color: '#fde047',
        linkColor: '#38bdf8',
        linkHoverColor: '#fde047',
        pageBgColor: 'transparent',
        contentFontSize: '16px',
        contentLineHeight: '1.75',
        tocBgColor: '#090d16',
        tocBorderColor: '#1e293b',
        tocTitleColor: '#ffffff',
        badgeBorderColor: '#eab308',
        badgeBgColor: 'rgba(15, 23, 42, 0.8)',
        badgeTextColor: '#ffffff',
        calloutGoldBorder: '#f59e0b',
        calloutBlueBorder: '#38bdf8',
        calloutBgColor: 'rgba(15, 23, 42, 0.85)',
        ctaBoxButtonColor: 'alert',
      });
    } else if (preset === 'modern_neon_blue') {
      onChangeStyling({
        ...styling,
        themeMode: 'dark',
        textColor: '#e2e8f0',
        boldColor: '#00f2fe',
        heading1Color: '#ffffff',
        heading2Color: '#00f2fe',
        heading3Color: '#4facfe',
        linkColor: '#00f2fe',
        linkHoverColor: '#ffffff',
        pageBgColor: 'transparent',
        contentFontSize: '16px',
        contentLineHeight: '1.75',
        tocBgColor: '#0b132b',
        tocBorderColor: '#1c2541',
        tocTitleColor: '#00f2fe',
        badgeBorderColor: '#00f2fe',
        badgeBgColor: 'rgba(11, 19, 43, 0.8)',
        badgeTextColor: '#ffffff',
        calloutGoldBorder: '#00f2fe',
        calloutBlueBorder: '#4facfe',
        calloutBgColor: 'rgba(11, 19, 43, 0.85)',
        ctaBoxButtonColor: 'primary',
      });
    } else {
      onChangeStyling({
        ...styling,
        themeMode: 'light',
        textColor: '#334155',
        boldColor: '#0f172a',
        heading1Color: '#0f172a',
        heading2Color: '#1e40af',
        heading3Color: '#b45309',
        linkColor: '#2563eb',
        linkHoverColor: '#1d4ed8',
        pageBgColor: '#ffffff',
        contentFontSize: '16px',
        contentLineHeight: '1.75',
        tocBgColor: '#f8fafc',
        tocBorderColor: '#e2e8f0',
        tocTitleColor: '#0f172a',
        badgeBorderColor: '#d97706',
        badgeBgColor: '#ffffff',
        badgeTextColor: '#0f172a',
        calloutGoldBorder: '#d97706',
        calloutBlueBorder: '#2563eb',
        calloutBgColor: '#f8fafc',
        ctaBoxButtonColor: 'alert',
      });
    }
  };

  // Sample HTML snippets for users to copy
  const snippetBadge = `<div class="autoweb-badges-wrapper">
  <span class="autoweb-badge badge-gold">JUEGALOTTO</span>
  <span class="autoweb-badge badge-blue">⚽ APUESTAS DEPORTIVAS</span>
  <span class="autoweb-badge badge-green">MX MÉXICO 2026 - SEGOB</span>
</div>`;

  const snippetCallout = `<div class="autoweb-callout callout-gold">
  <h4 style="margin: 0 0 6px 0; color: #f59e0b; font-size: 15px; font-weight: 700;">💡 LƯU Ý QUAN TRỌNG:</h4>
  <p style="margin: 0; font-size: 14px; line-height: 1.6;">Áp dụng ưu đãi hoàn trả 100% nạp lần đầu cho tất cả thành viên đăng ký hợp lệ trong tháng này.</p>
</div>`;

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 text-white shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold text-sm">
              7
            </span>
            <h2 className="text-lg font-bold tracking-wide">
              Cấu Hình Trang Con &amp; Bài Viết (Subpage &amp; Content Styling)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Toàn Bộ Site
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Thiết lập màu sắc chữ (H1, H2, đoạn văn, link) và các khung mẫu làm nổi bật nội dung (Mục lục, Thẻ Badge, Callout Box, Nút CTA giữa bài). Chỉ cần chỉnh 1 lần sẽ tự động đồng bộ lên toàn bộ trang con và bài viết WordPress.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveToWordPress}
            disabled={isSaving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang Lưu...</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>Xuất Bản Style Lên Web</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}
      {saveError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Presets Bar */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Áp Dụng Mẫu Phong Cách Nhanh:</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => applyPreset('dark_gold_casino')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-amber-500/30 hover:border-amber-400 transition cursor-pointer text-[11px]"
          >
            🎰 Casino Gold Dark (Chuẩn Juega365)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('modern_neon_blue')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold border border-cyan-500/30 hover:border-cyan-400 transition cursor-pointer text-[11px]"
          >
            ⚡ Thể Thao Neon Cyan
          </button>
          <button
            type="button"
            onClick={() => applyPreset('clean_light')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 hover:border-slate-500 transition cursor-pointer text-[11px]"
          >
            📄 Nền Sáng Tinh Gọn (Light)
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('typography')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'typography'
              ? 'bg-white text-blue-600 border-t-2 border-l border-r border-slate-200 -mb-px'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>1. Màu Sắc Chữ &amp; Cỡ Chữ (Toàn Trang)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('frames')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'frames'
              ? 'bg-white text-blue-600 border-t-2 border-l border-r border-slate-200 -mb-px'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>2. Các Khung Nổi Bật (Mục Lục, Tag, Callout, CTA)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'posts'
              ? 'bg-white text-blue-600 border-t-2 border-l border-r border-slate-200 -mb-px'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Columns className="w-4 h-4" />
          <span>3. Cấu Hình Bài Viết &amp; Gợi Ý Đọc (Bài Liên Quan &amp; Cột Phải)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-white text-blue-600 border-t-2 border-l border-r border-slate-200 -mb-px'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>4. Xem Trước Trang &amp; Bài Viết (Live Preview)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: TYPOGRAPHY & TEXT COLORS                                */}
      {/* ============================================================== */}
      {activeTab === 'typography' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600" />
              <span>Màu Sắc Tiêu Đề &amp; Đoạn Văn (Global Text Colors)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Áp dụng trực tiếp cho tất cả các thẻ H1, H2, H3, đoạn văn &lt;p&gt; và liên kết &lt;a&gt; trong trang con.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* H1 Color */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Tiêu Đề H1 (Tên Trang/Bài)</label>
                <div className="w-5 h-5 rounded-md border border-slate-300 shadow-inner" style={{ backgroundColor: styling.heading1Color }} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styling.heading1Color}
                  onChange={(e) => onChangeStyling({ ...styling, heading1Color: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={styling.heading1Color}
                  onChange={(e) => onChangeStyling({ ...styling, heading1Color: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-slate-800"
                />
              </div>
            </div>

            {/* H2 Color */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Tiêu Đề H2 (Mục Chính)</label>
                <div className="w-5 h-5 rounded-md border border-slate-300 shadow-inner" style={{ backgroundColor: styling.heading2Color }} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styling.heading2Color}
                  onChange={(e) => onChangeStyling({ ...styling, heading2Color: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={styling.heading2Color}
                  onChange={(e) => onChangeStyling({ ...styling, heading2Color: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-slate-800"
                />
              </div>
            </div>

            {/* H3 Color */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Tiêu Đề H3 (Mục Con)</label>
                <div className="w-5 h-5 rounded-md border border-slate-300 shadow-inner" style={{ backgroundColor: styling.heading3Color }} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styling.heading3Color}
                  onChange={(e) => onChangeStyling({ ...styling, heading3Color: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={styling.heading3Color}
                  onChange={(e) => onChangeStyling({ ...styling, heading3Color: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Bold Text Color (strong, b) */}
            <div className="p-3.5 bg-slate-50 border-2 border-amber-300/80 rounded-xl space-y-2 relative shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-amber-500 text-white font-extrabold flex items-center justify-center text-[10px]">B</span>
                  <span>Chữ In Đậm (&lt;strong&gt;, &lt;b&gt;)</span>
                </label>
                <div
                  className="w-5 h-5 rounded-md border border-slate-300 shadow-inner"
                  style={{ backgroundColor: styling.boldColor || (styling.themeMode === 'light' ? '#0f172a' : '#fde047') }}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styling.boldColor || (styling.themeMode === 'light' ? '#0f172a' : '#fde047')}
                  onChange={(e) => onChangeStyling({ ...styling, boldColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={styling.boldColor || (styling.themeMode === 'light' ? '#0f172a' : '#fde047')}
                  onChange={(e) => onChangeStyling({ ...styling, boldColor: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-slate-800"
                  placeholder="#fde047"
                />
              </div>
              <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => onChangeStyling({ ...styling, boldColor: '#fde047' })}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold cursor-pointer transition"
                  title="Vàng Gold Hoàng Gia"
                >
                  Gold
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStyling({ ...styling, boldColor: '#ffffff' })}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer transition"
                  title="Trắng Sáng"
                >
                  Trắng
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStyling({ ...styling, boldColor: '#38bdf8' })}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 hover:bg-sky-200 text-sky-900 font-semibold cursor-pointer transition"
                  title="Xanh Cyan Neon"
                >
                  Cyan
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStyling({ ...styling, boldColor: '#0f172a' })}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-semibold cursor-pointer transition"
                  title="Đen Đậm"
                >
                  Đen
                </button>
              </div>
            </div>

            {/* Paragraph Text Color */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Màu Chữ Nội Dung (&lt;p&gt;)</label>
                <div className="w-5 h-5 rounded-md border border-slate-300 shadow-inner" style={{ backgroundColor: styling.textColor }} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styling.textColor}
                  onChange={(e) => onChangeStyling({ ...styling, textColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={styling.textColor}
                  onChange={(e) => onChangeStyling({ ...styling, textColor: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Link Color */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Màu Đường Dẫn (&lt;a&gt; Link)</label>
                <div className="w-5 h-5 rounded-md border border-slate-300 shadow-inner" style={{ backgroundColor: styling.linkColor }} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styling.linkColor}
                  onChange={(e) => onChangeStyling({ ...styling, linkColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={styling.linkColor}
                  onChange={(e) => onChangeStyling({ ...styling, linkColor: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Link Hover Color */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Màu Khi Rê Chuột (Hover Link)</label>
                <div className="w-5 h-5 rounded-md border border-slate-300 shadow-inner" style={{ backgroundColor: styling.linkHoverColor }} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styling.linkHoverColor}
                  onChange={(e) => onChangeStyling({ ...styling, linkHoverColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={styling.linkHoverColor}
                  onChange={(e) => onChangeStyling({ ...styling, linkHoverColor: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Subpage Background Color */}
            <div className="p-3.5 bg-slate-50 border-2 border-indigo-300/80 rounded-xl space-y-2 relative shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-indigo-600 text-white font-extrabold flex items-center justify-center text-[10px]">BG</span>
                  <span>Màu Nền Trang Con / Bài Viết</span>
                </label>
                <div
                  className="w-5 h-5 rounded-md border border-slate-300 shadow-inner flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor:
                      styling.pageBgColor && styling.pageBgColor !== 'transparent'
                        ? styling.pageBgColor
                        : '#ffffff',
                    backgroundImage:
                      !styling.pageBgColor || styling.pageBgColor === 'transparent'
                        ? 'repeating-linear-gradient(45deg, #cbd5e1 0, #cbd5e1 2px, #f8fafc 0, #f8fafc 6px)'
                        : 'none',
                  }}
                  title={!styling.pageBgColor || styling.pageBgColor === 'transparent' ? 'Trong suốt (theo Nền Web)' : styling.pageBgColor}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styling.pageBgColor && styling.pageBgColor !== 'transparent' ? styling.pageBgColor : '#0b0f19'}
                  onChange={(e) => onChangeStyling({ ...styling, pageBgColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={styling.pageBgColor ?? 'transparent'}
                  onChange={(e) => onChangeStyling({ ...styling, pageBgColor: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-slate-800"
                  placeholder="transparent hoặc #0b0f19"
                />
              </div>
              <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => onChangeStyling({ ...styling, pageBgColor: 'transparent' })}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold cursor-pointer transition ${
                    !styling.pageBgColor || styling.pageBgColor === 'transparent'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                  title="Trong suốt (Theo nền Website Bước 4)"
                >
                  Trong Suốt
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStyling({ ...styling, pageBgColor: '#0b0f19' })}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold cursor-pointer transition ${
                    styling.pageBgColor === '#0b0f19'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 hover:bg-black text-amber-300'
                  }`}
                  title="Đen Đậm Casino (#0b0f19)"
                >
                  Đen Casino
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStyling({ ...styling, pageBgColor: '#ffffff' })}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold cursor-pointer transition ${
                    styling.pageBgColor === '#ffffff'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                  }`}
                  title="Trắng Sáng (#ffffff)"
                >
                  Trắng Sáng
                </button>
              </div>
            </div>
          </div>

          {/* Typography Sizes & Layout */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Layout className="w-4 h-4 text-blue-600" />
              <span>Cỡ Chữ &amp; Bố Cục Khung Nội Dung</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cỡ Chữ Đọc Tiêu Chuẩn</label>
                <select
                  value={styling.contentFontSize || '16px'}
                  onChange={(e) => onChangeStyling({ ...styling, contentFontSize: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                >
                  <option value="15px">15px (Nhỏ gọn / Vừa phải)</option>
                  <option value="16px">16px (Chuẩn Web &amp; Tối Ưu Mobile)</option>
                  <option value="17px">17px (Lớn rõ ràng / Dễ đọc)</option>
                  <option value="18px">18px (Cỡ lớn)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Độ Giãn Dòng (Line Height)</label>
                <select
                  value={styling.contentLineHeight || '1.75'}
                  onChange={(e) => onChangeStyling({ ...styling, contentLineHeight: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                >
                  <option value="1.6">1.6 (Vừa phải)</option>
                  <option value="1.75">1.75 (Thoáng mắt / Chuẩn Báo Chí)</option>
                  <option value="1.85">1.85 (Rộng rãi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Độ Rộng Tối Đa Khung Bài Viết</label>
                <select
                  value={styling.contentMaxWidth || '1080px'}
                  onChange={(e) => onChangeStyling({ ...styling, contentMaxWidth: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                >
                  <option value="850px">850px (Khung hẹp tập trung đọc)</option>
                  <option value="960px">960px (Khung tiêu chuẩn)</option>
                  <option value="1080px">1080px (Chuẩn Flatsome Subpage)</option>
                  <option value="1200px">1200px (Rộng thoáng)</option>
                  <option value="100%">100% (Toàn màn hình Full Width)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: HIGHLIGHT BOXES PRESETS & CUSTOMIZATION                 */}
      {/* ============================================================== */}
      {activeTab === 'frames' && (
        <div className="space-y-6">
          {/* Frame 1: Table of Contents Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Khung 1: Hộp Mục Lục (Table of Contents Box)</h4>
                  <p className="text-[11px] text-slate-500">
                    Tự động tạo khung viền nổi bật cho Mục Lục bài viết (tương thích LuckyWP, Easy TOC hoặc class .autoweb-toc).
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Tự Động Áp Dụng
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Màu Nền Khung TOC</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={styling.tocBgColor}
                    onChange={(e) => onChangeStyling({ ...styling, tocBgColor: e.target.value })}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={styling.tocBgColor}
                    onChange={(e) => onChangeStyling({ ...styling, tocBgColor: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Màu Viền Khung TOC</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={styling.tocBorderColor}
                    onChange={(e) => onChangeStyling({ ...styling, tocBorderColor: e.target.value })}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={styling.tocBorderColor}
                    onChange={(e) => onChangeStyling({ ...styling, tocBorderColor: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Màu Chữ Tiêu Đề TOC</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={styling.tocTitleColor}
                    onChange={(e) => onChangeStyling({ ...styling, tocTitleColor: e.target.value })}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={styling.tocTitleColor}
                    onChange={(e) => onChangeStyling({ ...styling, tocTitleColor: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Độ Bo Góc (Radius)</label>
                <select
                  value={styling.tocRadius}
                  onChange={(e) => onChangeStyling({ ...styling, tocRadius: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs font-medium"
                >
                  <option value="6px">6px (Bo nhẹ)</option>
                  <option value="10px">10px (Bo vừa chuẩn)</option>
                  <option value="16px">16px (Bo tròn hiện đại)</option>
                  <option value="0px">0px (Vuông vức)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Frame 2: Tag Badges / Meta Pills */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Khung 2: Thẻ Badge / Meta Pills (Giống Ảnh Mẫu Của Bạn)</h4>
                  <p className="text-[11px] text-slate-500">
                    Các thẻ nhãn viên nhộng bo tròn đặt dưới tiêu đề hoặc đầu bài viết: [JUEGALOTTO], [⚽ APUESTAS DEPORTIVAS], [MX MÉXICO 2026].
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(snippetBadge, 'badge')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSnippet === 'badge' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Đã Sao Chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao Chép Mã HTML Thẻ</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Visual of Badges */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center flex-wrap gap-2.5">
              <span className="autoweb-badge badge-gold" style={{ borderColor: styling.badgeBorderColor, backgroundColor: styling.badgeBgColor }}>
                JUEGALOTTO
              </span>
              <span className="autoweb-badge badge-blue" style={{ borderColor: '#38bdf8', backgroundColor: styling.badgeBgColor }}>
                ⚽ APUESTAS DEPORTIVAS
              </span>
              <span className="autoweb-badge badge-green" style={{ borderColor: '#10b981', backgroundColor: styling.badgeBgColor }}>
                MX MÉXICO 2026 - SEGOB
              </span>
            </div>
          </div>

          {/* Frame 3: Callout Boxes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Khung 3: Hộp Callout Nổi Bật (Lưu Ý, Khuyến Mãi, Mẹo Chơi)</h4>
                  <p className="text-[11px] text-slate-500">
                    Khung hộp viền màu nổi bật với nền kính mờ glassmorphism để nhấn mạnh thông tin quan trọng.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(snippetCallout, 'callout')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSnippet === 'callout' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Đã Sao Chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao Chép Mã Hộp Callout</span>
                  </>
                )}
              </button>
            </div>

            {/* Visual Callout Demo */}
            <div className="autoweb-callout callout-gold" style={{ borderLeftColor: styling.calloutGoldBorder, backgroundColor: styling.calloutBgColor }}>
              <h4 style={{ margin: '0 0 4px 0', color: styling.calloutGoldBorder, fontSize: '14px', fontWeight: 700 }}>
                💡 KHUYẾN MÃI ĐẶC BIỆT THÀNH VIÊN MỚI:
              </h4>
              <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', lineHeight: 1.6 }}>
                Đăng ký tài khoản hôm nay để nhận ngay gói thưởng nạp 100% lên tới 10,000,000 VNĐ cùng tỷ lệ hoàn trả thể thao cao nhất thị trường.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: BÀI VIẾT & GỢI Ý ĐỌC (RELATED POSTS & RIGHT SIDEBAR)    */}
      {/* ============================================================== */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {/* Section 1: Bố Cục Bài Viết Chi Tiết */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <Layout className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">1. Lựa Chọn Bố Cục Bài Viết (Single Post Layout)</h3>
                  <p className="text-xs text-slate-500">
                    Màu chữ (H1, H2, H3, đoạn văn, link) và các khung mẫu sẽ tự động kế thừa từ Bước 7. Hãy chọn kiểu bố cục hiển thị bài viết dưới đây:
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              {/* Option 1: Right Sidebar (Khuyên dùng) */}
              <div
                onClick={() => onChangeStyling({ ...styling, postLayout: 'right-sidebar' })}
                className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  (styling.postLayout || 'right-sidebar') === 'right-sidebar'
                    ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Cột Bên Phải (Right Sidebar)</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                      Khuyên Dùng
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Nội dung bài viết chiếm 9/12 cột, thanh bên phải 3/12 cột hiển thị danh sách bài gợi ý + banner CTA tăng tỷ lệ giữ chân và đăng ký.
                  </p>
                </div>
                <div className="h-14 rounded-lg border border-slate-300 bg-white p-1.5 flex gap-1.5">
                  <div className="flex-1 bg-slate-200 rounded-sm flex flex-col justify-center items-center text-[9px] font-bold text-slate-600">
                    Bài Viết (9/12)
                  </div>
                  <div className="w-10 bg-blue-100 border border-blue-300 rounded-sm flex flex-col justify-center items-center text-[8px] font-bold text-blue-700">
                    Sidebar
                  </div>
                </div>
              </div>

              {/* Option 2: No Sidebar (Full Width) */}
              <div
                onClick={() => onChangeStyling({ ...styling, postLayout: 'no-sidebar' })}
                className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  styling.postLayout === 'no-sidebar'
                    ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">Toàn Màn Hình Không Sidebar</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Toàn bộ bài viết căn giữa rộng thoáng không có thanh bên. Các bài gợi ý sẽ nằm trang trọng ở dưới chân bài đọc.
                  </p>
                </div>
                <div className="h-14 rounded-lg border border-slate-300 bg-white p-1.5 flex justify-center">
                  <div className="w-4/5 bg-slate-200 rounded-sm flex flex-col justify-center items-center text-[9px] font-bold text-slate-600">
                    Bài Viết Căn Giữa (10/12)
                  </div>
                </div>
              </div>

              {/* Option 3: Left Sidebar */}
              <div
                onClick={() => onChangeStyling({ ...styling, postLayout: 'left-sidebar' })}
                className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  styling.postLayout === 'left-sidebar'
                    ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">Cột Bên Trái (Left Sidebar)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Sidebar gợi ý bài viết nằm ở bên trái, nội dung bài viết chính nằm ở bên phải.
                  </p>
                </div>
                <div className="h-14 rounded-lg border border-slate-300 bg-white p-1.5 flex gap-1.5">
                  <div className="w-10 bg-blue-100 border border-blue-300 rounded-sm flex flex-col justify-center items-center text-[8px] font-bold text-blue-700">
                    Sidebar
                  </div>
                  <div className="flex-1 bg-slate-200 rounded-sm flex flex-col justify-center items-center text-[9px] font-bold text-slate-600">
                    Bài Viết (9/12)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Bài Viết Gợi Ý Dưới Chân Bài Đọc (Related Posts Grid) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">2. Lưới Bài Viết Gợi Ý Dưới Chân Bài Đọc (Related Posts)</h3>
                  <p className="text-xs text-slate-500">
                    Tự động chèn danh sách bài đọc gợi ý dạng thẻ Card bóng bẩy ở cuối bài viết (có ảnh, tag, ngày đăng, nút đọc ngay).
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition">
                <input
                  type="checkbox"
                  checked={styling.relatedPostsEnabled ?? true}
                  onChange={(e) => onChangeStyling({ ...styling, relatedPostsEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span>Bật Bài Gợi Ý Cuối Bài</span>
              </label>
            </div>

            {(styling.relatedPostsEnabled ?? true) && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Tiêu Đề Mục Gợi Ý (Tự do đặt ngôn ngữ: TBN / Anh / Việt)
                    </label>
                    <input
                      type="text"
                      value={styling.relatedPostsTitle ?? 'Artículos Relacionados'}
                      onChange={(e) => onChangeStyling({ ...styling, relatedPostsTitle: e.target.value })}
                      placeholder="Artículos Relacionados / Bài Viết Gợi Ý Khác"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Số Lượng Bài Gợi Ý</label>
                    <select
                      value={styling.relatedPostsCount ?? 3}
                      onChange={(e) => onChangeStyling({ ...styling, relatedPostsCount: parseInt(e.target.value, 10) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value={3}>3 Bài Viết (Chuẩn Đẹp Nhất)</option>
                      <option value={4}>4 Bài Viết</option>
                      <option value={6}>6 Bài Viết (2 Hàng)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Số Cột Hiển Thị</label>
                    <select
                      value={styling.relatedPostsColumns ?? 3}
                      onChange={(e) => onChangeStyling({ ...styling, relatedPostsColumns: parseInt(e.target.value, 10) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value={3}>3 Cột (Khuyên Dùng)</option>
                      <option value={4}>4 Cột</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Nguồn Lấy Bài Viết Gợi Ý</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => onChangeStyling({ ...styling, relatedPostsSource: 'category' })}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                        (styling.relatedPostsSource || 'category') === 'category'
                          ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="relatedSource"
                        checked={(styling.relatedPostsSource || 'category') === 'category'}
                        onChange={() => {}}
                        className="accent-blue-600"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">Ưu Tiên Cùng Chuyên Mục (Category)</div>
                        <div className="text-[11px] text-slate-500">Tự lấy các bài cùng chủ đề. Nếu thiếu sẽ bổ sung bài mới nhất.</div>
                      </div>
                    </label>
                    <label
                      onClick={() => onChangeStyling({ ...styling, relatedPostsSource: 'recent' })}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                        styling.relatedPostsSource === 'recent'
                          ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="relatedSource"
                        checked={styling.relatedPostsSource === 'recent'}
                        onChange={() => {}}
                        className="accent-blue-600"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">Bài Viết Mới Nhất (Recent Posts)</div>
                        <div className="text-[11px] text-slate-500">Lấy các bài viết mới đăng tải gần đây nhất trên website.</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Cấu Hình Thanh Bên Phải (Right Sidebar) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">3. Tiện Ích Cột Bên Phải (Right Sidebar Widgets)</h3>
                  <p className="text-xs text-slate-500">
                    Cấu hình các tiện ích hiển thị ở Sidebar bên phải khi đọc bài viết (Gợi ý đọc nhiều, Banner khuyến mãi VIP).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={styling.sidebarSticky ?? true}
                    onChange={(e) => onChangeStyling({ ...styling, sidebarSticky: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                  />
                  <span>Ghim Cố Định (Sticky)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  <input
                    type="checkbox"
                    checked={styling.sidebarCleanOnly ?? true}
                    onChange={(e) => onChangeStyling({ ...styling, sidebarCleanOnly: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <span>Chế Độ Sidebar VIP Tinh Gọn</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Widget 1: Bài Viết Đọc Nhiều Ở Sidebar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="text-amber-500">🔥</span>
                    <span>Widget Bài Viết Gợi Ý / Đọc Nhiều</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={styling.sidebarSuggestedPostsEnabled ?? true}
                    onChange={(e) => onChangeStyling({ ...styling, sidebarSuggestedPostsEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                  />
                </div>
                {(styling.sidebarSuggestedPostsEnabled ?? true) && (
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Tiêu Đề Widget Sidebar</label>
                      <input
                        type="text"
                        value={styling.sidebarSuggestedPostsTitle ?? 'Artículos Recomendados'}
                        onChange={(e) => onChangeStyling({ ...styling, sidebarSuggestedPostsTitle: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        placeholder="Artículos Recomendados / Bài Viết Nổi Bật"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Số Lượng Bài Ở Cột Phải</label>
                      <select
                        value={styling.sidebarSuggestedPostsCount ?? 5}
                        onChange={(e) => onChangeStyling({ ...styling, sidebarSuggestedPostsCount: parseInt(e.target.value, 10) })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold text-slate-800"
                      >
                        <option value={4}>4 Bài Viết</option>
                        <option value={5}>5 Bài Viết (Chuẩn Tỷ Lệ)</option>
                        <option value={6}>6 Bài Viết</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Widget 2: Box CTA Khuyến Mãi Ở Sidebar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="text-emerald-500">🎁</span>
                    <span>Widget Banner Khuyến Mãi / CTA</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={styling.sidebarCtaEnabled ?? true}
                    onChange={(e) => onChangeStyling({ ...styling, sidebarCtaEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                  />
                </div>
                {(styling.sidebarCtaEnabled ?? true) && (
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Tiêu Đề Khuyến Mãi</label>
                      <input
                        type="text"
                        value={styling.sidebarCtaTitle ?? 'Bono Exclusivo 100%'}
                        onChange={(e) => onChangeStyling({ ...styling, sidebarCtaTitle: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        placeholder="Bono Exclusivo 100% / Ưu Đãi VIP"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Mô Tả Ngắn</label>
                      <input
                        type="text"
                        value={styling.sidebarCtaDesc ?? 'Regístrate hoy y duplica tu primer depósito en JuegaLotto.'}
                        onChange={(e) => onChangeStyling({ ...styling, sidebarCtaDesc: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
                        placeholder="Mô tả ưu đãi hấp dẫn"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Chữ Nút</label>
                        <input
                          type="text"
                          value={styling.sidebarCtaBtnText ?? 'REGÍSTRATE AHORA'}
                          onChange={(e) => onChangeStyling({ ...styling, sidebarCtaBtnText: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Link Nút</label>
                        <input
                          type="text"
                          value={styling.sidebarCtaBtnLink ?? '#register'}
                          onChange={(e) => onChangeStyling({ ...styling, sidebarCtaBtnLink: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Khung Tác Giả Bài Viết (Author Box & Tiêu Chuẩn E-E-A-T Google) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">4. Khung Tác Giả Bài Viết (Author Box &amp; Chuẩn E-E-A-T Google)</h3>
                  <p className="text-xs text-slate-500">
                    Hiển thị chân dung tác giả, danh xưng chuyên môn và đường dẫn bài viết ở cuối mỗi bài đọc, giúp tăng độ uy tín với thuật toán Google.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition">
                <input
                  type="checkbox"
                  checked={styling.postAuthorBoxEnabled ?? true}
                  onChange={(e) => onChangeStyling({ ...styling, postAuthorBoxEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                />
                <span className="font-bold text-amber-900">Bật Khung Tác Giả Cuối Bài</span>
              </label>
            </div>

            {(styling.postAuthorBoxEnabled ?? true) && (
              <div className="space-y-4">
                {/* Visual Preview Box (Mô Phỏng Trực Quan Khung Tác Giả) */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0b0f19] to-[#040817] border border-amber-500/30 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-sky-400"></div>
                  <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                    <div className="flex flex-col items-center gap-1.5 shrink-0 mx-auto sm:mx-0">
                      <div
                        onClick={() => setIsMediaModalOpen(true)}
                        className="relative group cursor-pointer"
                        title="Bấm vào đây để mở Thư viện Media WordPress hoặc tải ảnh mới"
                      >
                        <img
                          src={styling.postAuthorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                          alt={styling.postAuthorName || 'Carlos Mendoza'}
                          className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 shadow-md bg-slate-800 transition duration-200 group-hover:brightness-75 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
                          }}
                        />
                        <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 bg-black/60 text-white text-[10px] font-bold pointer-events-none">
                          <ImageIcon className="w-5 h-5 text-amber-400 mb-0.5" />
                          <span>Mở Media</span>
                        </div>
                        <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center border-2 border-slate-900 shadow-sm" title="Tác giả uy tín">
                          ✓
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMediaModalOpen(true)}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Chọn Ảnh Media</span>
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full mb-1">
                            {styling.postAuthorBadge || 'Autor Verificado'}
                          </span>
                          <h4 className="text-base font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
                            <span>{styling.postAuthorName || 'Carlos Mendoza'}</span>
                            <span className="text-[11px] font-normal text-slate-400">
                              ({styling.postAuthorName ? 'Tác giả tùy chỉnh' : 'Tự lấy tên tác giả WordPress'})
                            </span>
                          </h4>
                          <p className="text-xs text-sky-400 font-semibold">
                            {styling.postAuthorRole || 'Chuyên Gia Đánh Giá & Phân Tích Casino'}
                          </p>
                        </div>

                        <div className="mx-auto sm:mx-0">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-bold shadow-2xs hover:bg-sky-500/20 transition cursor-pointer">
                            <span>Ver Todos Los Artículos</span>
                            <span>➔</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-white/10">
                        {styling.postAuthorBio ||
                          'Chuyên gia nghiên cứu thuật toán trò chơi RNG, phân tích tỷ lệ hoàn trả RTP và giấy phép cá cược trực tuyến. Cam kết đánh giá khách quan và chơi có trách nhiệm.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thông báo tải ảnh avatar */}
                {avatarUploadSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Đã tải ảnh đại diện tác giả lên WordPress Media thành công!</span>
                  </div>
                )}
                {avatarUploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{avatarUploadError}</span>
                  </div>
                )}

                {/* Các Trường Nhập Cấu Hình Tác Giả */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Tên Tác Giả / Bút Danh
                    </label>
                    <input
                      type="text"
                      value={styling.postAuthorName ?? ''}
                      onChange={(e) => onChangeStyling({ ...styling, postAuthorName: e.target.value })}
                      placeholder="Để trống = Tự lấy tên tác giả bài viết"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Nếu để trống, sẽ tự động lấy tên tác giả của bài viết trên WordPress.
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Chức Danh / Chuyên Môn
                    </label>
                    <input
                      type="text"
                      value={styling.postAuthorRole ?? 'Chuyên Gia Đánh Giá & Phân Tích Casino'}
                      onChange={(e) => onChangeStyling({ ...styling, postAuthorRole: e.target.value })}
                      placeholder="Chuyên Gia Đánh Giá & Phân Tích Casino"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Danh xưng nghề nghiệp hiển thị dưới tên tác giả.
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Huy Hiệu Xác Minh (E-E-A-T)
                    </label>
                    <input
                      type="text"
                      value={styling.postAuthorBadge ?? 'Autor Verificado'}
                      onChange={(e) => onChangeStyling({ ...styling, postAuthorBadge: e.target.value })}
                      placeholder="Autor Verificado / Tác Giả Uy Tín"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Nhãn nhỏ trên cùng (vd: Autor Verificado, Chuyên Gia SEO).
                    </span>
                  </div>

                  {/* Ảnh đại diện Avatar với Upload & Mẫu có sẵn */}
                  <div className="sm:col-span-2 lg:col-span-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-blue-600" />
                        <label className="text-xs font-bold text-slate-800">
                          Ảnh Đại Diện Tác Giả (Avatar)
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          ref={avatarFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => avatarFileInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isUploadingAvatar ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Đang Tải Lên...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Tải Ảnh Từ Máy Tính</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsMediaModalOpen(true)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>Chọn Từ Media</span>
                        </button>
                        {styling.postAuthorAvatar && (
                          <button
                            type="button"
                            onClick={() => onChangeStyling({ ...styling, postAuthorAvatar: '' })}
                            className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                            title="Xóa link ảnh tùy chỉnh để quay về avatar mặc định"
                          >
                            Quay Về Mặc Định
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={styling.postAuthorAvatar ?? ''}
                        onChange={(e) => onChangeStyling({ ...styling, postAuthorAvatar: e.target.value })}
                        placeholder="https://... (dán link ảnh trực tiếp hoặc bấm nút 'Tải Ảnh Từ Máy Tính')"
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Mẫu Avatar Chân Dung Tuyển Chọn (1-Click Chọn Ngay) */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Mẫu Avatar Chân Dung Có Sẵn (Bấm 1-Click Để Chọn Nhanh):</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {authorAvatarPresets.map((preset, idx) => {
                          const isSelected = styling.postAuthorAvatar === preset.url || (!styling.postAuthorAvatar && idx === 0);
                          return (
                            <div
                              key={idx}
                              onClick={() => onChangeStyling({ ...styling, postAuthorAvatar: preset.url })}
                              className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                            >
                              <img
                                src={preset.url}
                                alt={preset.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                                  {preset.name}
                                </div>
                                <div className="text-[9px] text-blue-600 font-medium">
                                  {isSelected ? '✓ Đang Dùng' : 'Chọn'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Link Bài Viết / Trang Tác Giả (Author Link)
                    </label>
                    <input
                      type="text"
                      value={styling.postAuthorLink ?? ''}
                      onChange={(e) => onChangeStyling({ ...styling, postAuthorLink: e.target.value })}
                      placeholder="https://juegalotto365.com/author/... (hoặc để trống tự động lấy link tác giả WP)"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 placeholder:text-slate-400"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Link khi người đọc bấm vào tên tác giả hoặc nút "Ver Todos Los Artículos".
                    </span>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Tiểu Sử Ngắn &amp; Kinh Nghiệm Chuyên Môn (Bio E-E-A-T)
                    </label>
                    <textarea
                      rows={2}
                      value={styling.postAuthorBio ?? ''}
                      onChange={(e) => onChangeStyling({ ...styling, postAuthorBio: e.target.value })}
                      placeholder="Để trống sẽ tự động lấy từ Tiểu sử (Biographical Info) của tài khoản tác giả trên WordPress..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder:text-slate-400"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Giới thiệu ngắn gọn 1-2 câu về kinh nghiệm để tăng điểm chất lượng nội dung E-E-A-T trong mắt Google.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Nút Chia Sẻ Mạng Xã Hội (Social Share Icons) & Chân Bài Viết */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">5. Nút Chia Sẻ Mạng Xã Hội (Social Share Icons) &amp; Chân Bài Viết</h3>
                  <p className="text-xs text-slate-500">
                    Cấu hình dãy nút chia sẻ Facebook, Twitter (X), Telegram, WhatsApp, LinkedIn... và các điều hướng dưới chân bài viết.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={styling.postShareEnabled ?? true}
                  onChange={(e) => onChangeStyling({ ...styling, postShareEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <span>Bật Nút Chia Sẻ (Share Icons)</span>
              </label>
            </div>

            {(styling.postShareEnabled ?? true) && (
              <div className="space-y-4">
                {/* Visual Preview Box (Mô Phỏng Trực Quan) */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#0a1128] to-[#040817] border border-blue-900/40 text-center space-y-3">
                  <div className="text-[11px] font-bold text-sky-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <span>✨</span>
                    <span>{styling.postShareTitle || 'Compartir este artículo'}</span>
                    <span>✨</span>
                  </div>
                  <div className="h-px bg-white/10 max-w-xs mx-auto"></div>
                  <div className={`flex items-center gap-2.5 flex-wrap justify-${styling.postShareAlign === 'left' ? 'start' : styling.postShareAlign === 'right' ? 'end' : 'center'}`}>
                    {(styling.postShareNetworks || ['facebook', 'twitter', 'whatsapp', 'telegram', 'email', 'pinterest', 'linkedin']).map((net) => {
                      const iconsMap: Record<string, { label: string; icon: string; bg: string }> = {
                        facebook: { label: 'Facebook', icon: 'f', bg: 'hover:border-blue-500 hover:text-blue-400' },
                        twitter: { label: 'Twitter / X', icon: '𝕏', bg: 'hover:border-slate-300 hover:text-white' },
                        whatsapp: { label: 'WhatsApp', icon: '💬', bg: 'hover:border-emerald-500 hover:text-emerald-400' },
                        telegram: { label: 'Telegram', icon: '✈', bg: 'hover:border-sky-400 hover:text-sky-300' },
                        email: { label: 'Email', icon: '✉', bg: 'hover:border-amber-400 hover:text-amber-300' },
                        pinterest: { label: 'Pinterest', icon: 'p', bg: 'hover:border-red-500 hover:text-red-400' },
                        linkedin: { label: 'LinkedIn', icon: 'in', bg: 'hover:border-blue-600 hover:text-blue-400' },
                      };
                      const item = iconsMap[net] || { label: net, icon: '🔗', bg: '' };
                      const isOutline = (styling.postShareStyle || 'outline') === 'outline';
                      const isFill = styling.postShareStyle === 'fill';

                      return (
                        <div
                          key={net}
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition duration-200 cursor-pointer ${
                            isOutline
                              ? 'border-2 border-white/30 text-white hover:border-sky-400 hover:scale-110 shadow-sm'
                              : isFill
                              ? 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-110 shadow-md'
                              : 'text-slate-300 hover:text-white hover:scale-110'
                          } ${item.bg}`}
                          title={`Chia sẻ lên ${item.label}`}
                        >
                          {item.icon}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Xem trước thực tế các nút chia sẻ sẽ xuất hiện ngay dưới chân mỗi bài viết chi tiết của bạn.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cấu Hình Tiêu Đề & Kiểu Dáng */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Tiêu Đề Dòng Chia Sẻ</label>
                      <input
                        type="text"
                        value={styling.postShareTitle ?? 'Compartir este artículo'}
                        onChange={(e) => onChangeStyling({ ...styling, postShareTitle: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        placeholder="Compartir este artículo / Chia sẻ bài viết này"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Kiểu Dáng Nút (Style)</label>
                      <div className="grid grid-cols-3 gap-2">
                        <label
                          onClick={() => onChangeStyling({ ...styling, postShareStyle: 'outline' })}
                          className={`p-2 rounded-lg border text-center cursor-pointer transition ${
                            (styling.postShareStyle || 'outline') === 'outline'
                              ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 text-xs'
                          }`}
                        >
                          <div className="text-xs font-bold">Viền Tròn</div>
                          <div className="text-[10px] text-slate-400">(Outline - Chuẩn)</div>
                        </label>
                        <label
                          onClick={() => onChangeStyling({ ...styling, postShareStyle: 'fill' })}
                          className={`p-2 rounded-lg border text-center cursor-pointer transition ${
                            styling.postShareStyle === 'fill'
                              ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 text-xs'
                          }`}
                        >
                          <div className="text-xs font-bold">Nền Đặc</div>
                          <div className="text-[10px] text-slate-400">(Fill)</div>
                        </label>
                        <label
                          onClick={() => onChangeStyling({ ...styling, postShareStyle: 'plain' })}
                          className={`p-2 rounded-lg border text-center cursor-pointer transition ${
                            styling.postShareStyle === 'plain'
                              ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 text-xs'
                          }`}
                        >
                          <div className="text-xs font-bold">Tối Giản</div>
                          <div className="text-[10px] text-slate-400">(Plain)</div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Vị Trí Căn Lề</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <label
                            key={align}
                            onClick={() => onChangeStyling({ ...styling, postShareAlign: align })}
                            className={`p-2 rounded-lg border text-center cursor-pointer transition ${
                              (styling.postShareAlign || 'center') === align
                                ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 text-xs'
                            }`}
                          >
                            <span className="text-xs font-bold capitalize">
                              {align === 'center' ? 'Căn Giữa' : align === 'left' ? 'Căn Trái' : 'Căn Phải'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Chọn Mạng Xã Hội Hiển Thị */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Các Kênh Mạng Xã Hội Bật Chia Sẻ
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Bấm vào từng mạng xã hội dưới đây để bật hoặc tắt theo nhu cầu website của bạn:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'facebook', name: 'Facebook', icon: 'f', color: 'bg-blue-600' },
                        { id: 'twitter', name: 'Twitter / X', icon: '𝕏', color: 'bg-slate-900' },
                        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'bg-emerald-600' },
                        { id: 'telegram', name: 'Telegram', icon: '✈', color: 'bg-sky-500' },
                        { id: 'email', name: 'Email', icon: '✉', color: 'bg-amber-600' },
                        { id: 'pinterest', name: 'Pinterest', icon: 'p', color: 'bg-red-600' },
                        { id: 'linkedin', name: 'LinkedIn', icon: 'in', color: 'bg-blue-700' },
                      ].map((item) => {
                        const activeList = styling.postShareNetworks || [
                          'facebook',
                          'twitter',
                          'whatsapp',
                          'telegram',
                          'email',
                          'pinterest',
                          'linkedin',
                        ];
                        const isActive = activeList.includes(item.id);

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const newList = isActive
                                ? activeList.filter((x) => x !== item.id)
                                : [...activeList, item.id];
                              onChangeStyling({ ...styling, postShareNetworks: newList });
                            }}
                            className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition text-left ${
                              isActive
                                ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                                : 'bg-slate-100 border-slate-200 opacity-50 hover:opacity-80'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${item.color}`}
                            >
                              {item.icon}
                            </span>
                            <span className="text-xs font-semibold text-slate-800">{item.name}</span>
                            {isActive && <Check className="w-3.5 h-3.5 text-blue-600 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tiện Ích Chân Bài Viết Đi Kèm */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between flex-wrap gap-3">
                  <div className="text-xs font-bold text-slate-800">Các Thành Phần Khác Ở Chân Bài Viết:</div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={styling.postAuthorBoxEnabled ?? false}
                        onChange={(e) => onChangeStyling({ ...styling, postAuthorBoxEnabled: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span>Khung Tác Giả (Author Box)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={styling.postNavEnabled ?? true}
                        onChange={(e) => onChangeStyling({ ...styling, postNavEnabled: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span>Nút Bài Trước / Sau (Next/Prev Nav)</span>
                    </label>
                    <label
                      className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700"
                      title="Dòng chữ mặc định của WordPress: 'This entry was posted in... Bookmark the permalink'. Nên tắt để website hiện đại và chuẩn SEO."
                    >
                      <input
                        type="checkbox"
                        checked={styling.postFooterMetaEnabled ?? false}
                        onChange={(e) => onChangeStyling({ ...styling, postFooterMetaEnabled: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span>Dòng Chữ Cũ ("This entry was posted...")</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Tiêu Đề Chuyên Mục & Trang Lưu Trữ (Category / Archive Cleaner) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                  <FolderCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">6. Tiêu Đề Chuyên Mục &amp; Lưu Trữ (Category / Archive Cleaner)</h3>
                  <p className="text-xs text-slate-500">
                    Tự động xóa sạch tiền tố mặc định <code className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-mono font-semibold">Category Archives:</code> và link chuyên mục nhỏ <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono font-semibold">GUÍAS</code> lặp lại trên từng bài viết.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-xl transition">
                  <input
                    type="checkbox"
                    checked={styling.stripArchiveTitlePrefix ?? true}
                    onChange={(e) => onChangeStyling({ ...styling, stripArchiveTitlePrefix: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-emerald-800">Xóa "Category Archives:"</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 px-3 py-1.5 rounded-xl transition">
                  <input
                    type="checkbox"
                    checked={styling.hideArchiveCategoryBadge ?? true}
                    onChange={(e) => onChangeStyling({ ...styling, hideArchiveCategoryBadge: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-indigo-800">Xóa Link Chuyên Mục Nhỏ ("Guías")</span>
                </label>
              </div>
            </div>

            {/* So sánh trước và sau */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-red-50/50 border border-red-200/80 rounded-xl space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-red-600 flex items-center gap-1">
                  <span>✕ Giao diện cũ mặc định Flatsome</span>
                </div>
                <div className="font-mono text-xs text-slate-700 font-bold line-through decoration-red-500 decoration-2">
                  CATEGORY ARCHIVES: GUÍAS
                </div>
                <div className="font-mono text-[11px] text-red-700/80 line-through">
                  • GUÍAS (link nhỏ lặp lại trên mọi bài viết)
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Chữ "Category Archives:" và link chuyên mục nhỏ chiếm chỗ thô kệch, rườm rà trên từng thẻ bài viết.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-emerald-600 flex items-center gap-1">
                  <span>✓ Sau khi bật AutoWeb Cleaner</span>
                </div>
                <div className="font-mono text-xs text-emerald-700 font-extrabold flex items-center gap-1.5">
                  <span>GUÍAS</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded font-sans font-bold uppercase">Chuẩn SEO</span>
                </div>
                <div className="text-[11px] text-emerald-800 font-medium">
                  ✓ Thẻ bài viết sạch sẽ, hiện đại (loại bỏ sạch link Guías nhỏ)
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tiêu đề chuyên mục chỉ hiển thị tên danh mục ngắn gọn, hiện đại và loại bỏ hoàn toàn link chuyên mục nhỏ khỏi DOM HTML.
                </p>
              </div>
            </div>

            {/* Action Banner to deploy the PHP code to WordPress */}
            <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-blue-900 max-w-xl">
                <span className="font-bold flex items-center gap-1.5 text-blue-950 mb-0.5">
                  <span>⚡</span> Đẩy mã nguồn PHP xử lý trực tiếp lên website WordPress
                </span>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Tính năng này xử lý trực tiếp ở tầng backend PHP Flatsome (xóa sạch node text "Category Archives:", không dùng CSS ẩn). Nhấp nút bên cạnh để nén và đồng bộ file plugin PHP mới lên website ngay:
                </p>
              </div>
              {onAutoInstallPlugin && (
                <button
                  type="button"
                  onClick={onAutoInstallPlugin}
                  disabled={isAutoInstallingPlugin}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isAutoInstallingPlugin ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang Đẩy Plugin PHP...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>📦 Cập Nhật Plugin Lên Web Ngay</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Section 7: Điều Hướng Phân Cấp Rank Math (SEO Breadcrumbs) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">7. Điều Hướng Phân Cấp Rank Math (SEO Breadcrumbs)</h3>
                  <p className="text-xs text-slate-500">
                    Tự động kết nối hàm <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono font-semibold">rank_math_the_breadcrumbs()</code> và shortcode Rank Math vào giao diện Flatsome chuẩn SEO.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-xl transition">
                <input
                  type="checkbox"
                  checked={styling.breadcrumbsEnabled ?? true}
                  onChange={(e) => onChangeStyling({ ...styling, breadcrumbsEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-emerald-800">Bật Breadcrumbs Rank Math</span>
              </label>
            </div>

            {/* Checkbox chi tiết vị trí */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={styling.breadcrumbsOnPosts ?? true}
                  onChange={(e) => onChangeStyling({ ...styling, breadcrumbsOnPosts: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">Trang Bài Viết (Post)</div>
                  <div className="text-[11px] text-slate-500">Hiển thị trên từng bài viết</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={styling.breadcrumbsOnCategories ?? true}
                  onChange={(e) => onChangeStyling({ ...styling, breadcrumbsOnCategories: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">Chuyên Mục &amp; Lưu Trữ</div>
                  <div className="text-[11px] text-slate-500">Category, Tag, Archive</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={styling.breadcrumbsOnPages ?? false}
                  onChange={(e) => onChangeStyling({ ...styling, breadcrumbsOnPages: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">Trang Tĩnh (Pages)</div>
                  <div className="text-[11px] text-slate-500">Giới thiệu, liên hệ...</div>
                </div>
              </label>
            </div>

            {/* Live Breadcrumb Preview Box */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                <span>MÔ PHỎNG HIỂN THỊ BREADCRUMBS RANK MATH:</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/60 font-mono font-bold">
                  Google Schema BreadcrumbList
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-2 text-xs font-medium">
                <span className="text-sky-400 hover:underline cursor-pointer">Inicio</span>
                <span className="text-slate-500 text-[11px]">-</span>
                <span className="text-sky-400 hover:underline cursor-pointer">Guías</span>
                <span className="text-slate-500 text-[11px]">-</span>
                <span className="text-slate-300 font-semibold truncate max-w-xs">
                  Top Slots Mayor RTP Mexico (2026)
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl space-y-1">
              <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                <span>💡</span> Gắn tự động không cần can thiệp file theme:
              </div>
              <p className="text-slate-600 leading-relaxed">
                Rank Math yêu cầu chèn code PHP <code className="bg-emerald-100 text-emerald-900 px-1 rounded font-semibold font-mono">&lt;?php if (function_exists('rank_math_the_breadcrumbs')) rank_math_the_breadcrumbs(); ?&gt;</code> vào theme. Flatsome SEO Bridge đã tự động móc vào hook Flatsome chuẩn để hiển thị đẹp mắt, tự động áp bảng màu Dark/Light Mode và tạo cấu trúc dữ liệu Schema cho Google!
              </p>
            </div>
          </div>

          {/* Quick Publish Action Banner inside Tab 3 */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-md">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-emerald-400" />
                <span>Hoàn Tất Tùy Chỉnh Bài Viết &amp; Cột Phải?</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Bấm nút bên cạnh để xuất bản ngay toàn bộ thiết lập lên website WordPress mà không cần cuộn trang.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveToWordPress}
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Lưu...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Xuất Bản Style Lên Web</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: LIVE PREVIEW (MÔ PHỎNG THỰC TẾ TRANG & BÀI VIẾT)        */}
      {/* ============================================================== */}
      {activeTab === 'preview' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-6">
          {/* Mock Browser Header Bar with Mode Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-slate-400 font-mono ml-2">
                {previewMode === 'post'
                  ? 'juegalotto365.com/top-slots-mayor-rtp-mexico/'
                  : 'juegalotto365.com/apuestas-deportivas/'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode('post')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  previewMode === 'post'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>📰 Bài Viết (Post &amp; Cột Phải)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('page')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  previewMode === 'page'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>📄 Trang Con (Page)</span>
              </button>
            </div>
          </div>

          {/* Subpage Content Container */}
          <div
            className="mx-auto transition-colors duration-300 p-4 sm:p-6 rounded-2xl"
            style={{
              maxWidth: styling.contentMaxWidth || '1080px',
              backgroundColor: styling.pageBgColor && styling.pageBgColor !== 'transparent' ? styling.pageBgColor : 'transparent',
            }}
          >
            {previewMode === 'post' ? (
              /* POST MODE: Grid with Content (9 cols) + Right Sidebar (3 cols) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className={`${(styling.postLayout || 'right-sidebar') === 'right-sidebar' ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-5`}>
                  {/* Category & Date */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="text-amber-400 font-bold uppercase tracking-wider">GUÍAS</span>
                    <span>•</span>
                    <span>POSTED ON 03 OCTUBRE, 2026 BY JUEGA365</span>
                  </div>

                  {/* H1 Title */}
                  <h1
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug"
                    style={{ color: styling.heading1Color }}
                  >
                    Slots Mayor RTP Mexico (2026): Tragamonedas que Más Pagan en JuegaLotto #1
                  </h1>

                  {/* Badges */}
                  <div className="flex items-center flex-wrap gap-2 pt-1">
                    <span className="autoweb-badge badge-gold" style={{ borderColor: styling.badgeBorderColor, backgroundColor: styling.badgeBgColor }}>
                      JUEGALOTTO
                    </span>
                    <span className="autoweb-badge badge-blue" style={{ borderColor: '#38bdf8', backgroundColor: styling.badgeBgColor }}>
                      🎰 TOP SLOTS MAYOR RTP
                    </span>
                    <span className="autoweb-badge badge-green" style={{ borderColor: '#10b981', backgroundColor: styling.badgeBgColor }}>
                      MX MÉXICO 2026 - SEGOB
                    </span>
                  </div>

                  {/* Featured Image Mockup */}
                  <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-900 flex items-center justify-center relative shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                    <div className="text-center z-20 p-4">
                      <div className="text-amber-400 font-black text-xl tracking-wider">TOP 5 SLOTS WITH HIGHEST RTP</div>
                      <div className="text-slate-300 text-xs mt-1">JuegaLotto México Oficial • Licencia SEGOB Federal</div>
                    </div>
                  </div>

                  {/* Table of Contents */}
                  <div
                    className="autoweb-toc"
                    style={{
                      backgroundColor: styling.tocBgColor,
                      borderColor: styling.tocBorderColor,
                      borderRadius: styling.tocRadius,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold tracking-wide" style={{ color: styling.tocTitleColor }}>
                        Table of Contents
                      </span>
                      <span className="text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        ☰ Thu gọn
                      </span>
                    </div>
                    <ul className="mt-2.5 space-y-1 text-xs list-disc list-inside">
                      <li><a href="#rtp" style={{ color: styling.tocLinkColor }}>1. RTP là gì và tại sao người chơi cần chú ý?</a></li>
                      <li><a href="#top5" style={{ color: styling.tocLinkColor }}>2. Bảng xếp hạng 5 game slot có tỷ lệ hoàn trả cao nhất 2026</a></li>
                      <li><a href="#tips" style={{ color: styling.tocLinkColor }}>3. Kinh nghiệm quản lý vốn khi quay slot nổ hũ</a></li>
                    </ul>
                  </div>

                  {/* Article Text */}
                  <div
                    className="space-y-3.5"
                    style={{
                      color: styling.textColor,
                      fontSize: styling.contentFontSize || '16px',
                      lineHeight: styling.contentLineHeight || '1.75',
                    }}
                  >
                    <p>
                      Tỷ lệ hoàn trả cho người chơi (Return to Player -{' '}
                      <strong style={{ color: styling.boldColor || (styling.themeMode === 'light' ? '#0f172a' : '#fde047') }}>RTP</strong>
                      ) là một trong những chỉ số quan trọng nhất giúp game thủ lựa chọn tựa game slot tối ưu lợi nhuận. Tại nền tảng{' '}
                      <strong style={{ color: styling.boldColor || (styling.themeMode === 'light' ? '#0f172a' : '#fde047') }}>JuegaLotto 365</strong>
                      , tất cả trò chơi đều được cấp phép và kiểm định minh bạch bởi tổ chức quốc tế.
                    </p>

                    {/* Callout Box */}
                    <div
                      className="autoweb-callout callout-gold"
                      style={{
                        borderLeftColor: styling.calloutGoldBorder,
                        backgroundColor: styling.calloutBgColor,
                      }}
                    >
                      <h4 style={{ margin: '0 0 4px 0', color: styling.calloutGoldBorder, fontSize: '14px', fontWeight: 700 }}>
                        💡 Mẹo Chơi Slot Chuyên Nghiệp:
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
                        Hãy luôn chọn những máy xèng có tỷ lệ RTP trên 96.5% để gia tăng xác suất kích hoạt vòng quay miễn phí (Free Spins) và Jackpot nổ hũ.
                      </p>
                    </div>

                    <h2 className="text-xl font-bold pt-3" style={{ color: styling.heading2Color }}>
                      Bảng So Sánh Các Máy Xèng Trả Thưởng Cao Nhất
                    </h2>

                    <p>
                      Dưới đây là thống kê chi tiết tỷ lệ cược và vòng thưởng cho từng máy xèng đang có mặt trên sảnh chơi chính thức của chúng tôi.
                    </p>
                  </div>

                  {/* In-Article CTA Box */}
                  <div className="autoweb-cta-box">
                    <h3 style={{ color: '#ffffff', margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800 }}>
                      {styling.ctaBoxTitle || 'Đăng Ký Nhận Thưởng Ngay'}
                    </h3>
                    <p style={{ color: '#cbd5e1', margin: '0 0 16px 0', fontSize: '13px' }}>
                      {styling.ctaBoxSubtitle || 'Nhận ngay 100% hoàn nạp và hàng trăm vòng quay miễn phí!'}
                    </p>
                    <button
                      type="button"
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg transition cursor-pointer"
                    >
                      {styling.ctaBoxButtonText || 'ĐĂNG KÝ NGAY HÔM NAY'}
                    </button>
                  </div>

                  {/* Author Box Preview (At Bottom of Post Content) */}
                  {(styling.postAuthorBoxEnabled ?? true) && (
                    <div className="autoweb-author-box">
                      <div className="autoweb-author-avatar-wrap">
                        <img
                          src={styling.postAuthorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                          alt={styling.postAuthorName || 'Carlos Mendoza'}
                          className="autoweb-author-avatar"
                        />
                        <span className="autoweb-author-check">✓</span>
                      </div>
                      <div className="autoweb-author-content">
                        <div className="autoweb-author-header">
                          <div className="autoweb-author-title-group">
                            <span className="autoweb-author-badge">{styling.postAuthorBadge || 'Autor Verificado'}</span>
                            <h4 className="autoweb-author-name">
                              <a href="#author">{styling.postAuthorName || 'Carlos Mendoza'}</a>
                            </h4>
                            <span className="autoweb-author-role">{styling.postAuthorRole || 'Chuyên Gia Đánh Giá & Phân Tích Casino'}</span>
                          </div>
                          <span className="autoweb-author-posts-btn">
                            <span>Ver Todos Los Artículos</span>
                            <span>➔</span>
                          </span>
                        </div>
                        <p className="autoweb-author-bio">
                          {styling.postAuthorBio ||
                            'Chuyên gia nghiên cứu thuật toán trò chơi RNG, phân tích tỷ lệ hoàn trả RTP và giấy phép cá cược trực tuyến. Cam kết đánh giá khách quan và chơi có trách nhiệm.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Related Posts Section (At Bottom of Content) */}
                  {(styling.relatedPostsEnabled ?? true) && (
                    <div className="autoweb-related-posts-section">
                      <div className="autoweb-related-header">
                        <span className="autoweb-related-badge">RECOMENDADO</span>
                        <h3 className="autoweb-related-title">
                          <span>★</span>
                          <span>{styling.relatedPostsTitle || 'Artículos Relacionados'}</span>
                        </h3>
                      </div>
                      <div className={`autoweb-related-grid columns-${styling.relatedPostsColumns || 3}`}>
                        {/* Mock Card 1 */}
                        <div className="autoweb-related-card">
                          <div className="autoweb-related-thumb">
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-amber-400">
                              🎰
                            </div>
                            <span className="autoweb-related-category">CASINO</span>
                          </div>
                          <div className="autoweb-related-body">
                            <h4 className="autoweb-related-post-title">
                              Guía Completa para Ganar en la Ruleta en Vivo de JuegaLotto
                            </h4>
                            <div className="autoweb-related-meta">
                              <span className="autoweb-related-date">📅 02 Oct, 2026</span>
                              <span className="autoweb-related-read">Leer ➔</span>
                            </div>
                          </div>
                        </div>

                        {/* Mock Card 2 */}
                        <div className="autoweb-related-card">
                          <div className="autoweb-related-thumb">
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-cyan-400">
                              ⚽
                            </div>
                            <span className="autoweb-related-category">APUESTAS</span>
                          </div>
                          <div className="autoweb-related-body">
                            <h4 className="autoweb-related-post-title">
                              Estrategias de Apuestas Liga MX: Cómo Analizar Momios
                            </h4>
                            <div className="autoweb-related-meta">
                              <span className="autoweb-related-date">📅 01 Oct, 2026</span>
                              <span className="autoweb-related-read">Leer ➔</span>
                            </div>
                          </div>
                        </div>

                        {/* Mock Card 3 */}
                        <div className="autoweb-related-card">
                          <div className="autoweb-related-thumb">
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-emerald-400">
                              🎁
                            </div>
                            <span className="autoweb-related-category">BONOS</span>
                          </div>
                          <div className="autoweb-related-body">
                            <h4 className="autoweb-related-post-title">
                              Códigos Promocionales y Giros Gratis de Octubre 2026
                            </h4>
                            <div className="autoweb-related-meta">
                              <span className="autoweb-related-date">📅 30 Sep, 2026</span>
                              <span className="autoweb-related-read">Leer ➔</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT SIDEBAR (3/12 cols) */}
                {(styling.postLayout || 'right-sidebar') === 'right-sidebar' && (
                  <div className="lg:col-span-4 space-y-5">
                    {/* Sidebar Widget 1: Suggested Posts */}
                    {(styling.sidebarSuggestedPostsEnabled ?? true) && (
                      <div className="autoweb-sidebar-widget autoweb-sidebar-posts">
                        <div className="autoweb-sidebar-widget-title">
                          <span>🔥</span>
                          <span>{styling.sidebarSuggestedPostsTitle || 'Artículos Recomendados'}</span>
                        </div>
                        <div className="autoweb-sidebar-posts-list">
                          {[
                            { title: 'Top 10 Tragamonedas con Bote Progresivo', date: '04 Oct, 2026', icon: '💎' },
                            { title: 'Cómo Descargar la App Oficial en Android e iOS', date: '03 Oct, 2026', icon: '📱' },
                            { title: 'Métodos de Retiro Rápido SPEI y OXXO en México', date: '01 Oct, 2026', icon: '💳' },
                            { title: 'Términos y Condiciones del Bono de Bienvenida', date: '28 Sep, 2026', icon: '📜' },
                          ].map((item, idx) => (
                            <div key={idx} className="autoweb-sidebar-post-item">
                              <div className="autoweb-sidebar-post-thumb flex items-center justify-center text-lg bg-slate-800">
                                {item.icon}
                              </div>
                              <div className="autoweb-sidebar-post-info">
                                <h5 className="autoweb-sidebar-post-title">{item.title}</h5>
                                <span className="autoweb-sidebar-post-date">📅 {item.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sidebar Widget 2: CTA Box */}
                    {(styling.sidebarCtaEnabled ?? true) && (
                      <div className="autoweb-sidebar-widget autoweb-sidebar-cta">
                        <div className="autoweb-cta-badge">OFERTA VIP</div>
                        <h4 className="autoweb-cta-sidebar-title">{styling.sidebarCtaTitle || 'Bono Exclusivo 100%'}</h4>
                        <p className="autoweb-cta-sidebar-desc">
                          {styling.sidebarCtaDesc || 'Regístrate hoy y duplica tu primer depósito en JuegaLotto.'}
                        </p>
                        <button
                          type="button"
                          className="button autoweb-cta-sidebar-btn cursor-pointer"
                        >
                          {styling.sidebarCtaBtnText || 'REGÍSTRATE AHORA'} ➔
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* PAGE MODE: Standard Centered Content Area */
              <div className="space-y-5">
                {/* Table of Contents */}
                <div
                  className="autoweb-toc"
                  style={{
                    backgroundColor: styling.tocBgColor,
                    borderColor: styling.tocBorderColor,
                    borderRadius: styling.tocRadius,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold tracking-wide" style={{ color: styling.tocTitleColor }}>
                      Table of Contents
                    </span>
                    <span className="text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      ☰ Thu gọn
                    </span>
                  </div>
                  <ul className="mt-2.5 space-y-1 text-xs list-disc list-inside">
                    <li><a href="#section1" style={{ color: styling.tocLinkColor }}>1. Giới thiệu kèo cược Liga MX 2026</a></li>
                    <li><a href="#section2" style={{ color: styling.tocLinkColor }}>2. Tỷ lệ cược momios tốt nhất tại Mexico</a></li>
                    <li><a href="#section3" style={{ color: styling.tocLinkColor }}>3. Hướng dẫn nạp rút và nhận khuyến mãi</a></li>
                  </ul>
                </div>

                {/* H1 Title */}
                <h1
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug"
                  style={{ color: styling.heading1Color }}
                >
                  Apuestas Deportivas en México con los Mejores Momios de la Liga MX 2026
                </h1>

                {/* Meta Badges */}
                <div className="flex items-center flex-wrap gap-2 pt-1">
                  <span className="autoweb-badge badge-gold" style={{ borderColor: styling.badgeBorderColor, backgroundColor: styling.badgeBgColor }}>
                    JUEGALOTTO
                  </span>
                  <span className="autoweb-badge badge-blue" style={{ borderColor: '#38bdf8', backgroundColor: styling.badgeBgColor }}>
                    ⚽ APUESTAS DEPORTIVAS
                  </span>
                  <span className="autoweb-badge badge-green" style={{ borderColor: '#10b981', backgroundColor: styling.badgeBgColor }}>
                    MX MÉXICO 2026 - SEGOB
                  </span>
                </div>

                {/* Sample Paragraphs */}
                <div
                  className="space-y-3.5 pt-2"
                  style={{
                    color: styling.textColor,
                    fontSize: styling.contentFontSize || '16px',
                    lineHeight: styling.contentLineHeight || '1.75',
                  }}
                >
                  <p>
                    Chào mừng bạn đến với chuyên mục cá cược thể thao trực tuyến chính thức của{' '}
                    <strong style={{ color: styling.boldColor || (styling.themeMode === 'light' ? '#0f172a' : '#fde047') }}>JuegaLotto 365</strong>
                    . Tại đây bạn có thể dễ dàng theo dõi trực tiếp các trận đấu đỉnh cao của giải Vô địch Quốc gia Mexico (Liga MX), Premier League và Cúp C1 Châu Âu với tỷ lệ cược cập nhật liên tục.
                  </p>

                  <div
                    className="autoweb-callout callout-gold"
                    style={{
                      borderLeftColor: styling.calloutGoldBorder,
                      backgroundColor: styling.calloutBgColor,
                    }}
                  >
                    <h4 style={{ margin: '0 0 4px 0', color: styling.calloutGoldBorder, fontSize: '14px', fontWeight: 700 }}>
                      💡 Mẹo Đặt Kèo:
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
                      Đừng bỏ lỡ các trận cầu tâm điểm cuối tuần để nhận thêm 20% tiền thưởng cược xiên (Combo Boost). Xem chi tiết tại <a href="#promos" style={{ color: styling.linkColor }}>Trang Khuyến Mãi Thể Thao</a>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Save Notification Banner */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
          {currentSite?.siteUrl && (
            <a
              href={currentSite.siteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 hover:underline font-bold text-[11px] shrink-0"
            >
              Xem Web Ngay ➔
            </a>
          )}
        </div>
      )}
      {saveError && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Navigation & Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 flex-wrap gap-3">
        <button
          type="button"
          onClick={onPrevStep}
          className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition cursor-pointer shadow-2xs"
        >
          ❮ Quay lại Bước 6 (Trang Chủ)
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveToWordPress}
            disabled={isSaving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-emerald-500/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang Lưu...</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>Xuất Bản Style Lên Web</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onNextStep}
            className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <span>Tiếp tục: Bước 8 (Mẫu Footer) ❯</span>
          </button>
        </div>
      </div>

      {/* WordPress Media Picker Modal */}
      {isMediaModalOpen && (
        <WpMediaPickerModal
          isOpen={isMediaModalOpen}
          onClose={() => setIsMediaModalOpen(false)}
          onSelect={(media: WpMediaItem) => {
            onChangeStyling({
              ...styling,
              postAuthorAvatar: media.url,
            });
            setIsMediaModalOpen(false);
          }}
          currentSite={currentSite}
          title="Chọn Ảnh Đại Diện Tác Giả Từ Thư Viện Media WordPress"
        />
      )}
    </div>
  );
};
