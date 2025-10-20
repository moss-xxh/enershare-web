// ========================================
// Apple & Tesla 风格交互脚本
// ========================================

// 多语言配置
const translations = {
    zh: {
        heroTitle: '为地球<br>创造清洁能源',
        heroSubtitle: '智能能源管理系统,让绿色能源触手可及',
        loginTitle: '登录',
        usernameLabel: '用户名或邮箱',
        passwordLabel: '密码',
        captchaLabel: '验证码',
        rememberMe: '保持登录',
        forgotPassword: '忘记密码?',
        signIn: '登录',
        or: '或',
        createAccount: '创建新账户',
        privacy: '隐私政策',
        terms: '服务条款',
        // 提示消息
        loginSuccess: '登录成功',
        loginFailed: '用户名或密码错误',
        captchaError: '验证码错误',
        loggingIn: '登录中...',
        fieldRequired: '此字段为必填项'
    },
    en: {
        heroTitle: 'Creating Clean Energy<br>For The Planet',
        heroSubtitle: 'Intelligent energy management system, making green energy within reach',
        loginTitle: 'Sign In',
        usernameLabel: 'Username or Email',
        passwordLabel: 'Password',
        captchaLabel: 'Captcha',
        rememberMe: 'Keep me signed in',
        forgotPassword: 'Forgot password?',
        signIn: 'Sign In',
        or: 'or',
        createAccount: 'Create New Account',
        privacy: 'Privacy',
        terms: 'Terms',
        // 提示消息
        loginSuccess: 'Login successful',
        loginFailed: 'Invalid username or password',
        captchaError: 'Invalid captcha',
        loggingIn: 'Signing in...',
        fieldRequired: 'This field is required'
    }
};

// 全局状态
let currentLang = localStorage.getItem('language') || 'zh';
let currentCaptcha = '';

// DOM元素缓存
const DOM = {
    langButtons: document.querySelectorAll('.lang-option'),
    form: document.getElementById('loginForm'),
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    captcha: document.getElementById('captcha'),
    captchaCode: document.getElementById('captchaCode'),
    refreshCaptcha: document.querySelector('.refresh-captcha'),
    toggleBtn: document.querySelector('.toggle-visibility'),
    btnPrimary: document.querySelector('.btn-primary')
};

// ========================================
// 初始化
// ========================================
function init() {
    setLanguage(currentLang);
    generateCaptcha();
    bindEvents();
    setupAnimations();
}

// ========================================
// 事件绑定
// ========================================
function bindEvents() {
    // 语言切换
    DOM.langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });

    // 表单提交
    DOM.form.addEventListener('submit', handleSubmit);

    // 密码显示/隐藏
    DOM.toggleBtn?.addEventListener('click', togglePassword);

    // 点击验证码刷新
    DOM.captchaCode?.addEventListener('click', generateCaptcha);

    // 输入框事件
    setupInputEffects();
}

// ========================================
// 生成验证码
// ========================================
function generateCaptcha() {
    // 生成1-20之间的随机数
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operators = ['+', '-', '×'];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    // 计算答案
    let answer;
    switch(operator) {
        case '+':
            answer = num1 + num2;
            break;
        case '-':
            // 确保结果为正数
            if (num1 < num2) {
                [num1, num2] = [num2, num1];
            }
            answer = num1 - num2;
            break;
        case '×':
            // 使用较小的数字相乘
            const smallNum1 = Math.floor(Math.random() * 10) + 1;
            const smallNum2 = Math.floor(Math.random() * 10) + 1;
            DOM.captchaCode.textContent = `${smallNum1} ${operator} ${smallNum2} = ?`;
            currentCaptcha = String(smallNum1 * smallNum2);
            if (DOM.captcha) {
                DOM.captcha.value = '';
            }
            return;
    }

    currentCaptcha = String(answer);
    DOM.captchaCode.textContent = `${num1} ${operator} ${num2} = ?`;

    // 清空输入
    if (DOM.captcha) {
        DOM.captcha.value = '';
    }
}

// ========================================
// 语言切换
// ========================================
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);

    // 更新按钮状态
    DOM.langButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // 更新文本
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang]?.[key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // 更新HTML lang属性
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
}

// ========================================
// 密码显示/隐藏
// ========================================
function togglePassword() {
    const isPassword = DOM.password.type === 'password';
    DOM.password.type = isPassword ? 'text' : 'password';

    // 添加动画效果
    DOM.toggleBtn.style.transform = 'translateY(-50%) scale(0.8)';
    setTimeout(() => {
        DOM.toggleBtn.style.transform = 'translateY(-50%) scale(1)';
    }, 150);
}

// ========================================
// 表单提交
// ========================================
async function handleSubmit(e) {
    e.preventDefault();

    // 禁用按钮
    const originalHTML = DOM.btnPrimary.innerHTML;
    DOM.btnPrimary.disabled = true;
    DOM.btnPrimary.innerHTML = `<span>${translations[currentLang].loggingIn}</span>`;
    DOM.btnPrimary.style.transform = 'scale(0.98)';

    // 模拟登录请求
    setTimeout(() => {
        showNotification('success', translations[currentLang].loginSuccess);

        // 成功动画
        DOM.btnPrimary.style.transform = 'scale(1)';

        // 跳转
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }, 800);
}

// ========================================
// 通知提示
// ========================================
function showNotification(type, message) {
    // 移除已存在的通知
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // 添加样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '80px',
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

    // 显示动画
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    });

    // 自动隐藏
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// 输入框效果
// ========================================
function setupInputEffects() {
    const inputs = [DOM.username, DOM.password, DOM.captcha];

    inputs.forEach(input => {
        if (!input) return;

        // 聚焦效果
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });

        // 失焦效果
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });

        // 输入效果
        input.addEventListener('input', function() {
            // 清除错误状态
            this.style.borderBottomColor = '';
            // 验证码只允许数字
            if (this.id === 'captcha') {
                this.value = this.value.replace(/[^0-9]/g, '');
            }
        });
    });
}

// ========================================
// 页面动画
// ========================================
function setupAnimations() {
    // 添加震动动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
    `;
    document.head.appendChild(style);

    // 滚动视差效果
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const orbs = document.querySelectorAll('.gradient-orb');
                orbs.forEach((orb, index) => {
                    const speed = 0.5 + index * 0.2;
                    orb.style.transform = `translateY(${scrolled * speed}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ========================================
// 键盘快捷键
// ========================================
document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K: 聚焦用户名
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        DOM.username.focus();
    }

    // Escape: 清空表单
    if (e.key === 'Escape') {
        DOM.form.reset();
        DOM.username.blur();
        DOM.password.blur();
    }
});

// ========================================
// 自动填充
// ========================================
window.addEventListener('load', () => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        DOM.username.value = rememberedUser;
        DOM.remember.checked = true;
    }
});

// ========================================
// 启动应用
// ========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
