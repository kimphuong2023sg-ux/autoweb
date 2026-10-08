import React, { useState } from 'react';
import { X, Rocket, CheckCircle2, Loader2, ExternalLink, Edit3, ShieldAlert } from 'lucide-react';
import { ConnectedSite, ThemeConfig, FooterConfig, SectionItem, SeoEssentialsConfig, WpInspectData } from '../types';
import { api } from '../services/api';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSite: ConnectedSite;
  inspectData: WpInspectData | null;
  themeConfig: ThemeConfig;
  footerConfig: FooterConfig;
  sections: SectionItem[];
  essentials: SeoEssentialsConfig;
  onDeploySuccess: () => void;
}

export const DeployModal: React.FC<DeployModalProps> = ({
  isOpen,
  onClose,
  currentSite,
  inspectData,
  themeConfig,
  footerConfig,
  sections,
  essentials,
  onDeploySuccess,
}) => {
  const [wipeFirst, setWipeFirst] = useState(inspectData?.stats?.is_demo_loaded || false);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [currentStepText, setCurrentStepText] = useState('');
  const [deployResult, setDeployResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartDeploy = async () => {
    try {
      setStatus('running');
      setErrorMsg(null);

      // 1. Tự động tải bất kỳ ảnh local (Base64) nào lên WordPress Media nếu chưa tải
      const processedSections = [...sections];
      for (let i = 0; i < processedSections.length; i++) {
        const sec = processedSections[i];
        if (sec.data?.fileData && !sec.data?.imageId) {
          setCurrentStepText(`Đang tải ảnh khối "${sec.title || sec.type}" lên WordPress Media...`);
          try {
            const uploadRes = await api.uploadMedia(currentSite, {
              filename: sec.data.filename || `image-${Date.now()}.png`,
              fileData: sec.data.fileData,
              altText: sec.data.alt || sec.title || '',
              title: sec.data.title || sec.title || '',
              caption: sec.data.caption || '',
              description: sec.data.description || '',
            });
            if (uploadRes && uploadRes.media) {
              processedSections[i] = {
                ...sec,
                data: {
                  ...sec.data,
                  imageId: uploadRes.media.id,
                  imageUrl: uploadRes.media.url,
                  fileData: undefined,
                },
              };
            }
          } catch (uploadErr: any) {
            console.warn('Auto upload image failed, continuing with direct image fallback:', uploadErr);
          }
        }
      }

      // 2. Làm sạch trường fileData base64 nặng trước khi gửi sang deploy-all
      const sanitizedSections = processedSections.map((sec) => {
        if (sec.data?.fileData) {
          const { fileData, ...restData } = sec.data;
          return { ...sec, data: restData };
        }
        return sec;
      });

      setCurrentStepText('Đang khởi tạo Theme Options và biên dịch bố cục Flatsome UX Builder...');

      const res = await api.deployAll(currentSite, {
        themeConfig,
        footerConfig,
        sections: sanitizedSections,
        essentials: { ...essentials, createPages: false },
        wipeFirst,
      });

      setDeployResult(res);
      setStatus('success');
      onDeploySuccess();
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Có lỗi xảy ra trong quá trình triển khai.');
    }
  };

  const editUxBuilderUrl = deployResult?.details?.homepage?.edit_uxbuilder_url || 
    `${currentSite.siteUrl.replace(/\/$/, '')}/wp-admin/edit.php?post_type=page`;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Xuất Bản & Cập Nhật Website</h3>
              <p className="text-xs text-slate-500">{currentSite.siteUrl.replace(/^https?:\/\//, '')}</p>
            </div>
          </div>
          {status !== 'running' && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-600">
                <div className="font-semibold text-slate-800 text-sm mb-1">
                  Quy trình đồng bộ & cập nhật tự động lên WordPress:
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Cập nhật Theme Options (Màu sắc, Topbar, Header, Bản quyền)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Cập nhật UX Block Chân trang (Footer) và liên kết vào Theme</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Biên dịch và đẩy {sections.length} khối nội dung mới vào Trang Chủ UX Builder</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Đảm bảo 4 trang chính sách E-E-A-T và Menu Header</span>
                </div>
              </div>

              {/* Wipe Checkbox */}
              <label className="flex items-start gap-3 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl cursor-pointer hover:bg-amber-50 transition">
                <input
                  type="checkbox"
                  checked={wipeFirst}
                  onChange={(e) => setWipeFirst(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-amber-600 rounded-sm border-amber-300 focus:ring-amber-500"
                />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    Dọn dẹp sạch sẽ dữ liệu rác (Chỉ bật khi muốn reset web ban đầu)
                  </span>
                  <span className="text-[11px] text-amber-700 leading-normal block mt-0.5">
                    Mặc định đang tắt để bảo toàn nguyên vẹn mọi dữ liệu, bài viết và sản phẩm của bạn khi cập nhật.
                  </span>
                </div>
              </label>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Xem lại cấu hình
                </button>
                <button
                  onClick={handleStartDeploy}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer"
                >
                  <Rocket className="w-4 h-4" /> Bắt Đầu Cập Nhật Ngay
                </button>
              </div>
            </div>
          )}

          {status === 'running' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">Đang Triển Khai Website...</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {currentStepText || 'Vui lòng đợi vài giây để hệ thống biên dịch và cấu hình WordPress.'}
                </p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden max-w-xs mx-auto">
                <div className="bg-blue-600 h-full w-2/3 animate-[pulse_1s_infinite]"></div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Xuất Bản Thành Công!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Toàn bộ giao diện, Footer UX Block và cấu hình Theme đã được đẩy lên website của bạn.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={currentSite.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  <ExternalLink className="w-4 h-4" /> Xem Website Ngoài Frontend
                </a>
                <a
                  href={editUxBuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
                >
                  <Edit3 className="w-4 h-4 text-blue-600" /> Mở Sửa Bằng UX Builder
                </a>
              </div>

              <button
                onClick={onClose}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 pt-2 block mx-auto transition"
              >
                Đóng cửa sổ
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Xuất Bản Không Thành Công</h4>
                <p className="text-xs text-red-600 mt-1 max-w-sm mx-auto">{errorMsg}</p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setStatus('idle')}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
