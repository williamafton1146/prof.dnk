// ============================================
// ПрофДНК - Платформа профессиональной ориентации
// Полный JavaScript код (ФИНАЛЬНАЯ ВЕРСИЯ)
// ============================================

// --- State Management ---
const state = {
    currentUser: null,
    tests: [],
    testResults: [],
    submissions: [],
    psychologists: [],
    currentTestSession: null,
    currentClientInfo: null,
    isPublicMode: false
};

let currentTestResults = null;
let questionCount = 0;
let selectedFormat = 'slider';
let currentClientDetail = null;

// ============================================
// Initialization
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    initializeAdmin();
    loadUserData();
    updateAuthUI();
    checkUrlForTest();
    showComfortPopup();
    console.log('✅ Платформа ПрофДНК загружена');
});

// ============================================
// Admin System
// ============================================

function initializeAdmin() {
    let adminData = localStorage.getItem('psytest_admin');
    if (!adminData) {
        const defaultAdmin = {
            login: 'admin',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('psytest_admin', JSON.stringify(defaultAdmin));
        console.log('✅ Администратор создан: login=admin, password=admin123');
    }
}

function handleAdminAuth(e) {
    e.preventDefault();
    
    const login = document.getElementById('adminLogin').value.trim().toLowerCase();
    const password = document.getElementById('adminPass').value;
    
    console.log('🔐 Попытка входа админа:', login);
    
    const adminData = localStorage.getItem('psytest_admin');
    if (!adminData) {
        alert('❌ Администратор не найден');
        return;
    }
    
    const admin = JSON.parse(adminData);
    
    if (login === admin.login.toLowerCase() && password === admin.password) {
        state.currentUser = {
            name: 'Администратор',
            email: admin.login,
            role: 'admin'
        };
        
        saveUserData();
        updateAuthUI();
        
        document.getElementById('adminAuthForm').reset();
        navigateTo('admin-cabinet');
        renderAdminCabinet();
        
        console.log('✅ Вход администратора успешен');
    } else {
        alert('❌ Неверный логин или пароль\n\nПо умолчанию:\nЛогин: admin\nПароль: admin123');
    }
}

function renderAdminCabinet() {
    if (!state.currentUser || state.currentUser.role !== 'admin') {
        navigateTo('admin-login');
        return;
    }
    
    const psychologists = state.psychologists || [];
    const activePsychologists = psychologists.filter(p => p.isActive && !p.isBlocked && new Date(p.accessExpires) > new Date()).length;
    const blockedPsychologists = psychologists.filter(p => p.isBlocked).length;
    const totalTests = state.tests ? state.tests.length : 0;
    const uniqueClients = new Set(state.submissions.map(s => s.clientName)).size;
    
    document.getElementById('adminPsychologistsCount').innerText = psychologists.length;
    document.getElementById('adminActiveCount').innerText = activePsychologists;
    document.getElementById('adminBlockedCount').innerText = blockedPsychologists;
    document.getElementById('adminTestsCount').innerText = totalTests;
    document.getElementById('adminClientsCount').innerText = uniqueClients;
    document.getElementById('adminSubmissionsCount').innerText = state.submissions.length;
    document.getElementById('lastUpdate').innerText = new Date().toLocaleString();
    
    console.log('✅ Кабинет администратора обновлён');
}

function showAdminSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(el => el.style.display = 'none');
    
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
    }
    
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target.closest('.tab-btn')) {
        event.target.closest('.tab-btn').classList.add('active');
    }
    
    if (sectionId === 'admin-psychologists') {
        renderPsychologistsList();
    }
    if (sectionId === 'admin-tests') {
        renderAdminTestsList();
    }
}

function renderAdminTestsList() {
    const list = document.getElementById('adminTestsList');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (!state.tests || state.tests.length === 0) {
        list.innerHTML = '<div class="empty-state">Список тестов пуст</div>';
        return;
    }
    
    state.tests.forEach(test => {
        const item = document.createElement('div');
        item.className = 'test-item';
        
        const formatIcon = test.answerFormat === 'slider' 
            ? '<i class="fas fa-sliders-h" style="color: var(--accent); margin-right: 8px;"></i>'
            : '<i class="fas fa-check-circle" style="color: var(--accent); margin-right: 8px;"></i>';
        
        const formatText = test.answerFormat === 'slider' ? '1-10 баллов' : 'Да/Нет';
        const creator = state.psychologists.find(p => p.email === test.psychologistEmail);
        const creatorName = creator ? creator.name : 'Неизвестно';
        const testSubmissions = state.submissions.filter(s => s.testId === test.id);
        
        item.innerHTML = `
            <div style="flex: 1; min-width: 250px;">
                <h3>${formatIcon}${test.title}</h3>
                <small style="color:var(--text-sec)">
                    <i class="fas fa-user"></i> ${creatorName} | 
                    <i class="fas fa-question-circle"></i> ${test.questions.length} вопросов | 
                    <i class="fas fa-clock"></i> ${formatText}
                </small>
                <div style="margin-top: 8px; color: var(--accent); font-size: 0.9rem;">
                    <i class="fas fa-users"></i> Клиентов: ${testSubmissions.length} | 
                    <i class="fas fa-calendar"></i> Создан: ${test.created}
                </div>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn-secondary" onclick="adminStartTest(${test.id})">
                    <i class="fas fa-play"></i> Пройти
                </button>
                <button class="btn-action" onclick="adminViewSubmissions(${test.id})">
                    <i class="fas fa-chart-bar"></i> Результаты
                </button>
                <button class="btn-primary" style="padding: 10px 15px; font-size: 0.85rem;" onclick="copyLink('${test.uniqueId}')">
                    <i class="fas fa-link"></i> Ссылка
                </button>
                <button class="btn-delete" onclick="deleteTest(${test.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

function adminStartTest(testId) {
    startTest(testId);
}

function adminViewSubmissions(testId) {
    showSubmissions(testId);
}

function showCreatePsychologistForm() {
    document.getElementById('createPsychologistForm').style.display = 'block';
}

function hideCreatePsychologistForm() {
    document.getElementById('createPsychologistForm').style.display = 'none';
}

function createPsychologist(e) {
    e.preventDefault();
    
    const name = document.getElementById('newPsychName').value.trim();
    const email = document.getElementById('newPsychEmail').value.trim().toLowerCase();
    const password = document.getElementById('newPsychPass').value;
    const accessDays = parseInt(document.getElementById('newPsychAccessDays').value);
    const maxTests = parseInt(document.getElementById('newPsychMaxTests').value);
    
    if (!name || !email || !password) {
        alert('❌ Заполните все поля');
        return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        alert('❌ Введите корректный email адрес');
        return;
    }
    
    if (!state.psychologists) state.psychologists = [];
    
    const exists = state.psychologists.find(p => p.email.toLowerCase() === email);
    if (exists) {
        alert('❌ Психолог с таким email уже существует');
        return;
    }
    
    const accessExpires = new Date();
    accessExpires.setDate(accessExpires.getDate() + accessDays);
    
    const newPsychologist = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        role: 'psychologist',
        isActive: true,
        isBlocked: false,
        createdAt: new Date().toISOString(),
        accessExpires: accessExpires.toISOString(),
        maxTests: maxTests,
        testsCreated: 0
    };
    
    state.psychologists.push(newPsychologist);
    saveUserData();
    
    alert(`✅ Психолог создан!\n\nЛогин: ${email}\nПароль: ${password}\nСрок: ${accessDays} дней`);
    
    hideCreatePsychologistForm();
    renderPsychologistsList();
    renderAdminCabinet();
    e.target.reset();
}

function renderPsychologistsList() {
    const list = document.getElementById('psychologistsList');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (!state.psychologists || state.psychologists.length === 0) {
        list.innerHTML = '<div class="empty-state">Психологи не созданы</div>';
        return;
    }
    
    state.psychologists.forEach(psych => {
        const isExpired = new Date(psych.accessExpires) < new Date();
        const statusClass = psych.isBlocked ? 'blocked' : (isExpired ? 'expired' : 'active');
        const statusText = psych.isBlocked ? 'Заблокирован' : (isExpired ? 'Истёк доступ' : 'Активен');
        const testsCount = state.tests.filter(t => t.psychologistEmail === psych.email).length;
        
        const item = document.createElement('div');
        item.className = `psychologist-item ${psych.isBlocked ? 'blocked' : ''}`;
        
        item.innerHTML = `
            <div class="psychologist-info">
                <h4>${psych.name}</h4>
                <p><i class="fas fa-envelope"></i> ${psych.email}</p>
                <p><i class="fas fa-calendar"></i> Создан: ${new Date(psych.createdAt).toLocaleDateString()}</p>
                <p><i class="fas fa-clock"></i> Доступ до: ${new Date(psych.accessExpires).toLocaleDateString()}</p>
                <p><i class="fas fa-chart-bar"></i> Тестов: <strong style="color: var(--accent);">${testsCount}</strong> / ${psych.maxTests}</p>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="psychologist-actions">
                ${!psych.isBlocked ? `
                    <button class="btn-secondary" onclick="blockPsychologist(${psych.id})">
                        <i class="fas fa-ban"></i> Заблокировать
                    </button>
                ` : `
                    <button class="btn-primary" onclick="unblockPsychologist(${psych.id})">
                        <i class="fas fa-check"></i> Разблокировать
                    </button>
                `}
                <button class="btn-secondary" onclick="extendPsychologistAccess(${psych.id})">
                    <i class="fas fa-clock"></i> Продлить
                </button>
                <button class="btn-delete" onclick="deletePsychologist(${psych.id})">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        `;
        
        list.appendChild(item);
    });
}

function blockPsychologist(psychId) {
    if (!confirm('Заблокировать психолога?')) return;
    const psych = state.psychologists.find(p => p.id === psychId);
    if (psych) {
        psych.isBlocked = true;
        saveUserData();
        renderPsychologistsList();
        renderAdminCabinet();
    }
}

function unblockPsychologist(psychId) {
    const psych = state.psychologists.find(p => p.id === psychId);
    if (psych) {
        psych.isBlocked = false;
        saveUserData();
        renderPsychologistsList();
        renderAdminCabinet();
    }
}

function extendPsychologistAccess(psychId) {
    const days = prompt('На сколько дней продлить?', '30');
    if (!days || isNaN(days)) return;
    
    const psych = state.psychologists.find(p => p.id === psychId);
    if (psych) {
        const newDate = new Date(psych.accessExpires);
        newDate.setDate(newDate.getDate() + parseInt(days));
        psych.accessExpires = newDate.toISOString();
        saveUserData();
        renderPsychologistsList();
        renderAdminCabinet();
        alert(`Доступ продлён до ${newDate.toLocaleDateString()}`);
    }
}

function deletePsychologist(psychId) {
    if (!confirm('Удалить психолога? Все тесты будут удалены!')) return;
    
    const psychologist = state.psychologists.find(p => p.id === psychId);
    const email = psychologist ? psychologist.email : null;
    
    if (email) {
        state.tests = state.tests.filter(t => t.psychologistEmail !== email);
    }
    
    state.psychologists = state.psychologists.filter(p => p.id !== psychId);
    saveUserData();
    renderPsychologistsList();
    renderAdminCabinet();
}

function checkExpiredAccess() {
    const now = new Date();
    let count = 0;
    state.psychologists.forEach(psych => {
        if (new Date(psych.accessExpires) < now && !psych.isBlocked) count++;
    });
    alert(`Истёкших доступов: ${count}`);
    if (count > 0) renderPsychologistsList();
}

function clearSystemCache() {
    if (!confirm('Очистить кэш?')) return;
    const preserved = {
        psytest_admin: localStorage.getItem('psytest_admin'),
        psytest_data: localStorage.getItem('psytest_data')
    };
    localStorage.clear();
    Object.keys(preserved).forEach(key => {
        if (preserved[key]) localStorage.setItem(key, preserved[key]);
    });
    alert('Кэш очищен');
    location.reload();
}

function exportAllData() {
    const data = {
        psychologists: state.psychologists,
        tests: state.tests,
        submissions: state.submissions,
        testResults: state.testResults,
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profdnk_export_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Данные экспортированы!');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.psychologists) state.psychologists = data.psychologists;
                if (data.tests) state.tests = data.tests;
                if (data.submissions) state.submissions = data.submissions;
                if (data.testResults) state.testResults = data.testResults;
                saveUserData();
                renderAdminCabinet();
                alert('Данные импортированы!');
            } catch (err) {
                alert('Ошибка импорта: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ============================================
// Data Persistence
// ============================================

function saveUserData() {
    const userData = {
        currentUser: state.currentUser,
        tests: state.tests,
        testResults: state.testResults,
        submissions: state.submissions,
        psychologists: state.psychologists
    };
    try {
        localStorage.setItem('psytest_data', JSON.stringify(userData));
        console.log('💾 Данные сохранены');
    } catch (e) {
        console.error('❌ Ошибка сохранения:', e);
    }
}

function loadUserData() {
    try {
        const savedData = localStorage.getItem('psytest_data');
        if (savedData) {
            const data = JSON.parse(savedData);
            state.currentUser = data.currentUser;
            state.tests = data.tests || [];
            state.testResults = data.testResults || [];
            state.submissions = data.submissions || [];
            state.psychologists = data.psychologists || [];
            
            // Пересчитываем тесты для каждого психолога
            if (state.psychologists && state.tests) {
                state.psychologists.forEach(psych => {
                    psych.testsCreated = state.tests.filter(t => t.psychologistEmail === psych.email).length;
                });
            }
            console.log('📥 Данные загружены');
        }
    } catch (e) {
        console.error('❌ Ошибка загрузки:', e);
    }
}

// ============================================
// Authentication - ИСПРАВЛЕНО
// ============================================

function handleStartWork() {
    console.log('🚀 Кнопка "Начать работу" нажата');
    console.log('Текущий пользователь:', state.currentUser);
    
    if (state.currentUser) {
        if (state.currentUser.role === 'admin') {
            console.log('✅ Перенаправление в кабинет администратора');
            navigateTo('admin-cabinet');
        } else if (state.currentUser.role === 'psychologist') {
            console.log('✅ Перенаправление в dashboard психолога');
            navigateTo('dashboard');
        } else {
            navigateTo('login');
        }
    } else {
        console.log('✅ Пользователь не авторизован, переход на login');
        navigateTo('login');
    }
}

function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('authEmail').value.trim().toLowerCase();
    const password = document.getElementById('authPass').value;
    
    console.log('🔐 Попытка входа:', email);
    
    if (!email || !password) {
        alert('❌ Введите email и пароль');
        return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        alert('❌ Введите корректный email');
        return;
    }
    
    // Ищем психолога (НЕ администратора!)
    const psychologist = state.psychologists.find(p => p.email.toLowerCase() === email && p.password === password);
    
    if (psychologist) {
        // Проверяем блокировку
        if (psychologist.isBlocked) {
            alert('❌ Ваш аккаунт заблокирован. Обратитесь к администратору.');
            return;
        }
        
        // Проверяем срок доступа
        if (new Date(psychologist.accessExpires) < new Date()) {
            alert('❌ Срок вашего доступа истёк. Обратитесь к администратору для продления.');
            return;
        }
        
        // ✅ ВАЖНО: Устанавливаем роль 'psychologist', НЕ 'admin'!
        state.currentUser = {
            name: psychologist.name,
            email: psychologist.email,
            role: 'psychologist'
        };
        
        console.log('✅ Вход психолога:', state.currentUser);
        
        saveUserData();
        updateAuthUI();
        navigateTo('dashboard');
        document.getElementById('authForm').reset();
    } else {
        alert('❌ Неверный email или пароль\n\nЕсли у вас нет аккаунта, обратитесь к администратору для создания.');
    }
}

function showLoginHelp() {
    const help = document.getElementById('loginHelp');
    if (help) help.style.display = help.style.display === 'none' ? 'block' : 'none';
}

function toggleAuthMode() {
    showLoginHelp();
}

function logout() {
    state.currentUser = null;
    saveUserData();
    updateAuthUI();
    navigateTo('home');
    console.log('👋 Пользователь вышел');
}

function updateAuthUI() {
    const userNameEl = document.getElementById('navUserName');
    
    if (state.currentUser) {
        if (userNameEl) {
            userNameEl.innerText = state.currentUser.name;
            userNameEl.style.display = 'block';
            userNameEl.classList.add('show');
        }
        
        // ✅ Чёткое разделение по ролям
        if (state.currentUser.role === 'admin') {
            console.log('✅ Роль: Администратор');
            document.getElementById('linkLogin').style.display = 'none';
            document.getElementById('linkAdmin').style.display = 'block';
            document.getElementById('linkDashboard').style.display = 'none';
            document.getElementById('linkClients').style.display = 'none';
            document.getElementById('linkBuilder').style.display = 'block';
            document.getElementById('linkProfile').style.display = 'none';
            document.getElementById('linkLogout').style.display = 'block';
            document.getElementById('menuBuilder').style.display = 'block';
        } else if (state.currentUser.role === 'psychologist') {
            console.log('✅ Роль: Психолог');
            document.getElementById('linkLogin').style.display = 'none';
            document.getElementById('linkAdmin').style.display = 'none';
            document.getElementById('linkDashboard').style.display = 'block';
            document.getElementById('linkClients').style.display = 'block';
            document.getElementById('linkBuilder').style.display = 'block';
            document.getElementById('linkProfile').style.display = 'block';
            document.getElementById('linkLogout').style.display = 'block';
            document.getElementById('menuBuilder').style.display = 'block';
        }
    } else {
        console.log('✅ Пользователь не авторизован');
        if (userNameEl) {
            userNameEl.style.display = 'none';
            userNameEl.classList.remove('show');
        }
        document.getElementById('linkLogin').style.display = 'block';
        document.getElementById('linkAdmin').style.display = 'none';
        document.getElementById('linkDashboard').style.display = 'none';
        document.getElementById('linkClients').style.display = 'none';
        document.getElementById('linkBuilder').style.display = 'none';
        document.getElementById('linkProfile').style.display = 'none';
        document.getElementById('linkLogout').style.display = 'none';
        document.getElementById('menuBuilder').style.display = 'none';
    }
}

// ============================================
// Navigation
// ============================================

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('open');
    
    if (!overlay) {
        const newOverlay = document.createElement('div');
        newOverlay.id = 'sidebarOverlay';
        newOverlay.className = 'sidebar-overlay';
        newOverlay.onclick = toggleMenu;
        document.body.appendChild(newOverlay);
    }
    
    document.getElementById('sidebarOverlay').classList.toggle('show');
}

function navigateTo(viewId) {
    // Блокировка навигации в публичном режиме
    if (state.isPublicMode && viewId !== 'test-interface' && viewId !== 'results') {
        console.log('⚠️ Навигация заблокирована в публичном режиме');
        return;
    }
    
    // ✅ Проверка прав для админ-страниц
    if (viewId === 'admin-cabinet' || viewId === 'admin-login') {
        if (!state.currentUser || state.currentUser.role !== 'admin') {
            if (viewId !== 'admin-login') {
                alert('⚠️ Требуется авторизация администратора');
                navigateTo('admin-login');
                return;
            }
        }
    }
    
    // Скрываем все view
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    
    // Показываем нужный view
    const targetId = viewId.startsWith('view-') ? viewId : `view-${viewId}`;
    const target = document.getElementById(targetId);
    
    if (target) {
        target.classList.add('active');
        console.log('✅ Переход на:', viewId);
    } else {
        console.error('❌ View не найден:', targetId);
    }
    
    // Закрываем sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
    
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.classList.remove('show');
    
    // Загружаем данные для view
    if (viewId === 'dashboard') {
        renderDashboard();
    }
    if (viewId === 'admin-cabinet') {
        renderAdminCabinet();
    }
    if (viewId === 'profile') {
        renderProfile();
    }
    if (viewId === 'psych-clients') {
        showPsychologistClients();
    }
    
    window.scrollTo(0, 0);
}

// ============================================
// Test Builder
// ============================================

function generateTestId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function addQuestionField() {
    questionCount++;
    const container = document.getElementById('questionsContainer');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'question-block';
    div.innerHTML = `
        <span class="question-number">Вопрос #${questionCount}</span>
        <input type="text" class="q-text" placeholder="Введите текст вопроса">
        <button class="remove-btn" onclick="this.parentElement.remove()">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

function saveTest() {
    if (!state.currentUser || state.currentUser.role !== 'psychologist') {
        alert('Требуется авторизация психолога');
        navigateTo('login');
        return;
    }
    
    const title = document.getElementById('testTitle').value;
    if (!title) return alert("Введите название теста");

    const formatRadios = document.getElementsByName('answerFormat');
    for (const radio of formatRadios) {
        if (radio.checked) {
            selectedFormat = radio.value;
            break;
        }
    }

    const questions = [];
    document.querySelectorAll('.question-block').forEach(block => {
        const text = block.querySelector('.q-text').value;
        if (text.trim()) {
            questions.push({ text: text.trim(), type: selectedFormat });
        }
    });

    if (questions.length === 0) return alert("Добавьте хотя бы один вопрос");

    const uniqueId = generateTestId();
    const fullLink = `${window.location.origin}${window.location.pathname}?test=${uniqueId}`;

    const newTest = {
        id: Date.now(),
        uniqueId: uniqueId,
        title: title,
        questions: questions,
        answerFormat: selectedFormat,
        created: new Date().toLocaleDateString(),
        passes: 0,
        link: fullLink,
        psychologistEmail: state.currentUser.email
    };

    state.tests.push(newTest);
    
    // Увеличиваем счётчик тестов
    const psychologist = state.psychologists.find(p => p.email === state.currentUser.email);
    if (psychologist) {
        psychologist.testsCreated = (psychologist.testsCreated || 0) + 1;
    }
    
    saveUserData();
    
    document.getElementById('testTitle').value = '';
    document.getElementById('questionsContainer').innerHTML = '';
    questionCount = 0;
    
    alert(`Тест сохранён!\n\nСсылка: ${fullLink}`);
    navigateTo('dashboard');
}

// ============================================
// Dashboard
// ============================================

function renderDashboard() {
    const list = document.getElementById('testsList');
    if (!list) return;
    
    list.innerHTML = '';

    if (!state.tests || state.tests.length === 0) {
        list.innerHTML = '<div class="empty-state">Список тестов пуст</div>';
        return;
    }

    state.tests.forEach(test => {
        const item = document.createElement('div');
        item.className = 'test-item';
        
        const formatIcon = test.answerFormat === 'slider' 
            ? '<i class="fas fa-sliders-h" style="color: var(--accent); margin-right: 8px;"></i>'
            : '<i class="fas fa-check-circle" style="color: var(--accent); margin-right: 8px;"></i>';
        
        const formatText = test.answerFormat === 'slider' ? '1-10 баллов' : 'Да/Нет';
        const testSubmissions = state.submissions.filter(s => s.testId === test.id);
        
        item.innerHTML = `
            <div style="flex: 1; min-width: 250px;">
                <h3>${formatIcon}${test.title}</h3>
                <small style="color:var(--text-sec)">
                    <i class="fas fa-question-circle"></i> ${test.questions.length} вопросов | 
                    <i class="fas fa-clock"></i> ${formatText} |
                    <i class="fas fa-calendar"></i> ${test.created}
                </small>
                <div style="margin-top: 8px; color: var(--accent); font-size: 0.9rem;">
                    <i class="fas fa-users"></i> Клиентов: ${testSubmissions.length}
                </div>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn-secondary" onclick="startTest(${test.id})">
                    <i class="fas fa-play"></i> Пройти
                </button>
                <button class="btn-action" onclick="showPsychologistClients()">
                    <i class="fas fa-users"></i> Клиенты
                </button>
                <button class="btn-action" onclick="showSubmissions(${test.id})">
                    <i class="fas fa-chart-bar"></i> Результаты
                </button>
                <button class="btn-primary" style="padding: 10px 15px; font-size: 0.85rem;" onclick="copyLink('${test.uniqueId}')">
                    <i class="fas fa-link"></i> Ссылка
                </button>
                <button class="btn-delete" onclick="deleteTest(${test.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

function deleteTest(testId) {
    console.log('🗑️ Попытка удаления теста:', testId);
    
    if (!confirm('Удалить тест? Все результаты и данные клиентов будут удалены!')) {
        console.log('❌ Удаление отменено');
        return;
    }
    
    // Находим тест для получения информации
    const test = state.tests.find(t => t.id === testId);
    const testName = test ? test.title : 'Неизвестно';
    
    // ✅ Удаляем тест из массива
    const beforeCount = state.tests.length;
    state.tests = state.tests.filter(t => t.id !== testId);
    const afterCount = state.tests.length;
    
    console.log(`✅ Тестов до: ${beforeCount}, после: ${afterCount}`);
    
    // ✅ Удаляем все результаты (submissions) этого теста
    const submissionsBefore = state.submissions.length;
    state.submissions = state.submissions.filter(s => s.testId !== testId);
    const submissionsAfter = state.submissions.length;
    
    console.log(`✅ Прохождений до: ${submissionsBefore}, после: ${submissionsAfter}`);
    
    // ✅ Удаляем aggregated results
    state.testResults = state.testResults.filter(r => r.testId !== testId);
    
    // ✅ Сохраняем изменения
    saveUserData();
    
    console.log('✅ Данные сохранены в localStorage');
    
    // ✅ Обновляем UI в зависимости от текущей страницы
    const dashboardList = document.getElementById('testsList');
    const adminTestsList = document.getElementById('adminTestsList');
    
    if (dashboardList && dashboardList.parentElement.classList.contains('active')) {
        renderDashboard();
        console.log('✅ Dashboard обновлён');
    }
    
    if (adminTestsList && adminTestsList.parentElement.classList.contains('active')) {
        renderAdminTestsList();
        console.log('✅ Админ-панель обновлена');
    }
    
    // ✅ Обновляем статистику в кабинете администратора
    if (state.currentUser && state.currentUser.role === 'admin') {
        renderAdminCabinet();
        console.log('✅ Статистика администратора обновлена');
    }
    
    alert(`✅ Тест "${testName}" успешно удалён`);
}

function copyLink(uniqueId) {
    const test = state.tests.find(t => t.uniqueId === uniqueId);
    if (!test) {
        alert('Тест не найден');
        return;
    }
    
    const link = test.link;
    navigator.clipboard.writeText(link).then(() => {
        alert(`Ссылка скопирована:\n\n${link}`);
    }).catch(() => {
        alert(`Ссылка: ${link}`);
    });
}

// ============================================
// Psychologist Clients
// ============================================

function showPsychologistClients() {
    if (!state.currentUser) {
        alert('Требуется авторизация');
        navigateTo('login');
        return;
    }
    
    const list = document.getElementById('clientsList');
    if (!list) return;
    
    list.innerHTML = '';
    
    const allSubmissions = state.submissions || [];
    
    if (allSubmissions.length === 0) {
        list.innerHTML = '<div class="empty-state">Пока нет клиентов</div>';
        navigateTo('view-psych-clients');
        return;
    }
    
    const clientsMap = new Map();
    allSubmissions.forEach(sub => {
        const key = sub.clientName;
        if (!clientsMap.has(key)) clientsMap.set(key, []);
        clientsMap.get(key).push(sub);
    });
    
    clientsMap.forEach((submissions, clientName) => {
        const latest = submissions[submissions.length - 1];
        const item = document.createElement('div');
        item.className = 'submission-item';
        
        item.innerHTML = `
            <div class="client-info">
                <h4>${clientName}</h4>
                <p><i class="fas fa-envelope"></i> ${latest.clientPhone || 'Телефон не указан'}</p>
                <p><i class="fas fa-chart-bar"></i> Тестов: ${submissions.length}</p>
                <p><i class="fas fa-clock"></i> Последнее: ${new Date(latest.id).toLocaleDateString()}</p>
            </div>
            <button class="btn-action" onclick="viewClientDetail('${clientName}')">
                <i class="fas fa-eye"></i> Результаты
            </button>
        `;
        
        list.appendChild(item);
    });
    
    navigateTo('view-psych-clients');
}

function viewClientDetail(clientName) {
    const allSubmissions = state.submissions || [];
    const clientSubmissions = allSubmissions.filter(s => s.clientName === clientName);
    
    if (clientSubmissions.length === 0) {
        alert('Нет данных');
        return;
    }
    
    currentClientDetail = { name: clientName, submissions: clientSubmissions };
    
    const content = document.getElementById('clientDetailContent');
    
    let html = `
        <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: var(--accent); margin-bottom: 15px;">${clientName}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                    <p style="color: var(--text-sec); font-size: 0.85rem;">Всего прохождений</p>
                    <p style="font-size: 1.5rem; font-weight: bold;">${clientSubmissions.length}</p>
                </div>
                <div>
                    <p style="color: var(--text-sec); font-size: 0.85rem;">Первое</p>
                    <p style="font-size: 1.1rem;">${new Date(clientSubmissions[0].id).toLocaleDateString()}</p>
                </div>
                <div>
                    <p style="color: var(--text-sec); font-size: 0.85rem;">Последнее</p>
                    <p style="font-size: 1.1rem;">${new Date(clientSubmissions[clientSubmissions.length - 1].id).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
        <h3 style="margin-bottom: 15px;">История прохождений</h3>
    `;
    
    clientSubmissions.forEach(sub => {
        const test = state.tests.find(t => t.id === sub.testId);
        const scoreDisplay = test.answerFormat === 'slider' 
            ? `${sub.score} / ${test.questions.length * 10}`
            : '✓ Пройдено';
        
        html += `
            <div class="submission-item" style="margin-bottom: 10px;">
                <div class="client-info">
                    <h4>${test.title}</h4>
                    <p><i class="fas fa-calendar"></i> ${sub.date}</p>
                    <p>Результат: <strong style="color: var(--accent);">${scoreDisplay}</strong></p>
                </div>
                <button class="btn-view-result" onclick="viewSingleSubmissionResult(${sub.id})">
                    <i class="fas fa-file-alt"></i> Отчёт
                </button>
            </div>
        `;
    });
    
    content.innerHTML = html;
    navigateTo('view-client-detail');
}

function viewSingleSubmissionResult(submissionId) {
    const sub = state.submissions.find(s => s.id === submissionId);
    if (!sub) return;
    
    const test = state.tests.find(t => t.id === sub.testId);
    
    currentTestResults = {
        score: sub.score,
        testName: sub.testName,
        date: sub.date,
        answers: sub.answers,
        questions: test.questions,
        format: sub.format,
        clientName: sub.clientName,
        clientPhone: sub.clientPhone
    };
    
    document.getElementById('resultScore').innerText = sub.score;
    document.getElementById('resultText').innerText = `Клиент: ${sub.clientName}`;
    renderReportContent('psychologist');
    
    document.querySelector('.report-actions').innerHTML = `
        <button class="btn-action" onclick="printReport()">
            <i class="fas fa-print"></i> Печать
        </button>
        <button class="btn-action" onclick="downloadDOCX()">
            <i class="fas fa-file-word"></i> Скачать DOCX
        </button>
        <button class="btn-secondary" onclick="viewClientDetail('${sub.clientName}')">
            <i class="fas fa-arrow-left"></i> Назад
        </button>
    `;
    
    navigateTo('results');
}

function showSubmissions(testId) {
    const test = state.tests.find(t => t.id === testId);
    if (!test) return;
    
    document.getElementById('submissionsTestTitle').innerText = `Результаты: ${test.title}`;
    const list = document.getElementById('submissionsList');
    list.innerHTML = '';
    
    const subs = state.submissions.filter(s => s.testId === test.id);
    
    if (subs.length === 0) {
        list.innerHTML = '<div class="empty-state">Нет прохождений</div>';
    } else {
        subs.forEach(s => {
            const div = document.createElement('div');
            div.className = 'submission-item';
            
            const scoreDisplay = test.answerFormat === 'slider' 
                ? `${s.score} / ${test.questions.length * 10}`
                : '✓ Пройдено';
            
            div.innerHTML = `
                <div class="client-info">
                    <h4>${s.clientName}</h4>
                    <p><i class="fas fa-calendar"></i> ${s.date}</p>
                </div>
                <div style="display:flex; gap:15px; align-items:center;">
                    <div class="client-score">${scoreDisplay}</div>
                    <button class="btn-view-result" onclick="viewSubmissionResult(${s.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `;
            list.appendChild(div);
        });
    }
    
    navigateTo('view-submissions');
}

function viewSubmissionResult(submissionId) {
    const sub = state.submissions.find(s => s.id === submissionId);
    if (!sub) return;
    
    const test = state.tests.find(t => t.id === sub.testId);
    
    currentTestResults = {
        score: sub.score,
        testName: sub.testName,
        date: sub.date,
        answers: sub.answers,
        questions: test.questions,
        format: sub.format,
        clientName: sub.clientName,
        clientPhone: sub.clientPhone
    };
    
    document.getElementById('resultScore').innerText = sub.score;
    document.getElementById('resultText').innerText = `Клиент: ${sub.clientName}`;
    renderReportContent('psychologist');
    
    document.querySelector('.report-actions').innerHTML = `
        <button class="btn-action" onclick="printReport()">
            <i class="fas fa-print"></i> Печать
        </button>
        <button class="btn-action" onclick="downloadDOCX()">
            <i class="fas fa-file-word"></i> Скачать DOCX
        </button>
        <button class="btn-secondary" onclick="showSubmissions(${test.id})">
            <i class="fas fa-arrow-left"></i> Назад
        </button>
    `;
    
    navigateTo('results');
}

// ============================================
// Test Taking
// ============================================

function startTest(testId) {
    const test = state.tests.find(t => t.id === testId);
    if (!test) {
        alert('Тест не найден');
        return;
    }
    
    if (!test.questions || test.questions.length === 0) {
        alert('В тесте нет вопросов');
        return;
    }
    
    state.isPublicMode = false;
    document.body.classList.remove('public-mode');
    state.currentClientInfo = null;
    
    state.currentTestSession = {
        test: test,
        answers: {},
        currentIndex: 0,
        totalQuestions: test.questions.length,
        isPublic: false
    };
    
    document.getElementById('currentTestTitle').innerText = test.title;
    document.getElementById('clientNameDisplay').innerText = '';
    
    navigateTo('test-interface');
    setTimeout(() => renderQuestion(), 100);
}

function renderQuestion() {
    const session = state.currentTestSession;
    if (!session || !session.test) {
        navigateTo('dashboard');
        return;
    }
    
    const test = session.test;
    const q = test.questions[session.currentIndex];
    const container = document.getElementById('questionsRenderArea');
    if (!container) return;
    
    const progress = ((session.currentIndex + 1) / test.questions.length) * 100;
    const progressEl = document.getElementById('progressFill');
    if (progressEl) progressEl.style.width = `${progress}%`;
    
    const currentQNum = document.getElementById('currentQuestionNum');
    const totalQNum = document.getElementById('totalQuestionsNum');
    if (currentQNum) currentQNum.innerText = session.currentIndex + 1;
    if (totalQNum) totalQNum.innerText = test.questions.length;
    
    let inputHtml = '';

    if (test.answerFormat === 'slider') {
        const val = session.answers[session.currentIndex] || 5;
        inputHtml = `
            <input type="range" min="1" max="10" value="${val}" class="slider-input" id="answerInput" 
                oninput="document.getElementById('valDisplay').innerText = this.value">
            <div id="valDisplay" style="text-align:center; color:var(--accent); font-size:2rem; font-weight:bold; margin: 15px 0;">${val}</div>
        `;
    } else {
        const val = session.answers[session.currentIndex] || '';
        inputHtml = `
            <div class="choice-options">
                <label class="choice-option">
                    <input type="radio" name="ans" value="да" ${val === 'да' ? 'checked' : ''}>
                    <span>Да</span>
                </label>
                <label class="choice-option">
                    <input type="radio" name="ans" value="нет" ${val === 'нет' ? 'checked' : ''}>
                    <span>Нет</span>
                </label>
                <label class="choice-option">
                    <input type="radio" name="ans" value="сложно" ${val === 'сложно' ? 'checked' : ''}>
                    <span>Сложно ответить</span>
                </label>
            </div>
        `;
    }

    container.innerHTML = `
        <h3 style="margin-bottom:20px; color:var(--text-main);">${q.text}</h3>
        <p style="color: var(--text-sec); margin-bottom: 20px;">Вопрос ${session.currentIndex + 1} из ${test.questions.length}</p>
        ${inputHtml}
    `;

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display:flex; justify-content:space-between; margin-top:40px; gap: 15px;';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn-secondary';
    prevBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Назад';
    prevBtn.style.cssText = 'min-width: 120px;';
    prevBtn.disabled = session.currentIndex === 0;
    if (session.currentIndex === 0) {
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
    } else {
        prevBtn.onclick = () => prevQuestion();
    }
    btnContainer.appendChild(prevBtn);

    const rightButtons = document.createElement('div');
    rightButtons.style.cssText = 'display: flex; gap: 15px;';

    if (session.currentIndex === test.questions.length - 1) {
        const finishBtn = document.createElement('button');
        finishBtn.className = 'btn-primary';
        finishBtn.innerHTML = '<i class="fas fa-check-circle"></i> Завершить';
        finishBtn.style.cssText = 'min-width: 160px; background: linear-gradient(135deg, #4caf50, #43a047);';
        finishBtn.onclick = () => finishTest();
        rightButtons.appendChild(finishBtn);
    } else {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn-primary';
        nextBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Далее';
        nextBtn.style.cssText = 'min-width: 120px;';
        nextBtn.onclick = () => nextQuestion();
        rightButtons.appendChild(nextBtn);
    }

    btnContainer.appendChild(rightButtons);
    container.appendChild(btnContainer);
}

function saveCurrentAnswer() {
    const session = state.currentTestSession;
    if (!session || !session.test) return '';
    
    let val = '';
    if (session.test.answerFormat === 'slider') {
        const input = document.getElementById('answerInput');
        if (input) val = input.value;
    } else {
        const checked = document.querySelector('input[name="ans"]:checked');
        if (checked) val = checked.value;
    }
    
    if (val !== '') {
        session.answers[session.currentIndex] = val;
    }
    return val;
}

function nextQuestion() {
    const session = state.currentTestSession;
    if (!session) return;
    saveCurrentAnswer();
    if (session.currentIndex < session.test.questions.length - 1) {
        session.currentIndex++;
        renderQuestion();
    } else {
        finishTest();
    }
}

function prevQuestion() {
    const session = state.currentTestSession;
    if (!session) return;
    saveCurrentAnswer();
    if (session.currentIndex > 0) {
        session.currentIndex--;
        renderQuestion();
    }
}

function finishTest() {
    const session = state.currentTestSession;
    if (!session || !session.test) {
        alert('Ошибка сессии');
        navigateTo('dashboard');
        return;
    }
    
    saveCurrentAnswer();
    const test = session.test;
    const answeredCount = Object.keys(session.answers).length;
    
    if (answeredCount < test.questions.length) {
        if (!confirm(`Вы ответили на ${answeredCount} из ${test.questions.length} вопросов. Завершить?`)) return;
    }
    
    let score = 0;
    if (test.answerFormat === 'slider') {
        Object.values(session.answers).forEach(val => {
            const num = parseInt(val);
            if (!isNaN(num)) score += num;
        });
    } else {
        Object.values(session.answers).forEach(val => {
            if (val === 'да') score += 1;
        });
    }

    const submission = {
        id: Date.now(),
        testId: test.id,
        testUniqueId: test.uniqueId,
        testName: test.title,
        score: score,
        answers: {...session.answers},
        date: new Date().toLocaleString(),
        format: test.answerFormat,
        clientName: state.isPublicMode ? state.currentClientInfo.fullName : (state.currentUser ? state.currentUser.name : 'Аноним'),
        clientPhone: state.isPublicMode ? state.currentClientInfo.phone : '',
        isPublic: state.isPublicMode
    };
    
    const existingIndex = state.submissions.findIndex(s => s.testId === test.id && s.clientName === submission.clientName);
    if (existingIndex >= 0) {
        state.submissions[existingIndex] = submission;
    } else {
        state.submissions.push(submission);
    }
    
    const resultData = {
        id: Date.now(),
        testId: test.id,
        score: score,
        date: submission.date,
        clientName: submission.clientName
    };
    const resultIndex = state.testResults.findIndex(r => r.testId === test.id);
    if (resultIndex >= 0) {
        state.testResults[resultIndex] = resultData;
    } else {
        state.testResults.push(resultData);
    }
    
    test.passes++;
    saveUserData();
    
    currentTestResults = {
        score: score,
        testName: test.title,
        date: submission.date,
        answers: session.answers,
        questions: test.questions,
        format: test.answerFormat
    };
    
    if (test.answerFormat === 'choice') {
        document.getElementById('resultScore').innerText = '';
        document.getElementById('resultText').innerText = 'Спасибо за ответ. Более подробные результаты узнавайте у вашего специалиста.';
    } else {
        document.getElementById('resultScore').innerText = score;
        document.getElementById('resultText').innerText = '';
    }
    
    renderReportContent('client');
    
    if (state.isPublicMode) {
        document.getElementById('view-test-interface').classList.remove('active');
        document.getElementById('view-results').classList.add('active');
        document.querySelector('.report-actions').innerHTML = `
            <button class="btn-action btn-retake" onclick="retakePublicTest()">
                <i class="fas fa-redo"></i> Пройти ещё раз
            </button>
        `;
    } else {
        navigateTo('results');
    }
    
    setTimeout(() => window.scrollTo(0, 0), 100);
}

function retakePublicTest() {
    state.currentTestSession.answers = {};
    state.currentTestSession.currentIndex = 0;
    document.getElementById('view-results').classList.remove('active');
    document.getElementById('view-test-interface').classList.add('active');
    renderQuestion();
}

function retakeTest() {
    if (state.currentTestSession && state.currentTestSession.test) {
        state.currentTestSession.answers = {};
        state.currentTestSession.currentIndex = 0;
        navigateTo('test-interface');
        renderQuestion();
    } else {
        navigateTo('dashboard');
    }
}

// ============================================
// Public Mode
// ============================================

function checkUrlForTest() {
    const params = new URLSearchParams(window.location.search);
    const testId = params.get('test');
    
    if (testId) {
        const test = state.tests.find(t => t.uniqueId === testId);
        if (test) {
            enablePublicMode(test);
        } else {
            alert('Тест не найден');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

function enablePublicMode(test) {
    state.isPublicMode = true;
    document.body.classList.add('public-mode');
    
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById('view-public-intro').classList.add('active');
    document.getElementById('publicTestTitle').innerText = test.title;
    
    state.currentTestSession = { test: test, isPublic: true };
}

function loadTestByLink() {
    const linkInput = document.getElementById('testLinkInput');
    const link = linkInput ? linkInput.value.trim() : '';
    
    if (!link) {
        alert('Вставьте ссылку на тест');
        return;
    }
    
    let testId = '';
    if (link.includes('?test=')) {
        testId = link.split('?test=')[1].split('&')[0];
    } else if (link.includes('/take/')) {
        testId = link.split('/take/')[1].split('?')[0];
    } else if (link.length >= 6 && /^[a-zA-Z0-9]+$/.test(link)) {
        testId = link;
    } else {
        alert('Неверный формат ссылки');
        return;
    }
    
    const test = state.tests.find(t => t.uniqueId === testId);
    if (!test) {
        alert('Тест не найден');
        return;
    }
    
    if (state.currentUser) {
        if (!confirm('Вы авторизованы. Продолжить как ' + state.currentUser.name + '?')) {
            logout();
            return;
        }
    }
    
    enablePublicMode(test);
    alert('Тест "' + test.title + '" загружен!');
}

function submitClientInfo(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('clientFirstName').value.trim();
    const lastName = document.getElementById('clientLastName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    
    if (!firstName || !lastName) {
        alert('Заполните имя и фамилию');
        return;
    }
    
    state.currentClientInfo = {
        firstName,
        lastName,
        phone,
        fullName: `${lastName} ${firstName}`
    };
    
    document.getElementById('view-public-intro').classList.remove('active');
    document.getElementById('view-test-interface').classList.add('active');
    
    const test = state.currentTestSession.test;
    document.getElementById('currentTestTitle').innerText = test.title;
    document.getElementById('clientNameDisplay').innerText = state.currentClientInfo.fullName;
    
    state.currentTestSession.answers = {};
    state.currentTestSession.currentIndex = 0;
    state.currentTestSession.totalQuestions = test.questions.length;
    
    renderQuestion();
}

// ============================================
// Reports
// ============================================

function renderReportContent(mode) {
    if (!currentTestResults) return;
    
    const { score, testName, date, answers, questions, format, clientName, clientPhone } = currentTestResults;
    
    let answersTable = '';
    questions.forEach((q, index) => {
        const answer = answers[index] || 'Не отвечено';
        const answerDisplay = format === 'slider' ? `${answer} из 10` : answer.charAt(0).toUpperCase() + answer.slice(1);
        answersTable += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 12px 8px;">${index + 1}</td>
                <td style="padding: 12px 8px;">${q.text}</td>
                <td style="padding: 12px 8px; color: var(--accent); font-weight: 600;">${answerDisplay}</td>
            </tr>
        `;
    });
    
    let resultBlock = '';
    if (format === 'choice') {
        resultBlock = `
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(123, 31, 162, 0.1)); border-radius: 15px; margin-bottom: 25px; border: 2px solid var(--accent);">
                <p style="margin: 0; font-size: 1.2rem; line-height: 1.6;">
                    <i class="fas fa-check-circle" style="color: var(--accent); margin-right: 10px;"></i>
                    Спасибо за ответ.<br>Более подробные результаты узнавайте у вашего специалиста.
                </p>
            </div>
        `;
    } else {
        resultBlock = `
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(123, 31, 162, 0.1)); border-radius: 15px; margin-bottom: 25px; border: 2px solid var(--accent);">
                <p style="margin: 0 0 10px 0; color: var(--text-sec);">Итоговый результат</p>
                <p style="margin: 0; font-size: 3.5rem; font-weight: bold; color: var(--accent);">${score}<span style="font-size: 1.5rem; color: var(--text-sec);"> / ${questions.length * 10}</span></p>
            </div>
        `;
    }
    
    const reportHTML = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: var(--text-main);">
            <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 3px solid var(--accent);">
                <h1 style="margin: 0 0 10px 0; font-size: 1.8rem;">${testName}</h1>
                <p style="color: var(--text-sec); margin: 0;">Отчет о прохождении тестирования</p>
                ${clientName ? `<p style="color: var(--accent); margin: 10px 0 0 0;">Клиент: ${clientName}${clientPhone ? ' | ' + clientPhone : ''}</p>` : ''}
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div>
                        <p style="margin: 0 0 5px 0; color: var(--text-sec); font-size: 0.85rem;">Дата</p>
                        <p style="margin: 0; font-weight: 600;">${date}</p>
                    </div>
                    <div>
                        <p style="margin: 0 0 5px 0; color: var(--text-sec); font-size: 0.85rem;">Вопросов</p>
                        <p style="margin: 0; font-weight: 600;">${questions.length}</p>
                    </div>
                    <div>
                        <p style="margin: 0 0 5px 0; color: var(--text-sec); font-size: 0.85rem;">Формат</p>
                        <p style="margin: 0; font-weight: 600;">${format === 'slider' ? 'Шкала 1-10' : 'Да/Нет/Сложно'}</p>
                    </div>
                    <div>
                        <p style="margin: 0 0 5px 0; color: var(--text-sec); font-size: 0.85rem;">Статус</p>
                        <p style="margin: 0; color: #6bcb77; font-weight: 600;">✓ Завершено</p>
                    </div>
                </div>
            </div>
            
            ${resultBlock}
            
            <div style="margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid var(--accent);">Подробные ответы</h3>
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: rgba(0, 229, 255, 0.2); color: var(--accent);">
                                <th style="padding: 12px 8px; text-align: left; width: 50px;">#</th>
                                <th style="padding: 12px 8px; text-align: left;">Вопрос</th>
                                <th style="padding: 12px 8px; text-align: left; width: 150px;">Ответ</th>
                            </tr>
                        </thead>
                        <tbody>${answersTable}</tbody>
                    </table>
                </div>
            </div>
            
            <div style="background: rgba(255, 193, 7, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107;">
                <h4 style="color: #ffc107; margin: 0 0 10px 0;">📋 Рекомендации</h4>
                <p style="color: var(--text-sec); margin: 0; line-height: 1.6;">
                    ${format === 'slider' 
                        ? 'Данный отчет носит информационный характер. Для подробной интерпретации результатов рекомендуется обратиться к квалифицированному специалисту.'
                        : 'Результаты теста могут использоваться как дополнительный материал при консультации.'}
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); color: var(--text-sec); font-size: 0.85rem;">
                <p style="margin: 0;">ПрофДНК © ${new Date().getFullYear()}</p>
                <p style="margin: 5px 0 0 0;">Отчет сгенерирован автоматически</p>
            </div>
        </div>
    `;
    
    document.getElementById('reportContent').innerHTML = reportHTML;
}

function switchReportTab(mode) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target.closest('.tab-btn')) {
        event.target.closest('.tab-btn').classList.add('active');
    }
    renderReportContent(mode);
}

function printReport() {
    window.print();
}

function downloadDOCX() {
    if (!currentTestResults) {
        alert('Нет данных отчета');
        return;
    }
    
    const { score, testName, date, answers, questions, format } = currentTestResults;
    
    let answersTable = '';
    questions.forEach((q, index) => {
        const answer = answers[index] || 'Не отвечено';
        const answerDisplay = format === 'slider' ? `${answer} из 10` : answer.charAt(0).toUpperCase() + answer.slice(1);
        answersTable += `<tr><td>${index + 1}</td><td>${q.text}</td><td>${answerDisplay}</td></tr>`;
    });
    
    const htmlContent = `
        <html><head><meta charset="utf-8"><title>${testName}</title>
        <style>body{font-family:Arial,sans-serif;padding:40px;}h1{color:#7b1fa2;}table{width:100%;border-collapse:collapse;}th{background:#7b1fa2;color:white;padding:10px;}td{padding:10px;border-bottom:1px solid #ddd;}</style>
        </head><body>
        <h1>${testName}</h1><p>Дата: ${date}</p><h2>Результат: ${score}</h2>
        <table><tr><th>#</th><th>Вопрос</th><th>Ответ</th></tr>${answersTable}</table>
        <p>ПрофДНК © ${new Date().getFullYear()}</p>
        </body></html>
    `;
    
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${testName.replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_')}_${Date.now()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Файл скачан!');
}

// ============================================
// Profile
// ============================================

function renderProfile() {
    if (!state.currentUser) return;
    document.getElementById('profileName').innerText = state.currentUser.name;
    document.getElementById('statTotalTests').innerText = state.tests.length;
    document.getElementById('statTotalPasses').innerText = state.submissions.length;
}

// ============================================
// Contacts & Other
// ============================================

function openSpecialistChat() {
    alert('Открывается окно записи на консультацию...');
}

function sendContactMessage(e) {
    e.preventDefault();
    alert('Сообщение отправлено!');
    e.target.reset();
}

// ============================================
// Comfort Popup
// ============================================

function showComfortPopup() {
    const popup = document.getElementById('comfortPopup');
    if (popup) {
        setTimeout(() => {
            popup.classList.add('show');
            setTimeout(() => popup.classList.remove('show'), 8000);
        }, 3000);
    }
}