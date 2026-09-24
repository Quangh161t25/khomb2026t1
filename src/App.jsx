import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ColumnWidthProvider } from './context/ColumnWidthContext';
import SettingsModal from './components/settings/SettingsModal';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout & Common
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/Login';

// Pages
import HomePage from './pages/Home';
import HangHoanPage from './pages/HangHoan';
import BanDonPage from './pages/BanDon';
import DonChiTietPage from './pages/DonChiTiet';
import UniqueDhctPage from './pages/UniqueDhct';
import DonHangTongPage from './pages/DonHangTong';
import DonHangPage from './pages/DonHang';
import SanPhamPage from './pages/Products';
import InventoryPage from './pages/Inventory';
import UpMisaPage from './pages/UpMisa';
import BaoCaoPage from './pages/BaoCao';
import BaoCaoTongPage from './pages/BaoCaoTong';
import BCHangHoanPage from './pages/BCHangHoan';
import HHShopDienPage from './pages/HHShopDien';
import { fetchSheetData } from './services/googleSheetsApi';
import { CONFIG } from './config/config';

// Route & Metadata Configurations
export const MODULE_ROUTES = {
  home: {
    path: '/trang-chu',
    aliases: ['/', '/home', '/trang-chu', 'home'],
    category: 'Tổng quan',
    label: 'Trang chủ',
  },
  donhang: {
    path: '/up-don-chi-tiet',
    aliases: ['/donhang', '/don-chi-tiet', '/up-don-chi-tiet', 'don_chi_tiet', 'donhang'],
    category: 'Đơn hàng',
    label: 'UP Đơn chi tiết',
  },
  sanpham: {
    path: '/san-pham',
    aliases: ['/sanpham', '/san-pham', 'san_pham', 'sanpham'],
    category: 'Quản lý kho',
    label: 'Sản phẩm PM',
  },
  hang_hoan: {
    path: '/hang-hoan',
    aliases: ['/hang_hoan', '/hanghoan', '/hang-hoan', 'hang_hoan', 'hanghoan'],
    category: 'Quản lý kho',
    label: 'Hàng hoàn',
  },
  ban_don: {
    path: '/ban-don',
    aliases: ['/ban_don', '/bandon', '/ban-don', 'ban_don', 'bandon'],
    category: 'Vận hành',
    label: 'Bắn đơn',
  },
  donhang_tong: {
    path: '/don-hang',
    aliases: ['/donhang_tong', '/don-hang', 'don_hang', 'donhang_tong'],
    category: 'Đơn hàng',
    label: 'Đơn hàng',
  },
  dhct: {
    path: '/don-hang-ct',
    aliases: ['/dhct', '/dh_ct', '/don-hang-ct', 'dh_ct', 'dhct'],
    category: 'Đơn hàng',
    label: 'Đơn hàng CT',
  },
  unique_dh_ct: {
    path: '/unique-dhct',
    aliases: ['/unique_dh_ct', '/unique-dhct', 'unique_dh_ct'],
    category: 'Đơn hàng',
    label: 'Unique DHCT',
  },
  inventory: {
    path: '/ton-kho',
    aliases: ['/inventory', '/ton_kho', '/ton-kho', 'ton_kho', 'inventory'],
    category: 'Quản lý kho',
    label: 'Tồn kho',
  },
  bc_hang_hoan: {
    path: '/bc-hang-hoan',
    aliases: ['/bc_hang_hoan', '/bchh', '/bc-hang-hoan', 'bc_hang_hoan', 'bchh'],
    category: 'Báo cáo',
    label: 'BC Hàng hoàn',
  },
  baocao: {
    path: '/bao-cao',
    aliases: ['/baocao', '/bao_cao', '/bao-cao', 'bao_cao', 'baocao'],
    category: 'Báo cáo',
    label: 'Báo cáo đơn hàng',
  },
  baocao_tong: {
    path: '/bao-cao-tong',
    aliases: ['/baocao_tong', '/bao_cao_tong', '/bao-cao-tong', 'bao_cao_tong', 'baocao_tong'],
    category: 'Báo cáo',
    label: 'Báo cáo tổng',
  },
  upmisa: {
    path: '/upmisa',
    aliases: ['/upmisa', '/up-misa', 'upmisa'],
    category: 'Kế toán',
    label: 'UPMISA',
  },
  hh_shop_dien: {
    path: '/hh-shop-dien',
    aliases: ['/hh-shop-dien', '/hh_shop_dien', 'hh_shop_dien', 'hh-shop-dien'],
    category: 'Quản lý kho',
    label: 'HH Shop điền',
  },
};

function getModuleFromLocation() {
  try {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const urlParams = new URLSearchParams(window.location.search);
    const linkParam = urlParams.get('link') || urlParams.get('module');

    if (linkParam) {
      for (const [modId, config] of Object.entries(MODULE_ROUTES)) {
        if (config.aliases.includes(linkParam.toLowerCase()) || modId === linkParam.toLowerCase()) {
          return modId;
        }
      }
    }

    for (const [modId, config] of Object.entries(MODULE_ROUTES)) {
      if (config.aliases.includes(path)) {
        return modId;
      }
    }
  } catch (e) {}
  return 'home';
}

function MainApp() {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModuleState] = useState(() => getModuleFromLocation());

  // Function to switch module and update browser address bar

  // Background Prefetch: Âm thầm tải trước dữ liệu nặng để khi bấm sang trang sẽ load ngay lập tức
  React.useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        console.log('[Prefetch] Bắt đầu tải ngầm các dữ liệu nặng (UD_CT, HH_BH, DH_CT, v.v.)...');
        Promise.allSettled([
          fetchSheetData(CONFIG.udctSheetName, 'A1:AF900000'), // UD_CT cho UP Đơn / Hàng hoàn
          fetchSheetData(`${CONFIG.hhbhSheetName}!A:Z`),       // HH_BH cho Hàng hoàn
          fetchSheetData(`${CONFIG.dhctSheetName}!A:P`),       // DH_CT cho UP Đơn
          fetchSheetData(CONFIG.sanphamSheetName),             // SAN_PHAM chung
          fetchSheetData(`${CONFIG.sanphamSheetName}!A:G`)     // SAN_PHAM cho UP Đơn
        ]).then(() => {
          console.log('[Prefetch] Hoàn tất tải ngầm 100%!');
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const setActiveModule = (moduleId, replace = false) => {
    setActiveModuleState(moduleId);
    const route = MODULE_ROUTES[moduleId] || MODULE_ROUTES.home;
    const newPath = route.path;
    if (replace) {
      window.history.replaceState({ module: moduleId }, '', newPath);
    } else {
      window.history.pushState({ module: moduleId }, '', newPath);
    }
  };

  // Sync with browser Back / Forward buttons & initial URL normalize
  React.useEffect(() => {
    const handlePopState = (event) => {
      const mod = event.state?.module || getModuleFromLocation();
      setActiveModuleState(mod);
    };

    window.addEventListener('popstate', handlePopState);

    // Initial replaceState to clean up pathname if needed
    const initialMod = getModuleFromLocation();
    const route = MODULE_ROUTES[initialMod] || MODULE_ROUTES.home;
    window.history.replaceState({ module: initialMod }, '', route.path);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-600">Đang khởi tạo hệ thống...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const moduleInfo = MODULE_ROUTES[activeModule] || MODULE_ROUTES.home;

  const renderModule = () => {
    switch (activeModule) {
      case 'home':
        return <HomePage onNavigate={setActiveModule} />;
      case 'hanghoan':
      case 'hang_hoan':
        return <HangHoanPage />;
      case 'bandon':
      case 'ban_don':
        return <BanDonPage />;
      case 'dhct':
        return <DonChiTietPage />;
      case 'unique_dh_ct':
        return <UniqueDhctPage />;
      case 'donhang_tong':
        return <DonHangTongPage />;
      case 'donhang':
        return <DonHangPage />;
      case 'sanpham':
        return <SanPhamPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'upmisa':
        return <UpMisaPage />;
      case 'baocao':
        return <BaoCaoPage />;
      case 'baocao_tong':
        return <BaoCaoTongPage />;
      case 'bchh':
      case 'bc_hang_hoan':
        return <BCHangHoanPage />;
      case 'hh_shop_dien':
        return <HHShopDienPage />;
      default:
        return <HomePage onNavigate={setActiveModule} />;
    }
  };

  return (
    <MainLayout
      activeModule={activeModule}
      setActiveModule={setActiveModule}
      moduleInfo={moduleInfo}
    >
      {renderModule()}
    </MainLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ColumnWidthProvider>
            <MainApp />
            <SettingsModal />
          </ColumnWidthProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
