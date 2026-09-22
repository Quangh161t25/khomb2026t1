const fs = require('fs');
const files = [
    'js/config.js',
    'js/state.js',
    'js/utils.js',
    'js/shared/sheet-ranges.js',
    'js/api.js',
    'js/modules/hanghoan.js',
    'js/modules/hh_shop_dien.js',
    'js/modules/donhang.js',
    'js/modules/bandon.js',
    'js/modules/sanpham.js',
    'js/modules/upmisa.js',
    'js/modules/baocao.js',
    'js/modules/bchh.js',
    'js/modules/dhct.js',
    'js/modules/dhct_form.js',
    'js/modules/unique_dh_ct.js',
    'js/modules/inventory.js',
    'js/auth.js',
    'js/main.js'
];
let out = '';
for (let f of files) {
    out += fs.readFileSync(f, 'utf8') + '\n;\n';
}
fs.writeFileSync('js/bundle_all.js', out);
console.log('Concatenated all JS files to js/bundle_all.js');
