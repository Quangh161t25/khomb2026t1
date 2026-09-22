// js/state.js - Shared global application state
// All modules read/write these variables
let isUploading = false;
let isLoggedIn = false;
let usersData = [];
let currentUser = null;
let accessToken = null;
let tokenExpiry = 0;
let tokenRequestPromise = null;

// Data stores
let udctData = [];
let sanphamData = [];
let reportData = [];
let mergedChart = null;
let upmisaData = [];
let inventoryData = [];
let dhctData = [];
let hangHoanData = [];
let filteredHangHoanData = [];
let hhShopDienData = [];
let filteredHHShopDienData = [];
let hhBhMvdSet = new Set();
let banDonData = [];
let filteredBanDonData = [];
let banDonCurrentIndex = 0;
let banDonTimer = null;

// UI state
let currentEditRowIndex = -1;
let currentHangHoanEditIndex = -1;
let hhDrawerMode = 'edit';
let currentHHShopRowIndex = -1;
let continuousScanRunning = false;
let continuousScanStream = null;
let continuousScanLastValue = '';
let continuousScanLastAt = 0;
let currentDrawerMode = 'udct';
let udctAutoSaveTimer = null;
let suppressUDCTAutoSave = false;
let hhCatalogLoadPromise = null;

// UDCT filter/pagination state
let filteredUDCT = [];
let udctCurrentPage = 1;
const uitItemsPerPage = 500;
let udctQuickStatusTab = 'all';
const udctSelectedRows = new Set();
const udctTrangThaiOptions = ['1 THAY THẾ', '2 HỦY', '3 HÊT HÀNG', '4 MAI GỌI'];
