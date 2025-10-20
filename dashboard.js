// ========================================
// Dashboard - 后台管理系统交互脚本
// ========================================

// 多语言配置
const translations = {
    zh: {
        systemTitle: '爱尚能源管理系统',
        logout: '退出',
        otaUpgrade: 'OTA升级',
        otaDesc: '系统固件在线升级,保持系统最新版本',
        manual: '说明书',
        manualDesc: '查看产品详细说明和技术参数',
        operationGuide: '操作手册',
        guideDesc: '详细的操作步骤和使用指南',
        privacy: '隐私协议',
        privacyDesc: '查看隐私政策和用户协议',
        // OTA页面
        addPackage: '添加升级包',
        searchPlaceholder: '搜索升级包...',
        packageName: '升级包名称',
        version: '版本号',
        size: '文件大小',
        uploadDate: '上传日期',
        status: '状态',
        actions: '操作',
        download: '下载',
        edit: '编辑',
        delete: '删除',
        active: '启用',
        inactive: '禁用',
        // 表单
        addOtaTitle: '添加升级包',
        editOtaTitle: '编辑升级包',
        name: '名称',
        versionNumber: '版本号',
        description: '描述',
        descriptionZh: '描述(中文)',
        descriptionEn: '描述(English)',
        file: '文件',
        fileName: '文件名',
        language: '语言',
        selectFile: '选择文件或拖拽到此处',
        save: '保存',
        addManual: '添加说明书',
        addManualTitle: '添加说明书',
        editManualTitle: '编辑说明书',
        addGuide: '添加操作手册',
        addGuideTitle: '添加操作手册',
        editGuideTitle: '编辑操作手册',
        addPrivacy: '添加隐私协议',
        addPrivacyTitle: '添加隐私协议',
        editPrivacyTitle: '编辑隐私协议',
        title: '标题',
        content: '内容',
        updateDate: '更新日期',
        // 提示消息
        logoutConfirm: '确定要退出系统吗?',
        logoutSuccess: '已退出系统',
        deleteConfirm: '确定要删除此升级包吗?',
        deleteSuccess: '删除成功',
        addSuccess: '添加成功',
        editSuccess: '更新成功',
        downloadSuccess: '开始下载',
        // 确认对话框
        confirmTitle: '确认退出',
        deleteTitle: '确认删除',
        cancel: '取消',
        confirm: '确定'
    },
    en: {
        systemTitle: 'EnerShare Management System',
        logout: 'Logout',
        otaUpgrade: 'OTA Upgrade',
        otaDesc: 'Online firmware upgrade, keep system up to date',
        manual: 'Manual',
        manualDesc: 'View detailed product specifications and parameters',
        operationGuide: 'Operation Guide',
        guideDesc: 'Detailed operation steps and usage guide',
        privacy: 'Privacy Policy',
        privacyDesc: 'View privacy policy and user agreement',
        // OTA Page
        addPackage: 'Add Package',
        searchPlaceholder: 'Search packages...',
        packageName: 'Package Name',
        version: 'Version',
        size: 'Size',
        uploadDate: 'Upload Date',
        status: 'Status',
        actions: 'Actions',
        download: 'Download',
        edit: 'Edit',
        delete: 'Delete',
        active: 'Active',
        inactive: 'Inactive',
        // Form
        addOtaTitle: 'Add OTA Package',
        editOtaTitle: 'Edit OTA Package',
        name: 'Name',
        versionNumber: 'Version',
        description: 'Description',
        descriptionZh: 'Description(Chinese)',
        descriptionEn: 'Description(English)',
        file: 'File',
        fileName: 'File Name',
        language: 'Language',
        selectFile: 'Select file or drag here',
        save: 'Save',
        addManual: 'Add Manual',
        addManualTitle: 'Add Manual',
        editManualTitle: 'Edit Manual',
        addGuide: 'Add Guide',
        addGuideTitle: 'Add Operation Guide',
        editGuideTitle: 'Edit Operation Guide',
        addPrivacy: 'Add Privacy Policy',
        addPrivacyTitle: 'Add Privacy Policy',
        editPrivacyTitle: 'Edit Privacy Policy',
        title: 'Title',
        content: 'Content',
        updateDate: 'Update Date',
        // Messages
        logoutConfirm: 'Are you sure you want to logout?',
        logoutSuccess: 'Logged out successfully',
        deleteConfirm: 'Are you sure you want to delete this package?',
        deleteSuccess: 'Deleted successfully',
        addSuccess: 'Added successfully',
        editSuccess: 'Updated successfully',
        downloadSuccess: 'Download started',
        // Dialogs
        confirmTitle: 'Confirm Logout',
        deleteTitle: 'Confirm Delete',
        cancel: 'Cancel',
        confirm: 'Confirm'
    }
};

// 语言名称映射
const languageNames = {
    zh: '简体中文',
    en: 'English'
};

// 全局状态
let currentLang = localStorage.getItem('language') || 'zh';
let currentMenu = 'ota';

// DOM元素
const DOM = {
    langButton: document.getElementById('langButton'),
    currentLangText: document.getElementById('currentLang'),
    langMenu: document.getElementById('langMenu'),
    langItems: document.querySelectorAll('.lang-item'),
    langDropdown: document.querySelector('.language-dropdown'),
    logoutBtn: document.getElementById('logoutBtn'),
    navItems: document.querySelectorAll('.nav-item'),
    contentSections: document.querySelectorAll('.content-section'),
    pageTitle: document.querySelector('.page-title')
};

// ========================================
// 初始化
// ========================================
function init() {
    // 设置从登录页继承的语言
    setLanguage(currentLang);
    bindEvents();

    // 初始化各个模块
    if (typeof initOta === 'function') {
        initOta();
    }
    if (typeof initManual === 'function') {
        initManual();
    }
    if (typeof initGuide === 'function') {
        initGuide();
    }
    if (typeof initPrivacy === 'function') {
        initPrivacy();
    }
}

// ========================================
// 事件绑定
// ========================================
function bindEvents() {
    // 语言下拉菜单切换
    DOM.langButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        DOM.langDropdown.classList.toggle('active');
    });

    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', () => {
        DOM.langDropdown.classList.remove('active');
    });

    // 语言选项点击
    DOM.langItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const lang = item.dataset.lang;
            setLanguage(lang);
            DOM.langDropdown.classList.remove('active');
        });
    });

    // 退出按钮
    DOM.logoutBtn?.addEventListener('click', handleLogout);

    // 菜单项点击
    DOM.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const menuType = item.dataset.menu;
            switchMenu(menuType);
        });
    });
}

// ========================================
// 语言切换
// ========================================
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);

    // 更新当前语言显示
    DOM.currentLangText.textContent = languageNames[lang];

    // 更新选中状态
    DOM.langItems.forEach(item => {
        item.classList.toggle('active', item.dataset.lang === lang);
    });

    // 更新所有文本
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang]?.[key]) {
            el.textContent = translations[lang][key];
        }
    });

    // 更新搜索框placeholder
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = translations[lang].searchPlaceholder;
    }

    // 更新HTML lang属性
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    // 重新渲染各模块表格以更新状态标签和按钮文字
    if (typeof renderTable === 'function') {
        renderTable();
    }
    if (typeof renderManualTable === 'function') {
        renderManualTable();
    }
    if (typeof renderGuideTable === 'function') {
        renderGuideTable();
    }
    if (typeof renderPrivacyTable === 'function') {
        renderPrivacyTable();
    }
}

// ========================================
// 菜单切换
// ========================================
function switchMenu(menuType) {
    currentMenu = menuType;

    // 更新菜单项激活状态
    DOM.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.menu === menuType);
    });

    // 更新内容区域
    DOM.contentSections.forEach(section => {
        section.classList.toggle('active', section.dataset.section === menuType);
    });

    // 更新页面标题
    const menuNames = {
        ota: translations[currentLang].otaUpgrade,
        manual: translations[currentLang].manual,
        guide: translations[currentLang].operationGuide,
        privacy: translations[currentLang].privacy
    };
    DOM.pageTitle.textContent = menuNames[menuType] || menuType;
}

// ========================================
// 退出登录
// ========================================
function handleLogout() {
    showCustomConfirm(
        translations[currentLang].confirmTitle,
        translations[currentLang].logoutConfirm,
        () => {
            // 确认退出
            showNotification('success', translations[currentLang].logoutSuccess);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    );
}

// ========================================
// 自定义确认对话框
// ========================================
function showCustomConfirm(title, message, onConfirm) {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'custom-confirm-overlay';

    // 创建对话框
    const dialog = document.createElement('div');
    dialog.className = 'custom-confirm-dialog';

    dialog.innerHTML = `
        <div class="confirm-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h3 class="confirm-title">${title}</h3>
        <p class="confirm-message">${message}</p>
        <div class="confirm-buttons">
            <button class="confirm-btn confirm-btn-cancel">${translations[currentLang].cancel}</button>
            <button class="confirm-btn confirm-btn-confirm">${translations[currentLang].confirm}</button>
        </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // 显示动画
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    // 绑定按钮事件
    const cancelBtn = dialog.querySelector('.confirm-btn-cancel');
    const confirmBtn = dialog.querySelector('.confirm-btn-confirm');

    const closeDialog = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 350);
    };

    cancelBtn.addEventListener('click', closeDialog);

    confirmBtn.addEventListener('click', () => {
        closeDialog();
        if (onConfirm) {
            setTimeout(onConfirm, 350);
        }
    });

    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeDialog();
        }
    });
}

// ========================================
// 通知提示
// ========================================
function showNotification(type, message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '90px',
        left: '50%',
        transform: 'translateX(-50%) translateY(-20px)',
        padding: '16px 24px',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '500',
        zIndex: '10000',
        backdropFilter: 'saturate(180%) blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        opacity: '0',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });

    if (type === 'success') {
        notification.style.background = 'rgba(46, 174, 77, 0.95)';
        notification.style.color = 'white';
    } else {
        notification.style.background = 'rgba(239, 68, 68, 0.95)';
        notification.style.color = 'white';
    }

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// 启动应用
// ========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
