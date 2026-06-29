const fs = require('fs');

const path = 'js/modules/baocao.js';
let content = fs.readFileSync(path, 'utf8');

const matchStr = `function updateDetailSortIndicators() {
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderColor: '#2563eb',
                    borderWidth: 1,
                    yAxisID: 'yRev',
                    order: 2
                },`;

const fixStr = `function updateDetailSortIndicators() {
    const keys = ['Ngay', 'San', 'Mvd', 'Mdh', 'TenSp', 'IdSp', 'SlgXuat', 'DonGia', 'ThanhTien', 'TrangThai'];
    keys.forEach(k => {
        const el = document.getElementById(\`detailSort\${k}\`);
        if (el) el.textContent = '↕';
    });
    const activeKeyMap = {
        ngay: 'Ngay', san: 'San', mvd: 'Mvd', mdh: 'Mdh', ten_sp: 'TenSp', id_sp: 'IdSp', slg_xuat: 'SlgXuat', don_gia: 'DonGia', thanh_tien: 'ThanhTien', trang_thai: 'TrangThai'
    };
    const activeEl = document.getElementById(\`detailSort\${activeKeyMap[detailSortState.key]}\`);
    if (activeEl) activeEl.textContent = detailSortState.dir === 'asc' ? '↑' : '↓';
}

function sortDetailTable(key) {
    if (detailSortState.key === key) {
        detailSortState.dir = detailSortState.dir === 'asc' ? 'desc' : 'asc';
    } else {
        detailSortState.key = key;
        detailSortState.dir = key === 'ngay' ? 'desc' : 'asc';
    }
    renderDetailTable();
}

function renderDetailTable() {
    const detailBody = document.getElementById('detailTableBody');
    if (!detailBody) return;
    const rows = (window.__detailRows || []).slice();
    rows.sort((a, b) => {
        const av = normalizeDetailValue(a, detailSortState.key);
        const bv = normalizeDetailValue(b, detailSortState.key);
        let cmp = 0;
        if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
        else cmp = String(av).localeCompare(String(bv), 'vi', { numeric: true, sensitivity: 'base' });
        return detailSortState.dir === 'asc' ? cmp : -cmp;
    });
    if (rows.length === 0) {
        detailBody.innerHTML = '<tr><td colspan="11" class="text-center py-8 text-slate-500">Không có dữ liệu</td></tr>';
    } else {
        detailBody.innerHTML = rows.map(item => \`
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                        <td class="px-4 py-3 text-sm text-slate-900">\${item.ngay || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">\${item.san || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">\${item.ma_gian || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">\${item.mvd || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">\${item.mdh || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">\${item.ten_sp || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">\${item.id_sp || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">\${item.slg_xuat}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">\${parseFloat(item.don_gia || 0).toLocaleString('vi-VN')}</td>
                        <td class="px-4 py-3 text-sm text-slate-900 font-medium">\${((parseFloat(item.don_gia) || 0) * (parseFloat(item.slg_xuat) || 0)).toLocaleString('vi-VN')}</td>
                        <td class="px-4 py-3 text-sm text-slate-700 font-semibold">\${item.trang_thai || '-'}</td>
                    </tr>
                \`).join('');
    }
    updateDetailSortIndicators();
}

function renderCharts(dailyStats) {
    const labels = Object.keys(dailyStats).sort();
    const revenueData = labels.map(l => dailyStats[l].doanh_thu);
    const ordersData = labels.map(l => dailyStats[l].mvd_set ? dailyStats[l].mvd_set.size : dailyStats[l].so_don);

    if (mergedChart) mergedChart.destroy();

    const ctx = document.getElementById('mergedChart').getContext('2d');
    mergedChart = new Chart(ctx, {
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Doanh thu (đ)',
                    data: revenueData,
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderColor: '#2563eb',
                    borderWidth: 1,
                    yAxisID: 'yRev',
                    order: 2
                },`;

const startIdx = content.indexOf('function updateDetailSortIndicators() {');
const endIdx = content.indexOf('                },', startIdx) + 18;

if (startIdx !== -1 && endIdx !== -1) {
    const newContent = content.substring(0, startIdx) + fixStr + content.substring(endIdx);
    fs.writeFileSync(path, newContent, 'utf8');
    console.log('Fixed baocao.js successfully!');
} else {
    console.log('Could not find matches in baocao.js');
}
