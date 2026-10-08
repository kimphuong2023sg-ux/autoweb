import React from 'react';
import { FileText, ShieldCheck, CheckCircle2, Compass, Rocket } from 'lucide-react';
import { SeoEssentialsConfig } from '../../types';

interface Step5SeoPagesProps {
  essentials: SeoEssentialsConfig;
  onChangeEssentials: (newConfig: SeoEssentialsConfig) => void;
  onOpenDeployModal: () => void;
  onPrevStep: () => void;
}

export const Step5SeoPages: React.FC<Step5SeoPagesProps> = ({
  essentials,
  onChangeEssentials,
  onOpenDeployModal,
  onPrevStep,
}) => {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>5. Thiết Lập Trang Chuẩn SEO E-E-A-T & Điều Hướng</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            Tối ưu Onpage
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Tạo các trang bắt buộc để tăng điểm uy tín Google (E-E-A-T), thiết lập cấu trúc đường dẫn Permalink và gán Menu chính.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition shadow-2xs">
          <input
            type="checkbox"
            checked={essentials.createPages}
            onChange={(e) => onChangeEssentials({ ...essentials, createPages: e.target.checked })}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
          />
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Tự động tạo 4 Trang Chính Sách Chuẩn E-E-A-T</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tạo các trang: <strong>Giới Thiệu</strong>, <strong>Liên Hệ</strong>, <strong>Chính Sách Bảo Mật</strong>, và <strong>Điều Khoản Sử Dụng</strong> với nội dung mẫu chuyên nghiệp chứa tên thương hiệu và hotline của bạn.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition shadow-2xs">
          <input
            type="checkbox"
            checked={essentials.createMenu}
            onChange={(e) => onChangeEssentials({ ...essentials, createMenu: e.target.checked })}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
          />
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Tạo Menu Chính & Gán Vào Vị Trí Primary Menu</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tự động gom Trang Chủ, Giới Thiệu, Liên Hệ vào Menu điều hướng của Flatsome để website có ngay thanh điều hướng chuyên nghiệp.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition shadow-2xs">
          <input
            type="checkbox"
            checked={essentials.setPermalinks}
            onChange={(e) => onChangeEssentials({ ...essentials, setPermalinks: e.target.checked })}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
          />
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cập Nhật Cấu Trúc Đường Dẫn Permalink Chuẩn SEO (/postname/)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Chuyển cấu trúc URL từ dạng mặc định <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">/?p=123</code> sang dạng tiêu đề bài viết <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">/ten-bai-viet/</code> thân thiện 100% với Google Bot.
            </p>
          </div>
        </label>
      </div>

      {/* Completion CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-6 text-center space-y-3">
        <h3 className="font-bold text-slate-900 text-base">Mọi Thứ Đã Sẵn Sàng Để Xuất Bản!</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Bạn có thể kiểm tra lại ở khung Live Preview bên phải trước khi nhấn nút xuất bản lên WordPress.
        </p>
        <button
          onClick={onOpenDeployModal}
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <Rocket className="w-4 h-4" /> Xuất Bản Toàn Bộ Website Ngay
        </button>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <button
          onClick={onPrevStep}
          className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition"
        >
          ❮ Quay lại Bước 4
        </button>
      </div>
    </div>
  );
};
