// FitCircle SmartChat MVP - Frontend JavaScript
// 請將 API_BASE 替換為您的 Cloudflare Worker URL

const API_BASE = 'fircircle-backend1.wangserena1960.workers.dev'; // 例如: https://fitcircle-api.youraccount.workers.dev

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
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '登入失敗');
        }

        // Store token and user
        window._fitcircleToken = data.token;
        currentUser = data.user;
        localStorage.setItem('fitcircle_token', data.token);
        localStorage.setItem('fitcircle_user', JSON.stringify(data.user));

        // Show app
        showApp();
    } catch (error) {
        errorDiv.textContent = error.message;
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
        openScreen('coach-dashboard');
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
        document.querySelectorAll('.tab')[0]?.classList.add('active');
    } else if (screenId === 'admin-coaches') {
        document.querySelectorAll('.tab')[1]?.classList.add('active');
        loadCoaches();
    } else if (screenId === 'admin-students') {
        document.querySelectorAll('.tab')[2]?.classList.add('active');
        loadStudents();
    } else if (screenId === 'admin-leaves') {
        document.querySelectorAll('.tab')[3]?.classList.add('active');
        loadLeaveRequests();
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

// Make functions available globally
window.switchRole = switchRole;
window.openScreen = openScreen;
window.openCreateCoachModal = openCreateCoachModal;
window.openCreateStudentModal = openCreateStudentModal;
window.closeModal = closeModal;
window.handleCreateCoach = handleCreateCoach;
window.handleCreateStudent = handleCreateStudent;
window.handleLeaveDecision = handleLeaveDecision;

