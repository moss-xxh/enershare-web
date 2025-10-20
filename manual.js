// ========================================
// 说明书管理模块
// ========================================

// 说明书数据存储
let manualFiles = [];
let manualCurrentPage = 1;
const manualPageSize = 10;
let manualEditingId = null;

// 初始化数据
function initManualData() {
    const saved = localStorage.getItem('manualFiles');
    if (saved) {
        manualFiles = JSON.parse(saved);
    } else {
        // 初始化示例数据
        manualFiles = [
            {
                id: 1,
                language: 'zh',
                fileName: '产品说明书_中文版.pdf',
                uploadDate: '2025-01-15',
                status: 'active'
            },
            {
                id: 2,
                language: 'en',
                fileName: 'Product_Manual_English.pdf',
                uploadDate: '2025-01-10',
                status: 'active'
            }
        ];
        saveManualData();
    }
}

function saveManualData() {
    localStorage.setItem('manualFiles', JSON.stringify(manualFiles));
}

// ========================================
// 初始化说明书模块
// ========================================
function initManual() {
    initManualData();
    bindManualEvents();
    renderManualTable();
    renderManualPagination();
}

// ========================================
// 事件绑定
// ========================================
function bindManualEvents() {
    const addBtn = document.getElementById('addManualBtn');
    addBtn?.addEventListener('click', () => showManualForm());

    const searchInput = document.getElementById('manualSearchInput');
    searchInput?.addEventListener('input', (e) => {
        handleManualSearch(e.target.value);
    });

    const prevBtn = document.getElementById('manualPrevPage');
    const nextBtn = document.getElementById('manualNextPage');

    prevBtn?.addEventListener('click', () => {
        if (manualCurrentPage > 1) {
            manualCurrentPage--;
            renderManualTable();
            renderManualPagination();
        }
    });

    nextBtn?.addEventListener('click', () => {
        const totalPages = Math.ceil(manualFiles.length / manualPageSize);
        if (manualCurrentPage < totalPages) {
            manualCurrentPage++;
            renderManualTable();
            renderManualPagination();
        }
    });
}

// ========================================
// 渲染表格
// ========================================
function renderManualTable(searchTerm = '') {
    const tbody = document.getElementById('manualTableBody');
    if (!tbody) return;

    let filteredData = manualFiles;
    if (searchTerm) {
        filteredData = manualFiles.filter(file =>
            file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getLanguageName(file.language).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    const start = (manualCurrentPage - 1) * manualPageSize;
    const end = start + manualPageSize;
    const pageData = filteredData.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: var(--text-tertiary);">
                    暂无数据
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pageData.map(file => `
        <tr>
            <td>${getLanguageName(file.language)}</td>
            <td>${file.fileName || '-'}</td>
            <td>${file.uploadDate}</td>
            <td style="text-align: left;">
                <div class="action-buttons">
                    <button class="action-btn download" onclick="handleManualDownload(${file.id})">
                        ${translations[currentLang].download}
                    </button>
                    <button class="action-btn edit" onclick="handleManualEdit(${file.id})">
                        ${translations[currentLang].edit}
                    </button>
                    <button class="action-btn delete" onclick="handleManualDelete(${file.id})">
                        ${translations[currentLang].delete}
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 获取语言名称
function getLanguageName(lang) {
    const names = {
        zh: '简体中文',
        en: 'English'
    };
    return names[lang] || lang;
}

// ========================================
// 渲染分页
// ========================================
function renderManualPagination() {
    const totalPages = Math.ceil(manualFiles.length / manualPageSize);
    const pageNumbers = document.getElementById('manualPageNumbers');
    const prevBtn = document.getElementById('manualPrevPage');
    const nextBtn = document.getElementById('manualNextPage');

    if (!pageNumbers) return;

    prevBtn.disabled = manualCurrentPage === 1;
    nextBtn.disabled = manualCurrentPage === totalPages || totalPages === 0;

    let pages = [];
    if (totalPages <= 7) {
        pages = Array.from({length: totalPages}, (_, i) => i + 1);
    } else {
        if (manualCurrentPage <= 3) {
            pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (manualCurrentPage >= totalPages - 2) {
            pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', manualCurrentPage - 1, manualCurrentPage, manualCurrentPage + 1, '...', totalPages];
        }
    }

    pageNumbers.innerHTML = pages.map(page => {
        if (page === '...') {
            return '<span class="page-number" style="cursor: default;">...</span>';
        }
        return `
            <div class="page-number ${page === manualCurrentPage ? 'active' : ''}"
                 onclick="goToManualPage(${page})">
                ${page}
            </div>
        `;
    }).join('');
}

function goToManualPage(page) {
    manualCurrentPage = page;
    renderManualTable();
    renderManualPagination();
}

// ========================================
// 搜索处理
// ========================================
function handleManualSearch(term) {
    manualCurrentPage = 1;
    renderManualTable(term);
    renderManualPagination();
}

// ========================================
// 显示表单
// ========================================
function showManualForm(id = null) {
    manualEditingId = id;
    const file = id ? manualFiles.find(f => f.id === id) : null;

    const overlay = document.createElement('div');
    overlay.className = 'ota-form-overlay';
    overlay.id = 'manualFormOverlay';

    overlay.innerHTML = `
        <div class="ota-form-dialog">
            <div class="form-header">
                <h3 class="form-title">${translations[currentLang][id ? 'editManualTitle' : 'addManualTitle']}</h3>
                <button class="close-btn" onclick="closeManualForm()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <form id="manualForm" onsubmit="handleManualSubmit(event)">
                <div class="form-group">
                    <label class="form-label">${translations[currentLang].language}<span class="required">*</span></label>
                    <select class="form-select" id="manualLanguage" required>
                        <option value="zh" ${file?.language === 'zh' ? 'selected' : ''}>简体中文</option>
                        <option value="en" ${file?.language === 'en' ? 'selected' : ''}>English</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">${translations[currentLang].file}<span class="required">*</span></label>
                    <div class="file-upload">
                        <label class="file-upload-btn" for="manualFile">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span class="file-upload-text">${translations[currentLang].selectFile}</span>
                        </label>
                        <input type="file" id="manualFile" accept=".pdf,.doc,.docx" ${!file ? 'required' : ''}>
                        <div class="file-name" id="manualFileName">${file?.fileName || ''}</div>
                    </div>
                </div>
                <div class="form-buttons">
                    <button type="button" class="form-btn form-btn-cancel" onclick="closeManualForm()">${translations[currentLang].cancel}</button>
                    <button type="submit" class="form-btn form-btn-submit">${translations[currentLang].save}</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    // 文件上传处理
    const fileInput = document.getElementById('manualFile');
    fileInput?.addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name;
        const fileNameDiv = document.getElementById('manualFileName');
        if (fileNameDiv && fileName) {
            fileNameDiv.textContent = fileName;
        }
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeManualForm();
        }
    });
}

// ========================================
// 关闭表单
// ========================================
function closeManualForm() {
    const overlay = document.getElementById('manualFormOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 350);
    }
    manualEditingId = null;
}

// ========================================
// 提交表单
// ========================================
function handleManualSubmit(e) {
    e.preventDefault();

    const language = document.getElementById('manualLanguage').value;
    const fileInput = document.getElementById('manualFile');
    const fileName = fileInput.files[0]?.name || '';

    if (manualEditingId) {
        // 编辑
        const index = manualFiles.findIndex(f => f.id === manualEditingId);
        if (index !== -1) {
            manualFiles[index] = {
                ...manualFiles[index],
                language,
                fileName: fileName || manualFiles[index].fileName
            };
            showNotification('success', translations[currentLang].editSuccess);
        }
    } else {
        // 新增
        if (!fileName) {
            showNotification('error', '请选择文件');
            return;
        }

        const newFile = {
            id: Date.now(),
            language,
            fileName: fileName,
            uploadDate: new Date().toISOString().split('T')[0],
            status: 'active'
        };
        manualFiles.unshift(newFile);
        showNotification('success', translations[currentLang].addSuccess);
    }

    saveManualData();
    renderManualTable();
    renderManualPagination();
    closeManualForm();
}

// ========================================
// 下载
// ========================================
function handleManualDownload(id) {
    const file = manualFiles.find(f => f.id === id);
    if (file) {
        showNotification('success', translations[currentLang].downloadSuccess);
        console.log('下载:', file.fileName);
    }
}

// ========================================
// 编辑
// ========================================
function handleManualEdit(id) {
    showManualForm(id);
}

// ========================================
// 删除
// ========================================
function handleManualDelete(id) {
    const file = manualFiles.find(f => f.id === id);
    if (file) {
        showCustomConfirm(
            translations[currentLang].deleteTitle,
            translations[currentLang].deleteConfirm,
            () => {
                manualFiles = manualFiles.filter(f => f.id !== id);
                saveManualData();

                const totalPages = Math.ceil(manualFiles.length / manualPageSize);
                if (manualCurrentPage > totalPages && totalPages > 0) {
                    manualCurrentPage = totalPages;
                }

                renderManualTable();
                renderManualPagination();
                showNotification('success', translations[currentLang].deleteSuccess);
            }
        );
    }
}

// ========================================
// 导出到全局作用域
// ========================================
window.initManual = initManual;
window.renderManualTable = renderManualTable;
window.goToManualPage = goToManualPage;
window.handleManualDownload = handleManualDownload;
window.handleManualEdit = handleManualEdit;
window.handleManualDelete = handleManualDelete;
window.handleManualSubmit = handleManualSubmit;
window.closeManualForm = closeManualForm;
