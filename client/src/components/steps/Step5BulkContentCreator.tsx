import React, { useState, useEffect } from 'react';
import {
  FileText,
  FolderTree,
  FilePlus2,
  Sparkles,
  Trash2,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Table,
  UploadCloud,
  Check,
  AlignLeft,
  RefreshCw,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { ConnectedSite } from '../../types';
import { api } from '../../services/api';

export interface BulkItem {
  id?: string;
  term_id?: number;
  title: string;
  slug: string;
  description?: string;
  type: 'page' | 'post' | 'category';
  isExisting?: boolean;
  isDefault?: boolean;
  count?: number;
}

interface Step5BulkContentCreatorProps {
  currentSite: ConnectedSite;
  onRefreshInspect?: () => Promise<void>;
  onNextStep?: () => void;
  onPrevStep?: () => void;
}

const normalizeSlug = (s?: string): string => {
  if (!s) return '';
  const trimmed = s.trim().toLowerCase();
  if (trimmed === '/' || trimmed === '') return trimmed;
  return trimmed.replace(/^\/+|\/+$/g, '');
};

const normalizeTitle = (t?: string): string => {
  if (!t) return '';
  return t.trim().toLowerCase().replace(/\s+/g, ' ');
};

export const Step5BulkContentCreator: React.FC<Step5BulkContentCreatorProps> = ({
  currentSite,
  onRefreshInspect,
  onNextStep,
  onPrevStep,
}) => {
  const [defaultType, setDefaultType] = useState<'page' | 'post' | 'category'>('page');
  const [excelPasteText, setExcelPasteText] = useState('');
  const [items, setItems] = useState<BulkItem[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [pasteNotice, setPasteNotice] = useState<{ type: 'success' | 'info' | 'warn'; text: string } | null>(null);

  const [createResults, setCreateResults] = useState<{
    summary?: { total: number; created: number; updated: number; failed: number };
    results?: Array<{
      id?: number;
      title: string;
      slug: string;
      type: string;
      action?: string;
      url?: string;
      success: boolean;
      error?: string;
    }>;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [syncingRowId, setSyncingRowId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [rowSuccessMsg, setRowSuccessMsg] = useState<{ [id: string]: string }>({});

  const storageKey = `flatsome_seo_bulk_items_${(currentSite?.siteUrl || '').replace(/[^a-zA-Z0-9]/g, '_')}`;

  // 1. Load from localStorage on mount/site change
  useEffect(() => {
    if (!currentSite?.siteUrl) return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Lỗi khi đọc danh sách từ localStorage', e);
    }

    setItems([]);
  }, [currentSite?.siteUrl, storageKey]);

  // 2. Auto-save to localStorage whenever items changes
  const saveItems = (newItems: BulkItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newItems));
    } catch (e) {
      console.error('Lỗi khi lưu danh sách vào localStorage', e);
    }
  };

  // 3. Scan & Load All Existing Content from Live WordPress
  const handleScanFromWebsite = async () => {
    if (!currentSite?.siteUrl) return;

    try {
      setIsScanning(true);
      setErrorMsg(null);
      setScanMessage(null);

      const res = await api.listContent(currentSite, { type: 'all' });
      if (res && Array.isArray(res.items)) {
        const liveItems: BulkItem[] = res.items.map((it: any) => ({
          id: `wp-${it.id || it.slug}`,
          term_id: it.term_id || (it.type === 'category' ? it.id : undefined),
          title: it.title || '',
          slug: it.slug || '',
          description: it.description || '',
          type: it.type || 'category',
          isExisting: true,
          isDefault: !!it.is_default,
          count: typeof it.count === 'number' ? it.count : undefined,
        }));

        saveItems(liveItems);
        setScanMessage(`Đã quét & nạp thành công ${liveItems.length} mục đang có trên WordPress!`);
        setTimeout(() => setScanMessage(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể quét danh sách từ website. Vui lòng kiểm tra lại kết nối!');
    } finally {
      setIsScanning(false);
    }
  };

  // 4. Xóa chuyên mục / trang / bài viết vĩnh viễn khỏi WordPress
  const handleDeleteFromWordPress = async (item: BulkItem) => {
    if (!item.isExisting) {
      handleRemoveItem(item.id!);
      return;
    }

    const typeLabel = item.type === 'category' ? 'Chuyên mục' : (item.type === 'page' ? 'Trang' : 'Bài viết');
    const confirmMsg = item.isDefault
      ? `"${item.title}" là chuyên mục Mặc Định của WordPress. Bạn có chắc chắn muốn xóa không? (Nếu xóa được, WordPress sẽ chuyển mặc định sang chuyên mục khác; nếu không xóa được, bạn có thể sửa trực tiếp Tên/Slug ở dòng này để tái sử dụng).`
      : `Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${typeLabel} "${item.title}" khỏi website WordPress không?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setDeletingId(item.id!);
      setErrorMsg(null);

      let numericId: number | undefined = item.term_id;
      if (!numericId && item.id?.startsWith('wp-')) {
        const parsed = parseInt(item.id.replace('wp-', ''), 10);
        if (!isNaN(parsed)) numericId = parsed;
      }

      const res = await api.deleteContent(currentSite, {
        type: item.type,
        id: numericId,
        slug: item.slug.replace(/^\/+/, ''),
      });

      if (res && res.success) {
        saveItems(items.filter((it) => it.id !== item.id));
        setScanMessage(res.message || `Đã xóa ${typeLabel} thành công!`);
        setTimeout(() => setScanMessage(null), 4000);
        if (onRefreshInspect) {
          await onRefreshInspect();
        }
      } else {
        setErrorMsg(res?.message || `Không thể xóa ${typeLabel} khỏi WordPress.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || `Lỗi khi xóa ${typeLabel} trên WordPress.`);
    } finally {
      setDeletingId(null);
    }
  };

  // Parse bulk text from Excel/Google Sheets with smart de-duplication
  const handleParseExcelText = () => {
    if (!excelPasteText.trim()) return;

    const lines = excelPasteText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const workingItems: BulkItem[] = [...items];
    let addedCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      let title = '';
      let slug = '';
      let description = '';

      if (line.includes('\t')) {
        // Tab-separated from Excel / Google Sheets
        const parts = line.split('\t');
        title = parts[0]?.trim() || '';
        slug = parts[1]?.trim() || '';
        description = parts[2]?.trim() || '';
      } else if (line.includes('|')) {
        const parts = line.split('|');
        title = parts[0]?.trim() || '';
        slug = parts[1]?.trim() || '';
        description = parts[2]?.trim() || '';
      } else if (line.includes(',')) {
        const parts = line.split(',');
        title = parts[0]?.trim() || '';
        slug = parts[1]?.trim() || '';
        description = parts.slice(2).join(',').trim() || '';
      } else {
        title = line;
        slug = '';
        description = '';
      }

      if (!title && !slug) continue;

      // Clean & format slug with leading slash if not empty
      let cleanSlug = slug.trim();
      if (cleanSlug && !cleanSlug.startsWith('/')) {
        cleanSlug = '/' + cleanSlug;
      }

      const normSlug = normalizeSlug(cleanSlug);
      const normTitle = normalizeTitle(title);

      // Check if item already exists in workingItems (by slug or by title)
      const existingIdx = workingItems.findIndex((it) => {
        const itSlug = normalizeSlug(it.slug);
        const itTitle = normalizeTitle(it.title);

        // 1. If both have valid non-empty slugs (and not '/'), check slug match
        if (normSlug && itSlug && normSlug !== '/' && normSlug === itSlug) {
          return true;
        }

        // 2. If both have non-empty titles, check title match
        if (normTitle && itTitle && normTitle === itTitle) {
          return true;
        }

        // 3. If both are root homepage '/'
        if (normSlug === '/' && itSlug === '/') {
          return true;
        }

        return false;
      });

      if (existingIdx !== -1) {
        // Update existing item without creating duplicate row
        const existing = workingItems[existingIdx];
        workingItems[existingIdx] = {
          ...existing,
          title: title || existing.title,
          slug: cleanSlug || existing.slug,
          description: description || existing.description,
          type: existing.type || defaultType,
        };
        updatedCount++;
      } else {
        // Add as a brand new item
        workingItems.push({
          id: `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          title,
          slug: cleanSlug,
          description,
          type: defaultType,
        });
        addedCount++;
      }
    }

    if (addedCount > 0 || updatedCount > 0) {
      saveItems(workingItems);
      setExcelPasteText('');
      setCreateResults(null);

      let msg = '';
      if (addedCount > 0 && updatedCount > 0) {
        msg = `Đã nạp thành công: Thêm mới ${addedCount} mục, cập nhật ${updatedCount} mục đã có (không bị nhân đôi).`;
        setPasteNotice({ type: 'success', text: msg });
      } else if (addedCount > 0) {
        msg = `Đã nạp thành công ${addedCount} mục mới vào bảng.`;
        setPasteNotice({ type: 'success', text: msg });
      } else {
        msg = `Tất cả ${updatedCount} mục đã tồn tại trong bảng! Đã cập nhật lại thông tin, không nhân đôi số lượng.`;
        setPasteNotice({ type: 'info', text: msg });
      }

      setScanMessage(msg);
      setTimeout(() => {
        setPasteNotice(null);
        setScanMessage(null);
      }, 6000);
    } else {
      setPasteNotice({
        type: 'warn',
        text: 'Không tìm thấy dòng dữ liệu hợp lệ để nạp vào bảng.',
      });
      setTimeout(() => setPasteNotice(null), 4000);
    }
  };

  // Lọc và loại bỏ các dòng bị trùng lặp trong bảng hiện tại
  const handleDeduplicateExisting = () => {
    if (items.length <= 1) return;

    const seenSlugs = new Set<string>();
    const seenTitles = new Set<string>();
    const deduped: BulkItem[] = [];
    let removedCount = 0;

    for (const item of items) {
      const s = normalizeSlug(item.slug);
      const t = normalizeTitle(item.title);

      const isDupSlug = Boolean(s && s !== '/' && seenSlugs.has(s));
      const isDupTitle = Boolean(t && seenTitles.has(t));

      if (isDupSlug || isDupTitle) {
        removedCount++;
        // Gộp mô tả nếu mục trước đó chưa có mô tả mà mục này có
        const existingIdx = deduped.findIndex((d) => 
          (s && s !== '/' && normalizeSlug(d.slug) === s) ||
          (t && normalizeTitle(d.title) === t)
        );
        if (existingIdx !== -1 && item.description && !deduped[existingIdx].description) {
          deduped[existingIdx] = {
            ...deduped[existingIdx],
            description: item.description,
          };
        }
      } else {
        if (s && s !== '/') seenSlugs.add(s);
        if (t) seenTitles.add(t);
        deduped.push(item);
      }
    }

    if (removedCount > 0) {
      saveItems(deduped);
      const msg = `Đã lọc và loại bỏ ${removedCount} dòng trùng lặp! Giữ lại ${deduped.length} mục duy nhất.`;
      setPasteNotice({ type: 'success', text: msg });
      setScanMessage(msg);
    } else {
      setPasteNotice({
        type: 'info',
        text: `Bảng dữ liệu sạch, không phát hiện dòng nào bị trùng lặp (${items.length} mục).`,
      });
    }

    setTimeout(() => {
      setPasteNotice(null);
      setScanMessage(null);
    }, 5000);
  };

  // Load sample matching user's Excel sheet
  const handleLoadSample = () => {
    const sample: BulkItem[] = [
      { id: '1', title: 'JuegaLotto: El Mejor Casino y Lotería en Línea Oficial', slug: '/', description: 'Trang chủ chính thức của JuegaLotto - Cổng game casino và xổ số trực tuyến số 1 tại Mexico.', type: 'category' },
      { id: '2', title: 'Casino en Línea y Máquinas Tragamonedas en México - JuegaLotto', slug: '/casino-online-mexico', description: 'Trải nghiệm hàng trăm máy slots nổ hũ và casino trực tiếp hấp dẫn nhất.', type: 'category' },
      { id: '3', title: 'Lotería en Línea y Sorteos Oficiales en México - JuegaLotto', slug: '/loteria-en-linea', description: 'Sorteos y lotería oficial de México con premios millonarios en vivo.', type: 'category' },
      { id: '4', title: 'Apuestas Deportivas en Línea: Liga MX y Deportes en Vivo', slug: '/apuestas-deportivas', description: 'Cá cược bóng đá Liga MX, NBA, bóng chày với tỷ lệ cược cạnh tranh nhất.', type: 'category' },
      { id: '5', title: 'Bonos de Casino y Promociones: Hasta $2,000 MXN de Bienvenida', slug: '/bonos-y-promociones', description: 'Nhận ngay gói quà tặng chào mừng lên đến $2,000 MXN khi đăng ký tài khoản.', type: 'category' },
      { id: '6', title: 'Guía de Pagos: Cómo Depositar con OXXO, SPEI y 7-Eleven', slug: '/metodos-de-pago', description: 'Hướng dẫn thanh toán nhanh chóng, an toàn qua hệ thống OXXO và chuyển khoản SPEI.', type: 'category' },
      { id: '7', title: 'Descargar JuegaLotto App APK para Android y Google Play', slug: '/descargar-app', description: 'Tải ứng dụng di động JuegaLotto tiện lợi chơi mọi lúc mọi nơi trên điện thoại.', type: 'category' },
      { id: '8', title: 'Licencia Oficial SEGOB y Seguridad Legal en JuegaLotto', slug: '/licencia-y-seguridad', description: 'Giấy phép hoạt động hợp pháp do bộ nội vụ SEGOB cấp, đảm bảo minh bạch tuyệt đối.', type: 'category' },
      { id: '9', title: 'Juego Responsable y Ayuda al Jugador - Línea de la Vida', slug: '/juego-responsable', description: 'Chính sách chơi có trách nhiệm và hỗ trợ người chơi 24/7.', type: 'category' },
      { id: '10', title: 'Fortune Gems 2 en JuegaLotto: Guía, RTP y Consejos para Ganar', slug: '/fortune-gems-2-guia-consejos', description: 'Cẩm nang chơi nổ hũ Fortune Gems 2, tỷ lệ trả thưởng RTP và bí quyết thắng lớn.', type: 'category' },
    ];
    saveItems(sample);
    setCreateResults(null);
  };

  const handleAddItem = () => {
    saveItems([
      ...items,
      {
        id: `${Date.now()}`,
        title: '',
        slug: '',
        description: '',
        type: defaultType,
      },
    ]);
  };

  const handleUpdateItem = (id: string, field: keyof BulkItem, value: any) => {
    saveItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    saveItems(items.filter((item) => item.id !== id));
  };

  const handleSetAllType = (newType: 'page' | 'post' | 'category') => {
    setDefaultType(newType);
    saveItems(items.map((item) => ({ ...item, type: newType })));
  };

  const handleCreateBulk = async () => {
    const validItems = items.filter((it) => it.title.trim().length > 0);
    if (validItems.length === 0) {
      alert('Vui lòng nhập ít nhất một tiêu đề / tên chuyên mục hợp lệ');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      setCreateResults(null);

      const res = await api.batchCreateContent(currentSite, {
        default_type: defaultType,
        items: validItems.map((it) => {
          let numericId: number | undefined = it.term_id;
          if (!numericId && it.id?.startsWith('wp-')) {
            const parsed = parseInt(it.id.replace('wp-', ''), 10);
            if (!isNaN(parsed)) numericId = parsed;
          }
          return {
            id: numericId,
            term_id: numericId,
            title: it.title.trim(),
            slug: it.slug.trim(),
            description: it.description?.trim() || '',
            type: it.type || defaultType,
          };
        }),
      });

      setCreateResults(res);
      // Cập nhật ID thật từ WordPress trả về cho các mục
      if (res && Array.isArray(res.results)) {
        const updatedItems = items.map((it, idx) => {
          const r = res.results.find((resIt: any) => resIt.index === idx || (resIt.slug && normalizeSlug(resIt.slug) === normalizeSlug(it.slug)));
          if (r && r.id) {
            return {
              ...it,
              id: `wp-${r.id}`,
              term_id: it.type === 'category' ? r.id : undefined,
              isExisting: true,
            };
          }
          return { ...it, isExisting: true };
        });
        saveItems(updatedItems);
      } else {
        saveItems(
          items.map((it) => ({
            ...it,
            isExisting: true,
          }))
        );
      }

      if (onRefreshInspect) {
        await onRefreshInspect();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi tạo danh sách lên WordPress');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = (url: string, idx: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleSyncSingleItem = async (item: BulkItem) => {
    if (!currentSite?.siteUrl) {
      setErrorMsg('Vui lòng kết nối website trước!');
      return;
    }
    if (!item.title.trim()) {
      setErrorMsg('Vui lòng nhập Tên / Tiêu đề trước khi đồng bộ!');
      return;
    }

    try {
      setSyncingRowId(item.id || item.slug);
      setErrorMsg(null);

      let numericId: number | undefined = item.term_id;
      if (!numericId && item.id?.startsWith('wp-')) {
        const parsed = parseInt(item.id.replace('wp-', ''), 10);
        if (!isNaN(parsed)) numericId = parsed;
      }

      const res = await api.batchCreateContent(currentSite, {
        default_type: item.type,
        items: [
          {
            id: numericId,
            term_id: numericId,
            title: item.title.trim(),
            slug: (item.slug || '').trim(),
            description: (item.description || '').trim(),
            type: item.type || defaultType,
          },
        ],
      });

      if (res && res.success) {
        const resultItem = res.results?.[0];
        const newId = resultItem?.id;
        // Cập nhật trạng thái dòng này thành isExisting: true và lưu ID thật
        const updated = items.map((it) =>
          it.id === item.id ? {
            ...it,
            id: newId ? `wp-${newId}` : it.id,
            term_id: (item.type === 'category' && newId) ? newId : it.term_id,
            isExisting: true
          } : it
        );
        saveItems(updated);

        const actionText = resultItem?.action || 'Đã cập nhật';
        setRowSuccessMsg((prev) => ({ ...prev, [item.id!]: `${actionText}!` }));
        setTimeout(() => {
          setRowSuccessMsg((prev) => {
            const next = { ...prev };
            delete next[item.id!];
            return next;
          });
        }, 3500);

        if (onRefreshInspect) {
          await onRefreshInspect();
        }
      } else {
        setErrorMsg(res?.message || 'Không thể đồng bộ mục này lên WordPress.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi đồng bộ mục này lên WordPress.');
    } finally {
      setSyncingRowId(null);
    }
  };

  const totalPages = items.filter((i) => i.type === 'page').length;
  const totalPosts = items.filter((i) => i.type === 'post').length;
  const totalCategories = items.filter((i) => i.type === 'category').length;

  const filteredItems = items.filter((i) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.slug.toLowerCase().includes(q) ||
      (i.description && i.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Title & Description */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>5. Khởi Tạo Link SEO Hàng Loạt</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" /> Tự động lưu & Quét dữ liệu
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Hỗ trợ nhập <strong>Name</strong>, <strong>Slug</strong> và <strong>Description</strong>. Dữ liệu được lưu tự động trên máy và có thể quét ngược từ website về bất kỳ lúc nào.
        </p>
      </div>

      {/* Duplicate Prevention Alert Banner */}
      <div className="bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900">
          <div className="font-bold">Cơ Chế Chống Trùng Lặp Thông Minh (Upsert An Toàn 100%)</div>
          <p className="text-[11px] text-emerald-700/90 mt-0.5 leading-relaxed">
            Nếu chuyên mục, bài viết hoặc trang <strong>đã tồn tại trên website</strong> (trùng slug hoặc tên), hệ thống sẽ <strong>tự động CẬP NHẬT thông tin/mô tả</strong> thay vì tạo thêm mục trùng lặp. Bạn hoàn toàn có thể thêm dòng mới và bấm tạo tiếp mà không sợ bị trùng!
          </p>
        </div>
      </div>

      {/* Global Type Chooser & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Loại nội dung tạo hàng loạt:
          </span>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => handleSetAllType('category')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                defaultType === 'category'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Chuyên mục (Categories)</span>
            </button>
            <button
              onClick={() => handleSetAllType('page')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                defaultType === 'page'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Trang (Pages)</span>
            </button>
            <button
              onClick={() => handleSetAllType('post')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                defaultType === 'post'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              <span>Bài viết (Posts)</span>
            </button>
          </div>
        </div>

        {/* Counter Summary & Fetch Live Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>Tổng số: <strong>{items.length}</strong> mục</span>
            <span>•</span>
            <span className="text-purple-600 font-semibold">📁 {totalCategories} Chuyên mục</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">📄 {totalPages} Trang</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">📝 {totalPosts} Bài viết</span>
          </div>

          <button
            onClick={handleScanFromWebsite}
            disabled={isScanning}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
            title="Quét toàn bộ chuyên mục, trang và bài viết đang có trên website nạp vào bảng"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Đang Quét Website...' : '🔄 Quét Link Đang Có Trên Web'}</span>
          </button>
        </div>

        {scanMessage && (
          <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{scanMessage}</span>
          </div>
        )}
      </div>

      {/* Excel / Google Sheets Import Box */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-600" />
            <span>Dán dữ liệu từ Excel / Google Sheets (2 hoặc 3 cột)</span>
          </label>
          <button
            onClick={handleLoadSample}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition cursor-pointer"
          >
            📋 Dán mẫu thử có Description (Chuyên mục Casino)
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mb-2.5">
          Copy từ Excel: Cột 1 là <strong>Tên (Name)</strong>, Cột 2 là <strong>Slug (URL)</strong>, Cột 3 (tùy chọn) là <strong>Description (Mô tả)</strong>. Loại nội dung áp dụng theo lựa chọn bên trên:
        </p>

        <textarea
          rows={3}
          value={excelPasteText}
          onChange={(e) => setExcelPasteText(e.target.value)}
          placeholder={`Casino en Línea y Máquinas Tragamonedas\t/casino-online-mexico\tChuyên mục tổng hợp các máy nổ hũ uy tín\nLotería en Línea y Sorteos Oficiales\t/loteria-en-linea\tThông tin xổ số trực tuyến mới nhất`}
          className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
        />

        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[10px] text-slate-400">
            Hỗ trợ phân cách bằng phím Tab (Excel), dấu phẩy (,), hoặc dấu gạch đứng (|).
          </span>
          <button
            onClick={handleParseExcelText}
            disabled={!excelPasteText.trim()}
            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡ Phân Tích & Nạp Thêm Vào Bảng</span>
          </button>
        </div>

        {pasteNotice && (
          <div
            className={`mt-2.5 text-xs font-medium px-3.5 py-2.5 rounded-lg border flex items-center justify-between gap-2 transition-all ${
              pasteNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : pasteNotice.type === 'info'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pasteNotice.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setPasteNotice(null)}
              className="text-slate-400 hover:text-slate-600 font-bold px-1.5 cursor-pointer text-sm"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Danh Sách Mục ({items.length} mục)
            </span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Tìm tiêu đề / slug..."
                className="pl-8 pr-2.5 py-1 text-xs bg-slate-100 rounded-md border border-slate-200 focus:bg-white focus:outline-hidden w-44"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddItem}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm 1 dòng
            </button>
            {items.length > 1 && (
              <button
                onClick={handleDeduplicateExisting}
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
                title="Quét và xóa bỏ các dòng bị trùng lặp slug hoặc tiêu đề trong bảng"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Lọc bỏ trùng lặp
              </button>
            )}
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách trong bảng?')) {
                  saveItems([]);
                }
              }}
              className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-md transition cursor-pointer"
            >
              Xóa tất cả
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {items.length === 0 ? (
              <div className="space-y-2">
                <p>Chưa có dòng nào trong bảng.</p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={handleScanFromWebsite}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Quét các link đang có trên web
                  </button>
                  <button
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm dòng mới
                  </button>
                </div>
              </div>
            ) : (
              'Không tìm thấy mục nào khớp với từ khóa tìm kiếm.'
            )}
          </div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-100 text-xs">
            {filteredItems.map((item, idx) => (
              <div key={item.id || idx} className="p-3.5 hover:bg-slate-50/70 transition space-y-2">
                {/* Line 1: Type, Name/Title, Slug, Status Badge, Delete */}
                <div className="flex items-center gap-2.5">
                  <span className="w-6 text-slate-400 font-bold text-center shrink-0 text-xs">
                    {idx + 1}
                  </span>

                  {/* Type select */}
                  <select
                    value={item.type}
                    onChange={(e) => handleUpdateItem(item.id!, 'type', e.target.value as any)}
                    className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 focus:outline-hidden shrink-0 cursor-pointer"
                  >
                    <option value="category">📁 Chuyên mục</option>
                    <option value="page">📄 Trang</option>
                    <option value="post">📝 Bài viết</option>
                  </select>

                  {/* Name/Title Input */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateItem(item.id!, 'title', e.target.value)}
                      placeholder={item.type === 'category' ? "Tên chuyên mục (Name)..." : "Tiêu đề SEO..."}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-hidden"
                    />
                  </div>

                  {/* Slug Input */}
                  <div className="w-48 shrink-0">
                    <input
                      type="text"
                      value={item.slug}
                      onChange={(e) => handleUpdateItem(item.id!, 'slug', e.target.value)}
                      placeholder="/slug-duong-dan"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-400 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-700 focus:outline-hidden"
                    />
                  </div>

                  {/* Existing Badge & Count & Default Indicator */}
                  {item.isExisting ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Đã có trên web {item.count !== undefined ? `(${item.count})` : ''}
                      </span>
                      {item.isDefault && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-300"
                          title="Chuyên mục Mặc Định của WordPress. Bạn có thể sửa Tên/Slug/Mô tả và bấm Cập Nhật để tái sử dụng làm chuyên mục mới!"
                        >
                          Mặc định WP
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      Mục mới
                    </span>
                  )}

                  {/* Single Item Sync / Update Button */}
                  <button
                    type="button"
                    disabled={syncingRowId === (item.id || item.slug) || deletingId === item.id || !item.title.trim()}
                    onClick={() => handleSyncSingleItem(item)}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      rowSuccessMsg[item.id!]
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : item.isExisting
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={item.isExisting ? (item.isDefault ? 'Cập nhật lại chuyên mục này (Tái sử dụng chuyên mục Mặc Định Uncategorized)' : 'Cập nhật lại riêng mục này lên WordPress') : 'Đẩy ngay riêng mục này lên WordPress'}
                  >
                    {syncingRowId === (item.id || item.slug) ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : rowSuccessMsg[item.id!] ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>{rowSuccessMsg[item.id!]}</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{item.isExisting ? (item.isDefault ? 'Đổi & Dùng lại' : 'Cập nhật') : 'Đẩy lên WP'}</span>
                      </>
                    )}
                  </button>

                  {/* Delete button (Deletes from WP if existing, or removes row from list) */}
                  <button
                    disabled={deletingId === item.id}
                    onClick={() => handleDeleteFromWordPress(item)}
                    className={`p-1.5 rounded-lg transition shrink-0 cursor-pointer ${
                      item.isExisting
                        ? 'text-red-400 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200'
                        : 'text-slate-300 hover:text-red-600'
                    }`}
                    title={item.isExisting ? 'Xóa vĩnh viễn khỏi WordPress' : 'Xóa dòng'}
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Line 2: Description Box (WordPress Description Field) */}
                <div className="flex items-center gap-2 pl-8.5 pr-8">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 shrink-0 w-36">
                    <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {item.type === 'category' ? 'Description (Mô tả):' : 'Đoạn trích (Excerpt):'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => handleUpdateItem(item.id!, 'description', e.target.value)}
                    placeholder={
                      item.type === 'category'
                        ? 'Nhập nội dung mô tả cho Chuyên mục này (sẽ lưu trực tiếp vào ô Description của WordPress)...'
                        : 'Mô tả ngắn chuẩn SEO cho bài viết/trang...'
                    }
                    className="flex-1 bg-white border border-slate-200 focus:border-blue-400 rounded-md px-3 py-1 text-xs text-slate-700 focus:outline-hidden placeholder:text-slate-400"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Execution Action Button */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <div>
          <div className="text-xs font-bold text-slate-800">
            Sẵn sàng đồng bộ {items.length} mục lên {currentSite.siteUrl.replace(/^https?:\/\//, '')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Cơ chế Upsert an toàn: Mục nào có rồi sẽ cập nhật Description, mục nào mới sẽ tạo mới.
          </div>
        </div>

        <button
          onClick={handleCreateBulk}
          disabled={isLoading || items.length === 0}
          className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang Đồng Bộ Lên WP...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>🚀 Tạo & Cập Nhật Lên WordPress</span>
            </>
          )}
        </button>
      </div>

      {/* Execution Results View */}
      {createResults && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div className="text-xs font-bold text-emerald-900">
                {createResults.summary?.created || 0} mục đã tạo mới, {createResults.summary?.updated || 0} mục cập nhật chống trùng lặp!
              </div>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Đồng bộ hoàn tất thành công 100% ✅
            </span>
          </div>

          {/* Quick Links to exact WP Admin screens */}
          <div className="flex flex-wrap items-center gap-2 py-1.5 px-2 bg-emerald-100/50 rounded-lg border border-emerald-200/60">
            <span className="text-[11px] text-emerald-900 font-bold flex items-center gap-1">
              <span>👉 Kiểm tra ngay trên WP Admin:</span>
            </span>
            <a
              href={`${currentSite.siteUrl.replace(/\/$/, '')}/wp-admin/edit-tags.php?taxonomy=category`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-emerald-50 border border-emerald-300 text-[11px] font-semibold text-emerald-900 shadow-2xs transition"
            >
              <span>📂 Chuyên mục bài viết (taxonomy=category)</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>
            <a
              href={`${currentSite.siteUrl.replace(/\/$/, '')}/wp-admin/edit.php`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white hover:bg-emerald-50 border border-emerald-300 text-[11px] font-medium text-emerald-900 transition"
            >
              <span>📝 Quản trị Bài viết</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>
            <a
              href={`${currentSite.siteUrl.replace(/\/$/, '')}/wp-admin/edit.php?post_type=page`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white hover:bg-emerald-50 border border-emerald-300 text-[11px] font-medium text-emerald-900 transition"
            >
              <span>📄 Quản trị Trang</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-emerald-100 bg-white/80 rounded-lg border border-emerald-200/60 text-xs">
            {createResults.results?.map((res, idx) => (
              <div key={idx} className="p-2.5 flex items-center justify-between gap-3 hover:bg-emerald-50/40">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                    {res.type}
                  </span>
                  <span className="font-medium text-slate-800 truncate">
                    {res.title}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    res.action === 'created' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {res.action === 'created' ? 'Tạo mới' : 'Cập nhật'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {res.url && (
                    <>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-mono flex items-center gap-1 hover:underline"
                      >
                        <span>{res.slug}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => handleCopyUrl(res.url!, idx)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                        title="Copy link"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onPrevStep}
          className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition cursor-pointer"
        >
          ❮ Quay lại Bước 1 (Dọn dẹp)
        </button>

        <button
          onClick={onNextStep}
          className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>Tiếp tục sang Cấu Hình Theme (Bước 3)</span>
          <span>🚀</span>
        </button>
      </div>
    </div>
  );
};
