// ========================================
// OTA升级管理模块
// ========================================

// OTA数据存储
let otaPackages = [];
let currentPage = 1;
const pageSize = 10;
let editingId = null;

// 模拟初始数据
function initOtaData() {
    const saved = localStorage.getItem('otaPackages');
    if (saved) {
        otaPackages = JSON.parse(saved);
        // 检查是否有旧格式的版本号（如 2.1.0），如果有则重置数据
        const hasOldFormat = otaPackages.some(pkg => pkg.version && pkg.version.split('.').length > 2);
        if (hasOldFormat) {
            // 清除旧数据，使用新格式
            localStorage.removeItem('otaPackages');
            otaPackages = [];
        }
    }

    if (otaPackages.length === 0) {
        // 初始化示例数据
        otaPackages = [
            {
                id: 1,
                name: 'Firmware v1.2',
                version: '1.2',
                size: '-',
                uploadDate: '2025-01-15',
                status: 'active',
                description: {
                    zh: '修复了网络连接问题，优化了系统性能',
                    en: 'Fixed network connection issues and optimized system performance'
                }
            },
            {
                id: 2,
                name: 'Firmware v1.1',
                version: '1.1',
                size: '-',
                uploadDate: '2025-01-10',
                status: 'active',
                description: {
                    zh: '安全更新，修复了多个安全漏洞',
                    en: 'Security update, fixed multiple vulnerabilities'
                }
            },
            {
                id: 3,
                name: 'Firmware v1.0',
                version: '1.0',
                size: '-',
                uploadDate: '2025-01-05',
                status: 'inactive',
                description: {
                    zh: '主要版本更新，新增多个功能',
                    en: 'Major version update with new features'
                }
            }
        ];
        saveOtaData();
    }
}

function saveOtaData() {
    localStorage.setItem('otaPackages', JSON.stringify(otaPackages));
}

// ========================================
// 初始化OTA模块
// ========================================
function initOta() {
    initOtaData();
    bindOtaEvents();
    renderTable();
    renderPagination();
}

// ========================================
// 事件绑定
// ========================================
function bindOtaEvents() {
    // 添加按钮
    const addBtn = document.getElementById('addOtaBtn');
    addBtn?.addEventListener('click', () => showOtaForm());

    // 搜索
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    // 分页按钮
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    prevBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            renderPagination();
        }
    });

    nextBtn?.addEventListener('click', () => {
        const totalPages = Math.ceil(otaPackages.length / pageSize);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
            renderPagination();
        }
    });
}

// ========================================
// 渲染表格
// ========================================
function renderTable(searchTerm = '') {
    const tbody = document.getElementById('otaTableBody');
    if (!tbody) return;

    // 筛选数据
    let filteredData = otaPackages;
    if (searchTerm) {
        filteredData = otaPackages.filter(pkg =>
            pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pkg.version.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // 分页
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredData.slice(start, end);

    // 渲染
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

    tbody.innerHTML = pageData.map(pkg => {
        // 获取当前语言的描述
        const desc = typeof pkg.description === 'object'
            ? (pkg.description[currentLang] || pkg.description.zh || '-')
            : (pkg.description || '-');

        return `
            <tr>
                <td>${pkg.version}</td>
                <td>${desc}</td>
                <td>${pkg.uploadDate}</td>
                <td style="text-align: left;">
                    <div class="action-buttons">
                        <button class="action-btn download" onclick="handleDownload(${pkg.id})">
                            ${translations[currentLang].download}
                        </button>
                        <button class="action-btn edit" onclick="handleEdit(${pkg.id})">
                            ${translations[currentLang].edit}
                        </button>
                        <button class="action-btn delete" onclick="handleDelete(${pkg.id})">
                            ${translations[currentLang].delete}
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ========================================
// 渲染分页
// ========================================
function renderPagination() {
    const totalPages = Math.ceil(otaPackages.length / pageSize);
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (!pageNumbers) return;

    // 更新按钮状态
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    // 渲染页码
    let pages = [];
    if (totalPages <= 7) {
        pages = Array.from({length: totalPages}, (_, i) => i + 1);
    } else {
        if (currentPage <= 3) {
            pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (currentPage >= totalPages - 2) {
            pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        }
    }

    pageNumbers.innerHTML = pages.map(page => {
        if (page === '...') {
            return '<span class="page-number" style="cursor: default;">...</span>';
        }
        return `
            <div class="page-number ${page === currentPage ? 'active' : ''}"
                 onclick="goToPage(${page})">
                ${page}
            </div>
        `;
    }).join('');
}

// ========================================
// 跳转页面
// ========================================
function goToPage(page) {
    currentPage = page;
    renderTable();
    renderPagination();
}

// ========================================
// 搜索处理
// ========================================
function handleSearch(term) {
    currentPage = 1;
    renderTable(term);
    renderPagination();
}

// ========================================
// 显示表单
// ========================================
function showOtaForm(id = null) {
    editingId = id;
    const pkg = id ? otaPackages.find(p => p.id === id) : null;

    const overlay = document.createElement('div');
    overlay.className = 'ota-form-overlay';
    overlay.id = 'otaFormOverlay';

    overlay.innerHTML = `
        <div class="ota-form-dialog">
            <div class="form-header">
                <h3 class="form-title">${translations[currentLang][id ? 'editOtaTitle' : 'addOtaTitle']}</h3>
                <button class="close-btn" onclick="closeOtaForm()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <form id="otaForm" onsubmit="handleSubmit(event)">
                <div class="form-group">
                    <label class="form-label">${translations[currentLang].versionNumber}<span class="required">*</span></label>
                    <input type="text" class="form-input" id="pkgVersion" value="${pkg?.version || ''}" placeholder="例如: 1.0" required>
                </div>
                <div class="form-group">
                    <label class="form-label">${translations[currentLang].descriptionZh || '描述(中文)'}</label>
                    <input type="text" class="form-input" id="pkgDescriptionZh" value="${pkg?.description?.zh || ''}" placeholder="例如: 修复了网络连接问题">
                </div>
                <div class="form-group">
                    <label class="form-label">${translations[currentLang].descriptionEn || '描述(English)'}</label>
                    <input type="text" class="form-input" id="pkgDescriptionEn" value="${pkg?.description?.en || ''}" placeholder="e.g.: Fixed network connection issues">
                </div>
                <div class="form-group">
                    <label class="form-label">${translations[currentLang].file}<span class="required">*</span></label>
                    <div class="file-upload">
                        <label class="file-upload-btn" for="pkgFile">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span class="file-upload-text">${translations[currentLang].selectFile}</span>
                        </label>
                        <input type="file" id="pkgFile" accept=".bin,.zip,.tar.gz" ${!pkg ? 'required' : ''}>
                        <div class="file-name" id="fileName">${pkg?.fileName || ''}</div>
                    </div>
                </div>
                <div class="form-buttons">
                    <button type="button" class="form-btn form-btn-cancel" onclick="closeOtaForm()">${translations[currentLang].cancel}</button>
                    <button type="submit" class="form-btn form-btn-submit">${translations[currentLang].save}</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    // 显示动画
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    // 文件上传处理
    const fileInput = document.getElementById('pkgFile');
    fileInput?.addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name;
        const fileNameDiv = document.getElementById('fileName');
        if (fileNameDiv && fileName) {
            fileNameDiv.textContent = fileName;
        }
    });

    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeOtaForm();
        }
    });
}

// ========================================
// 关闭表单
// ========================================
function closeOtaForm() {
    const overlay = document.getElementById('otaFormOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 350);
    }
    editingId = null;
}

// ========================================
// 提交表单
// ========================================
function handleSubmit(e) {
    e.preventDefault();

    const version = document.getElementById('pkgVersion').value;
    const descriptionZh = document.getElementById('pkgDescriptionZh').value || '';
    const descriptionEn = document.getElementById('pkgDescriptionEn').value || '';
    const fileInput = document.getElementById('pkgFile');
    const fileName = fileInput.files[0]?.name || '';

    const description = {
        zh: descriptionZh,
        en: descriptionEn
    };

    if (editingId) {
        // 编辑
        const index = otaPackages.findIndex(p => p.id === editingId);
        if (index !== -1) {
            otaPackages[index] = {
                ...otaPackages[index],
                version,
                description,
                fileName: fileName || otaPackages[index].fileName
            };
            showNotification('success', translations[currentLang].editSuccess);
        }
    } else {
        // 新增
        if (!fileName) {
            showNotification('error', '请选择文件');
            return;
        }

        const newPkg = {
            id: Date.now(),
            name: `Firmware v${version}`,
            version: version,
            size: '-',
            description: description,
            fileName: fileName,
            status: 'active',
            uploadDate: new Date().toISOString().split('T')[0]
        };
        otaPackages.unshift(newPkg);
        showNotification('success', translations[currentLang].addSuccess);
    }

    saveOtaData();
    renderTable();
    renderPagination();
    closeOtaForm();
}

// ========================================
// 下载
// ========================================
function handleDownload(id) {
    const pkg = otaPackages.find(p => p.id === id);
    if (pkg) {
        showNotification('success', translations[currentLang].downloadSuccess);
        // 实际项目中这里应该调用真实的下载API
        console.log('下载:', pkg.name);
    }
}

// ========================================
// 编辑
// ========================================
function handleEdit(id) {
    showOtaForm(id);
}

// ========================================
// 删除
// ========================================
function handleDelete(id) {
    const pkg = otaPackages.find(p => p.id === id);
    if (pkg) {
        showCustomConfirm(
            translations[currentLang].deleteTitle,
            translations[currentLang].deleteConfirm,
            () => {
                otaPackages = otaPackages.filter(p => p.id !== id);
                saveOtaData();

                // 调整当前页
                const totalPages = Math.ceil(otaPackages.length / pageSize);
                if (currentPage > totalPages && totalPages > 0) {
                    currentPage = totalPages;
                }

                renderTable();
                renderPagination();
                showNotification('success', translations[currentLang].deleteSuccess);
            }
        );
    }
}

// ========================================
// 导出到全局作用域
// ========================================
window.initOta = initOta;
window.renderTable = renderTable;
window.goToPage = goToPage;
window.handleDownload = handleDownload;
window.handleEdit = handleEdit;
window.handleDelete = handleDelete;
window.handleSubmit = handleSubmit;
window.closeOtaForm = closeOtaForm;
