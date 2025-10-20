// ========================================
// 隐私协议管理模块
// ========================================

// 隐私协议数据存储
let privacyPolicies = [];
let privacyCurrentPage = 1;
const privacyPageSize = 10;
let privacyEditingId = null;

// 初始化数据
function initPrivacyData() {
    const saved = localStorage.getItem('privacyPolicies');
    if (saved) {
        privacyPolicies = JSON.parse(saved);
    } else {
        // 初始化示例数据
        privacyPolicies = [
            {
                id: 1,
                language: 'zh',
                content: '本隐私政策说明了我们如何收集、使用和保护您的个人信息...',
                updateDate: '2025-01-15'
            },
            {
                id: 2,
                language: 'en',
                content: 'This Privacy Policy explains how we collect, use and protect your personal information...',
                updateDate: '2025-01-15'
            }
        ];
        savePrivacyData();
    }
}

function savePrivacyData() {
    localStorage.setItem('privacyPolicies', JSON.stringify(privacyPolicies));
}

// ========================================
// 初始化隐私协议模块
// ========================================
function initPrivacy() {
    initPrivacyData();
    bindPrivacyEvents();
    renderPrivacyTable();
    renderPrivacyPagination();
}

// ========================================
// 事件绑定
// ========================================
function bindPrivacyEvents() {
    const searchInput = document.getElementById('privacySearchInput');
    searchInput?.addEventListener('input', (e) => {
        handlePrivacySearch(e.target.value);
    });

    const prevBtn = document.getElementById('privacyPrevPage');
    const nextBtn = document.getElementById('privacyNextPage');

    prevBtn?.addEventListener('click', () => {
        if (privacyCurrentPage > 1) {
            privacyCurrentPage--;
            renderPrivacyTable();
            renderPrivacyPagination();
        }
    });

    nextBtn?.addEventListener('click', () => {
        const totalPages = Math.ceil(privacyPolicies.length / privacyPageSize);
        if (privacyCurrentPage < totalPages) {
            privacyCurrentPage++;
            renderPrivacyTable();
            renderPrivacyPagination();
        }
    });
}

// ========================================
// 渲染表格
// ========================================
function renderPrivacyTable(searchTerm = '') {
    const tbody = document.getElementById('privacyTableBody');
    if (!tbody) return;

    let filteredData = privacyPolicies;
    if (searchTerm) {
        filteredData = privacyPolicies.filter(policy =>
            policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getPrivacyLanguageName(policy.language).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    const start = (privacyCurrentPage - 1) * privacyPageSize;
    const end = start + privacyPageSize;
    const pageData = filteredData.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 40px; color: var(--text-tertiary);">
                    暂无数据
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pageData.map(policy => `
        <tr>
            <td>${getPrivacyLanguageName(policy.language)}</td>
            <td>${policy.updateDate}</td>
            <td style="text-align: left;">
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="handlePrivacyEdit(${policy.id})">
                        ${translations[currentLang].edit}
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 获取语言名称
function getPrivacyLanguageName(lang) {
    const names = {
        zh: '简体中文',
        en: 'English'
    };
    return names[lang] || lang;
}

// ========================================
// 渲染分页
// ========================================
function renderPrivacyPagination() {
    const totalPages = Math.ceil(privacyPolicies.length / privacyPageSize);
    const pageNumbers = document.getElementById('privacyPageNumbers');
    const prevBtn = document.getElementById('privacyPrevPage');
    const nextBtn = document.getElementById('privacyNextPage');

    if (!pageNumbers) return;

    prevBtn.disabled = privacyCurrentPage === 1;
    nextBtn.disabled = privacyCurrentPage === totalPages || totalPages === 0;

    let pages = [];
    if (totalPages <= 7) {
        pages = Array.from({length: totalPages}, (_, i) => i + 1);
    } else {
        if (privacyCurrentPage <= 3) {
            pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (privacyCurrentPage >= totalPages - 2) {
            pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', privacyCurrentPage - 1, privacyCurrentPage, privacyCurrentPage + 1, '...', totalPages];
        }
    }

    pageNumbers.innerHTML = pages.map(page => {
        if (page === '...') {
            return '<span class="page-number" style="cursor: default;">...</span>';
        }
        return `
            <div class="page-number ${page === privacyCurrentPage ? 'active' : ''}"
                 onclick="goToPrivacyPage(${page})">
                ${page}
            </div>
        `;
    }).join('');
}

function goToPrivacyPage(page) {
    privacyCurrentPage = page;
    renderPrivacyTable();
    renderPrivacyPagination();
}

// ========================================
// 搜索处理
// ========================================
function handlePrivacySearch(term) {
    privacyCurrentPage = 1;
    renderPrivacyTable(term);
    renderPrivacyPagination();
}

// 全局变量存储 Quill 实例
let privacyQuillEditor = null;

// ========================================
// 显示表单
// ========================================
function showPrivacyForm(id = null) {
    privacyEditingId = id;
    const policy = id ? privacyPolicies.find(p => p.id === id) : null;

    const overlay = document.createElement('div');
    overlay.className = 'ota-form-overlay';
    overlay.id = 'privacyFormOverlay';

    overlay.innerHTML = `
        <div class="ota-form-dialog" style="max-width: 900px;">
            <div class="form-header">
                <h3 class="form-title">${translations[currentLang][id ? 'editPrivacyTitle' : 'addPrivacyTitle']}</h3>
                <button class="close-btn" onclick="closePrivacyForm()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <form id="privacyForm" onsubmit="handlePrivacySubmit(event)">
                <div class="form-group">
                    <label class="form-label">${translations[currentLang].language}<span class="required">*</span></label>
                    <select class="form-select" id="privacyLanguage" required>
                        <option value="zh" ${policy?.language === 'zh' ? 'selected' : ''}>简体中文</option>
                        <option value="en" ${policy?.language === 'en' ? 'selected' : ''}>English</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">${translations[currentLang].content}<span class="required">*</span></label>
                    <div id="privacyQuillEditor" style="height: 400px;"></div>
                    <input type="hidden" id="privacyContent" required>
                </div>
                <div class="form-buttons">
                    <button type="button" class="form-btn form-btn-cancel" onclick="closePrivacyForm()">${translations[currentLang].cancel}</button>
                    <button type="submit" class="form-btn form-btn-submit">${translations[currentLang].save}</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.classList.add('active');

        // 初始化 Quill 编辑器
        const editorContainer = document.getElementById('privacyQuillEditor');
        if (editorContainer && typeof Quill !== 'undefined') {
            privacyQuillEditor = new Quill('#privacyQuillEditor', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        ['link'],
                        ['clean']
                    ]
                },
                placeholder: translations[currentLang].content
            });

            // 如果是编辑模式,设置内容
            if (policy?.content) {
                privacyQuillEditor.root.innerHTML = policy.content;
            }
        }
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closePrivacyForm();
        }
    });
}

// ========================================
// 关闭表单
// ========================================
function closePrivacyForm() {
    const overlay = document.getElementById('privacyFormOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 350);
    }
    // 清除 Quill 实例
    privacyQuillEditor = null;
    privacyEditingId = null;
}

// ========================================
// 提交表单
// ========================================
function handlePrivacySubmit(e) {
    e.preventDefault();

    const language = document.getElementById('privacyLanguage').value;

    // 从 Quill 编辑器获取 HTML 内容
    let content = '';
    if (privacyQuillEditor) {
        content = privacyQuillEditor.root.innerHTML;
        // 验证内容不为空(排除空的 HTML 标签)
        const textContent = privacyQuillEditor.getText().trim();
        if (!textContent) {
            showNotification('error', '内容不能为空');
            return;
        }
    } else {
        showNotification('error', '编辑器未初始化');
        return;
    }

    if (privacyEditingId) {
        // 编辑
        const index = privacyPolicies.findIndex(p => p.id === privacyEditingId);
        if (index !== -1) {
            privacyPolicies[index] = {
                ...privacyPolicies[index],
                language,
                content,
                updateDate: new Date().toISOString().split('T')[0]
            };
            showNotification('success', translations[currentLang].editSuccess);
        }
    } else {
        // 新增
        const newPolicy = {
            id: Date.now(),
            language,
            content,
            updateDate: new Date().toISOString().split('T')[0]
        };
        privacyPolicies.unshift(newPolicy);
        showNotification('success', translations[currentLang].addSuccess);
    }

    savePrivacyData();
    renderPrivacyTable();
    renderPrivacyPagination();
    closePrivacyForm();
}

// ========================================
// 编辑
// ========================================
function handlePrivacyEdit(id) {
    showPrivacyForm(id);
}

// ========================================
// 导出到全局作用域
// ========================================
window.initPrivacy = initPrivacy;
window.renderPrivacyTable = renderPrivacyTable;
window.goToPrivacyPage = goToPrivacyPage;
window.handlePrivacyEdit = handlePrivacyEdit;
window.handlePrivacySubmit = handlePrivacySubmit;
window.closePrivacyForm = closePrivacyForm;
