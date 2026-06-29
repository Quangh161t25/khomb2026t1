// main - Module Pattern (IIFE)
(function () {
// ============================================================
// Main application logic
// CONFIG is defined in js/config.js
// Global state variables are defined in js/state.js
// ============================================================

// Chạy ngay khi DOM vừa tải để tránh chớp màn hình đăng nhập
document.addEventListener('DOMContentLoaded', () => {
    const ls = document.getElementById('loginScreen');
    const ma = document.getElementById('mainApp');
    if (localStorage.getItem('erp_current_user')) {
        if (ls) ls.classList.add('hidden');
        if (ma) ma.classList.remove('hidden');
    } else {
        if (ls) ls.classList.remove('hidden');
        if (ma) ma.classList.add('hidden');
    }
});

// Close custom suggestions on click outside
document.addEventListener('click', (e) => {
    const list = [
        { sug: 'hhSkuSuggestions', input: 'hhEditSKU' },
        { sug: 'hhSkuCtSuggestions', input: 'hhEditSKUCT' },
        { sug: 'hhShopMvdSuggestions', input: 'hhShopEditMVD' },
        { sug: 'hhShopMdhSuggestions', input: 'hhShopEditMDH' }
    ];
    list.forEach(item => {
        const sug = document.getElementById(item.sug);
        if (sug && !sug.contains(e.target) && e.target.id !== item.input) {
            sug.classList.add('hidden');
        }
    });
});

function toggleSidebar() {
    if (window.innerWidth <= 1024) {
        toggleMobileSidebar();
        return;
    }
    const sidebar = document.getElementById('sidebar');
    const icon = document.getElementById('sidebarToggleIcon');
    const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
    if (isCollapsed) {
        sidebar.classList.remove('sidebar-collapsed', 'w-16');
        sidebar.classList.add('w-64');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />';
    } else {
        sidebar.classList.add('sidebar-collapsed', 'w-16');
        sidebar.classList.remove('w-64');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />';
    }
}

function syncMobileSidebar(isOpen) {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('mobileSidebarBackdrop');
    if (!sidebar || !backdrop) return;
    sidebar.classList.toggle('mobile-open', !!isOpen);
    backdrop.classList.toggle('hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

function openMobileSidebar() {
    syncMobileSidebar(true);
}

function closeMobileSidebar() {
    syncMobileSidebar(false);
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    syncMobileSidebar(!sidebar.classList.contains('mobile-open'));
}
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) return;

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0 && (files[0].name.endsWith('.xlsx') || files[0].name.endsWith('.xls'))) {
            handleExcelUpload(files);
        } else {
            alert("Vui lòng kéo thả file Excel (.xlsx hoặc .xls)");
        }
    });
}

function setupDragAndDropDonhang() {
    const dropZone = document.getElementById('dropZoneDonhang');
    if (!dropZone) return;

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0 && (files[0].name.endsWith('.xlsx') || files[0].name.endsWith('.xls'))) {
            handleExcelUploadDonhang(files);
        } else {
            alert("Vui lòng kéo thả file Excel (.xlsx hoặc .xls)");
        }
    });
}

function switchModule(module) {
    const homeModule = document.getElementById('moduleHome');
    const donhangModule = document.getElementById('moduleDonhang');
    const sanphamModule = document.getElementById('moduleSanpham');
    const baocaoModule = document.getElementById('moduleBaocao');
    const upmisaModule = document.getElementById('moduleUpmisa');
    const inventoryModule = document.getElementById('moduleInventory');
    const hangHoanModule = document.getElementById('moduleHangHoan');
    const hhShopDienModule = document.getElementById('moduleHHShopDien');

    const bcHangHoanModule = document.getElementById('moduleBCHangHoan');
    const baocaoTongModule = document.getElementById('moduleBaocaoTong');
    const banDonModule = document.getElementById('moduleBanDon');
    const dhctFormModule = document.getElementById('moduleDhctForm');
    const dhctModule = document.getElementById('moduleDhct');
    const donhangTongModule = document.getElementById('moduleDonhangTong');
    const pageTitle = document.getElementById('pageTitle');
    const udctHeaderSearchBox = document.getElementById('udctHeaderSearchBox');
    const sidebarHome = document.getElementById('sidebarHome');
    const sidebarDonhang = document.getElementById('sidebarDonhang');
    const sidebarSanpham = document.getElementById('sidebarSanpham');
    const sidebarBaocao = document.getElementById('sidebarBaocao');
    const sidebarBaocaoTong = document.getElementById('sidebarBaocaoTong');
    const sidebarUpmisa = document.getElementById('sidebarUpmisa');
    const sidebarInventory = document.getElementById('sidebarInventory');
    const sidebarDHCT = document.getElementById('sidebarDHCT');
    const sidebarUniqueDHCT = document.getElementById('sidebarUniqueDHCT');
    const sidebarHangHoan = document.getElementById('sidebarHangHoan');
    const sidebarHHShopDien = document.getElementById('sidebarHHShopDien');
    const sidebarBCHangHoan = document.getElementById('sidebarBCHangHoan');
    const sidebarBanDon = document.getElementById('sidebarBanDon');
    const sidebarDhctForm = document.getElementById('sidebarDhctForm');
    const sidebarDhct = document.getElementById('sidebarDhct');
    const sidebarDonhangTong = document.getElementById('sidebarDonhangTong');

    homeModule.style.display = 'none';
    donhangModule.style.display = 'none';
    sanphamModule.style.display = 'none';
    baocaoModule.style.display = 'none';
    upmisaModule.style.display = 'none';
    inventoryModule.style.display = 'none';
    if (hangHoanModule) hangHoanModule.style.display = 'none';
    if (hhShopDienModule) hhShopDienModule.style.display = 'none';
    if (bcHangHoanModule) bcHangHoanModule.style.display = 'none';
    if (baocaoTongModule) baocaoTongModule.style.display = 'none';
    if (banDonModule) banDonModule.style.display = 'none';
    if (dhctFormModule) dhctFormModule.style.display = 'none';
    if (dhctModule) dhctModule.style.display = 'none';
    if (donhangTongModule) donhangTongModule.style.display = 'none';

    if (udctHeaderSearchBox) udctHeaderSearchBox.classList.add('hidden');

    const resetSidebar = () => {
        [sidebarHome, sidebarDonhang, sidebarSanpham, sidebarBaocao, sidebarBaocaoTong, sidebarUpmisa, sidebarInventory, sidebarDHCT, sidebarUniqueDHCT, sidebarHangHoan, sidebarHHShopDien, sidebarBCHangHoan, sidebarBanDon, sidebarDhctForm, sidebarDhct, sidebarDonhangTong].forEach(s => {
            if (s) {
                s.classList.remove('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
                s.classList.add('text-slate-600');
            }
        });
    };

    if (module === 'home') {
        homeModule.style.display = 'block';
        pageTitle.textContent = 'Trang chủ';
        resetSidebar();
        sidebarHome.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
        sidebarHome.classList.remove('text-slate-600');
    } else if (module === 'donhang') {
        donhangModule.style.display = 'flex';
        pageTitle.textContent = 'UP Đơn chi tiết';
        if (udctHeaderSearchBox) udctHeaderSearchBox.classList.remove('hidden');
        resetSidebar();
        sidebarDonhang.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
        sidebarDonhang.classList.remove('text-slate-600');
    } else if (module === 'sanpham') {
        sanphamModule.style.display = 'flex';
        pageTitle.textContent = 'Sản phẩm phần mềm';
        resetSidebar();
        sidebarSanpham.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
        sidebarSanpham.classList.remove('text-slate-600');
        setTimeout(() => setupDragAndDrop(), 100);
    } else if (module === 'baocao') {
        baocaoModule.style.display = 'flex';
        pageTitle.textContent = 'Báo cáo đơn hàng';
        resetSidebar();
        sidebarBaocao.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
        sidebarBaocao.classList.remove('text-slate-600');
        // Không tự động reset ngày khi chuyển module để giữ bộ lọc local
        if (!document.getElementById('fromDate').value || !document.getElementById('toDate').value) {
            setQuickDate('today');
        } else {
            autoFilterReport();
        }
    } else if (module === 'upmisa') {
        upmisaModule.style.display = 'flex';
        pageTitle.textContent = 'UPMISA';
        resetSidebar();
        sidebarUpmisa.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
        sidebarUpmisa.classList.remove('text-slate-600');

        const today = new Date();
        const d = String(today.getDate()).padStart(2, '0');
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const y = today.getFullYear();
        document.getElementById('upmisaDateFilter').value = `${y}-${m}-${d}`;
        buildUpmisaData();
    } else if (module === 'inventory') {
        inventoryModule.style.display = 'flex';
        pageTitle.textContent = 'Quản lý Tồn Kho';
        resetSidebar();
        sidebarInventory.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
        sidebarInventory.classList.remove('text-slate-600');
        fetchInventoryData();

    } else if (module === 'hang_hoan') {
        if (hangHoanModule) hangHoanModule.style.display = 'flex';
        pageTitle.textContent = 'Dữ liệu Hàng hoàn';
        resetSidebar();
        if (sidebarHangHoan) {
            sidebarHangHoan.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarHangHoan.classList.remove('text-slate-600');
        }
        fetchHangHoanData();
    } else if (module === 'hh_shop_dien') {
        if (hhShopDienModule) hhShopDienModule.style.display = 'flex';
        pageTitle.textContent = 'HH SHOP ĐIỀN';
        resetSidebar();
        if (sidebarHHShopDien) {
            sidebarHHShopDien.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarHHShopDien.classList.remove('text-slate-600');
        }
        fetchHHShopDienData();
    } else if (module === 'bc_hang_hoan') {
        if (bcHangHoanModule) bcHangHoanModule.style.display = 'flex';
        pageTitle.textContent = 'Báo cáo hàng hoàn';
        resetSidebar();
        if (sidebarBCHangHoan) {
            sidebarBCHangHoan.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarBCHangHoan.classList.remove('text-slate-600');
        }
        if (!hangHoanData || hangHoanData.length === 0) {
            fetchHangHoanData().then(() => setBCHHQuickDate('today'));
        } else {
            if (!document.getElementById('bcHHFromDate').value) {
                setBCHHQuickDate('today');
            } else {
                filterBCHHData();
            }
        }
    } else if (module === 'ban_don') {
        if (banDonModule) banDonModule.style.display = 'flex';
        pageTitle.textContent = 'Bắn đơn';
        resetSidebar();
        if (sidebarBanDon) {
            sidebarBanDon.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarBanDon.classList.remove('text-slate-600');
        }
        if (typeof showBanDonModule === 'function') showBanDonModule();
        else fetchBanDonData(true);
    } else if (module === 'baocao_tong') {
        if (baocaoTongModule) baocaoTongModule.style.display = 'flex';
        pageTitle.textContent = 'Báo cáo tổng';
        resetSidebar();
        if (sidebarBaocaoTong) {
            sidebarBaocaoTong.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarBaocaoTong.classList.remove('text-slate-600');
        }
        if (!document.getElementById('fromDateTong').value || !document.getElementById('toDateTong').value) {
            setQuickDateTong('thisMonth');
        } else {
            filterReportTong();
        }
    } else if (module === 'dhct_form') {
        if (dhctFormModule) dhctFormModule.style.display = 'block';
        pageTitle.textContent = 'Thêm Đơn hàng chi tiết';
        resetSidebar();
        if (sidebarDhct) {
            sidebarDhct.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarDhct.classList.remove('text-slate-600');
        }
        if (window.initDhctForm) window.initDhctForm();
    } else if (module === 'dhct') {
        if (dhctModule) dhctModule.style.display = 'flex';
        pageTitle.textContent = 'Đơn hàng chi tiết';
        resetSidebar();
        if (sidebarDhct) {
            sidebarDhct.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarDhct.classList.remove('text-slate-600');
        }
        if (typeof fetchDHCTData === 'function') fetchDHCTData(true);
    } else if (module === 'donhang_tong') {
        if (donhangTongModule) donhangTongModule.style.display = 'flex';
        pageTitle.textContent = 'Đơn hàng';
        resetSidebar();
        if (sidebarDonhangTong) {
            sidebarDonhangTong.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarDonhangTong.classList.remove('text-slate-600');
        }
        if (typeof fetchDHCTData === 'function') fetchDHCTData(true);
    }
    if (window.innerWidth <= 1024) closeMobileSidebar();
}

    Object.assign(window.AppModules = window.AppModules || {}, { ['main']: true });
    window.toggleSidebar = toggleSidebar;
    window.syncMobileSidebar = syncMobileSidebar;
    window.openMobileSidebar = openMobileSidebar;
    window.closeMobileSidebar = closeMobileSidebar;
    window.toggleMobileSidebar = toggleMobileSidebar;
    window.setupDragAndDrop = setupDragAndDrop;
    window.setupDragAndDropDonhang = setupDragAndDropDonhang;
    window.switchModule = switchModule;
})();
