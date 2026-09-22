// auth - Module Pattern (IIFE)
(function () {
function applyRoleUI(role) {
    const isDemo = role === 'demo';
    const isKinhDoanh = role === 'kinhdoanh';
    const isRestricted = isDemo || isKinhDoanh;
    const hideIds = ['sidebarUpmisa', 'sidebarBaocao', 'sidebarInventory', 'sidebarDHCT'];
    hideIds.forEach(hid => {
        const el = document.getElementById(hid);
        if (el) el.style.display = isRestricted ? 'none' : '';
    });

    const hangHoanModule = document.getElementById('sidebarHangHoan');
    if (hangHoanModule) hangHoanModule.style.display = isDemo ? 'none' : '';
    const hhShopDienModule = document.getElementById('sidebarHHShopDien');
    if (hhShopDienModule) hhShopDienModule.style.display = isDemo ? 'none' : '';

    if (isKinhDoanh) {
        const hhActions = [
            "button[onclick='exportHangHoanSummaryToExcel()']",
            "button[onclick='exportHangHoanToExcel()']",
            "button[onclick='exportHangHoanToMisa()']"
        ];
        document.querySelectorAll(hhActions.join(', ')).forEach(b => b.style.display = 'none');
    }

    ['excelUploadDonhang', 'excelUpload'].forEach(upId => {
        const excelUp = document.getElementById(upId);
        if (excelUp && excelUp.parentElement) {
            excelUp.parentElement.style.display = isRestricted ? 'none' : '';
        }
    });

    document.querySelectorAll("button[onclick='updateAllPricesBatch()'], button[onclick^='batchUpdateUDCTStatus'], button[onclick='batchRefreshSelectedRows()']").forEach(b => {
        b.style.display = isRestricted ? 'none' : '';
    });

    document.querySelectorAll("button[onclick='exportHangHoanSummaryToExcel()'], button[onclick='exportHangHoanToExcel()'], button[onclick='exportHangHoanToMisa()'], button[onclick='exportReportToExcel()'], button[onclick='exportIdSPExcel()'], button[onclick='exportUpmisaToExcel()']").forEach(b => {
        b.style.display = isKinhDoanh ? 'none' : '';
    });

    const actionHeader = Array.from(document.querySelectorAll('th')).find(th => th.textContent.trim() === 'Action');
    if (actionHeader) actionHeader.style.display = isKinhDoanh ? 'none' : '';

    document.querySelectorAll('#donhangTableBody td:nth-child(16), #donhangTableBody th:nth-child(16)').forEach(el => {
        el.style.display = isKinhDoanh ? 'none' : '';
    });

    const donhangExcelBtn = document.querySelector("label[for='excelUploadDonhang']");
    if (donhangExcelBtn) donhangExcelBtn.style.display = isRestricted ? 'none' : '';

    const donhangRefreshBtn = document.querySelector("button[onclick='loadUDCTData()']");
    if (donhangRefreshBtn) donhangRefreshBtn.style.display = isRestricted ? 'none' : '';

    // Hide Add DH button in moduleUniqueDHCT
    const addUniqueDHBtn = document.querySelector("button[onclick='openAddDHCTModal()']");
    if (addUniqueDHBtn) addUniqueDHBtn.style.display = isKinhDoanh ? 'none' : '';
}

async function handleLogin() {
    const id = document.getElementById('loginId')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const errorEl = document.getElementById('loginError');
    if (errorEl) {
        errorEl.classList.add('hidden');
        errorEl.textContent = '';
    }

    if (!id || !password) {
        if (errorEl) {
            errorEl.textContent = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    document.getElementById('loginLoading').classList.remove('hidden');
    try {
        await fetchAuthData();
        const user = usersData.find(u => u.id === id && u.password === password);
        if (!user) {
            if (errorEl) {
                errorEl.textContent = 'Sai tài khoản hoặc mật khẩu.';
                errorEl.classList.remove('hidden');
            }
            return;
        }

        if (user.tinhTrang && /nghỉ|khóa|block|inactive/i.test(user.tinhTrang)) {
            if (errorEl) {
                errorEl.textContent = 'Tài khoản đang bị khóa hoặc ngưng hoạt động.';
                errorEl.classList.remove('hidden');
            }
            return;
        }

        isLoggedIn = true;
        currentUser = {
            id: user.id,
            name: user.name || user.id,
            role: (user.role || 'user').toString().trim().toLowerCase(),
            password: user.password
        };
        localStorage.setItem('erp_last_user_id', user.id);
        localStorage.setItem('erp_current_user', JSON.stringify(currentUser));

        window.location.reload();
    } catch (err) {
        console.error('Login error:', err);
        if (errorEl) {
            errorEl.textContent = 'Không thể xác thực tài khoản. Vui lòng thử lại.';
            errorEl.classList.remove('hidden');
        }
    } finally {
        document.getElementById('loginLoading').classList.add('hidden');
    }
}

function handleLogout() {
    if (confirm("Bạn có muốn đăng xuất không?")) {
        localStorage.removeItem('erp_current_user');
        isLoggedIn = false;
        currentUser = null;
        window.location.reload();
    }
}

function updateUserProfileUI() {
    if (!currentUser) return;
    const sidebarUserName = document.getElementById('sidebarUserName');
    const userInitial = document.getElementById('userInitial');
    const roleLabel = document.querySelector('.sidebar-text .text-xs.text-slate-500');
    if (sidebarUserName) sidebarUserName.textContent = currentUser.name;
    if (userInitial && currentUser.name) userInitial.textContent = currentUser.name.charAt(0).toUpperCase();
    if (roleLabel) roleLabel.textContent = currentUser.role === 'kinhdoanh' ? 'Kinh doanh' : (currentUser.role || 'Nhân viên');
}

window.onload = async () => {
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const lastId = localStorage.getItem('erp_last_user_id');
    if (lastId && document.getElementById('loginId')) document.getElementById('loginId').value = lastId;

    try {
        const savedUser = localStorage.getItem('erp_current_user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            if (parsedUser && parsedUser.id) {
                // Immediate UI update for smooth transition
                if (loginScreen) loginScreen.classList.add('hidden');
                if (mainApp) mainApp.classList.remove('hidden');
                isLoggedIn = true;
                currentUser = parsedUser;
                if (document.getElementById('welcomeUserName')) document.getElementById('welcomeUserName').textContent = currentUser.name;
                updateUserProfileUI();
                applyRoleUI(currentUser.role);

                // Khởi động tự động làm mới
                startAutoRefresh();

                // Khởi động tải dữ liệu ngay từ đầu để tránh lỗi "Chưa có dữ liệu"
                loadUDCTData();
                loadSanphamData();
                                fetchDHCTData(); // Thêm luôn DH_CT mới


                // Chuyển nhanh qua module đang yêu cầu (nếu có)
                const urlParams = new URLSearchParams(window.location.search);
                const link = urlParams.get('link');
                const moduleMapping = {
                    'don_chi_tiet': 'donhang',
                    'san_pham': 'sanpham',
                    'bao_cao': 'baocao',
                    'upmisa': 'upmisa',
                    'ton_kho': 'inventory',
                    'dh_ct': 'dh_ct',
                    'hang_hoan': 'hang_hoan',
                    'hh_shop_dien': 'hh_shop_dien'
                };
                if (link && moduleMapping[link]) {
                    if (typeof switchModule === 'function') switchModule(moduleMapping[link]);
                }

                // Fetch data in background
                await fetchAuthData();
                const user = usersData.find(u => u.id === parsedUser.id && u.password === parsedUser.password);
                if (user && !(user.tinhTrang && /nghỉ|khóa|block|inactive/i.test(user.tinhTrang))) {
                    currentUser = {
                        id: user.id,
                        name: user.name || user.id,
                        role: (user.role || 'user').toString().trim().toLowerCase(),
                        password: user.password
                    };
                    updateUserProfileUI();
                    applyRoleUI(currentUser.role);
                    await loadUDCTData();
                    await loadSanphamData();
                } else {
                    handleLogout(); // Session invalid
                }
            } else {
                if (loginScreen) loginScreen.classList.remove('hidden');
                if (mainApp) mainApp.classList.add('hidden');
            }
        } else {
            if (loginScreen) loginScreen.classList.remove('hidden');
            if (mainApp) mainApp.classList.add('hidden');
        }
    } catch (e) {
        console.error("Lỗi khởi tạo:", e);
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (mainApp) mainApp.classList.add('hidden');
    }

    if (window.innerWidth > 1024) closeMobileSidebar();
};

function startAutoRefresh() {
    console.log("Auto refresh started (2 mins)");
    setInterval(async () => {
        if (isLoggedIn) {
            console.log("Running auto background refresh...");
            await loadUDCTData(true);
            await fetchDHCTData(true);
            // Có thể thêm các sheet khác nếu cần như fetchInventoryData, fetchHangHoanData...
        }
    }, 120000); // 120000ms = 2 phút
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeMobileSidebar();
});


    Object.assign(window.AppModules = window.AppModules || {}, { ['auth']: true });
    window.applyRoleUI = applyRoleUI;
    window.handleLogin = handleLogin;
    window.handleLogout = handleLogout;
    window.updateUserProfileUI = updateUserProfileUI;
    window.startAutoRefresh = startAutoRefresh;
})();
