import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { CONFIG } from '../config/config';
import { fetchSheetData, appendSheetRows } from '../services/googleSheetsApi';
import { exportToExcel } from '../services/excelExport';
import Pagination from '../components/common/Pagination';
import FooterPortal from '../components/common/FooterPortal';
import {
  getTodayYmd,
  toYMD,
  formatYmdToDmy,
  getCurrentWeekRangeYmd,
  getCurrentMonthRangeYmd,
  shiftDate,
} from '../utils/dateUtils';
import {
  BarChart2,
  TrendingUp,
  DollarSign,
  Package,
  RotateCw,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Percent,
  Send,
  Copy,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
} from 'chart.js';
import { Chart, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController
);

export default function BaoCaoPage() {
  const { showToast } = useToast();
  const todayStr = toYMD(new Date());

  const [udctData, setUdctData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [sanPhamData, setSanPhamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);

  // Filters
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [maGianFilter, setMaGianFilter] = useState('');
  const [trangThaiFilter, setTrangThaiFilter] = useState('');

  // Table Sorting
  const [magianSort, setMagianSort] = useState({ key: 'doanh_thu', asc: false });
  const [idspSort, setIdspSort] = useState({ key: 'doanh_thu', asc: false });
  const [detailSort, setDetailSort] = useState({ key: 'ngay', dir: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 100;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [udctRows, invRows, spRows] = await Promise.all([
        fetchSheetData(`${CONFIG.udctSheetName}!A:AE`),
        fetchSheetData(`${CONFIG.inventorySheetName}!A:F`),
        fetchSheetData(`${CONFIG.sanphamSheetName}!A:L`),
      ]);

      if (invRows && invRows.length > 1) {
        setInventoryData(
          invRows.slice(1).map((r) => ({
            id_sp_ct: (r[2] || '').toString().trim(),
            ton_dau: parseFloat(r[5]) || 0,
          }))
        );
      }

      if (spRows && spRows.length > 1) {
        setSanPhamData(
          spRows.slice(1).map((r) => ({
            id_sp: (r[1] || '').toString().trim(),
            sku_con: (r[2] || '').toString().trim(),
            ten_sp: (r[3] || '').toString().trim(),
            gia_nhap: parseFloat(r[7]) || 0,
          }))
        );
      }

      if (udctRows && udctRows.length > 1) {
        const parsed = udctRows.slice(1).map((row) => ({
          ngay: toYMD(row[4] || '') || (row[4] || '').toString().trim(),
          san: (row[8] || '').toString().trim(),
          khung_h: (row[9] || '').toString().trim(),
          ma_gian: (row[10] || '').toString().trim(),
          mvd: (row[11] || '').toString().trim(),
          mdh: (row[12] || '').toString().trim(),
          sku_shop_up: (row[13] || '').toString().trim(),
          so_luong: parseFloat(row[14]) || 0,
          id_sp: (row[15] || '').toString().trim(),
          id_sp_ct: (row[16] || '').toString().trim(),
          ten_sp: (row[17] || '').toString().trim(),
          slg_xuat: parseFloat(row[18]) || 0,
          tinh_trang: (row[23] || '').toString().trim(),
          trang_thai: (row[24] || '').toString().trim(),
          don_gia_1: parseFloat(row[30]) || 0,
        }));
        setUdctData(parsed);
      } else {
        setUdctData([]);
      }
    } catch (err) {
      console.error('Error loading report data:', err);
      showToast('Lỗi tải báo cáo: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Distinct Filter Values
  const maGianList = useMemo(() => {
    return [...new Set(udctData.map((i) => i.ma_gian).filter(Boolean))].sort();
  }, [udctData]);

  const trangThaiList = useMemo(() => {
    return [...new Set(udctData.map((i) => i.trang_thai).filter(Boolean))].sort();
  }, [udctData]);

  // Quick Date Selectors
  const setQuickDate = (type) => {
    if (type === 'today') {
      const today = getTodayYmd();
      setFromDate(today);
      setToDate(today);
    } else if (type === 'thisWeek') {
      const { from, to } = getCurrentWeekRangeYmd();
      setFromDate(from);
      setToDate(to);
    } else if (type === 'thisMonth') {
      const { from, to } = getCurrentMonthRangeYmd();
      setFromDate(from);
      setToDate(to);
    }
  };

  // Reload handler resetting date to today
  const handleReload = () => {
    const today = getTodayYmd();
    setFromDate(today);
    setToDate(today);
    setMaGianFilter('');
    setTrangThaiFilter('');
    loadData();
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return udctData.filter((item) => {
      const itemYMD = toYMD(item.ngay);
      if (fromDate && itemYMD < fromDate) return false;
      if (toDate && itemYMD > toDate) return false;
      if (maGianFilter && item.ma_gian !== maGianFilter) return false;
      if (trangThaiFilter && (item.trang_thai || '').toLowerCase() !== trangThaiFilter.toLowerCase()) return false;
      return true;
    });
  }, [udctData, fromDate, toDate, maGianFilter, trangThaiFilter]);

  // KPI Computations
  const kpiData = useMemo(() => {
    let tongDoanhThu = 0;
    let tongSlgXuat = 0;
    let soDonSet = new Set();
    let soDonHuy = 0;

    filteredData.forEach((item) => {
      const isHuy = (item.trang_thai || '').toLowerCase().includes('hủy');
      if (isHuy) soDonHuy++;

      const dt = (item.don_gia_1 || 0) * (item.slg_xuat || 0);
      tongDoanhThu += dt;
      tongSlgXuat += item.slg_xuat || 0;
      if (item.mvd || item.mdh) soDonSet.add(item.mvd || item.mdh);
    });

    const totalOrders = soDonSet.size || filteredData.length;
    const tyLeHuy = totalOrders > 0 ? ((soDonHuy / totalOrders) * 100).toFixed(1) : 0;

    return {
      tongDoanhThu,
      tongSlgXuat,
      tongSoDon: totalOrders,
      tyLeHuy,
    };
  }, [filteredData]);

  // Store Breakdown Stats
  const magianStats = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      const mg = item.ma_gian || 'Chưa rõ';
      if (!map[mg]) {
        map[mg] = {
          mg,
          so_don: new Set(),
          slg_xuat: 0,
          doanh_thu: 0,
        };
      }
      map[mg].so_don.add(item.mvd || item.mdh || item.rowIndex);
      map[mg].slg_xuat += item.slg_xuat || 0;
      map[mg].doanh_thu += (item.don_gia_1 || 0) * (item.slg_xuat || 0);
    });

    let list = Object.values(map).map((v) => ({
      mg: v.mg,
      so_don: v.so_don.size,
      slg_xuat: v.slg_xuat,
      doanh_thu: v.doanh_thu,
    }));

    list.sort((a, b) => {
      let valA = a[magianSort.key];
      let valB = b[magianSort.key];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return magianSort.asc ? -1 : 1;
      if (valA > valB) return magianSort.asc ? 1 : -1;
      return 0;
    });

    return list;
  }, [filteredData, magianSort]);

  // SKU Breakdown Stats
  const idspStats = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      const sku = item.id_sp_ct || item.id_sp || 'Chưa rõ';
      if (!map[sku]) {
        map[sku] = {
          idsp: sku,
          ten_sp: item.ten_sp || '',
          slg: 0,
          doanh_thu: 0,
          ton_kho: 0,
        };
      }
      map[sku].slg += item.slg_xuat || 0;
      map[sku].doanh_thu += (item.don_gia_1 || 0) * (item.slg_xuat || 0);
    });

    let list = Object.values(map);
    list.sort((a, b) => {
      let valA = a[idspSort.key];
      let valB = b[idspSort.key];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return idspSort.asc ? -1 : 1;
      if (valA > valB) return idspSort.asc ? 1 : -1;
      return 0;
    });

    return list;
  }, [filteredData, idspSort]);

  // Chart Data: Stores Donut Chart
  const storeChartData = useMemo(() => {
    const topStores = magianStats.slice(0, 6);
    return {
      labels: topStores.map((s) => s.mg),
      datasets: [
        {
          data: topStores.map((s) => s.doanh_thu),
          backgroundColor: [
            '#3b82f6',
            '#6366f1',
            '#ec4899',
            '#10b981',
            '#f59e0b',
            '#8b5cf6',
          ],
        },
      ],
    };
  }, [magianStats]);

  // Chart Data: Top 10 SKU Bar Chart
  const skuChartData = useMemo(() => {
    const topSku = idspStats.slice(0, 10);
    return {
      labels: topSku.map((s) => s.idsp),
      datasets: [
        {
          label: 'SL xuất',
          data: topSku.map((s) => s.slg),
          backgroundColor: '#3b82f6',
          borderRadius: 6,
        },
      ],
    };
  }, [idspStats]);

  // Sàn Breakdown Stats for Text Report
  const sanStats = useMemo(() => {
    const map = {};
    filteredData.forEach((item, idx) => {
      const s = (item.san || 'Khác').trim();
      if (!map[s]) {
        map[s] = {
          san: s,
          so_don: new Set(),
          doanh_thu: 0,
        };
      }
      const orderKey = (item.mvd || item.mdh || `item_${idx}`).trim();
      map[s].so_don.add(orderKey);
      const dt = (item.don_gia_1 || 0) * (item.slg_xuat || 0);
      map[s].doanh_thu += dt;
    });

    return Object.values(map)
      .map((v) => ({
        san: v.san,
        so_don: v.so_don.size,
        doanh_thu: v.doanh_thu,
      }))
      .sort((a, b) => b.so_don - a.so_don || b.doanh_thu - a.doanh_thu);
  }, [filteredData]);

  // Text Summary
  const textSummary = useMemo(() => {
    if (filteredData.length === 0) {
      return 'Chọn ngày và lọc để xem tóm tắt...';
    }

    let text = `BÁO CÁO NGÀY: ${fromDate} đến ${toDate}\n`;
    text += `----------------------------------------\n`;
    text += `TỔNG SỐ ĐƠN: ${kpiData.tongSoDon.toLocaleString('vi-VN')}\n`;
    text += `TỔNG DOANH THU: ${kpiData.tongDoanhThu.toLocaleString('vi-VN')}\n\n\n`;

    sanStats.forEach((s) => {
      text += `- Sàn ${s.san}: ${s.so_don.toLocaleString('vi-VN')} đơn - ${s.doanh_thu.toLocaleString('vi-VN')}\n`;
    });

    if (maGianFilter) {
      text += `\nLỌC THEO MÃ GIAN: ${maGianFilter}\n`;
    }
    if (trangThaiFilter) {
      text += `LỌC THEO TRẠNG THÁI: ${trangThaiFilter}\n`;
    }

    return text;
  }, [filteredData, fromDate, toDate, kpiData, sanStats, maGianFilter, trangThaiFilter]);

  // Copy text report handler
  const handleCopyTextReport = async () => {
    if (!textSummary || filteredData.length === 0) {
      showToast('Không có nội dung báo cáo để sao chép!', 'warning');
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textSummary);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      showToast('Đã sao chép báo cáo vào bộ nhớ tạm!', 'success');
    } catch {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textSummary;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          showToast('Đã sao chép báo cáo vào bộ nhớ tạm!', 'success');
        } else {
          showToast('Lỗi khi sao chép báo cáo!', 'error');
        }
      } catch (err2) {
        showToast('Lỗi khi sao chép báo cáo!', 'error');
      }
    }
  };

  // Daily Stats for Combined Chart
  const dailyStats = useMemo(() => {
    const map = {};
    filteredData.forEach((item, idx) => {
      const day = toYMD(item.ngay) || item.ngay || 'Chưa rõ';
      if (!map[day]) {
        map[day] = {
          so_don: new Set(),
          doanh_thu: 0,
        };
      }
      const orderKey = (item.mvd || item.mdh || `item_${idx}`).trim();
      map[day].so_don.add(orderKey);
      const dt = (item.don_gia_1 || 0) * (item.slg_xuat || 0);
      map[day].doanh_thu += dt;
    });
    return map;
  }, [filteredData]);

  // Combined Chart Data (Bar for Revenue, Line for Orders)
  const mergedChartData = useMemo(() => {
    const labels = Object.keys(dailyStats).filter((d) => d && d !== 'Chưa rõ').sort();
    const revenueData = labels.map((l) => dailyStats[l]?.doanh_thu || 0);
    const ordersData = labels.map((l) => dailyStats[l]?.so_don?.size || 0);

    return {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Số đơn (đơn)',
          data: ordersData,
          borderColor: '#ef4444',
          backgroundColor: '#ef4444',
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#ef4444',
          fill: false,
          tension: 0.3,
          yAxisID: 'yOrders',
          order: 1,
        },
        {
          type: 'bar',
          label: 'Doanh thu (đ)',
          data: revenueData,
          backgroundColor: 'rgba(59, 130, 246, 0.75)',
          hoverBackgroundColor: '#2563eb',
          borderColor: '#2563eb',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'yRev',
          order: 2,
        },
      ],
    };
  }, [dailyStats]);

  // Combined Chart Options
  const mergedChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 14,
            boxHeight: 14,
            usePointStyle: false,
            font: { size: 12 },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 12 },
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              if (context.parsed.y !== null) {
                label += Number(context.parsed.y).toLocaleString('vi-VN');
                if (context.dataset.yAxisID === 'yRev') label += ' đ';
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
        yRev: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Doanh thu (vnđ)',
            color: '#2563eb',
            font: { size: 11, weight: 'bold' },
          },
          grid: { color: '#f1f5f9' },
          beginAtZero: true,
          ticks: {
            callback: (val) => Number(val).toLocaleString('vi-VN'),
            font: { size: 10 },
          },
        },
        yOrders: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Số lượng đơn',
            color: '#ef4444',
            font: { size: 11, weight: 'bold' },
          },
          grid: { drawOnChartArea: false },
          beginAtZero: true,
          ticks: {
            callback: (val) => Number(val).toLocaleString('vi-VN'),
            font: { size: 10 },
          },
        },
      },
    }),
    []
  );

  // Sorting for Chi tiết đơn hàng
  const sortedDetailList = useMemo(() => {
    const list = [...filteredData];
    const { key, dir } = detailSort;
    list.sort((a, b) => {
      let av = '';
      let bv = '';
      if (key === 'ngay') {
        av = toYMD(a.ngay) || a.ngay || '';
        bv = toYMD(b.ngay) || b.ngay || '';
      } else if (key === 'san') {
        av = a.san || '';
        bv = b.san || '';
      } else if (key === 'ma_gian') {
        av = a.ma_gian || '';
        bv = b.ma_gian || '';
      } else if (key === 'mvd') {
        av = a.mvd || '';
        bv = b.mvd || '';
      } else if (key === 'mdh') {
        av = a.mdh || '';
        bv = b.mdh || '';
      } else if (key === 'ten_sp') {
        av = a.ten_sp || '';
        bv = b.ten_sp || '';
      } else if (key === 'id_sp') {
        av = a.id_sp || a.id_sp_ct || '';
        bv = b.id_sp || b.id_sp_ct || '';
      } else if (key === 'slg_xuat') {
        av = parseFloat(a.slg_xuat) || 0;
        bv = parseFloat(b.slg_xuat) || 0;
      } else if (key === 'don_gia') {
        av = parseFloat(a.don_gia_1) || 0;
        bv = parseFloat(b.don_gia_1) || 0;
      } else if (key === 'thanh_tien') {
        av = (parseFloat(a.don_gia_1) || 0) * (parseFloat(a.slg_xuat) || 0);
        bv = (parseFloat(b.don_gia_1) || 0) * (parseFloat(b.slg_xuat) || 0);
      } else if (key === 'trang_thai') {
        av = a.trang_thai || '';
        bv = b.trang_thai || '';
      }

      if (typeof av === 'number' && typeof bv === 'number') {
        return dir === 'asc' ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv), 'vi', { numeric: true, sensitivity: 'base' });
      return dir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [filteredData, detailSort]);

  const totalPages = Math.max(1, Math.ceil(sortedDetailList.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate, maGianFilter, trangThaiFilter, detailSort]);

  const paginatedDetailList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedDetailList.slice(start, start + PAGE_SIZE);
  }, [sortedDetailList, currentPage]);

  const handleSortDetail = (key) => {
    setDetailSort((prev) => ({
      key,
      dir: prev.key === key ? (prev.dir === 'asc' ? 'desc' : 'asc') : 'desc',
    }));
  };

  const renderDetailSortIcon = (key) => {
    if (detailSort.key !== key) {
      return <span className="text-[10px] text-slate-400">↕</span>;
    }
    return detailSort.dir === 'asc' ? (
      <span className="text-[10px] text-indigo-600 font-bold">↑</span>
    ) : (
      <span className="text-[10px] text-indigo-600 font-bold">↓</span>
    );
  };

  // Transfer to DonHangCT
  const handleTransferToDonHangCT = async () => {
    if (!idspStats || idspStats.length === 0) {
      showToast('Không có dữ liệu để chuyển sang Đơn hàng CT!', 'warning');
      return;
    }

    const validItems = idspStats.filter((i) => i.slg > 0);
    if (validItems.length === 0) {
      showToast('Không có mặt hàng nào có SL xuất > 0 để chuyển!', 'warning');
      return;
    }

    const ngayFormat = formatYmdToDmy(fromDate) || fromDate;
    const truong = 'XUẤT';
    const ncc = 'HẰNG NGÀY';

    const appendValues = validItems.map((item) => {
      const sp = sanPhamData.find(
        (s) => (s.sku_con || '').toLowerCase() === item.idsp.toLowerCase()
      );
      const id_sp = sp?.id_sp || item.idsp.substring(0, 4);
      const gia = sp?.gia_nhap || 0;
      const key = `${ngayFormat} | ${truong} | ${ncc} | MB`;
      const id_dh = key;
      const id_dh_ct = `${ngayFormat} | ${truong} | ${ncc} | MB | KHO | ${item.idsp}`;
      const id_ton_kho = `KHO | ${item.idsp}`;

      return [
        id_dh_ct,
        id_dh,
        ngayFormat,
        truong,
        ncc,
        'KHO',
        item.idsp,
        id_sp,
        item.ten_sp,
        item.slg,
        gia,
        item.slg * gia,
        '',
        id_ton_kho,
        'CHỜ XÁC NHẬN',
      ];
    });

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn chuyển ${appendValues.length} dòng sản phẩm xuất sang Đơn hàng CT?`
      )
    ) {
      return;
    }

    setTransferring(true);
    try {
      await appendSheetRows(CONFIG.dhctSheetName, appendValues);
      showToast(`Đã chuyển thành công ${appendValues.length} dòng sang Đơn hàng CT!`, 'success');
    } catch (err) {
      console.error('Lỗi khi chuyển sang Đơn hàng CT:', err);
      showToast('Lỗi khi chuyển sang Đơn hàng CT: ' + err.message, 'error');
    } finally {
      setTransferring(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      showToast('Không có dữ liệu để xuất Excel!', 'warning');
      return;
    }

    const headers = [
      'Ngày',
      'Sàn',
      'Mã gian',
      'MVD',
      'MDH',
      'Mã SKU CT',
      'Tên sản phẩm',
      'SL Xuất',
      'Đơn giá',
      'Thành tiền',
      'Trạng thái',
    ];
    const rows = filteredData.map((r) => [
      formatYmdToDmy(r.ngay) || r.ngay,
      r.san,
      r.ma_gian,
      r.mvd,
      r.mdh,
      r.id_sp_ct,
      r.ten_sp,
      r.slg_xuat,
      r.don_gia_1,
      r.slg_xuat * r.don_gia_1,
      r.trang_thai,
    ]);

    exportToExcel(`BaoCao_DonHang_${fromDate}_${toDate}`, 'ChiTiet', headers, rows);
    showToast('Đã xuất Excel báo cáo đơn hàng thành công!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 lg:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-base text-slate-800">Báo cáo đơn hàng</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTransferToDonHangCT}
              disabled={transferring || loading}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
              title="Chuyển dữ liệu xuất sang Đơn hàng CT"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{transferring ? 'Đang chuyển...' : 'Chuyển sang Đơn hàng CT'}</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Xuất dữ liệu ra Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={handleReload}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
              title="Tải lại dữ liệu (Mặc định hôm nay)"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          {/* Quick Date Presets */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold">
            <button
              onClick={() => setQuickDate('today')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                fromDate === getTodayYmd() && toDate === getTodayYmd()
                  ? 'bg-white text-primary shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setQuickDate('thisWeek')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                fromDate === getCurrentWeekRangeYmd().from && toDate === getCurrentWeekRangeYmd().to
                  ? 'bg-white text-primary shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tuần này
            </button>
            <button
              onClick={() => setQuickDate('thisMonth')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                fromDate === getCurrentMonthRangeYmd().from && toDate === getCurrentMonthRangeYmd().to
                  ? 'bg-white text-primary shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tháng này
            </button>
          </div>

          {/* Stepper Date Picker */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
            <button
              onClick={() => {
                setFromDate((p) => shiftDate(p, -1));
                setToDate((p) => shiftDate(p, -1));
              }}
              className="p-1 hover:bg-white rounded text-slate-600"
              title="Lùi 1 ngày"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
            <span className="text-slate-400 font-bold">➔</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
            <button
              onClick={() => {
                setFromDate((p) => shiftDate(p, 1));
                setToDate((p) => shiftDate(p, 1));
              }}
              className="p-1 hover:bg-white rounded text-slate-600"
              title="Tiến 1 ngày"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <select
            value={maGianFilter}
            onChange={(e) => setMaGianFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
          >
            <option value="">Tất cả Gian hàng</option>
            {maGianList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            value={trangThaiFilter}
            onChange={(e) => setTrangThaiFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
          >
            <option value="">Tất cả Trạng thái</option>
            {trangThaiList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Doanh thu</div>
            <div className="text-lg font-extrabold text-slate-900 tracking-tight">
              {kpiData.tongDoanhThu.toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Số đơn hàng</div>
            <div className="text-lg font-extrabold text-slate-900 tracking-tight">
              {kpiData.tongSoDon.toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Sản phẩm xuất</div>
            <div className="text-lg font-extrabold text-slate-900 tracking-tight">
              {kpiData.tongSlgXuat.toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tỷ lệ hủy</div>
            <div className="text-lg font-extrabold text-rose-600 tracking-tight">
              {kpiData.tyLeHuy}%
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-sm text-slate-800 mb-3">Top 10 SKU xuất nhiều nhất</h3>
          <div className="h-64">
            <Bar
              data={skuChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-sm text-slate-800 mb-3">Tỷ trọng doanh thu theo gian hàng</h3>
          <div className="h-64 flex items-center justify-center">
            {magianStats.length > 0 ? (
              <Doughnut
                data={storeChartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            ) : (
              <span className="text-xs text-slate-400">Không có dữ liệu</span>
            )}
          </div>
        </div>
      </div>

      {/* Tables: Store Breakdown & SKU Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Store Table */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase text-slate-700">Thống kê theo Gian hàng</h3>
            <span className="text-xs text-slate-500">{magianStats.length} gian hàng</span>
          </div>

          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
                <tr>
                  <th className="px-3 py-2.5 w-28 text-center whitespace-nowrap">Mã gian</th>
                  <th className="px-3 py-2.5 w-24 text-right whitespace-nowrap">Số đơn</th>
                  <th className="px-3 py-2.5 w-24 text-right whitespace-nowrap">SLG Xuất</th>
                  <th className="px-3 py-2.5 w-32 text-right whitespace-nowrap">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {magianStats.map((s) => (
                  <tr key={s.mg} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 text-center font-bold text-slate-900 whitespace-nowrap w-28">{s.mg}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap w-24">{s.so_don.toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap w-24">{s.slg_xuat.toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums font-bold text-primary whitespace-nowrap w-32">
                      {s.doanh_thu.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SKU Table */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase text-slate-700">Thống kê theo Mã SKU</h3>
            <span className="text-xs text-slate-500">{idspStats.length} SKU</span>
          </div>

          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
                <tr>
                  <th className="px-3 py-2.5 w-28 text-center whitespace-nowrap">Mã SKU</th>
                  <th className="px-3 py-2.5 text-left min-w-[140px]">Tên SP</th>
                  <th className="px-3 py-2.5 w-24 text-right whitespace-nowrap">SL Xuất</th>
                  <th className="px-3 py-2.5 w-32 text-right whitespace-nowrap">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {idspStats.map((s) => (
                  <tr key={s.idsp} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 text-center font-bold text-indigo-700 font-mono whitespace-nowrap w-28">{s.idsp}</td>
                    <td className="px-3 py-2 text-left text-slate-600 truncate max-w-[160px] min-w-[140px]" title={s.ten_sp}>
                      {s.ten_sp || '-'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap w-24">{s.slg.toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums font-bold text-primary whitespace-nowrap w-32">
                      {s.doanh_thu.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tóm tắt báo cáo văn bản */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
            Tóm tắt báo cáo văn bản
          </h3>
          <button
            onClick={handleCopyTextReport}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Sao chép văn bản báo cáo"
          >
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span>Sao chép</span>
          </button>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg text-xs sm:text-sm font-mono whitespace-pre-wrap border border-slate-100 text-slate-800 leading-relaxed select-all">
          {textSummary}
        </div>
      </div>

      {/* Biểu đồ Doanh thu (Cột) & Số đơn (Đường) theo ngày */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <h3 className="font-semibold text-slate-900 mb-4 text-sm sm:text-base">
          Biểu đồ Doanh thu (Cột) & Số đơn (Đường) theo ngày
        </h3>
        <div className="h-96">
          {mergedChartData.labels.length > 0 ? (
            <Chart type="bar" data={mergedChartData} options={mergedChartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Không có dữ liệu biểu đồ
            </div>
          )}
        </div>
      </div>

      {/* Chi tiết đơn hàng */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Chi tiết đơn hàng</h3>
          <span className="text-xs text-slate-500 font-medium">
            {sortedDetailList.length.toLocaleString('vi-VN')} đơn
          </span>
        </div>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full min-w-[1000px] text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 select-none shadow-2xs">
              <tr className="text-slate-600 font-semibold text-[11px]">
                <th className="px-3 py-2.5 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSortDetail('ngay')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Ngày</span>
                    {renderDetailSortIcon('ngay')}
                  </button>
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSortDetail('san')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Sàn</span>
                    {renderDetailSortIcon('san')}
                  </button>
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSortDetail('ma_gian')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Gian</span>
                    {renderDetailSortIcon('ma_gian')}
                  </button>
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSortDetail('mvd')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>MVD</span>
                    {renderDetailSortIcon('mvd')}
                  </button>
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSortDetail('mdh')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>MDH</span>
                    {renderDetailSortIcon('mdh')}
                  </button>
                </th>
                <th className="px-3 py-2.5 min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => handleSortDetail('ten_sp')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Tên SP</span>
                    {renderDetailSortIcon('ten_sp')}
                  </button>
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap text-center">
                  <button
                    type="button"
                    onClick={() => handleSortDetail('id_sp')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>ID SP</span>
                    {renderDetailSortIcon('id_sp')}
                  </button>
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap text-right">
                  <button
                    type="button"
                    onClick={() => handleSortDetail('slg_xuat')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>SLG xuất</span>
                    {renderDetailSortIcon('slg_xuat')}
                  </button>
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap text-right">
                  <button
                    type="button"
                    onClick={() => handleSortDetail('don_gia')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Đơn giá</span>
                    {renderDetailSortIcon('don_gia')}
                  </button>
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap text-right">
                  <button
                    type="button"
                    onClick={() => handleSortDetail('thanh_tien')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Thành tiền</span>
                    {renderDetailSortIcon('thanh_tien')}
                  </button>
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap text-center">
                  <button
                    type="button"
                    onClick={() => handleSortDetail('trang_thai')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Trạng thái</span>
                    {renderDetailSortIcon('trang_thai')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDetailList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                paginatedDetailList.map((item, idx) => {
                  const thanhTien = (parseFloat(item.don_gia_1) || 0) * (parseFloat(item.slg_xuat) || 0);
                  return (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-800">
                        {formatYmdToDmy(item.ngay) || item.ngay || '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-800">
                        {item.san || '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-medium text-slate-800">
                        {item.ma_gian || '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-slate-700">
                        {item.mvd || '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-slate-700">
                        {item.mdh || '-'}
                      </td>
                      <td className="px-3 py-2.5 min-w-[200px] text-slate-800" title={item.ten_sp}>
                        {item.ten_sp || '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-center font-bold text-indigo-700 font-mono">
                        {item.id_sp || item.id_sp_ct || '-'}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono tabular-nums text-slate-900">
                        {item.slg_xuat}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono tabular-nums text-slate-700">
                        {parseFloat(item.don_gia_1 || 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono tabular-nums font-medium text-slate-900">
                        {thanhTien.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-center text-slate-700 font-medium">
                        {item.trang_thai || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Pagination rendered in Bottom Footer */}
      {sortedDetailList.length > 0 && (
        <FooterPortal>
          <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
            <span className="text-slate-300 font-medium hidden sm:inline">•</span>
            <div className="text-slate-600 font-medium whitespace-nowrap text-[11px] sm:text-xs">
              Đang hiển thị{' '}
              <strong className="text-slate-900 font-bold">
                {(currentPage - 1) * PAGE_SIZE + 1} -{' '}
                {Math.min(currentPage * PAGE_SIZE, sortedDetailList.length)}
              </strong>{' '}
              trong tổng số{' '}
              <strong className="text-slate-900 font-bold">
                {sortedDetailList.length.toLocaleString('vi-VN')}
              </strong>{' '}
              dòng
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              maxButtons={6}
            />
          </div>
        </FooterPortal>
      )}
    </div>
  );
}
