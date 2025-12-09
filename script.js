// FitCircle SmartChat MVP - Frontend JavaScript
// 請將 API_BASE 替換為您的 Cloudflare Worker URL

const API_BASE = 'https://fitcircle-backend1.wangserena1960.workers.dev'; // Cloudflare Worker URL

// 檢查 API_BASE 是否已設定
if (API_BASE === 'YOUR_WORKER_URL_HERE' || !API_BASE || API_BASE.trim() === '') {
    console.error('❌ API_BASE 尚未設定！請在 script.js 中將 YOUR_WORKER_URL_HERE 替換為您的 Cloudflare Worker URL');
}

// Global State
let currentUser = null;
let currentRole = 'admin';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = localStorage.getItem('fitcircle_token');
    if (token) {
        window._fitcircleToken = token;
        const userStr = localStorage.getItem('fitcircle_user');
        if (userStr) {
            currentUser = JSON.parse(userStr);
            showApp();
        }
    }

    // Login form handler
    document.getElementById('login-form').addEventListener('submit', handleLogin);
});

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');

    errorDiv.textContent = '';
    loginBtn.disabled = true;
    loginBtn.textContent = '登入中...';

    try {
        // 檢查 API_BASE 是否已設定
        if (API_BASE === 'YOUR_WORKER_URL_HERE' || !API_BASE || API_BASE.trim() === '') {
            throw new Error('API URL 尚未設定！請在 script.js 中將 YOUR_WORKER_URL_HERE 替換為您的 Cloudflare Worker URL');
        }

        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        // 檢查網路錯誤
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status} 錯誤` }));
            throw new Error(errorData.error || `登入失敗 (HTTP ${response.status})`);
        }

        const data = await response.json();

        // Store token and user
        window._fitcircleToken = data.token;
        currentUser = data.user;
        localStorage.setItem('fitcircle_token', data.token);
        localStorage.setItem('fitcircle_user', JSON.stringify(data.user));

        // Show app
        showApp();
    } catch (error) {
        // 顯示更詳細的錯誤訊息
        let errorMessage = error.message;
        
        // 如果是網路錯誤
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = '無法連接到伺服器。請檢查：\n1. API URL 是否正確設定\n2. Cloudflare Worker 是否正常運作\n3. 網路連線是否正常';
        }
        
        // 如果是 URL 格式錯誤
        if (error.message.includes('pattern') || error.message.includes('Invalid URL')) {
            errorMessage = 'API URL 格式錯誤！請在 script.js 中將 YOUR_WORKER_URL_HERE 替換為您的 Cloudflare Worker URL（例如：https://fitcircle-api.youraccount.workers.dev）';
        }
        
        errorDiv.textContent = errorMessage;
        console.error('登入錯誤:', error);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = '登入';
    }
}

// Show App
function showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-root').classList.add('active');
    switchRole('admin');
}

// Role Switcher
function switchRole(role) {
    currentRole = role;
    
    // Update role buttons
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event?.target?.classList.add('active') || 
    document.querySelectorAll('.role-btn')[role === 'admin' ? 0 : role === 'coach' ? 1 : 2]?.classList.add('active');

    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Hide all tabs
    document.querySelectorAll('.tabs').forEach(tabs => {
        tabs.style.display = 'none';
    });

    // Show appropriate screens based on role
    if (role === 'admin') {
        document.getElementById('admin-tabs').style.display = 'flex';
        openScreen('admin-dashboard');
        loadAdminDashboard();
    } else if (role === 'coach') {
        document.getElementById('coach-tabs').style.display = 'flex';
        openScreen('coach-dashboard');
        loadCoachDashboard();
    } else if (role === 'student') {
        openScreen('student-home');
    }
}

// Screen Navigation
function openScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    // Update tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Update active tab based on screen
    if (screenId === 'admin-dashboard') {
        document.querySelectorAll('#admin-tabs .tab')[0]?.classList.add('active');
    } else if (screenId === 'admin-coaches') {
        document.querySelectorAll('#admin-tabs .tab')[1]?.classList.add('active');
        loadCoaches();
    } else if (screenId === 'admin-students') {
        document.querySelectorAll('#admin-tabs .tab')[2]?.classList.add('active');
        loadStudents();
    } else if (screenId === 'admin-leaves') {
        document.querySelectorAll('#admin-tabs .tab')[3]?.classList.add('active');
        loadLeaveRequests();
    } else if (screenId === 'coach-dashboard') {
        document.querySelectorAll('#coach-tabs .tab')[0]?.classList.add('active');
        loadCoachDashboard();
    } else if (screenId === 'coach-classes') {
        document.querySelectorAll('#coach-tabs .tab')[1]?.classList.add('active');
        loadCoachClasses();
    } else if (screenId === 'coach-students') {
        document.querySelectorAll('#coach-tabs .tab')[2]?.classList.add('active');
        loadCoachStudents();
    } else if (screenId === 'coach-leaves') {
        document.querySelectorAll('#coach-tabs .tab')[3]?.classList.add('active');
        loadCoachLeaves();
    } else if (screenId === 'coach-payments') {
        document.querySelectorAll('#coach-tabs .tab')[4]?.classList.add('active');
        loadCoachPayments();
    } else if (screenId === 'coach-smartchat') {
        document.querySelectorAll('#coach-tabs .tab')[5]?.classList.add('active');
    }
}

// API Helper
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (window._fitcircleToken) {
        headers['Authorization'] = `Bearer ${window._fitcircleToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

// Admin Dashboard
async function loadAdminDashboard() {
    try {
        const data = await apiCall('/api/admin/overview');
        
        document.getElementById('stat-coaches').textContent = data.coaches || 0;
        document.getElementById('stat-students').textContent = data.students || 0;
        document.getElementById('stat-classes').textContent = data.classes || 0;
        document.getElementById('stat-pending-leaves').textContent = data.pendingLeaves || 0;
        document.getElementById('stat-total-payments').textContent = 
            data.totalPayments ? `NT$ ${data.totalPayments.toLocaleString()}` : 'NT$ 0';
    } catch (error) {
        console.error('Failed to load admin overview:', error);
        alert('載入總覽資料失敗: ' + error.message);
    }
}

// Coaches Management
async function loadCoaches() {
    const tbody = document.getElementById('coaches-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">載入中...</td></tr>';

    try {
        const coaches = await apiCall('/api/admin/coaches');
        
        if (coaches.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">尚無教練資料</td></tr>';
            return;
        }

        tbody.innerHTML = coaches.map(coach => `
            <tr>
                <td>${coach.id}</td>
                <td>${coach.name || '-'}</td>
                <td>${coach.email || '-'}</td>
                <td>${coach.phone || '-'}</td>
                <td>${coach.line_id || '-'}</td>
                <td>${coach.active ? '啟用' : '停用'}</td>
                <td>${coach.created_at || '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load coaches:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">載入失敗: ' + error.message + '</td></tr>';
    }
}

function openCreateCoachModal() {
    document.getElementById('create-coach-modal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    if (modalId === 'create-coach-modal') {
        document.getElementById('create-coach-form').reset();
    } else if (modalId === 'create-student-modal') {
        document.getElementById('create-student-form').reset();
    }
}

async function handleCreateCoach(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email') || null,
        phone: formData.get('phone') || null,
        line_id: formData.get('line_id') || null,
    };

    try {
        await apiCall('/api/admin/coaches', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        closeModal('create-coach-modal');
        loadCoaches();
        loadAdminDashboard(); // Refresh stats
    } catch (error) {
        alert('新增教練失敗: ' + error.message);
    }
}

// Students Management
async function loadStudents() {
    const tbody = document.getElementById('students-tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">載入中...</td></tr>';

    try {
        const students = await apiCall('/api/admin/students');
        
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">尚無學生資料</td></tr>';
            return;
        }

        tbody.innerHTML = students.map(student => `
            <tr>
                <td>${student.id}</td>
                <td>${student.name || '-'}</td>
                <td>${student.email || '-'}</td>
                <td>${student.phone || '-'}</td>
                <td>${student.line_id || '-'}</td>
                <td>${student.created_at || '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load students:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">載入失敗: ' + error.message + '</td></tr>';
    }
}

function openCreateStudentModal() {
    document.getElementById('create-student-modal').classList.add('active');
}

async function handleCreateStudent(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email') || null,
        phone: formData.get('phone') || null,
        line_id: formData.get('line_id') || null,
    };

    try {
        await apiCall('/api/admin/students', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        closeModal('create-student-modal');
        loadStudents();
        loadAdminDashboard(); // Refresh stats
    } catch (error) {
        alert('新增學生失敗: ' + error.message);
    }
}

// Leave Requests Management
async function loadLeaveRequests() {
    const tbody = document.getElementById('leaves-tbody');
    tbody.innerHTML = '<tr><td colspan="9" class="loading">載入中...</td></tr>';

    try {
        const leaves = await apiCall('/api/leave-requests?status=pending');
        
        if (leaves.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-state">尚無待處理請假</td></tr>';
            return;
        }

        tbody.innerHTML = leaves.map(leave => `
            <tr>
                <td>${leave.id}</td>
                <td>${leave.student_name || '-'}</td>
                <td>${leave.class_name || '-'}</td>
                <td>${leave.type === 'leave' ? '請假' : '改期'}</td>
                <td>${leave.lesson_date || '-'}</td>
                <td>${leave.new_lesson_date || '-'}</td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 4px; background: #ffc107; color: #000;">
                        ${leave.status === 'pending' ? '待處理' : leave.status === 'accepted' ? '已接受' : '已拒絕'}
                    </span>
                </td>
                <td>${leave.reason_student || '-'}</td>
                <td>
                    <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; margin-right: 5px;" 
                            onclick="handleLeaveDecision(${leave.id}, 'accept')">接受</button>
                    <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;" 
                            onclick="handleLeaveDecision(${leave.id}, 'reject')">拒絕</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load leave requests:', error);
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">載入失敗: ' + error.message + '</td></tr>';
    }
}

async function handleLeaveDecision(leaveId, decision) {
    const reason = prompt(`請輸入${decision === 'accept' ? '接受' : '拒絕'}理由（選填）:`);
    
    try {
        await apiCall(`/api/leave-requests/${leaveId}/decision`, {
            method: 'POST',
            body: JSON.stringify({
                decision,
                reason_coach: reason || null,
            }),
        });

        alert(`已${decision === 'accept' ? '接受' : '拒絕'}請假申請`);
        loadLeaveRequests();
        loadAdminDashboard(); // Refresh stats
    } catch (error) {
        alert('處理請假申請失敗: ' + error.message);
    }
}

// ==================== Coach Functions ====================

// Coach Dashboard
async function loadCoachDashboard() {
    try {
        // 載入課程列表以計算統計
        const classes = await apiCall('/api/classes');
        const students = await apiCall('/api/admin/students');
        const leaves = await apiCall('/api/leave-requests?status=pending');

        // 計算教練的課程數（目前顯示所有課程，未來可以根據登入的教練 ID 過濾）
        document.getElementById('coach-stat-classes').textContent = classes.length || 0;
        document.getElementById('coach-stat-students').textContent = students.length || 0;
        document.getElementById('coach-stat-pending-leaves').textContent = leaves.length || 0;
        
        // 計算總收入（從所有學生的付款中計算）
        let totalPayments = 0;
        let paymentCount = 0;
        for (const student of students) {
            try {
                const studentPayments = await apiCall(`/api/students/${student.id}/payments`);
                const studentTotal = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                totalPayments += studentTotal;
                paymentCount += studentPayments.length;
            } catch (e) {
                // 忽略個別錯誤
            }
        }
        document.getElementById('coach-stat-total-payments').textContent = 
            totalPayments > 0 ? `NT$ ${totalPayments.toLocaleString()}` : 'NT$ 0';
    } catch (error) {
        console.error('Failed to load coach dashboard:', error);
        document.getElementById('coach-stat-classes').textContent = '-';
        document.getElementById('coach-stat-students').textContent = '-';
        document.getElementById('coach-stat-pending-leaves').textContent = '-';
        document.getElementById('coach-stat-total-payments').textContent = '-';
    }
}

// Coach Classes
async function loadCoachClasses() {
    const tbody = document.getElementById('coach-classes-tbody');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">載入中...</td></tr>';

    try {
        const classes = await apiCall('/api/classes');
        
        if (classes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-state">尚無課程資料</td></tr>';
            return;
        }

        tbody.innerHTML = classes.map(cls => `
            <tr>
                <td>${cls.id}</td>
                <td>${cls.name || '-'}</td>
                <td>${cls.location || '-'}</td>
                <td>${cls.schedule_text || '-'}</td>
                <td>${cls.capacity || '-'}</td>
                <td>${cls.term_price ? `NT$ ${cls.term_price.toLocaleString()}` : '-'}</td>
                <td>${cls.term_classes || '-'}</td>
                <td>${cls.dropin_price ? `NT$ ${cls.dropin_price.toLocaleString()}` : '-'}</td>
                <td>
                    <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; margin-right: 5px;" 
                            onclick="openEditClassModal(${cls.id})">編輯</button>
                    <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;" 
                            onclick="deleteClass(${cls.id}, '${cls.name || ''}')">刪除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load coach classes:', error);
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">載入失敗: ' + error.message + '</td></tr>';
    }
}

// Coach Students
let allStudentsData = []; // 儲存所有學生資料供搜尋使用

async function loadCoachStudents() {
    const tbody = document.getElementById('coach-students-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">載入中...</td></tr>';

    try {
        const students = await apiCall('/api/admin/students');
        const classes = await apiCall('/api/classes');
        
        allStudentsData = students; // 儲存供搜尋使用
        
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">尚無學生資料</td></tr>';
            return;
        }

        // 簡單顯示所有學生（未來可以根據課程過濾）
        displayStudents(students, classes);
    } catch (error) {
        console.error('Failed to load coach students:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">載入失敗: ' + error.message + '</td></tr>';
    }
}

function displayStudents(students, classes) {
    const tbody = document.getElementById('coach-students-tbody');
    tbody.innerHTML = students.map(student => {
        // 找出學生報名的課程（簡化版，未來可以從 enrollments 表查詢）
        const studentClasses = classes.filter(c => true).map(c => c.name).join(', ') || '-';
        
        return `
            <tr>
                <td>${student.id}</td>
                <td>${student.name || '-'}</td>
                <td>${student.email || '-'}</td>
                <td>${student.phone || '-'}</td>
                <td>${student.line_id || '-'}</td>
                <td>${studentClasses}</td>
                <td>
                    <button class="btn-primary" style="padding: 6px 12px; font-size: 12px;" 
                            onclick="viewStudentDetail(${student.id})">詳情</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterStudents() {
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    if (!searchTerm) {
        // 如果搜尋框為空，重新載入所有學生
        loadCoachStudents();
        return;
    }
    
    const filtered = allStudentsData.filter(student => 
        (student.name && student.name.toLowerCase().includes(searchTerm)) ||
        (student.email && student.email.toLowerCase().includes(searchTerm)) ||
        (student.phone && student.phone.includes(searchTerm))
    );
    
    // 重新取得課程資料以顯示
    apiCall('/api/classes').then(classes => {
        displayStudents(filtered, classes);
    }).catch(() => {
        displayStudents(filtered, []);
    });
}

async function viewStudentDetail(studentId) {
    try {
        const student = allStudentsData.find(s => s.id === studentId);
        if (!student) {
            alert('找不到學生資料');
            return;
        }
        
        // 取得學生的付款紀錄
        const payments = await apiCall(`/api/students/${studentId}/payments`);
        const leaves = await apiCall('/api/leave-requests');
        const studentLeaves = leaves.filter(l => l.student_id === studentId);
        
        // 顯示學生詳情
        const detail = `
學生詳情
========
姓名：${student.name || '-'}
Email：${student.email || '-'}
電話：${student.phone || '-'}
LINE ID：${student.line_id || '-'}

付款紀錄（共 ${payments.length} 筆）：
${payments.length > 0 ? payments.map(p => `- ${p.paid_at} | NT$ ${p.amount.toLocaleString()} | ${p.class_name || '一般付款'}`).join('\n') : '尚無付款紀錄'}

請假紀錄（共 ${studentLeaves.length} 筆）：
${studentLeaves.length > 0 ? studentLeaves.map(l => `- ${l.lesson_date} | ${l.type === 'leave' ? '請假' : '改期'} | ${l.status}`).join('\n') : '尚無請假紀錄'}
        `;
        
        alert(detail);
    } catch (error) {
        alert('載入學生詳情失敗: ' + error.message);
    }
}

// Coach Leaves
async function loadCoachLeaves() {
    const tbody = document.getElementById('coach-leaves-tbody');
    tbody.innerHTML = '<tr><td colspan="9" class="loading">載入中...</td></tr>';

    try {
        const statusFilter = document.getElementById('leave-filter-status')?.value || '';
        const endpoint = statusFilter ? `/api/leave-requests?status=${statusFilter}` : '/api/leave-requests';
        const leaves = await apiCall(endpoint);
        
        if (leaves.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-state">尚無待處理請假</td></tr>';
            return;
        }

        tbody.innerHTML = leaves.map(leave => `
            <tr>
                <td>${leave.id}</td>
                <td>${leave.student_name || '-'}</td>
                <td>${leave.class_name || '-'}</td>
                <td>${leave.type === 'leave' ? '請假' : '改期'}</td>
                <td>${leave.lesson_date || '-'}</td>
                <td>${leave.new_lesson_date || '-'}</td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 4px; background: #ffc107; color: #000;">
                        ${leave.status === 'pending' ? '待處理' : leave.status === 'accepted' ? '已接受' : '已拒絕'}
                    </span>
                </td>
                <td>${leave.reason_student || '-'}</td>
                <td>
                    ${leave.status === 'pending' ? `
                        <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; margin-right: 5px;" 
                                onclick="handleCoachLeaveDecision(${leave.id}, 'accept')">接受</button>
                        <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;" 
                                onclick="handleCoachLeaveDecision(${leave.id}, 'reject')">拒絕</button>
                    ` : `
                        <span style="color: #666; font-size: 12px;">${leave.reason_coach || '-'}</span>
                    `}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load coach leaves:', error);
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">載入失敗: ' + error.message + '</td></tr>';
    }
}

async function handleCoachLeaveDecision(leaveId, decision) {
    const reason = prompt(`請輸入${decision === 'accept' ? '接受' : '拒絕'}理由（選填）:`);
    
    try {
        await apiCall(`/api/leave-requests/${leaveId}/decision`, {
            method: 'POST',
            body: JSON.stringify({
                decision,
                reason_coach: reason || null,
            }),
        });

        alert(`已${decision === 'accept' ? '接受' : '拒絕'}請假申請`);
        loadCoachLeaves();
        loadCoachDashboard(); // Refresh stats
    } catch (error) {
        alert('處理請假申請失敗: ' + error.message);
    }
}

// Coach Payments
async function loadCoachPayments() {
    const tbody = document.getElementById('coach-payments-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">載入中...</td></tr>';

    try {
        const students = await apiCall('/api/admin/students');
        
        // 收集所有學生的付款紀錄
        let allPayments = [];
        let totalAmount = 0;
        
        for (const student of students) {
            try {
                const payments = await apiCall(`/api/students/${student.id}/payments`);
                payments.forEach(p => {
                    allPayments.push({
                        ...p,
                        student_name: student.name
                    });
                    totalAmount += p.amount || 0;
                });
            } catch (e) {
                // 忽略個別錯誤
            }
        }

        // 日期過濾
        const startDate = document.getElementById('payment-filter-start')?.value;
        const endDate = document.getElementById('payment-filter-end')?.value;
        
        if (startDate || endDate) {
            allPayments = allPayments.filter(p => {
                const paidDate = new Date(p.paid_at);
                if (startDate && paidDate < new Date(startDate)) return false;
                if (endDate && paidDate > new Date(endDate)) return false;
                return true;
            });
            // 重新計算總計
            totalAmount = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        }

        // 按日期排序（最新的在前）
        allPayments.sort((a, b) => {
            const dateA = new Date(a.paid_at || 0);
            const dateB = new Date(b.paid_at || 0);
            return dateB - dateA;
        });

        if (allPayments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">尚無付款紀錄</td></tr>';
            return;
        }

        // 顯示總計
        const summaryRow = `
            <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="3">總計</td>
                <td>NT$ ${totalAmount.toLocaleString()}</td>
                <td colspan="3">共 ${allPayments.length} 筆</td>
            </tr>
        `;

        tbody.innerHTML = summaryRow + allPayments.map(payment => `
            <tr>
                <td>${payment.id}</td>
                <td>${payment.student_name || '-'}</td>
                <td>${payment.class_name || '一般付款'}</td>
                <td>NT$ ${(payment.amount || 0).toLocaleString()}</td>
                <td>${payment.paid_at || '-'}</td>
                <td>${payment.channel || '-'}</td>
                <td>${payment.note || '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to load coach payments:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">載入失敗: ' + error.message + '</td></tr>';
    }
}

// Create Class
function openCreateClassModal() {
    // 載入教練列表供選擇
    loadCoachesForClassModal();
    document.getElementById('create-class-modal').classList.add('active');
}

async function loadCoachesForClassModal() {
    try {
        const coaches = await apiCall('/api/admin/coaches');
        const coachSelect = document.getElementById('class-coach-select');
        if (coachSelect) {
            coachSelect.innerHTML = '<option value="">請選擇教練</option>' + 
                coaches.map(c => `<option value="${c.id}">${c.name || `教練 ${c.id}`}</option>`).join('');
        }
    } catch (error) {
        console.error('Failed to load coaches:', error);
    }
}

async function handleCreateClass(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // 取得教練 ID
    const coachId = formData.get('coach_id');
    if (!coachId) {
        alert('請選擇教練');
        return;
    }

    const data = {
        coach_id: parseInt(coachId),
        name: formData.get('name'),
        location: formData.get('location') || null,
        schedule_text: formData.get('schedule_text') || null,
        capacity: formData.get('capacity') ? parseInt(formData.get('capacity')) : null,
        term_price: formData.get('term_price') ? parseInt(formData.get('term_price')) : null,
        term_classes: formData.get('term_classes') ? parseInt(formData.get('term_classes')) : null,
        dropin_price: formData.get('dropin_price') ? parseInt(formData.get('dropin_price')) : null,
        rule_no_leave: formData.get('rule_no_leave') === 'on' ? true : false,
        rule_allow_delay: formData.get('rule_allow_delay') === 'on' ? true : false,
        rule_allow_dropin: formData.get('rule_allow_dropin') === 'on' ? true : false,
    };

    try {
        await apiCall('/api/classes', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        closeModal('create-class-modal');
        document.getElementById('create-class-form').reset();
        loadCoachClasses();
        loadCoachDashboard(); // Refresh stats
    } catch (error) {
        alert('新增課程失敗: ' + error.message);
    }
}

// Edit Class
async function openEditClassModal(classId) {
    try {
        const classes = await apiCall('/api/classes');
        const classData = classes.find(c => c.id === classId);
        
        if (!classData) {
            alert('找不到課程資料');
            return;
        }
        
        // 載入教練列表
        await loadCoachesForClassModal();
        
        // 填入表單
        document.getElementById('edit-class-id').value = classData.id;
        document.getElementById('edit-class-coach-select').value = classData.coach_id;
        document.getElementById('edit-class-name').value = classData.name || '';
        document.getElementById('edit-class-location').value = classData.location || '';
        document.getElementById('edit-class-schedule').value = classData.schedule_text || '';
        document.getElementById('edit-class-capacity').value = classData.capacity || '';
        document.getElementById('edit-class-term-price').value = classData.term_price || '';
        document.getElementById('edit-class-term-classes').value = classData.term_classes || '';
        document.getElementById('edit-class-dropin-price').value = classData.dropin_price || '';
        document.getElementById('edit-class-rule-no-leave').checked = classData.rule_no_leave === true || classData.rule_no_leave === 1;
        document.getElementById('edit-class-rule-allow-delay').checked = classData.rule_allow_delay === true || classData.rule_allow_delay === 1;
        document.getElementById('edit-class-rule-allow-dropin').checked = classData.rule_allow_dropin === true || classData.rule_allow_dropin === 1;
        
        document.getElementById('edit-class-modal').classList.add('active');
    } catch (error) {
        alert('載入課程資料失敗: ' + error.message);
    }
}

async function handleUpdateClass(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const classId = parseInt(formData.get('class_id'));
    
    const data = {
        coach_id: parseInt(formData.get('coach_id')),
        name: formData.get('name'),
        location: formData.get('location') || null,
        schedule_text: formData.get('schedule_text') || null,
        capacity: formData.get('capacity') ? parseInt(formData.get('capacity')) : null,
        term_price: formData.get('term_price') ? parseInt(formData.get('term_price')) : null,
        term_classes: formData.get('term_classes') ? parseInt(formData.get('term_classes')) : null,
        dropin_price: formData.get('dropin_price') ? parseInt(formData.get('dropin_price')) : null,
        rule_no_leave: formData.get('rule_no_leave') === 'on' ? true : false,
        rule_allow_delay: formData.get('rule_allow_delay') === 'on' ? true : false,
        rule_allow_dropin: formData.get('rule_allow_dropin') === 'on' ? true : false,
    };

    try {
        await apiCall(`/api/classes/${classId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        alert('課程已更新');
        closeModal('edit-class-modal');
        loadCoachClasses();
        loadCoachDashboard();
    } catch (error) {
        alert('更新課程失敗: ' + error.message);
    }
}

async function deleteClass(classId, className) {
    if (!confirm(`確定要刪除課程「${className}」嗎？此操作無法復原。`)) {
        return;
    }
    
    try {
        await apiCall(`/api/classes/${classId}`, {
            method: 'DELETE',
        });

        alert('課程已刪除');
        loadCoachClasses();
        loadCoachDashboard();
    } catch (error) {
        alert('刪除課程失敗: ' + error.message);
    }
}

// Make functions available globally
window.switchRole = switchRole;
window.openScreen = openScreen;
window.openCreateCoachModal = openCreateCoachModal;
window.openCreateStudentModal = openCreateStudentModal;
window.openCreateClassModal = openCreateClassModal;
window.openEditClassModal = openEditClassModal;
window.closeModal = closeModal;
window.handleCreateCoach = handleCreateCoach;
window.handleCreateStudent = handleCreateStudent;
window.handleCreateClass = handleCreateClass;
window.handleUpdateClass = handleUpdateClass;
window.deleteClass = deleteClass;
window.handleLeaveDecision = handleLeaveDecision;
window.handleCoachLeaveDecision = handleCoachLeaveDecision;
window.viewStudentDetail = viewStudentDetail;
window.filterStudents = filterStudents;

