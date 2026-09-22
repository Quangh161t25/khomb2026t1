import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  RotateCcw,
  QrCode,
  FileSpreadsheet,
  Layers,
  FileText,
  Package,
  Warehouse,
  PieChart,
  BarChart3,
  Boxes,
  FileCode2,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export default function HomePage({ onSelectModule, onNavigate }) {
  const { currentUser } = useAuth();
  const navigate = onNavigate || onSelectModule || (() => {});

  const cards = [
    {
      id: 'donhang',
      title: 'UP Đơn chi tiết',
      desc: 'Tải lên danh sách đơn hàng chi tiết từ các sàn thương mại điện tử',
      icon: FileSpreadsheet,
      color: 'from-sky-600 to-blue-600',
      badge: 'Trọng tâm',
    },
    {
      id: 'sanpham',
      title: 'Sản phẩm phần mềm',
      desc: 'Quản lý danh mục sản phẩm, mã SKU, SKU chi tiết và định giá',
      icon: Package,
      color: 'from-rose-500 to-pink-600',
    },
    {
      id: 'hang_hoan',
      title: 'Dữ liệu Hàng hoàn',
      desc: 'Quản lý, tìm kiếm MVD, xem dạng Thẻ & Bảng, chụp ảnh hoàn trả',
      icon: RotateCcw,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'hh_shop_dien',
      title: 'HH Shop điền',
      desc: 'Dữ liệu hàng hoàn do các shop tự điền và gửi về kho',
      icon: ShoppingBag,
      color: 'from-indigo-600 to-blue-700',
    },
    {
      id: 'ban_don',
      title: 'Bắn đơn & Quét mã',
      desc: 'Quét MVD liên tục, kiểm tra trùng lặp và ghi nhận trạng thái xuất',
      icon: QrCode,
      color: 'from-violet-600 to-purple-600',
    },
    {
      id: 'donhang_tong',
      title: 'Đơn hàng tổng',
      desc: 'Tổng hợp đơn hàng theo ngày, kênh bán và trạng thái xử lý',
      icon: Layers,
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'dhct',
      title: 'Đơn chi tiết',
      desc: 'Xem và tạo mới đơn chi tiết theo nhóm Ngày - Trường - NCC',
      icon: FileText,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      id: 'inventory',
      title: 'Quản lý Tồn kho',
      desc: 'Theo dõi số lượng tồn kho từng sản phẩm theo thời gian thực',
      icon: Warehouse,
      color: 'from-cyan-600 to-blue-600',
    },
    {
      id: 'bc_hang_hoan',
      title: 'Báo cáo hàng hoàn',
      desc: 'Thống kê tỉ lệ hoàn trả, phân tích theo gian hàng và lý do hoàn',
      icon: PieChart,
      color: 'from-fuchsia-600 to-purple-600',
    },
    {
      id: 'baocao',
      title: 'Báo cáo đơn hàng',
      desc: 'Biểu đồ doanh thu, số lượng đơn theo khung giờ và ngày xuất',
      icon: BarChart3,
      color: 'from-green-600 to-emerald-600',
    },
    {
      id: 'baocao_tong',
      title: 'Báo cáo tổng',
      desc: 'Báo cáo đối soát tổng hợp toàn diện các kênh bán hàng',
      icon: Boxes,
      color: 'from-teal-600 to-emerald-700',
    },
    {
      id: 'upmisa',
      title: 'UPMISA',
      desc: 'Xuất dữ liệu hóa đơn và phiếu xuất kho tương thích phần mềm MISA',
      icon: FileCode2,
      color: 'from-amber-600 to-yellow-600',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white mb-3">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Hệ thống Quản trị Kho Vận 2026 - React Edition</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Xin chào, {currentUser?.name || currentUser?.id}!
          </h1>
          <p className="mt-2 text-xs text-blue-100/90 leading-relaxed font-normal">
            Chọn một chức năng bên dưới hoặc sử dụng menu bên trái để bắt đầu làm việc.
          </p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Grid of Module Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.id)}
              className="module-card bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs hover:border-blue-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md shadow-slate-200 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {card.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                      {card.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-800 text-xs group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {card.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>Truy cập</span>
                <span>➔</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
