// ========================================
// 操作手册管理模块
// ========================================

// 操作手册数据存储
let guideFiles = [];
let guideCurrentPage = 1;
const guidePageSize = 10;
let guideEditingId = null;

// 初始化数据
function initGuideData() {
    const saved = localStorage.getItem('guideFiles');
    if (saved) {
        guideFiles = JSON.parse(saved);
    } else {
        // 初始化示例数据
        guideFiles = [
            {
                id: 1,
                language: 'zh',
                fileName: '操作手册_中文版.pdf',
                uploadDate: '2025-01-15',
                status: 'active'
            },
            {
                id: 2,
                language: 'en',
                fileName: 'Operation_Guide_English.pdf',
                uploadDate: '2025-01-10',
                status: 'active'
            }
        ];
        saveGuideData();
    }
}

function saveGuideData() {
    localStorage.setItem('guideFiles', JSON.stringify(guideFiles));
}

// ========================================
// 初始化操作手册模块
// ========================================
function initGuide() {
    initGuideData();
    bindGuideEvents();
    renderGuideTable();
    renderGuidePagination();
}

// ========================================
// 事件绑定
// ========================================
function bindGuideEvents() {
    const addBtn = document.getElementById('addGuideBtn');
    addBtn?.addEventListener('click', () => showGuideForm());

    const searchInput = document.getElementById('guideSearchInput');
    searchInput?.addEventListener('input', (e) => {
        handleGuideSearch(e.target.value);
    });

    const prevBtn = document.getElementById('guidePrevPage');
    const nextBtn = document.getElementById('guideNextPage');

    prevBtn?.addEventListener('click', () => {
        if (guideCurrentPage > 1) {
            guideCurrentPage--;
            renderGuideTable();
            renderGuidePagination();
        }
    });

    nextBtn?.addEventListener('click', () => {
        const totalPages = Math.ceil(guideFiles.length / guidePageSize);
        if (guideCurrentPage < totalPages) {
            guideCurrentPage++;
            renderGuideTable();
            renderGuidePagination();
        }
    });
}

// ========================================
// 渲染表格
// ========================================
function renderGuideTable(searchTerm = '') {
    const tbody = document.getElementById('guideTableBody');
    if (!tbody) return;

    let filteredData = guideFiles;
    if (searchTerm) {
        filteredData = guideFiles.filter(file =>
            file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getGuideLanguageName(file.language).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    const start = (guideCurrentPage - 1) * guidePageSize;
    const end = start + guidePageSize;
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
            <td>${getGuideLanguageName(file.language)}</td>
            <td>${file.fileName || '-'}</td>
            <td>${file.uploadDate}</td>
            <td style="text-align: left;">
                <div class="action-buttons">
                    <button class="action-btn download" onclick="handleGuideDownload(${file.id})">
                        ${translations[currentLang].download}
                    </button>
                    <button class="action-btn edit" onclick="handleGuideEdit(${file.id})">
                        ${translations[currentLang].edit}
                    </button>
                    <button class="action-btn delete" onclick="handleGuideDelete(${file.id})">
                        ${translations[currentLang].delete}
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 获取语言名称
function getGuideLanguageName(lang) {
    const names = {
        zh: '简体中文',
        en: 'English'
    };
    return names[lang] || lang;
}

// ========================================
// 渲染分页
// ========================================
function renderGuidePagination() {
    const totalPages = Math.ceil(guideFiles.length / guidePageSize);
    const pageNumbers = document.getElementById('guidePageNumbers');
    const prevBtn = document.getElementById('guidePrevPage');
    const nextBtn = document.getElementById('guideNextPage');

    if (!pageNumbers) return;

    prevBtn.disabled = guideCurrentPage === 1;
    nextBtn.disabled = guideCurrentPage === totalPages || totalPages === 0;

    let pages = [];
    if (totalPages <= 7) {
        pages = Array.from({length: totalPages}, (_, i) => i + 1);
    } else {
        if (guideCurrentPage <= 3) {
            pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (guideCurrentPage >= totalPages - 2) {
            pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', guideCurrentPage - 1, guideCurrentPage, guideCurrentPage + 1, '...', totalPages];
        }
    }

    pageNumbers.innerHTML = pages.map(page => {
        if (page === '...') {
            return '<span class="page-number" style="cursor: default;">...</span>';
        }
        return `
            <div class="page-number ${page === guideCurrentPage ? 'active' : ''}"
                 onclick="goToGuidePage(${page})">
                ${page}
            </div>
        `;
    }).join('');
}

function goToGuidePage(page) {
    guideCurrentPage = page;
    renderGuideTable();
    renderGuidePagination();
}

// ========================================
// 搜索处理
// ========================================
function handleGuideSearch(term) {
    guideCurrentPage = 1;
    renderGuideTable(term);
    renderGuidePagination();
}

// ========================================
// 显示表单
// ========================================
function showGuideForm(id = null) {
    guideEditingId = id;
    const file = id ? guideFiles.find(f => f.id === id) : null;

    const overlay = document.createElement('div');
    overlay.className = 'ota-form-overlay';
    overlay.id = 'guideFormOverlay';

    overlay.innerHTML = `
        <div class="ota-form-dialog">
            <div class="form-header">
                <h3 class="form-title">${translations[currentLang][id ? 'editGuideTitle' : 'addGuideTitle']}</h3>
                <button class="close-btn" onclick="closeGuideForm()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <form id="guideForm" onsubmit="handleGuideSubmit(event)">
                <div class="form-group">
                    <label class="form-label">${translations[currentLang].language}<span class="required">*</span></label>
                    <select class="form-select" id="guideLanguage" required>
                        <option value="zh" ${file?.language === 'zh' ? 'selected' : ''}>简体中文</option>
                        <option value="en" ${file?.language === 'en' ? 'selected' : ''}>English</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">${translations[currentLang].file}<span class="required">*</span></label>
                    <div class="file-upload">
                        <label class="file-upload-btn" for="guideFile">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span class="file-upload-text">${translations[currentLang].selectFile}</span>
                        </label>
                        <input type="file" id="guideFile" accept=".pdf,.doc,.docx" ${!file ? 'required' : ''}>
                        <div class="file-name" id="guideFileName">${file?.fileName || ''}</div>
                    </div>
                </div>
                <div class="form-buttons">
                    <button type="button" class="form-btn form-btn-cancel" onclick="closeGuideForm()">${translations[currentLang].cancel}</button>
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
    const fileInput = document.getElementById('guideFile');
    fileInput?.addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name;
        const fileNameDiv = document.getElementById('guideFileName');
        if (fileNameDiv && fileName) {
            fileNameDiv.textContent = fileName;
        }
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeGuideForm();
        }
    });
}

// ========================================
// 关闭表单
// ========================================
function closeGuideForm() {
    const overlay = document.getElementById('guideFormOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 350);
    }
    guideEditingId = null;
}

// ========================================
// 提交表单
// ========================================
function handleGuideSubmit(e) {
    e.preventDefault();

    const language = document.getElementById('guideLanguage').value;
    const fileInput = document.getElementById('guideFile');
    const fileName = fileInput.files[0]?.name || '';

    if (guideEditingId) {
        // 编辑
        const index = guideFiles.findIndex(f => f.id === guideEditingId);
        if (index !== -1) {
            guideFiles[index] = {
                ...guideFiles[index],
                language,
                fileName: fileName || guideFiles[index].fileName
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
        guideFiles.unshift(newFile);
        showNotification('success', translations[currentLang].addSuccess);
    }

    saveGuideData();
    renderGuideTable();
    renderGuidePagination();
    closeGuideForm();
}

// ========================================
// 下载
// ========================================
function handleGuideDownload(id) {
    const file = guideFiles.find(f => f.id === id);
    if (file) {
        showNotification('success', translations[currentLang].downloadSuccess);
        console.log('下载:', file.fileName);
    }
}

// ========================================
// 编辑
// ========================================
function handleGuideEdit(id) {
    showGuideForm(id);
}

// ========================================
// 删除
// ========================================
function handleGuideDelete(id) {
    const file = guideFiles.find(f => f.id === id);
    if (file) {
        showCustomConfirm(
            translations[currentLang].deleteTitle,
            translations[currentLang].deleteConfirm,
            () => {
                guideFiles = guideFiles.filter(f => f.id !== id);
                saveGuideData();

                const totalPages = Math.ceil(guideFiles.length / guidePageSize);
                if (guideCurrentPage > totalPages && totalPages > 0) {
                    guideCurrentPage = totalPages;
                }

                renderGuideTable();
                renderGuidePagination();
                showNotification('success', translations[currentLang].deleteSuccess);
            }
        );
    }
}

// ========================================
// 导出到全局作用域
// ========================================
window.initGuide = initGuide;
window.renderGuideTable = renderGuideTable;
window.goToGuidePage = goToGuidePage;
window.handleGuideDownload = handleGuideDownload;
window.handleGuideEdit = handleGuideEdit;
window.handleGuideDelete = handleGuideDelete;
window.handleGuideSubmit = handleGuideSubmit;
window.closeGuideForm = closeGuideForm;
