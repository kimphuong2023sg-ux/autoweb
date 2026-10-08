import React from 'react';
import { Columns, Check, Building2, Newspaper, HelpCircle } from 'lucide-react';
import { FooterConfig } from '../../types';

interface Step4FooterPickerProps {
  footerConfig: FooterConfig;
  onChangeFooterConfig: (newConfig: FooterConfig) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const Step4FooterPicker: React.FC<Step4FooterPickerProps> = ({
  footerConfig,
  onChangeFooterConfig,
  onNextStep,
  onPrevStep,
}) => {
  const layouts = [
    {
      id: 'corporate-4col',
      name: 'Doanh Nghiệp 4 Cột (Đầy Đủ Chuẩn SEO)',
      desc: 'Cột 1: Thông tin thương hiệu & Giới thiệu; Cột 2: Trang chính sách; Cột 3: Dịch vụ chính; Cột 4: Hotline & Địa chỉ.',
      icon: Building2,
    },
    {
      id: 'affiliate-2col',
      name: 'Tin Tức / Affiliate 2 Cột (Gọn Nhẹ)',
      desc: 'Cột 1: Giới thiệu thương hiệu & Miễn trừ trách nhiệm; Cột 2: Hotline tư vấn & Bản quyền.',
      icon: Newspaper,
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>4. Thiết Kế Mẫu Footer (UX Block)</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Chân trang UX
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Flatsome Footer chuẩn được tạo bằng <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded">UX Block</code> thay vì widget cũ kỹ. Đẹp mắt, tương thích hoàn hảo trên Mobile và dễ chỉnh sửa.
        </p>
      </div>

      {/* Layout Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {layouts.map((l) => {
          const Icon = l.icon;
          const isSelected = footerConfig.layout === l.id;
          return (
            <div
              key={l.id}
              onClick={() => onChangeFooterConfig({ ...footerConfig, layout: l.id as any })}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-500 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-blue-600" /> {l.name}
                </span>
                {isSelected && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{l.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Footer Details Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Columns className="w-4 h-4 text-blue-600" />
          <span>Thông Tin Doanh Nghiệp Hiển Thị Ở Chân Trang</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên Doanh Nghiệp / Thương Hiệu (Brand Name)
            </label>
            <input
              type="text"
              value={footerConfig.brandName}
              onChange={(e) => onChangeFooterConfig({ ...footerConfig, brandName: e.target.value })}
              placeholder="Ví dụ: Công Ty TNHH Giải Pháp SEO"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hotline Tư Vấn Nhanh
            </label>
            <input
              type="text"
              value={footerConfig.hotline || ''}
              onChange={(e) => onChangeFooterConfig({ ...footerConfig, hotline: e.target.value })}
              placeholder="0988.xxx.xxx"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Đoạn Giới Thiệu Ngắn Về Doanh Nghiệp (Bio)
          </label>
          <textarea
            rows={2}
            value={footerConfig.bio || ''}
            onChange={(e) => onChangeFooterConfig({ ...footerConfig, bio: e.target.value })}
            placeholder="Đơn vị uy tín chuyên cung cấp các giải pháp chất lượng hàng đầu, phục vụ khách hàng trên toàn quốc..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Liên Hệ
            </label>
            <input
              type="email"
              value={footerConfig.email || ''}
              onChange={(e) => onChangeFooterConfig({ ...footerConfig, email: e.target.value })}
              placeholder="lienhe@domain.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa Chỉ Trụ Sở
            </label>
            <input
              type="text"
              value={footerConfig.address || ''}
              onChange={(e) => onChangeFooterConfig({ ...footerConfig, address: e.target.value })}
              placeholder="Hà Nội, Việt Nam"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <button
          onClick={onPrevStep}
          className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition"
        >
          ❮ Quay lại Bước 5 (Trang Chủ)
        </button>

        <button
          onClick={onNextStep}
          className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>Hoàn tất & Triển Khai Lên WordPress</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
};
