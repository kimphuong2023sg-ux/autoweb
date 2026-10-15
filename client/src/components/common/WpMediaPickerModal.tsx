import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  RefreshCw,
  FolderOpen,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { ConnectedSite, WpMediaItem } from '../../types';
import { api } from '../../services/api';

interface WpMediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: WpMediaItem) => void;
  currentSite?: ConnectedSite | null;
  title?: string;
  selectedMediaId?: number;
}

export const WpMediaPickerModal: React.FC<WpMediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentSite,
  title = 'Chọn Ảnh từ Thư Viện Media WordPress',
  selectedMediaId,
}) => {
  const [mediaList, setMediaList] = useState<WpMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMedia = async () => {
    if (!currentSite) {
      setErrorMessage('Chưa kết nối website WordPress. Vui lòng kết nối ở thanh công cụ phía trên.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.listMedia(currentSite);
      if (res && res.media) {
        setMediaList(res.media);
      } else {
        setMediaList([]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tải danh sách Media từ WordPress');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setErrorMessage(null);
      fetchMedia();
    }
  }, [isOpen, currentSite]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSite) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Kích thước ảnh vượt quá 15MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsUploading(true);
      setErrorMessage(null);

      try {
        const res = await api.uploadMedia(currentSite, {
          filename: file.name,
          fileData: base64,
          title: file.name.replace(/\.[^/.]+$/, ''),
          altText: file.name.replace(/\.[^/.]+$/, ''),
        });

        if (res && res.media) {
          // Thêm ngay ảnh mới vào đầu danh sách
          setMediaList((prev) => [res.media, ...prev]);
          // Tự động chọn ảnh vừa tải lên luôn cho tiện!
          onSelect(res.media);
          onClose();
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Lỗi khi tải ảnh lên Media WordPress');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredMedia = mediaList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.alt && item.alt.toLowerCase().includes(q)) ||
      (item.filename && item.filename.toLowerCase().includes(q)) ||
      String(item.id).includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">{title}</h3>
              <p className="text-[11px] text-slate-500">
                {currentSite ? (
                  <span>
                    Website: <strong className="text-blue-600">{currentSite.name || currentSite.siteUrl}</strong> ({mediaList.length} ảnh)
                  </span>
                ) : (
                  <span className="text-amber-600">Chưa chọn website WordPress</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={fetchMedia}
              disabled={isLoading || !currentSite}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-50 cursor-pointer"
              title="Làm mới thư viện Media"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search + Quick Upload */}
        <div className="p-3 border-b border-slate-100 bg-white flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên file, tiêu đề, Alt text hoặc ID ảnh..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-blue-500 bg-slate-50/50 focus:bg-white"
            />
          </div>

          {currentSite && (
            <label className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition shrink-0">
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>{isUploading ? 'Đang tải lên...' : 'Tải ảnh mới lên Media'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileUpload}
              />
            </label>
          )}
        </div>

        {/* Error notice */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-xs font-medium">Đang tải thư viện ảnh từ WordPress...</span>
            </div>
          ) : !currentSite ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
              <FolderOpen className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-medium text-slate-600">Chưa kết nối website WordPress</p>
              <p className="text-[11px] text-slate-400">Vui lòng kết nối với WordPress ở thanh công cụ trên cùng để duyệt Media.</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
              <ImageIcon className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-medium text-slate-600">
                {searchQuery ? `Không tìm thấy ảnh nào khớp với "${searchQuery}"` : 'Thư viện Media trên website chưa có ảnh nào'}
              </p>
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filteredMedia.map((item) => {
                const isSelected = selectedMediaId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className={`group relative rounded-xl overflow-hidden border text-left bg-slate-50 transition cursor-pointer flex flex-col ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-600 shadow-md'
                        : 'border-slate-200 hover:border-blue-400 hover:shadow-xs'
                    }`}
                  >
                    <div className="aspect-square bg-slate-900/10 overflow-hidden relative flex items-center justify-center">
                      <img
                        src={item.thumb || item.url}
                        alt={item.alt || item.title || 'Media thumbnail'}
                        className="w-full h-full object-contain group-hover:scale-105 transition duration-200"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1 py-0.5 rounded">
                        #{item.id}
                      </span>
                    </div>

                    <div className="p-1.5 bg-white border-t border-slate-100 flex-1 flex flex-col justify-center">
                      <span className="text-[11px] font-medium text-slate-800 truncate block" title={item.title || item.filename}>
                        {item.title || item.filename || `Ảnh #${item.id}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            💡 Bấm vào ảnh bất kỳ để chọn làm Logo chân trang ngay lập tức.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
