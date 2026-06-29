const fs = require('fs');

const path = 'js/modules/baocao.js';
let content = fs.readFileSync(path, 'utf8');

const startMatch = 'const detailSortState = {';
const endMatch = `function updateDetailSortIndicators() {
    const keys = ['Ngay', 'San', 'MaGian', 'Mvd', 'Mdh', 'TenSp', 'IdSp', 'SlgXuat', 'DonGia', 'ThanhTien', 'TrangThai'];`;

const fixStr = `const detailSortState = {
    key: 'ngay',
    dir: 'desc'
};

function normalizeDetailValue(item, key) {
    if (key === 'ngay') return item.ngay || '';
    if (key === 'san') return item.san || '';
    if (key === 'ma_gian') return item.ma_gian || '';
    if (key === 'mvd') return item.mvd || '';
    if (key === 'mdh') return item.mdh || '';
    if (key === 'ten_sp') return item.ten_sp || '';
    if (key === 'id_sp') return item.id_sp || '';
    if (key === 'slg_xuat') return parseFloat(item.slg_xuat) || 0;
    if (key === 'don_gia') return parseFloat(item.don_gia) || 0;
    if (key === 'thanh_tien') return (parseFloat(item.don_gia) || 0) * (parseFloat(item.slg_xuat) || 0);
    if (key === 'trang_thai') return item.trang_thai || '';
    return '';
}

function updateDetailSortIndicators() {
    const keys = ['Ngay', 'San', 'MaGian', 'Mvd', 'Mdh', 'TenSp', 'IdSp', 'SlgXuat', 'DonGia', 'ThanhTien', 'TrangThai'];`;

const startIdx = content.indexOf(startMatch);
const endIdx = content.indexOf(endMatch, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newContent = content.substring(0, startIdx) + fixStr + content.substring(endIdx + endMatch.length);
    fs.writeFileSync(path, newContent, 'utf8');
    console.log('Fixed normalizeDetailValue successfully!');
} else {
    console.log('Could not find matches in baocao.js');
}
