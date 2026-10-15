import React, { useState } from 'react';
import {
  ShoppingBag,
  User,
  Menu as MenuIcon,
  Compass,
  Layers,
  SlidersHorizontal,
  Layout,
  Search,
  Share2,
  Phone,
  MousePointerClick,
  CreditCard,
  Mail,
  Globe,
  Minus,
  Box,
  Code,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Settings,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Sliders,
  ChevronDown,
  Loader2,
  Rocket,
} from 'lucide-react';
import { ThemeConfig, WpInspectData } from '../../types';

export interface HeaderElementDef {
  id: string;
  name: string;
  shortName: string;
  icon: any;
  category: 'nav' | 'cta' | 'shop' | 'search' | 'info' | 'code';
  color: string;
  desc: string;
  hasSettings?: boolean;
}

export const ALL_HEADER_ELEMENTS: HeaderElementDef[] = [
  { id: 'nav', name: 'Main Menu (Menu Chính)', shortName: 'Main Menu', icon: Compass, category: 'nav', color: 'bg-blue-600 text-white', desc: 'Thanh điều hướng trang web chính' },
  { id: 'button-1', name: 'Button 1 (Nút CTA 1)', shortName: 'Button 1', icon: MousePointerClick, category: 'cta', color: 'bg-red-600 text-white', desc: 'Nút Đăng Ký / Mua Hàng', hasSettings: true },
  { id: 'button-2', name: 'Button 2 (Nút CTA 2)', shortName: 'Button 2', icon: MousePointerClick, category: 'cta', color: 'bg-amber-600 text-white', desc: 'Nút Đăng Nhập / Liên Hệ', hasSettings: true },
  { id: 'search', name: 'Search Icon (Icon Kính Lúp)', shortName: 'Search Icon', icon: Search, category: 'search', color: 'bg-sky-600 text-white', desc: 'Icon tìm kiếm popup' },
  { id: 'search-form', name: 'Search Form (Ô Tìm Kiếm)', shortName: 'Search Form', icon: Search, category: 'search', color: 'bg-sky-700 text-white', desc: 'Khung nhập tìm kiếm trực tiếp' },
  { id: 'cart', name: 'Cart (Giỏ Hàng)', shortName: 'Cart', icon: ShoppingBag, category: 'shop', color: 'bg-emerald-600 text-white', desc: 'Giỏ hàng WooCommerce' },
  { id: 'account', name: 'Account (Tài Khoản)', shortName: 'Account', icon: User, category: 'shop', color: 'bg-purple-600 text-white', desc: 'Đăng nhập / Tài khoản' },
  { id: 'contact', name: 'Contact (Thông Tin Liên Hệ)', shortName: 'Contact', icon: Phone, category: 'info', color: 'bg-teal-600 text-white', desc: 'Hotline, Email, Giờ mở cửa', hasSettings: true },
  { id: 'social', name: 'Social Icons (Mạng Xã Hội)', shortName: 'Social Icons', icon: Share2, category: 'info', color: 'bg-pink-600 text-white', desc: 'Icon Facebook, Telegram, Youtube...' },
  { id: 'menu-icon', name: 'Nav Icon (Menu 3 Gạch)', shortName: 'Nav Icon', icon: MenuIcon, category: 'nav', color: 'bg-slate-700 text-white', desc: 'Biểu tượng mở Drawer Mobile' },
  { id: 'nav-secondary', name: 'Secondary Menu (Menu Phụ)', shortName: 'Secondary Menu', icon: Layers, category: 'nav', color: 'bg-indigo-600 text-white', desc: 'Menu phụ Flatsome' },
  { id: 'nav-top', name: 'Top Bar Menu', shortName: 'Top Bar Menu', icon: SlidersHorizontal, category: 'nav', color: 'bg-indigo-700 text-white', desc: 'Menu thanh trên cùng' },
  { id: 'nav-vertical', name: 'Vertical Menu (Menu Dọc)', shortName: 'Vertical Menu', icon: Layout, category: 'nav', color: 'bg-cyan-700 text-white', desc: 'Menu danh mục sổ dọc' },
  { id: 'checkout', name: 'Checkout Button', shortName: 'Checkout Button', icon: CreditCard, category: 'shop', color: 'bg-green-700 text-white', desc: 'Nút thanh toán nhanh' },
  { id: 'newsletter', name: 'Newsletter (Bản Tin)', shortName: 'Newsletter', icon: Mail, category: 'info', color: 'bg-orange-600 text-white', desc: 'Đăng ký nhận email' },
  { id: 'languages', name: 'Languages (Ngôn Ngữ)', shortName: 'Languages', icon: Globe, category: 'info', color: 'bg-blue-500 text-white', desc: 'Chuyển đổi ngôn ngữ' },
  { id: 'divider', name: 'Divider | (Đường Kẻ Dọc 1)', shortName: '|', icon: Minus, category: 'info', color: 'bg-slate-600 text-white', desc: 'Đường kẻ dọc ngăn cách' },
  { id: 'divider_2', name: 'Divider | (Đường Kẻ Dọc 2)', shortName: '|', icon: Minus, category: 'info', color: 'bg-slate-600 text-white', desc: 'Đường kẻ dọc ngăn cách 2' },
  { id: 'divider_3', name: 'Divider | (Đường Kẻ Dọc 3)', shortName: '|', icon: Minus, category: 'info', color: 'bg-slate-600 text-white', desc: 'Đường kẻ dọc ngăn cách 3' },
  { id: 'divider_4', name: 'Divider | (Đường Kẻ Dọc 4)', shortName: '|', icon: Minus, category: 'info', color: 'bg-slate-600 text-white', desc: 'Đường kẻ dọc ngăn cách 4' },
  { id: 'block-1', name: 'Block 1 (UX Block 1)', shortName: 'Block 1', icon: Box, category: 'code', color: 'bg-violet-600 text-white', desc: 'Chèn UX Block 1', hasSettings: true },
  { id: 'block-2', name: 'Block 2 (UX Block 2)', shortName: 'Block 2', icon: Box, category: 'code', color: 'bg-violet-600 text-white', desc: 'Chèn UX Block 2', hasSettings: true },
  { id: 'block-3', name: 'Block 3 (UX Block 3)', shortName: 'Block 3', icon: Box, category: 'code', color: 'bg-violet-600 text-white', desc: 'Chèn UX Block 3', hasSettings: true },
  { id: 'block-4', name: 'Block 4 (UX Block 4)', shortName: 'Block 4', icon: Box, category: 'code', color: 'bg-violet-600 text-white', desc: 'Chèn UX Block 4', hasSettings: true },
  { id: 'html', name: 'HTML 1 (Mã Tự Do 1)', shortName: 'HTML 1', icon: Code, category: 'code', color: 'bg-amber-700 text-white', desc: 'HTML / Text Topbar trái', hasSettings: true },
  { id: 'html-2', name: 'HTML 2 (Mã Tự Do 2)', shortName: 'HTML 2', icon: Code, category: 'code', color: 'bg-amber-700 text-white', desc: 'HTML / Text Topbar phải', hasSettings: true },
  { id: 'html-3', name: 'HTML 3 (Mã Tự Do 3)', shortName: 'HTML 3', icon: Code, category: 'code', color: 'bg-amber-700 text-white', desc: 'HTML Header Top Right', hasSettings: true },
  { id: 'html-4', name: 'HTML 4 (Mã Tự Do 4)', shortName: 'HTML 4', icon: Code, category: 'code', color: 'bg-amber-700 text-white', desc: 'HTML Nav Top Position', hasSettings: true },
  { id: 'html-5', name: 'HTML 5 (Mã Tự Do 5)', shortName: 'HTML 5', icon: Code, category: 'code', color: 'bg-amber-700 text-white', desc: 'HTML Nav Position Text', hasSettings: true },
];

export type SlotKey =
  | 'topbarElementsLeft'
  | 'topbarElementsCenter'
  | 'topbarElementsRight'
  | 'headerElementsLeft'
  | 'headerElementsCenter'
  | 'headerElementsRight'
  | 'headerElementsBottomLeft'
  | 'headerElementsBottomCenter'
  | 'headerElementsBottomRight';

interface SlotMeta {
  key: SlotKey;
  label: string;
  row: 'top' | 'main' | 'bottom';
  align: 'left' | 'center' | 'right';
}

const SLOTS: SlotMeta[] = [
  { key: 'topbarElementsLeft', label: 'Top Bar (Trái)', row: 'top', align: 'left' },
  { key: 'topbarElementsCenter', label: 'Top Bar (Giữa)', row: 'top', align: 'center' },
  { key: 'topbarElementsRight', label: 'Top Bar (Phải)', row: 'top', align: 'right' },
  { key: 'headerElementsLeft', label: 'Header Main (Trái)', row: 'main', align: 'left' },
  { key: 'headerElementsCenter', label: 'Header Main (Giữa)', row: 'main', align: 'center' },
  { key: 'headerElementsRight', label: 'Header Main (Phải)', row: 'main', align: 'right' },
  { key: 'headerElementsBottomLeft', label: 'Header Bottom (Trái)', row: 'bottom', align: 'left' },
  { key: 'headerElementsBottomCenter', label: 'Header Bottom (Giữa)', row: 'bottom', align: 'center' },
  { key: 'headerElementsBottomRight', label: 'Header Bottom (Phải)', row: 'bottom', align: 'right' },
];

interface FlatsomeHeaderBuilderProps {
  themeConfig: ThemeConfig;
  onChangeThemeConfig: (config: ThemeConfig) => void;
  inspectData?: WpInspectData | null;
  onOpenElementSettings?: (elementId: string) => void;
  onApplyTheme?: (config?: ThemeConfig) => Promise<void>;
  isApplying?: boolean;
}

export const FlatsomeHeaderBuilder: React.FC<FlatsomeHeaderBuilderProps> = ({
  themeConfig,
  onChangeThemeConfig,
  inspectData,
  onOpenElementSettings,
  onApplyTheme,
  isApplying = false,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [pickerTargetSlot, setPickerTargetSlot] = useState<SlotKey | null>(null);
  const [selectedElementForPlacement, setSelectedElementForPlacement] = useState<string | null>(null);
  const [editingContentModal, setEditingContentModal] = useState<string | null>(null);

  // Helper to get slot elements with fallback
  const getSlot = (key: SlotKey): string[] => {
    const val = themeConfig[key];
    if (Array.isArray(val)) return val;
    // Default fallback based on preset if slots are not initialized
    if (key === 'headerElementsRight' && (themeConfig.headerPreset === 'header-wide-nav-dark' || themeConfig.headerPreset === 'header-wide-nav')) {
      return ['button-1', 'button-2'];
    }
    if (key === 'headerElementsBottomLeft' && (themeConfig.headerPreset === 'header-wide-nav-dark' || themeConfig.headerPreset === 'header-wide-nav')) {
      return ['nav'];
    }
    return [];
  };

  // Find all elements currently placed in any slot
  const getAllPlacedElements = (): { id: string; slot: SlotKey }[] => {
    const placed: { id: string; slot: SlotKey }[] = [];
    SLOTS.forEach((slot) => {
      getSlot(slot.key).forEach((id) => {
        placed.push({ id, slot: slot.key });
      });
    });
    return placed;
  };

  const placedItems = getAllPlacedElements();
  const placedIds = placedItems.map((p) => p.id);

  // Available elements in tray (elements not yet in use, or repeatable elements like dividers/html)
  const availableInTray = ALL_HEADER_ELEMENTS.filter((el) => {
    if (el.id.startsWith('divider') || el.id.startsWith('html') || el.id.startsWith('block')) {
      return !placedIds.includes(el.id);
    }
    return !placedIds.includes(el.id);
  });

  // Add an element to a specific slot
  const handleAddElementToSlot = (slotKey: SlotKey, elementId: string) => {
    const currentList = getSlot(slotKey);
    // Don't add duplicate if already in this slot
    if (currentList.includes(elementId)) {
      setPickerTargetSlot(null);
      setSelectedElementForPlacement(null);
      return;
    }

    // Remove element from any other slot first (Flatsome elements are unique across header, except dividers)
    let updatedConfig = { ...themeConfig };
    if (!elementId.startsWith('divider')) {
      SLOTS.forEach((slot) => {
        const list = getSlot(slot.key);
        if (list.includes(elementId)) {
          updatedConfig = {
            ...updatedConfig,
            [slot.key]: list.filter((id) => id !== elementId),
          };
        }
      });
    }

    const updatedTargetList = [...(updatedConfig[slotKey] || []), elementId];
    updatedConfig = {
      ...updatedConfig,
      [slotKey]: updatedTargetList,
    };

    // Auto-enable Topbar show if element added to topbar
    if (slotKey.startsWith('topbar')) {
      updatedConfig.topbarText = updatedConfig.topbarText || ' ';
    }
    // Auto-enable Bottombar show if element added to bottombar
    if (slotKey.startsWith('headerElementsBottom')) {
      updatedConfig.headerBottomShow = true;
      if (!updatedConfig.headerBottomHeight) updatedConfig.headerBottomHeight = 45;
    }

    onChangeThemeConfig(updatedConfig);
    setPickerTargetSlot(null);
    setSelectedElementForPlacement(null);
  };

  // Remove element from slot
  const handleRemoveElement = (slotKey: SlotKey, index: number) => {
    const list = [...getSlot(slotKey)];
    list.splice(index, 1);
    onChangeThemeConfig({
      ...themeConfig,
      [slotKey]: list,
    });
  };

  // Move element left/right inside slot
  const handleMoveElement = (slotKey: SlotKey, index: number, direction: 'left' | 'right') => {
    const list = [...getSlot(slotKey)];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    onChangeThemeConfig({
      ...themeConfig,
      [slotKey]: list,
    });
  };

  // Reset to preset defaults
  const handleResetToPreset = () => {
    if (!window.confirm('Khôi phục lại sắp xếp các thành phần Header theo Preset chuẩn đang chọn?')) return;
    const preset = themeConfig.headerPreset || 'header-wide-nav-dark';
    if (preset === 'header-wide-nav-dark' || preset === 'header-wide-nav') {
      onChangeThemeConfig({
        ...themeConfig,
        topbarElementsLeft: [],
        topbarElementsCenter: [],
        topbarElementsRight: [],
        headerElementsLeft: [],
        headerElementsCenter: [],
        headerElementsRight: ['button-1', 'button-2'],
        headerElementsBottomLeft: ['nav'],
        headerElementsBottomCenter: [],
        headerElementsBottomRight: [],
      });
    } else if (preset === 'header-default-dark' || preset === 'header-default') {
      onChangeThemeConfig({
        ...themeConfig,
        topbarElementsLeft: [],
        topbarElementsCenter: [],
        topbarElementsRight: [],
        headerElementsLeft: ['nav'],
        headerElementsCenter: [],
        headerElementsRight: ['search', 'account', 'cart'],
        headerElementsBottomLeft: [],
        headerElementsBottomCenter: [],
        headerElementsBottomRight: [],
      });
    } else if (preset === 'header-simple-signup') {
      onChangeThemeConfig({
        ...themeConfig,
        topbarElementsLeft: [],
        topbarElementsCenter: [],
        topbarElementsRight: [],
        headerElementsLeft: ['nav'],
        headerElementsCenter: [],
        headerElementsRight: ['button-1', 'button-2'],
        headerElementsBottomLeft: [],
        headerElementsBottomCenter: [],
        headerElementsBottomRight: [],
      });
    } else {
      onChangeThemeConfig({
        ...themeConfig,
        topbarElementsLeft: [],
        topbarElementsCenter: [],
        topbarElementsRight: [],
        headerElementsLeft: ['nav'],
        headerElementsCenter: [],
        headerElementsRight: ['search', 'button-1'],
        headerElementsBottomLeft: [],
        headerElementsBottomCenter: [],
        headerElementsBottomRight: [],
      });
    }
  };

  // Clear all slots
  const handleClearAll = () => {
    if (!window.confirm('Xóa sạch tất cả các thành phần trong các thanh Header về trống? (Bạn có thể thêm lại bất cứ lúc nào).')) return;
    onChangeThemeConfig({
      ...themeConfig,
      topbarElementsLeft: [],
      topbarElementsCenter: [],
      topbarElementsRight: [],
      headerElementsLeft: [],
      headerElementsCenter: [],
      headerElementsRight: [],
      headerElementsBottomLeft: [],
      headerElementsBottomCenter: [],
      headerElementsBottomRight: [],
    });
  };

  const getElementDef = (id: string): HeaderElementDef => {
    return ALL_HEADER_ELEMENTS.find((el) => el.id === id) || {
      id,
      name: id,
      shortName: id,
      icon: Box,
      category: 'info',
      color: 'bg-slate-700 text-white',
      desc: '',
    };
  };

  const getElementCustomLabel = (id: string, def: HeaderElementDef): string => {
    if (id === 'button-1') {
      const text = themeConfig.headerButton1Text?.trim();
      return text ? `Button 1: ${text}` : 'Button 1';
    }
    if (id === 'button-2') {
      const text = themeConfig.headerButton2Text?.trim();
      return text ? `Button 2: ${text}` : 'Button 2';
    }
    if (id === 'contact' && themeConfig.contactPhone?.trim()) {
      return `Contact: ${themeConfig.contactPhone}`;
    }
    if (id === 'html' && (themeConfig.topbarLeftHtml || themeConfig.topbarText)) {
      const clean = (themeConfig.topbarLeftHtml || themeConfig.topbarText || '').replace(/<[^>]*>/g, '').trim();
      if (clean) return `HTML 1: ${clean.slice(0, 14)}...`;
    }
    if (id === 'html-2' && themeConfig.topbarRightHtml) {
      const clean = themeConfig.topbarRightHtml.replace(/<[^>]*>/g, '').trim();
      if (clean) return `HTML 2: ${clean.slice(0, 14)}...`;
    }
    if (id.startsWith('block-')) {
      const blockVal =
        id === 'block-1'
          ? themeConfig.headerBlock1
          : id === 'block-2'
          ? themeConfig.headerBlock2
          : id === 'block-3'
          ? themeConfig.headerBlock3
          : themeConfig.headerBlock4;
      if (blockVal) return `${def.shortName}: ${blockVal}`;
    }
    return def.shortName;
  };

  return (
    <div className="space-y-4">
      {/* Header Builder Canvas Container */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden text-slate-100">
        {/* Top Control Bar (matching Flatsome Native Header Builder header in Image 2) */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Flatsome Header Builder</span>
            </span>

            {/* Desktop / Mobile Switcher */}
            <div className="bg-slate-800 p-0.5 rounded-lg flex items-center border border-slate-700">
              <button
                type="button"
                onClick={() => setDeviceMode('desktop')}
                className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                  deviceMode === 'desktop'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                  deviceMode === 'mobile'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mobile / Tablet
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToPreset}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1 cursor-pointer"
              title="Khôi phục lại sắp xếp theo Preset chuẩn Flatsome"
            >
              <RefreshCw className="w-3 h-3 text-blue-400" />
              <span>Đặt Lại Theo Preset</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs font-medium rounded-lg border border-slate-700 hover:border-rose-700/60 transition flex items-center gap-1 cursor-pointer"
              title="Xóa toàn bộ các ô để xếp lại từ đầu"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Builder Dropzone Grid */}
        <div className="p-4 space-y-3 bg-slate-900/90 select-none">
          {/* ============================================================== */}
          {/* ROW 1: TOP BAR                                                 */}
          {/* ============================================================== */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span>Thanh Trên Cùng (Top Bar)</span>
              </span>
              <span className="text-[10px] text-slate-400 normal-case font-normal">
                {getSlot('topbarElementsLeft').length + getSlot('topbarElementsCenter').length + getSlot('topbarElementsRight').length > 0
                  ? 'Đang bật'
                  : 'Trống (Không hiện trên web)'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-black/60 p-2 rounded-xl border border-slate-800">
              {/* Top Left */}
              <div className="min-h-[52px] bg-slate-950/80 border border-dashed border-slate-700 rounded-lg p-2 flex flex-wrap items-center gap-1.5 relative group">
                <span className="absolute top-1 right-2 text-[9px] font-mono text-slate-400 uppercase pointer-events-none">
                  Top Left
                </span>
                {getSlot('topbarElementsLeft').map((id, idx) => (
                  <ElementChip
                    key={`${id}-${idx}`}
                    def={getElementDef(id)}
                    customLabel={getElementCustomLabel(id, getElementDef(id))}
                    onRemove={() => handleRemoveElement('topbarElementsLeft', idx)}
                    onMoveLeft={() => handleMoveElement('topbarElementsLeft', idx, 'left')}
                    onMoveRight={() => handleMoveElement('topbarElementsLeft', idx, 'right')}
                    isFirst={idx === 0}
                    isLast={idx === getSlot('topbarElementsLeft').length - 1}
                    onSettings={() => setEditingContentModal(id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setPickerTargetSlot('topbarElementsLeft')}
                  className="px-2 py-1 bg-slate-800/80 hover:bg-blue-600/80 text-slate-300 hover:text-white rounded text-[11px] font-medium border border-slate-700 hover:border-blue-500 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm</span>
                </button>
              </div>

              {/* Top Center */}
              <div className="min-h-[52px] bg-slate-950/80 border border-dashed border-slate-700 rounded-lg p-2 flex flex-wrap items-center justify-center gap-1.5 relative group">
                <span className="absolute top-1 right-2 text-[9px] font-mono text-slate-400 uppercase pointer-events-none">
                  Top Center
                </span>
                {getSlot('topbarElementsCenter').map((id, idx) => (
                  <ElementChip
                    key={`${id}-${idx}`}
                    def={getElementDef(id)}
                    customLabel={getElementCustomLabel(id, getElementDef(id))}
                    onRemove={() => handleRemoveElement('topbarElementsCenter', idx)}
                    onMoveLeft={() => handleMoveElement('topbarElementsCenter', idx, 'left')}
                    onMoveRight={() => handleMoveElement('topbarElementsCenter', idx, 'right')}
                    isFirst={idx === 0}
                    isLast={idx === getSlot('topbarElementsCenter').length - 1}
                    onSettings={() => setEditingContentModal(id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setPickerTargetSlot('topbarElementsCenter')}
                  className="px-2 py-1 bg-slate-800/80 hover:bg-blue-600/80 text-slate-300 hover:text-white rounded text-[11px] font-medium border border-slate-700 hover:border-blue-500 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm</span>
                </button>
              </div>

              {/* Top Right */}
              <div className="min-h-[52px] bg-slate-950/80 border border-dashed border-slate-700 rounded-lg p-2 flex flex-wrap items-center justify-end gap-1.5 relative group">
                <span className="absolute top-1 left-2 text-[9px] font-mono text-slate-400 uppercase pointer-events-none">
                  Top Right
                </span>
                {getSlot('topbarElementsRight').map((id, idx) => (
                  <ElementChip
                    key={`${id}-${idx}`}
                    def={getElementDef(id)}
                    customLabel={getElementCustomLabel(id, getElementDef(id))}
                    onRemove={() => handleRemoveElement('topbarElementsRight', idx)}
                    onMoveLeft={() => handleMoveElement('topbarElementsRight', idx, 'left')}
                    onMoveRight={() => handleMoveElement('topbarElementsRight', idx, 'right')}
                    isFirst={idx === 0}
                    isLast={idx === getSlot('topbarElementsRight').length - 1}
                    onSettings={() => setEditingContentModal(id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setPickerTargetSlot('topbarElementsRight')}
                  className="px-2 py-1 bg-slate-800/80 hover:bg-blue-600/80 text-slate-300 hover:text-white rounded text-[11px] font-medium border border-slate-700 hover:border-blue-500 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* ROW 2: HEADER MAIN (THANH CHÍNH)                               */}
          {/* ============================================================== */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase tracking-wider px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Thanh Chính (Header Main - Chiều cao {themeConfig.headerHeight || 90}px)</span>
              </span>
              <span className="text-[10px] text-slate-300 font-normal">
                Khung hiển thị Logo chính và các nút CTA VIP
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-black/70 p-2.5 rounded-xl border border-blue-900/60 shadow-inner">
              {/* Logo block (fixed representation matching Image 2) */}
              <div className="md:col-span-3 min-h-[60px] bg-slate-950 border border-slate-700 rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300 text-xs font-black">
                    ★
                  </div>
                  <div>
                    <div className="text-xs font-black text-white tracking-wider flex items-center gap-1.5">
                      <span>LOGO</span>
                      <Settings className="w-3 h-3 text-slate-300" />
                    </div>
                    <span className="text-[10px] text-slate-300 font-normal">Logo Website</span>
                  </div>
                </div>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Cố Định
                </span>
              </div>

              {/* Main Left / Center slot */}
              <div className="md:col-span-4 min-h-[60px] bg-slate-950/80 border border-dashed border-slate-700 rounded-lg p-2 flex flex-wrap items-center gap-1.5 relative group">
                <span className="absolute top-1 right-2 text-[9px] font-mono text-slate-400 uppercase pointer-events-none">
                  Main Center / Left
                </span>
                {getSlot('headerElementsLeft').map((id, idx) => (
                  <ElementChip
                    key={`${id}-${idx}`}
                    def={getElementDef(id)}
                    customLabel={getElementCustomLabel(id, getElementDef(id))}
                    onRemove={() => handleRemoveElement('headerElementsLeft', idx)}
                    onMoveLeft={() => handleMoveElement('headerElementsLeft', idx, 'left')}
                    onMoveRight={() => handleMoveElement('headerElementsLeft', idx, 'right')}
                    isFirst={idx === 0}
                    isLast={idx === getSlot('headerElementsLeft').length - 1}
                    onSettings={() => setEditingContentModal(id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setPickerTargetSlot('headerElementsLeft')}
                  className="px-2 py-1 bg-slate-800/80 hover:bg-blue-600/80 text-slate-300 hover:text-white rounded text-[11px] font-medium border border-slate-700 hover:border-blue-500 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm</span>
                </button>
              </div>

              {/* Main Right slot (Where Button 1 & 2 usually live) */}
              <div className="md:col-span-5 min-h-[60px] bg-slate-950/80 border border-dashed border-slate-700 rounded-lg p-2 flex flex-wrap items-center justify-end gap-1.5 relative group">
                <span className="absolute top-1 left-2 text-[9px] font-mono text-slate-400 uppercase pointer-events-none">
                  Main Right
                </span>
                {getSlot('headerElementsRight').map((id, idx) => (
                  <ElementChip
                    key={`${id}-${idx}`}
                    def={getElementDef(id)}
                    customLabel={getElementCustomLabel(id, getElementDef(id))}
                    onRemove={() => handleRemoveElement('headerElementsRight', idx)}
                    onMoveLeft={() => handleMoveElement('headerElementsRight', idx, 'left')}
                    onMoveRight={() => handleMoveElement('headerElementsRight', idx, 'right')}
                    isFirst={idx === 0}
                    isLast={idx === getSlot('headerElementsRight').length - 1}
                    onSettings={() => setEditingContentModal(id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setPickerTargetSlot('headerElementsRight')}
                  className="px-2 py-1 bg-slate-800/80 hover:bg-blue-600/80 text-slate-300 hover:text-white rounded text-[11px] font-medium border border-slate-700 hover:border-blue-500 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* ROW 3: HEADER BOTTOM (THANH MENU DƯỚI)                          */}
          {/* ============================================================== */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 uppercase tracking-wider px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Thanh Dưới (Header Bottom / Wide Nav - {themeConfig.headerBottomHeight || 45}px)</span>
              </span>
              <span className="text-[10px] text-slate-300 font-normal">
                Thanh chuyên dùng dàn hàng ngang Main Menu (Casino / Juega365)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-black/60 p-2.5 rounded-xl border border-slate-800">
              {/* Bottom Left (Where Main Menu usually lives) */}
              <div className="md:col-span-6 min-h-[54px] bg-slate-950/80 border border-dashed border-slate-700 rounded-lg p-2 flex flex-wrap items-center gap-1.5 relative group">
                <span className="absolute top-1 right-2 text-[9px] font-mono text-slate-400 uppercase pointer-events-none">
                  Bottom Left
                </span>
                {getSlot('headerElementsBottomLeft').map((id, idx) => (
                  <ElementChip
                    key={`${id}-${idx}`}
                    def={getElementDef(id)}
                    customLabel={getElementCustomLabel(id, getElementDef(id))}
                    onRemove={() => handleRemoveElement('headerElementsBottomLeft', idx)}
                    onMoveLeft={() => handleMoveElement('headerElementsBottomLeft', idx, 'left')}
                    onMoveRight={() => handleMoveElement('headerElementsBottomLeft', idx, 'right')}
                    isFirst={idx === 0}
                    isLast={idx === getSlot('headerElementsBottomLeft').length - 1}
                    onSettings={() => setEditingContentModal(id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setPickerTargetSlot('headerElementsBottomLeft')}
                  className="px-2 py-1 bg-slate-800/80 hover:bg-emerald-600/80 text-slate-300 hover:text-white rounded text-[11px] font-medium border border-slate-700 hover:border-emerald-500 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm</span>
                </button>
              </div>

              {/* Bottom Center */}
              <div className="md:col-span-3 min-h-[54px] bg-slate-950/80 border border-dashed border-slate-700 rounded-lg p-2 flex flex-wrap items-center justify-center gap-1.5 relative group">
                <span className="absolute top-1 right-2 text-[9px] font-mono text-slate-400 uppercase pointer-events-none">
                  Bottom Center
                </span>
                {getSlot('headerElementsBottomCenter').map((id, idx) => (
                  <ElementChip
                    key={`${id}-${idx}`}
                    def={getElementDef(id)}
                    customLabel={getElementCustomLabel(id, getElementDef(id))}
                    onRemove={() => handleRemoveElement('headerElementsBottomCenter', idx)}
                    onMoveLeft={() => handleMoveElement('headerElementsBottomCenter', idx, 'left')}
                    onMoveRight={() => handleMoveElement('headerElementsBottomCenter', idx, 'right')}
                    isFirst={idx === 0}
                    isLast={idx === getSlot('headerElementsBottomCenter').length - 1}
                    onSettings={() => setEditingContentModal(id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setPickerTargetSlot('headerElementsBottomCenter')}
                  className="px-2 py-1 bg-slate-800/80 hover:bg-emerald-600/80 text-slate-300 hover:text-white rounded text-[11px] font-medium border border-slate-700 hover:border-emerald-500 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm</span>
                </button>
              </div>

              {/* Bottom Right */}
              <div className="md:col-span-3 min-h-[54px] bg-slate-950/80 border border-dashed border-slate-700 rounded-lg p-2 flex flex-wrap items-center justify-end gap-1.5 relative group">
                <span className="absolute top-1 left-2 text-[9px] font-mono text-slate-400 uppercase pointer-events-none">
                  Bottom Right
                </span>
                {getSlot('headerElementsBottomRight').map((id, idx) => (
                  <ElementChip
                    key={`${id}-${idx}`}
                    def={getElementDef(id)}
                    customLabel={getElementCustomLabel(id, getElementDef(id))}
                    onRemove={() => handleRemoveElement('headerElementsBottomRight', idx)}
                    onMoveLeft={() => handleMoveElement('headerElementsBottomRight', idx, 'left')}
                    onMoveRight={() => handleMoveElement('headerElementsBottomRight', idx, 'right')}
                    isFirst={idx === 0}
                    isLast={idx === getSlot('headerElementsBottomRight').length - 1}
                    onSettings={() => setEditingContentModal(id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setPickerTargetSlot('headerElementsBottomRight')}
                  className="px-2 py-1 bg-slate-800/80 hover:bg-emerald-600/80 text-slate-300 hover:text-white rounded text-[11px] font-medium border border-slate-700 hover:border-emerald-500 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TRAY: AVAILABLE ELEMENTS ("Not in use" tray from Image 2)      */}
        {/* ============================================================== */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Khay Thành Phần Có Sẵn (Chưa Dùng - Not in use)
              </span>
              <span className="text-[10px] bg-slate-800 text-blue-400 px-2 py-0.5 rounded-full font-mono border border-slate-700">
                {availableInTray.length} thành phần
              </span>
            </div>
            <span className="text-[11px] text-slate-300">
              💡 Bấm vào thành phần để chọn vị trí chèn lên Header
            </span>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-wrap gap-2 items-center">
            {availableInTray.map((el) => {
              const Icon = el.icon;
              const isSelected = selectedElementForPlacement === el.id;
              return (
                <div key={el.id} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedElementForPlacement === el.id) {
                        setSelectedElementForPlacement(null);
                      } else {
                        setSelectedElementForPlacement(el.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-500/50 scale-105'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-500'
                    }`}
                    title={el.desc}
                  >
                    <Icon className="w-3.5 h-3.5 opacity-80" />
                    <span className={el.id === 'button-1' || el.id === 'button-2' ? 'text-amber-300 font-bold' : ''}>
                      {getElementCustomLabel(el.id, el)}
                    </span>
                    {el.hasSettings && <Settings className="w-2.5 h-2.5 text-slate-300" />}
                  </button>

                  {/* Popover when clicked to pick slot */}
                  {isSelected && (
                    <div className="absolute left-0 bottom-full mb-2 z-50 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-blue-400" />
                          <span>Chèn "{el.shortName}" vào:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedElementForPlacement(null)}
                          className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="text-[10px] uppercase font-bold text-blue-400 px-1 pt-0.5">Thanh Chính (Main)</div>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onClick={() => handleAddElementToSlot('headerElementsLeft', el.id)}
                            className="px-2 py-1 text-left bg-slate-800 hover:bg-blue-600 rounded text-slate-200 hover:text-white transition cursor-pointer text-[11px]"
                          >
                            ← Bên Trái
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddElementToSlot('headerElementsRight', el.id)}
                            className="px-2 py-1 text-left bg-slate-800 hover:bg-blue-600 rounded text-slate-200 hover:text-white transition cursor-pointer text-[11px]"
                          >
                            Bên Phải →
                          </button>
                        </div>

                        <div className="text-[10px] uppercase font-bold text-emerald-400 px-1 pt-1">Thanh Dưới (Bottom)</div>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => handleAddElementToSlot('headerElementsBottomLeft', el.id)}
                            className="px-1.5 py-1 text-center bg-slate-800 hover:bg-emerald-600 rounded text-slate-200 hover:text-white transition cursor-pointer text-[11px]"
                          >
                            Trái
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddElementToSlot('headerElementsBottomCenter', el.id)}
                            className="px-1.5 py-1 text-center bg-slate-800 hover:bg-emerald-600 rounded text-slate-200 hover:text-white transition cursor-pointer text-[11px]"
                          >
                            Giữa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddElementToSlot('headerElementsBottomRight', el.id)}
                            className="px-1.5 py-1 text-center bg-slate-800 hover:bg-emerald-600 rounded text-slate-200 hover:text-white transition cursor-pointer text-[11px]"
                          >
                            Phải
                          </button>
                        </div>

                        <div className="text-[10px] uppercase font-bold text-slate-400 px-1 pt-1">Thanh Trên (Top Bar)</div>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => handleAddElementToSlot('topbarElementsLeft', el.id)}
                            className="px-1.5 py-1 text-center bg-slate-800 hover:bg-slate-700 rounded text-slate-200 hover:text-white transition cursor-pointer text-[11px]"
                          >
                            Trái
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddElementToSlot('topbarElementsCenter', el.id)}
                            className="px-1.5 py-1 text-center bg-slate-800 hover:bg-slate-700 rounded text-slate-200 hover:text-white transition cursor-pointer text-[11px]"
                          >
                            Giữa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddElementToSlot('topbarElementsRight', el.id)}
                            className="px-1.5 py-1 text-center bg-slate-800 hover:bg-slate-700 rounded text-slate-200 hover:text-white transition cursor-pointer text-[11px]"
                          >
                            Phải
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Slot Element Picker (When clicking "+ Thêm" on a specific slot) */}
      {pickerTargetSlot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4 text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-400" />
                  <span>Chọn Thành Phần Để Thêm Vào {SLOTS.find((s) => s.key === pickerTargetSlot)?.label}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click vào thành phần bạn muốn hiển thị tại vị trí này
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerTargetSlot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
              {ALL_HEADER_ELEMENTS.map((el) => {
                const Icon = el.icon;
                const isCurrentlyInSlot = getSlot(pickerTargetSlot).includes(el.id);
                return (
                  <button
                    key={el.id}
                    type="button"
                    disabled={isCurrentlyInSlot}
                    onClick={() => handleAddElementToSlot(pickerTargetSlot, el.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      isCurrentlyInSlot
                        ? 'opacity-40 bg-slate-950 border-slate-800 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-blue-600/80 hover:border-blue-400 border-slate-700 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-4 h-4 text-blue-300" />
                      <span className="text-xs font-bold truncate">{el.shortName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1">
                      {isCurrentlyInSlot ? 'Đã có trong ô này' : el.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal / Quick Drawer: Edit Specific Content (HTML, Contact, Blocks) */}
      {editingContentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Cấu Hình Chi Tiết: {ALL_HEADER_ELEMENTS.find((el) => el.id === editingContentModal)?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingContentModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Form depending on Element */}
            {editingContentModal === 'html' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Nội Dung HTML 1 (theme_mod: topbar_left)
                </label>
                <textarea
                  rows={4}
                  value={themeConfig.topbarLeftHtml ?? themeConfig.topbarText ?? ''}
                  onChange={(e) =>
                    onChangeThemeConfig({
                      ...themeConfig,
                      topbarLeftHtml: e.target.value,
                      topbarText: e.target.value,
                    })
                  }
                  placeholder="<strong class='uppercase'>Nhập mã HTML, hotline hoặc thông báo khuyến mãi...</strong>"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500">
                  Hỗ trợ toàn bộ mã HTML, link liên kết thẻ &lt;a&gt; và WordPress Shortcode.
                </p>
              </div>
            )}

            {editingContentModal === 'html-2' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Nội Dung HTML 2 (theme_mod: topbar_right)
                </label>
                <textarea
                  rows={4}
                  value={themeConfig.topbarRightHtml || ''}
                  onChange={(e) =>
                    onChangeThemeConfig({
                      ...themeConfig,
                      topbarRightHtml: e.target.value,
                    })
                  }
                  placeholder="Nhập mã HTML hoặc thông báo góc phải..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>
            )}

            {editingContentModal === 'html-3' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Nội Dung HTML 3 (theme_mod: top_right_text)
                </label>
                <textarea
                  rows={4}
                  value={themeConfig.html3Text || ''}
                  onChange={(e) =>
                    onChangeThemeConfig({
                      ...themeConfig,
                      html3Text: e.target.value,
                    })
                  }
                  placeholder="Nhập mã HTML 3..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>
            )}

            {editingContentModal === 'contact' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Điện Thoại / Hotline (contact_phone)
                  </label>
                  <input
                    type="text"
                    value={themeConfig.contactPhone || ''}
                    onChange={(e) => onChangeThemeConfig({ ...themeConfig, contactPhone: e.target.value })}
                    placeholder="+84 988 888 888"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Liên Hệ (contact_email)
                  </label>
                  <input
                    type="email"
                    value={themeConfig.contactEmail || ''}
                    onChange={(e) => onChangeThemeConfig({ ...themeConfig, contactEmail: e.target.value })}
                    placeholder="support@domain.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Địa Chỉ / Văn Phòng (contact_location)
                  </label>
                  <input
                    type="text"
                    value={themeConfig.contactLocation || ''}
                    onChange={(e) => onChangeThemeConfig({ ...themeConfig, contactLocation: e.target.value })}
                    placeholder="Hà Nội, Việt Nam"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {(editingContentModal === 'block-1' ||
              editingContentModal === 'block-2' ||
              editingContentModal === 'block-3' ||
              editingContentModal === 'block-4') && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Chọn UX Block Flatsome Có Sẵn Trên Web
                </label>
                <select
                  value={
                    editingContentModal === 'block-1'
                      ? themeConfig.headerBlock1 || ''
                      : editingContentModal === 'block-2'
                      ? themeConfig.headerBlock2 || ''
                      : editingContentModal === 'block-3'
                      ? themeConfig.headerBlock3 || ''
                      : themeConfig.headerBlock4 || ''
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingContentModal === 'block-1') onChangeThemeConfig({ ...themeConfig, headerBlock1: val });
                    if (editingContentModal === 'block-2') onChangeThemeConfig({ ...themeConfig, headerBlock2: val });
                    if (editingContentModal === 'block-3') onChangeThemeConfig({ ...themeConfig, headerBlock3: val });
                    if (editingContentModal === 'block-4') onChangeThemeConfig({ ...themeConfig, headerBlock4: val });
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white"
                >
                  <option value="">-- Chọn UX Block --</option>
                  {(inspectData?.ux_blocks || []).map((b) => (
                    <option key={b.id} value={b.slug || b.id}>
                      {b.title} ({b.slug})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Block được thiết kế trong UX Builder của Flatsome sẽ được nhúng trực tiếp vào vị trí này trên Header.
                </p>
              </div>
            )}

            {(editingContentModal === 'button-1' || editingContentModal === 'button-2') && (() => {
              const isBtn1 = editingContentModal === 'button-1';
              const btnNum = isBtn1 ? '1' : '2';
              const textVal = isBtn1 ? (themeConfig.headerButton1Text ?? '') : (themeConfig.headerButton2Text ?? '');
              const linkVal = isBtn1 ? (themeConfig.headerButton1Link ?? '') : (themeConfig.headerButton2Link ?? '');
              const targetVal = isBtn1 ? (themeConfig.headerButton1Target ?? '_self') : (themeConfig.headerButton2Target ?? '_self');
              const relVal = isBtn1 ? (themeConfig.headerButton1Rel ?? 'nofollow') : (themeConfig.headerButton2Rel ?? 'nofollow');
              const colorVal = isBtn1 ? (themeConfig.headerButton1Color ?? 'alert') : (themeConfig.headerButton2Color ?? 'alert');
              const styleVal = isBtn1 ? (themeConfig.headerButton1Style ?? 'is-flat') : (themeConfig.headerButton2Style ?? 'is-flat');
              const radiusVal = isBtn1 ? (themeConfig.headerButton1Radius ?? '99px') : (themeConfig.headerButton2Radius ?? '99px');

              const updateBtn = (patch: Partial<ThemeConfig>) => {
                onChangeThemeConfig({ ...themeConfig, ...patch });
              };

              // Determine preview bg / border / text color
              let previewBg = 'bg-red-500 text-white';
              if (colorVal === 'primary') previewBg = 'bg-blue-600 text-white';
              else if (colorVal === 'secondary') previewBg = 'bg-amber-500 text-white';
              else if (colorVal === 'success') previewBg = 'bg-emerald-600 text-white';
              else if (colorVal === 'white') previewBg = 'bg-white text-slate-900 border border-slate-300';
              else if (colorVal === 'plain') previewBg = 'bg-slate-200 text-slate-800';

              let styleClass = '';
              if (styleVal === 'is-outline') {
                styleClass = 'bg-transparent border-2 border-current shadow-none';
              } else if (styleVal === 'is-shade') {
                styleClass = 'shadow-lg';
              }

              let radiusClass = 'rounded-full';
              if (radiusVal === '0px') radiusClass = 'rounded-none';
              else if (radiusVal === '4px') radiusClass = 'rounded-xs';
              else if (radiusVal === '8px') radiusClass = 'rounded-lg';

              return (
                <div className="space-y-4">
                  {/* Live Preview of Button */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Xem Trước Nút {btnNum} (Live Preview)
                      </span>
                      <span className="text-xs text-slate-300">
                        Hiển thị thực tế trên Header Flatsome
                      </span>
                    </div>
                    <div className="px-3 py-1">
                      <button
                        type="button"
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${previewBg} ${styleClass} ${radiusClass}`}
                      >
                        {textVal || `Button ${btnNum}`}
                      </button>
                    </div>
                  </div>

                  {/* Text Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                      <span>Tiêu Đề Nút (Button Text)</span>
                      <span className="text-[10px] text-blue-600 font-mono">theme_mod: header_button_{btnNum}</span>
                    </label>
                    <input
                      type="text"
                      value={textVal}
                      onChange={(e) => {
                        if (isBtn1) updateBtn({ headerButton1Text: e.target.value });
                        else updateBtn({ headerButton2Text: e.target.value });
                      }}
                      placeholder="Ví dụ: LIÊN HỆ, HOTLINE, ĐĂNG KÝ..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Link, Target and SEO Rel */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Đường Dẫn Liên Kết (URL / Link)
                      </label>
                      <input
                        type="text"
                        value={linkVal}
                        onChange={(e) => {
                          if (isBtn1) updateBtn({ headerButton1Link: e.target.value });
                          else updateBtn({ headerButton2Link: e.target.value });
                        }}
                        placeholder="https://..., tel:0988888888, hoặc /lien-he"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:bg-white"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mở Tab
                      </label>
                      <select
                        value={targetVal}
                        onChange={(e) => {
                          const val = e.target.value as '_self' | '_blank';
                          if (isBtn1) updateBtn({ headerButton1Target: val });
                          else updateBtn({ headerButton2Target: val });
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800"
                      >
                        <option value="_self">Cùng Tab (_self)</option>
                        <option value="_blank">Tab Mới (_blank)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Thuộc Tính Rel</span>
                        {relVal.includes('nofollow') && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded-xs">Nofollow</span>
                        )}
                      </label>
                      <select
                        value={relVal}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (isBtn1) updateBtn({ headerButton1Rel: val });
                          else updateBtn({ headerButton2Rel: val });
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 text-xs font-medium text-slate-800"
                      >
                        <option value="nofollow">Nofollow (Khuyên dùng link ngoài/affiliate)</option>
                        <option value="">Dofollow (Mặc định chuẩn SEO)</option>
                        <option value="nofollow noopener noreferrer">Nofollow + Noopener + Noreferrer</option>
                        <option value="sponsored nofollow">Sponsored + Nofollow (Link tài trợ)</option>
                      </select>
                    </div>
                  </div>

                  {/* Color, Style, Radius */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Màu Nút (Color)
                      </label>
                      <select
                        value={colorVal}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          if (isBtn1) updateBtn({ headerButton1Color: val });
                          else updateBtn({ headerButton2Color: val });
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800"
                      >
                        <option value="alert">Alert (Đỏ Nổi Bật / Cam)</option>
                        <option value="primary">Primary (Màu Chủ Đạo)</option>
                        <option value="secondary">Secondary (Màu Phụ)</option>
                        <option value="success">Success (Xanh Lá)</option>
                        <option value="white">White (Nền Trắng)</option>
                        <option value="plain">Plain (Mờ Tối Giản)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kiểu Dáng (Style)
                      </label>
                      <select
                        value={styleVal}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          if (isBtn1) updateBtn({ headerButton1Style: val });
                          else updateBtn({ headerButton2Style: val });
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800"
                      >
                        <option value="is-flat">Phẳng / Đổ Màu (Flat)</option>
                        <option value="is-outline">Viền Rỗng (Outline)</option>
                        <option value="is-shade">Đổ Bóng Mờ (Shade)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bo Góc (Radius)
                      </label>
                      <select
                        value={radiusVal}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (isBtn1) updateBtn({ headerButton1Radius: val });
                          else updateBtn({ headerButton2Radius: val });
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800"
                      >
                        <option value="99px">99px (Tròn Viên Thuốc - Pill)</option>
                        <option value="30px">30px (Bo Tròn Lớn)</option>
                        <option value="8px">8px (Bo Góc Vừa)</option>
                        <option value="4px">4px (Bo Nhẹ)</option>
                        <option value="0px">0px (Vuông Vức)</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    💡 <strong>Mẹo:</strong> Bạn cũng có thể thiết lập sâu hơn cho 2 nút này tại tab <strong>5. Nút CTA (Button 1 &amp; 2)</strong> của Bước 2.
                  </p>
                </div>
              );
            })()}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] text-slate-500">
                {onApplyTheme ? '💡 Bấm "Lưu & Áp Dụng Lên Web" để đồng bộ ngay sang WordPress' : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingContentModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Hoàn Tất (Lưu Tạm)
                </button>
                {onApplyTheme && (
                  <button
                    type="button"
                    disabled={isApplying}
                    onClick={async () => {
                      setEditingContentModal(null);
                      await onApplyTheme(themeConfig);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang Áp Dụng...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-3.5 h-3.5" />
                        <span>Lưu &amp; Áp Dụng Lên Web Ngay</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: A single chip in a Header slot (Styled like Image 2 dark badges with action tools)
interface ElementChipProps {
  def: HeaderElementDef;
  customLabel?: string;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSettings?: () => void;
}

const ElementChip: React.FC<ElementChipProps> = ({
  def,
  customLabel,
  onRemove,
  onMoveLeft,
  onMoveRight,
  isFirst,
  isLast,
  onSettings,
}) => {
  const Icon = def.icon;
  const isButton = def.id === 'button-1' || def.id === 'button-2';

  return (
    <div
      onClick={onSettings}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-white border shadow-sm text-xs font-medium transition group/chip ${
        isButton ? 'border-amber-500/50 bg-slate-800/95 ring-1 ring-amber-500/20' : 'border-slate-600'
      } ${onSettings ? 'cursor-pointer hover:border-blue-400' : ''}`}
      title={onSettings ? `${def.desc} (Bấm để mở cài đặt & sửa văn bản/nội dung)` : def.desc}
    >
      <Icon className={`w-3 h-3 ${isButton ? 'text-amber-400' : 'text-slate-400'} group-hover/chip:text-white transition`} />
      <span className={`font-semibold text-xs tracking-tight ${isButton ? 'text-amber-200' : ''}`}>
        {customLabel || def.shortName}
      </span>

      {/* Action buttons inside chip */}
      <div className="flex items-center gap-0.5 ml-1 pl-1 border-l border-slate-700 text-slate-400">
        {!isFirst && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveLeft();
            }}
            className="hover:text-white p-0.5 rounded hover:bg-slate-700 transition cursor-pointer"
            title="Di chuyển sang trái"
          >
            <ArrowLeft className="w-2.5 h-2.5" />
          </button>
        )}
        {!isLast && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveRight();
            }}
            className="hover:text-white p-0.5 rounded hover:bg-slate-700 transition cursor-pointer"
            title="Di chuyển sang phải"
          >
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        )}
        {def.hasSettings && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onSettings) onSettings();
            }}
            className="hover:text-blue-300 p-0.5 rounded hover:bg-slate-700 transition cursor-pointer"
            title="Cài đặt / Sửa text nút"
          >
            <Settings className="w-2.5 h-2.5 text-blue-400 hover:scale-110 transition" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:text-rose-400 p-0.5 rounded hover:bg-slate-700 transition cursor-pointer ml-0.5"
          title="Gỡ khỏi vị trí này"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};
