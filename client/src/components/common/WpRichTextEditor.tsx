import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Minus,
  RemoveFormatting,
  Code,
  Eye,
  Maximize2,
  Minimize2,
  Sparkles,
  Check,
  X,
  Palette,
  Undo,
  Redo,
  Image as ImageIcon,
  UploadCloud,
  FolderOpen,
  Search,
  Loader2,
  RefreshCw,
  ExternalLink,
  Pin,
} from 'lucide-react';
import { ConnectedSite, WpMediaItem } from '../../types';
import { api } from '../../services/api';

interface WpRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  label?: string;
  showShortcodeHelper?: boolean;
  currentSite?: ConnectedSite | null;
}

const COLOR_PALETTE = [
  { name: 'Đen (Mặc định)', color: '#1e293b' },
  { name: 'Đỏ Alert', color: '#e53935' },
  { name: 'Xanh Dương', color: '#2563eb' },
  { name: 'Xanh Lá', color: '#16a34a' },
  { name: 'Vàng Cam', color: '#f59e0b' },
  { name: 'Xám Đậm', color: '#475569' },
  { name: 'Trắng Sáng', color: '#ffffff' },
];

export const WpRichTextEditor: React.FC<WpRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung văn bản tại đây...',
  minHeight = 220,
  label,
  showShortcodeHelper = true,
  currentSite,
}) => {
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShortcodeMenu, setShowShortcodeMenu] = useState(false);

  // Link Modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkTargetBlank, setLinkTargetBlank] = useState(false);

  // Media Modal (Upload & Library)
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaTab, setMediaTab] = useState<'library' | 'upload' | 'url'>('library');
  const [mediaList, setMediaList] = useState<WpMediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<WpMediaItem | null>(null);
  const [mediaSearch, setMediaSearch] = useState('');

  // Media Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Media Insert Config
  const [imgAlign, setImgAlign] = useState<'center' | 'left' | 'right' | 'none'>('center');
  const [imgWidth, setImgWidth] = useState<'100%' | '75%' | '50%' | 'auto'>('100%');
  const [imgCaption, setImgCaption] = useState('');
  const [imgAltCustom, setImgAltCustom] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');

  const [currentFormat, setCurrentFormat] = useState('p');

  const [isStickyPinned, setIsStickyPinned] = useState(false);
  const stickySentinelRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Monitor when toolbar becomes sticky to enhance appearance
  useEffect(() => {
    if (!stickySentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStickyPinned(!entry.isIntersecting);
      },
      { threshold: [0, 1] }
    );
    observer.observe(stickySentinelRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync internal innerHTML when value changes from outside (and not focused)
  useEffect(() => {
    if (editorRef.current && mode === 'visual') {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, mode]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  }, [onChange]);

  const executeCmd = (cmd: string, val: string = '') => {
    if (mode === 'code') return;
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleInput();
  };

  const handleFormatChange = (tag: string) => {
    setCurrentFormat(tag);
    if (mode === 'code') return;
    editorRef.current?.focus();
    if (tag === 'p') {
      document.execCommand('formatBlock', false, '<p>');
    } else if (tag === 'blockquote') {
      document.execCommand('formatBlock', false, '<blockquote>');
    } else if (tag === 'pre') {
      document.execCommand('formatBlock', false, '<pre>');
    } else {
      document.execCommand('formatBlock', false, `<${tag}>`);
    }
    handleInput();
  };

  // ==========================================
  // LINK ACTIONS
  // ==========================================
  const openLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : '';
    setLinkText(selectedText);
    setLinkUrl('');
    setLinkTargetBlank(false);
    setShowLinkModal(true);
  };

  const handleApplyLink = () => {
    setShowLinkModal(false);
    if (!linkUrl) return;

    restoreSelection();
    editorRef.current?.focus();

    const targetAttr = linkTargetBlank ? ' target="_blank" rel="noopener noreferrer"' : '';
    if (linkText) {
      const linkHtml = `<a href="${linkUrl}"${targetAttr} style="color: #2563eb; text-decoration: underline;">${linkText}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
    } else {
      document.execCommand('createLink', false, linkUrl);
    }
    handleInput();
  };

  // ==========================================
  // MEDIA (IMAGE) ACTIONS
  // ==========================================
  const openMediaModal = async () => {
    saveSelection();
    setShowMediaModal(true);
    setUploadError(null);
    if (currentSite) {
      fetchMediaList();
    } else {
      setMediaTab('upload');
    }
  };

  const fetchMediaList = async () => {
    if (!currentSite) return;
    setIsLoadingMedia(true);
    try {
      const res = await api.listMedia(currentSite);
      if (res.media && Array.isArray(res.media)) {
        setMediaList(res.media);
        if (res.media.length > 0 && !selectedMedia) {
          setSelectedMedia(res.media[0]);
          setImgAltCustom(res.media[0].alt || res.media[0].title || '');
          setImgCaption(res.media[0].caption || '');
        }
      }
    } catch (err: any) {
      console.warn('Lỗi lấy danh sách media:', err);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setUploadTitle(cleanName);
    setUploadAlt(cleanName);

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAndInsert = async () => {
    if (!uploadFile || !uploadPreview) return;
    setIsUploading(true);
    setUploadError(null);

    let insertedUrl = uploadPreview;
    let insertedAlt = uploadAlt || uploadTitle || 'Hình ảnh';

    if (currentSite) {
      try {
        const res = await api.uploadMedia(currentSite, {
          filename: uploadFile.name,
          fileData: uploadPreview,
          title: uploadTitle,
          altText: uploadAlt,
          caption: imgCaption,
        });
        if (res.url) {
          insertedUrl = res.url;
        }
      } catch (err: any) {
        console.warn('Upload lên WP thất bại, chèn base64 ảnh trực tiếp:', err);
        setUploadError(err.message || 'Không thể upload lên WP, dùng ảnh tạm');
      }
    }

    insertImageIntoEditor(insertedUrl, insertedAlt, imgCaption);
    setIsUploading(false);
    setShowMediaModal(false);
    setUploadFile(null);
    setUploadPreview('');
  };

  const handleInsertSelectedMedia = () => {
    if (!selectedMedia) return;
    const url = selectedMedia.url;
    const alt = imgAltCustom || selectedMedia.alt || selectedMedia.title || 'Hình ảnh';
    insertImageIntoEditor(url, alt, imgCaption);
    setShowMediaModal(false);
  };

  const handleInsertCustomUrl = () => {
    if (!customImageUrl) return;
    insertImageIntoEditor(customImageUrl, imgAltCustom || 'Hình ảnh', imgCaption);
    setShowMediaModal(false);
    setCustomImageUrl('');
  };

  const insertImageIntoEditor = (url: string, alt: string, caption?: string) => {
    restoreSelection();
    editorRef.current?.focus();

    // Style according to alignment & width
    let containerStyle = 'margin: 16px 0; text-align: center; clear: both;';
    let imgStyle = 'max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.08);';

    if (imgWidth === '50%') {
      imgStyle += ' width: 50%;';
    } else if (imgWidth === '75%') {
      imgStyle += ' width: 75%;';
    } else if (imgWidth === '100%') {
      imgStyle += ' width: 100%;';
    }

    if (imgAlign === 'left') {
      containerStyle = 'float: left; margin: 8px 20px 16px 0; max-width: 50%;';
    } else if (imgAlign === 'right') {
      containerStyle = 'float: right; margin: 8px 0 16px 20px; max-width: 50%;';
    } else if (imgAlign === 'center') {
      containerStyle = 'margin: 16px auto; text-align: center; clear: both;';
      imgStyle += ' display: inline-block;';
    }

    const captionHtml = caption
      ? `<figcaption style="font-size: 12px; color: #64748b; margin-top: 6px; font-style: italic; text-align: center;">${caption}</figcaption>`
      : '';

    const imageHtml = `
<figure class="wp-block-image" style="${containerStyle}">
  <img src="${url}" alt="${alt}" style="${imgStyle}" loading="lazy" />
  ${captionHtml}
</figure>
<p></p>`;

    if (mode === 'visual') {
      document.execCommand('insertHTML', false, imageHtml);
      handleInput();
    } else {
      onChange((value || '') + '\n' + imageHtml);
    }
  };

  const insertShortcode = (shortcode: string) => {
    setShowShortcodeMenu(false);
    if (mode === 'visual') {
      editorRef.current?.focus();
      document.execCommand('insertHTML', false, shortcode);
      handleInput();
    } else {
      onChange((value || '') + '\n' + shortcode);
    }
  };

  const filteredMedia = mediaList.filter((m) =>
    (m.title || '').toLowerCase().includes(mediaSearch.toLowerCase()) ||
    (m.filename || '').toLowerCase().includes(mediaSearch.toLowerCase()) ||
    (m.alt || '').toLowerCase().includes(mediaSearch.toLowerCase())
  );

  return (
    <div
      className={`border border-slate-300 rounded-xl bg-white shadow-2xs transition-all flex flex-col ${
        isFullscreen
          ? 'fixed inset-4 z-99999 shadow-2xl ring-4 ring-blue-500/20 overflow-hidden'
          : 'relative'
      }`}
    >
      {/* Intersection Sentinel for Sticky detection */}
      <div ref={stickySentinelRef} className="h-px w-full pointer-events-none -mb-px" />

      {/* Sticky Header & Toolbar Container (Tự động neo bám theo mép trên khi cuộn xuống) */}
      <div
        className={`sticky top-0 z-30 rounded-t-xl transition-all ${
          isStickyPinned
            ? 'bg-[#f0f0f1]/98 backdrop-blur-md shadow-lg border-b-2 border-blue-500 ring-1 ring-blue-500/20'
            : 'bg-[#f0f0f1] border-b border-slate-300 shadow-xs'
        }`}
      >
        {/* Top Header: Label, Add Media Button & Mode Switcher */}
        <div className="px-3 py-2 flex items-center justify-between gap-2 select-none border-b border-slate-200/90">
          <div className="flex items-center gap-2">
            {label && (
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{label}</span>
              </span>
            )}

            {isStickyPinned && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/90 border border-blue-300/80 px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in">
                <Pin className="w-2.5 h-2.5 text-blue-600" />
                <span>Đang neo thanh công cụ</span>
              </span>
            )}

            {/* WordPress Style "Thêm Media" Button */}
            <button
              type="button"
              onClick={openMediaModal}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 hover:text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs hover:border-blue-400"
              title="Tải ảnh lên hoặc chọn từ Thư viện Media WordPress"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Thêm Media / Ảnh</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Visual / HTML Mode Switcher */}
            <div className="inline-flex rounded-lg border border-slate-300 bg-slate-200/80 p-0.5">
              <button
                type="button"
                onClick={() => setMode('visual')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1 cursor-pointer ${
                  mode === 'visual'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Trực quan (Visual)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('code')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1 cursor-pointer ${
                  mode === 'code'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>Văn bản (HTML)</span>
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Main Toolbar (Styled like WordPress Classic Editor / TinyMCE) */}
        {mode === 'visual' && (
          <div className="bg-[#f6f7f7] px-2.5 py-1.5 flex flex-wrap items-center gap-1 text-slate-700 text-xs">
          {/* Format Selector (Paragraph, Heading 1, 2, 3...) */}
          <select
            value={currentFormat}
            onChange={(e) => handleFormatChange(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-800 outline-hidden hover:border-slate-400 cursor-pointer mr-1"
          >
            <option value="p">Đoạn văn (Paragraph)</option>
            <option value="h1">Tiêu đề 1 (H1)</option>
            <option value="h2">Tiêu đề 2 (H2)</option>
            <option value="h3">Tiêu đề 3 (H3)</option>
            <option value="h4">Tiêu đề 4 (H4)</option>
            <option value="blockquote">Trích dẫn (Quote)</option>
            <option value="pre">Định dạng sẵn (Pre)</option>
          </select>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Bold, Italic, Underline, Strikethrough */}
          <button
            type="button"
            onClick={() => executeCmd('bold')}
            title="In đậm (Ctrl+B)"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer font-bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('italic')}
            title="In nghiêng (Ctrl+I)"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('underline')}
            title="Gạch chân (Ctrl+U)"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('strikeThrough')}
            title="Gạch ngang"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => executeCmd('insertUnorderedList')}
            title="Danh sách dấu chấm"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('insertOrderedList')}
            title="Danh sách số"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleFormatChange('blockquote')}
            title="Khối trích dẫn"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Alignments */}
          <button
            type="button"
            onClick={() => executeCmd('justifyLeft')}
            title="Căn trái"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('justifyCenter')}
            title="Căn giữa"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('justifyRight')}
            title="Căn phải"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('justifyFull')}
            title="Căn đều 2 bên"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Link / Unlink */}
          <button
            type="button"
            onClick={openLinkModal}
            title="Chèn liên kết"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('unlink')}
            title="Xóa liên kết"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer"
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>

          {/* Quick Insert Image Icon */}
          <button
            type="button"
            onClick={openMediaModal}
            title="Chèn ảnh / Media"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>

          {/* Color Picker Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Màu chữ văn bản"
              className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-blue-600" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-300 rounded-lg shadow-lg p-2 w-48 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Chọn Màu Chữ</span>
                {COLOR_PALETTE.map((c) => (
                  <div
                    key={c.color}
                    onClick={() => {
                      executeCmd('foreColor', c.color);
                      setShowColorPicker(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100 cursor-pointer text-xs"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-slate-800">{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Horizontal Rule */}
          <button
            type="button"
            onClick={() => executeCmd('insertHorizontalRule')}
            title="Đường kẻ ngang (Horizontal Rule)"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => executeCmd('removeFormat')}
            title="Xóa định dạng"
            className="p-1.5 rounded hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 cursor-pointer"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => executeCmd('undo')}
            title="Hoàn tác (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 cursor-pointer"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('redo')}
            title="Làm lại (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-slate-200/80 text-slate-700 cursor-pointer"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          {/* Flatsome Shortcodes Menu */}
          {showShortcodeHelper && (
            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setShowShortcodeMenu(!showShortcodeMenu)}
                className="px-2 py-1 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>+ Shortcode Flatsome</span>
              </button>
              {showShortcodeMenu && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-300 rounded-lg shadow-xl p-2 w-64 space-y-1 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5">
                    Chèn Nhanh Shortcode Flatsome
                  </div>
                  <button
                    type="button"
                    onClick={() => insertShortcode('[button text="Nhấp Vào Đây" link="#" style="primary" size="medium" radius="5"]')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                  >
                    <span>Nút Bấm (Button)</span>
                    <code className="text-[10px] text-slate-400">[button]</code>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertShortcode('[gap height="30px"]')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                  >
                    <span>Khoảng Trống (Gap)</span>
                    <code className="text-[10px] text-slate-400">[gap]</code>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertShortcode('[divider width="100px" height="2px" color="rgb(37, 99, 235)"]')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                  >
                    <span>Đường Phân Cách (Divider)</span>
                    <code className="text-[10px] text-slate-400">[divider]</code>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertShortcode('<p style="font-size: 1.15em; line-height: 1.8; color: #1e293b;">Nội dung đoạn văn nổi bật...</p>')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                  >
                    <span>Đoạn Văn Nổi Bật (Lead)</span>
                    <code className="text-[10px] text-slate-400">&lt;p&gt;</code>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative bg-white">
        {mode === 'visual' ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            style={{ minHeight: `${minHeight}px` }}
            className={`w-full p-4 text-slate-800 text-sm leading-relaxed focus:outline-hidden prose prose-slate max-w-none ${
              isFullscreen ? 'h-full overflow-y-auto' : ''
            }`}
            data-placeholder={placeholder}
          />
        ) : (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={{ minHeight: `${minHeight}px` }}
            className={`w-full p-4 font-mono text-xs text-slate-800 leading-relaxed bg-slate-50 focus:outline-hidden focus:bg-white resize-y ${
              isFullscreen ? 'h-full' : ''
            }`}
            placeholder="Nhập mã HTML hoặc Flatsome Shortcode tại đây..."
          />
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="bg-[#f6f7f7] border-t border-slate-200 px-3 py-1 flex items-center justify-between text-[11px] text-slate-500">
        <div>
          {mode === 'visual' ? (
            <span>Đang ở chế độ soạn thảo trực quan WYSIWYG</span>
          ) : (
            <span className="text-amber-600 font-medium">Đang chỉnh sửa mã nguồn HTML</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>{((value || '').replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length)} từ</span>
          <span>{(value || '').length} ký tự</span>
        </div>
      </div>

      {/* ==========================================
          MODAL: WORDPRESS MEDIA MANAGER
         ========================================== */}
      {showMediaModal && (
        <div className="fixed inset-0 z-999999 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl h-[650px] max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Thêm Media &amp; Tải Ảnh Lên Bài Viết</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Navigation (WordPress Style) */}
            <div className="bg-slate-100 border-b border-slate-200 px-5 pt-3 flex items-center justify-between shrink-0">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMediaTab('library')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-2 cursor-pointer border-t border-x ${
                    mediaTab === 'library'
                      ? 'bg-white text-blue-700 border-slate-300 -mb-px shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Thư Viện Media WordPress ({mediaList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTab('upload')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-2 cursor-pointer border-t border-x ${
                    mediaTab === 'upload'
                      ? 'bg-white text-blue-700 border-slate-300 -mb-px shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Tải Tập Tin Lên Máy Chủ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTab('url')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-2 cursor-pointer border-t border-x ${
                    mediaTab === 'url'
                      ? 'bg-white text-blue-700 border-slate-300 -mb-px shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Chèn Từ Đường Dẫn (URL)</span>
                </button>
              </div>

              {mediaTab === 'library' && (
                <div className="flex items-center gap-2 pb-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={mediaSearch}
                      onChange={(e) => setMediaSearch(e.target.value)}
                      placeholder="Tìm kiếm hình ảnh..."
                      className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 outline-hidden focus:border-blue-500 w-48"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={fetchMediaList}
                    disabled={isLoadingMedia}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 cursor-pointer"
                    title="Làm mới thư viện"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMedia ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* TAB 1: MEDIA LIBRARY */}
              {mediaTab === 'library' && (
                <div className="flex-1 flex overflow-hidden">
                  {/* Grid list of images */}
                  <div className="flex-1 p-4 overflow-y-auto border-r border-slate-200">
                    {isLoadingMedia ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-xs">Đang tải thư viện ảnh từ WordPress...</span>
                      </div>
                    ) : filteredMedia.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                        <ImageIcon className="w-12 h-12 text-slate-300" />
                        <div className="text-center">
                          <p className="text-xs font-semibold text-slate-600">Không tìm thấy hình ảnh nào</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {mediaList.length === 0 ? 'Thư viện chưa có ảnh nào trên website này' : 'Không khớp với từ khóa tìm kiếm'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMediaTab('upload')}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer"
                        >
                          Tải ảnh đầu tiên lên
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {filteredMedia.map((m) => {
                          const isSelected = selectedMedia?.id === m.id;
                          return (
                            <div
                              key={m.id}
                              onClick={() => {
                                setSelectedMedia(m);
                                setImgAltCustom(m.alt || m.title || '');
                                setImgCaption(m.caption || '');
                              }}
                              className={`aspect-square rounded-xl border-2 overflow-hidden relative cursor-pointer group transition ${
                                isSelected
                                  ? 'border-blue-600 ring-3 ring-blue-500/20'
                                  : 'border-slate-200 hover:border-blue-400'
                              }`}
                            >
                              <img
                                src={m.thumb || m.url}
                                alt={m.alt || m.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                              />
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 bg-blue-600 text-white rounded-full p-1 shadow-sm">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition">
                                <p className="text-[10px] text-white truncate font-medium">{m.title || m.filename}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Sidebar Info & Insert Options */}
                  <div className="w-72 bg-slate-50 p-4 overflow-y-auto flex flex-col justify-between shrink-0 space-y-4">
                    {selectedMedia ? (
                      <div className="space-y-4">
                        <div className="border-b border-slate-200 pb-3">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                            Chi Tiết Đính Kèm
                          </h4>
                          <div className="aspect-video rounded-lg overflow-hidden border border-slate-300 bg-white mb-2">
                            <img
                              src={selectedMedia.url}
                              alt={selectedMedia.title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-xs font-bold text-slate-900 truncate">{selectedMedia.title || selectedMedia.filename}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">ID: #{selectedMedia.id}</p>
                        </div>

                        {/* Formatting Options */}
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Văn Bản Thay Thế (Alt Text chuẩn SEO)
                            </label>
                            <input
                              type="text"
                              value={imgAltCustom}
                              onChange={(e) => setImgAltCustom(e.target.value)}
                              placeholder="Mô tả hình ảnh cho Google..."
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 outline-hidden focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Chú Thích Dưới Ảnh (Caption)
                            </label>
                            <input
                              type="text"
                              value={imgCaption}
                              onChange={(e) => setImgCaption(e.target.value)}
                              placeholder="Để trống nếu không cần chú thích"
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 outline-hidden focus:border-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Căn Lề</label>
                              <select
                                value={imgAlign}
                                onChange={(e: any) => setImgAlign(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 outline-hidden cursor-pointer"
                              >
                                <option value="center">Căn Giữa</option>
                                <option value="left">Căn Trái</option>
                                <option value="right">Căn Phải</option>
                                <option value="none">Không căn</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kích Thước</label>
                              <select
                                value={imgWidth}
                                onChange={(e: any) => setImgWidth(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 outline-hidden cursor-pointer"
                              >
                                <option value="100%">100% (Toàn khung)</option>
                                <option value="75%">75% (Vừa)</option>
                                <option value="50%">50% (Một nửa)</option>
                                <option value="auto">Kích thước gốc</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs p-4">
                        Chọn một hình ảnh bên trái để xem thông tin và chèn vào bài viết
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={handleInsertSelectedMedia}
                        disabled={!selectedMedia}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                          selectedMedia
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>Chèn Ảnh Này Vào Bài Viết</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: UPLOAD IMAGE */}
              {mediaTab === 'upload' && (
                <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center">
                  <div className="w-full max-w-xl space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {!uploadPreview ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/60 hover:bg-blue-50/30 flex flex-col items-center justify-center gap-3 group"
                      >
                        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Nhấp Vào Đây Để Chọn Tệp Ảnh Từ Máy</h4>
                          <p className="text-xs text-slate-500 mt-1">Hỗ trợ PNG, JPG, WEBP, GIF, SVG</p>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                          Chọn Tệp Tin
                        </span>
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-32 h-24 rounded-lg overflow-hidden border border-slate-300 bg-white shrink-0">
                            <img src={uploadPreview} alt="Xem trước" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-900 truncate">{uploadFile?.name}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setUploadFile(null);
                                  setUploadPreview('');
                                }}
                                className="text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
                              >
                                Đổi ảnh khác
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Kích thước: {uploadFile ? (uploadFile.size / 1024).toFixed(1) + ' KB' : ''}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-slate-200">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Tiêu Đề Ảnh
                            </label>
                            <input
                              type="text"
                              value={uploadTitle}
                              onChange={(e) => setUploadTitle(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Văn Bản Thay Thế (Alt Text chuẩn SEO)
                            </label>
                            <input
                              type="text"
                              value={uploadAlt}
                              onChange={(e) => setUploadAlt(e.target.value)}
                              placeholder="Từ khóa SEO mô tả nội dung hình ảnh..."
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Chú Thích Dưới Ảnh (Caption)
                            </label>
                            <input
                              type="text"
                              value={imgCaption}
                              onChange={(e) => setImgCaption(e.target.value)}
                              placeholder="Để trống nếu không muốn hiện chú thích"
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Căn Lề</label>
                              <select
                                value={imgAlign}
                                onChange={(e: any) => setImgAlign(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
                              >
                                <option value="center">Căn Giữa</option>
                                <option value="left">Căn Trái</option>
                                <option value="right">Căn Phải</option>
                                <option value="none">Không căn</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kích Thước</label>
                              <select
                                value={imgWidth}
                                onChange={(e: any) => setImgWidth(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
                              >
                                <option value="100%">100% (Toàn khung)</option>
                                <option value="75%">75% (Vừa)</option>
                                <option value="50%">50% (Một nửa)</option>
                                <option value="auto">Kích thước gốc</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {uploadError && (
                          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                            {uploadError}
                          </p>
                        )}

                        <div className="pt-2 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleUploadAndInsert}
                            disabled={isUploading}
                            className="w-full py-2.5 px-5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Đang Tải Lên WordPress...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Tải Lên Máy Chủ &amp; Chèn Vào Bài Viết</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: INSERT VIA URL */}
              {mediaTab === 'url' && (
                <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center">
                  <div className="w-full max-w-md space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Chèn Hình Ảnh Trực Tiếp Từ Đường Dẫn (URL)
                    </h4>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Đường Dẫn Hình Ảnh (URL)</label>
                      <input
                        type="text"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        placeholder="https://example.com/hinh-anh.jpg"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500 font-mono"
                      />
                    </div>

                    {customImageUrl && (
                      <div className="aspect-video rounded-lg overflow-hidden border border-slate-300 bg-white">
                        <img
                          src={customImageUrl}
                          alt="Xem trước"
                          className="w-full h-full object-contain"
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Văn Bản Thay Thế (Alt Text)
                      </label>
                      <input
                        type="text"
                        value={imgAltCustom}
                        onChange={(e) => setImgAltCustom(e.target.value)}
                        placeholder="Mô tả hình ảnh chuẩn SEO..."
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Chú Thích Dưới Ảnh (Caption)
                      </label>
                      <input
                        type="text"
                        value={imgCaption}
                        onChange={(e) => setImgCaption(e.target.value)}
                        placeholder="Để trống nếu không cần"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-hidden focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Căn Lề</label>
                        <select
                          value={imgAlign}
                          onChange={(e: any) => setImgAlign(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
                        >
                          <option value="center">Căn Giữa</option>
                          <option value="left">Căn Trái</option>
                          <option value="right">Căn Phải</option>
                          <option value="none">Không căn</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kích Thước</label>
                        <select
                          value={imgWidth}
                          onChange={(e: any) => setImgWidth(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 outline-hidden cursor-pointer"
                        >
                          <option value="100%">100% (Toàn khung)</option>
                          <option value="75%">75% (Vừa)</option>
                          <option value="50%">50% (Một nửa)</option>
                          <option value="auto">Kích thước gốc</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleInsertCustomUrl}
                      disabled={!customImageUrl}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                        customImageUrl
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Chèn Ảnh Từ Đường Dẫn Này</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: INSERT / EDIT LINK
         ========================================== */}
      {showLinkModal && (
        <div className="fixed inset-0 z-999999 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-md p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase">
                <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Chèn / Sửa Liên Kết (URL)</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Địa Chỉ Đường Dẫn (URL)</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com hoặc #lien-he"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Văn Bản Hiển Thị</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Nhập chữ hiển thị (nếu chưa chọn)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={linkTargetBlank}
                  onChange={(e) => setLinkTargetBlank(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 accent-blue-600"
                />
                <span className="text-xs text-slate-700">Mở liên kết trong tab mới (_blank)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Chèn Liên Kết</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
