import { createContext, useContext, useState, useCallback } from 'react'

const vi = {
  // Header
  'search': 'Tìm bảng, thẻ, không gian…',
  'notifications': 'Thông báo',
  'profile': 'Hồ sơ',
  'activity': 'Hoạt động',
  'settings': 'Cài đặt',
  'logout': 'Đăng xuất',
  'login': 'Đăng nhập',
  'register': 'Tạo tài khoản',
  'role': 'Vai trò',
  // Sidebar
  'menu': 'Menu',
  'my_boards': 'Bảng của tôi',
  'admin': 'Quản trị viên',
  'templates': 'Mẫu có sẵn',
  'home_feed': 'Luồng trang chủ',
  'personal_team': 'Cá nhân & Nhóm',
  'skills_profile': 'Kỹ năng & Hồ sơ',
  'evaluations': 'Đánh giá năng lực',
  'org_management': 'Quản lý Tổ chức',
  'workspaces': 'Không gian',
  'open_kanban': 'Mở bảng Kanban',
  'members': 'Thành viên',
  'workspace_settings': 'Cài đặt không gian',
  'explore': 'Khám phá',
  // Dashboard
  'hello': 'Xin chào 👋',
  'manage_projects': 'Quản lý tất cả dự án của bạn tại một nơi — từ dự án lẻ đến không gian tổ chức.',
  'personal_space': 'Không gian cá nhân',
  'personal_space_desc': 'Các project lẻ, không thuộc tổ chức.',
  'org_space': 'Không gian tổ chức',
  'org_space_desc': 'Các project thuộc về doanh nghiệp/tổ chức.',
  'no_org_yet': 'Bạn chưa thuộc tổ chức nào.',
  'create_project': 'Tạo dự án mới',
  'project_name': 'Tên dự án',
  'project_desc': 'Mô tả',
  'team_name': 'Tên nhóm (tự động tạo cùng project)',
  'cancel': 'Hủy',
  'creating': 'Đang tạo...',
  'create': 'Tạo dự án',
  'loading_projects': 'Đang tải dự án...',
  'my_tasks': 'Các Task Của Tôi',
  'todo': 'Chưa làm',
  'in_progress': 'Đang làm',
  'done': 'Hoàn tất',
  'review': 'Chờ duyệt',
  'no_tasks': 'Chưa có task nào.',
  // Board
  'loading_board': 'Đang tải bảng...',
  'dep_graph': 'Sơ đồ phụ thuộc',
  'ai_advice': 'AI Tư vấn',
  'create_task': 'Tạo Task',
  'predict_risk': 'Dự đoán Rủi ro',
  // Team
  'team_management': 'Quản lý Đội ngũ 👥',
  'team_desc': 'Xây dựng cấu trúc phòng ban và mời nhân sự tham gia vào không gian của bạn.',
  'team_list': 'DANH SÁCH NHÓM',
  'team_members': 'Thành viên Nhóm',
  'full_name': 'Họ và Tên',
  'role_label': 'Vai trò',
  'actions': 'Hành động',
  'evaluate': 'ĐÁNH GIÁ',
  'kick': 'KÍCH RA',
  'no_members': 'CHƯA CÓ THÀNH VIÊN',
  'invite_title': 'Gửi lời mời Nhân sự 📧',
  'invite_desc': 'Mời đồng nghiệp tham gia trực tiếp vào dự án.',
  'invite_placeholder': 'Nhập email nhân viên...',
  'send_invite': 'GỬI LỜI MỜI',
  // Notifications
  'mark_all_read': 'Đánh dấu tất cả đã đọc',
  'no_notifications': 'Chưa có thông báo mới.',
  'new_notif': 'mới',
  // Feed
  'feed_title': 'Luồng Hoạt động ⚡',
  'feed_desc': 'Theo dõi mọi thay đổi và tương tác trên toàn hệ thống trong thời gian thực.',
  'no_activity': 'Chưa có hoạt động nào được ghi nhận.',
  // Theme
  'dark_mode': 'Chế độ tối',
  'light_mode': 'Chế độ sáng',
  // Task View
  'task_detail': 'Chi tiết Task',
  'suggest_assignee': '🤖 AI Gợi ý người nhận',
  'no_assignee': 'Chưa có ai được gán',
  'comment': 'Bình luận',
}

const en = {
  'search': 'Search boards, cards, spaces…',
  'notifications': 'Notifications',
  'profile': 'Profile',
  'activity': 'Activity',
  'settings': 'Settings',
  'logout': 'Logout',
  'login': 'Login',
  'register': 'Create account',
  'role': 'Role',
  'menu': 'Menu',
  'my_boards': 'My Boards',
  'admin': 'Admin',
  'templates': 'Templates',
  'home_feed': 'Home Feed',
  'personal_team': 'Personal & Team',
  'skills_profile': 'Skills & Profile',
  'evaluations': 'Evaluations',
  'org_management': 'Org Management',
  'workspaces': 'Workspaces',
  'open_kanban': 'Open Kanban Board',
  'members': 'Members',
  'workspace_settings': 'Workspace Settings',
  'explore': 'Explore',
  'hello': 'Hello 👋',
  'manage_projects': 'Manage all your projects in one place — from solo projects to organization spaces.',
  'personal_space': 'Personal Space',
  'personal_space_desc': 'Solo projects, not part of any organization.',
  'org_space': 'Organization Space',
  'org_space_desc': 'Projects belonging to your organization.',
  'no_org_yet': 'You don\'t belong to any organization yet.',
  'create_project': 'Create New Project',
  'project_name': 'Project Name',
  'project_desc': 'Description',
  'team_name': 'Team Name (auto-created with project)',
  'cancel': 'Cancel',
  'creating': 'Creating...',
  'create': 'Create Project',
  'loading_projects': 'Loading projects...',
  'my_tasks': 'My Tasks',
  'todo': 'To Do',
  'in_progress': 'In Progress',
  'done': 'Done',
  'review': 'Review',
  'no_tasks': 'No tasks yet.',
  'loading_board': 'Loading board...',
  'dep_graph': 'Dependency Graph',
  'ai_advice': 'AI Advice',
  'create_task': 'Create Task',
  'predict_risk': 'Predict Risk',
  'team_management': 'Team Management 👥',
  'team_desc': 'Build your team structure and invite members to your workspace.',
  'team_list': 'TEAM LIST',
  'team_members': 'Team Members',
  'full_name': 'Full Name',
  'role_label': 'Role',
  'actions': 'Actions',
  'evaluate': 'EVALUATE',
  'kick': 'REMOVE',
  'no_members': 'NO MEMBERS YET',
  'invite_title': 'Send Invitation 📧',
  'invite_desc': 'Invite colleagues directly to your project.',
  'invite_placeholder': 'Enter employee email...',
  'send_invite': 'SEND INVITE',
  'mark_all_read': 'Mark all as read',
  'no_notifications': 'No new notifications.',
  'new_notif': 'new',
  'feed_title': 'Activity Feed ⚡',
  'feed_desc': 'Track all changes and interactions across the system in real-time.',
  'no_activity': 'No activity recorded yet.',
  'dark_mode': 'Dark Mode',
  'light_mode': 'Light Mode',
  'task_detail': 'Task Detail',
  'suggest_assignee': '🤖 AI Suggest Assignee',
  'no_assignee': 'No one assigned yet',
  'comment': 'Comment',
}

const translations = { vi, en }

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('taskgenie_lang') || 'vi'
  })

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations['vi']?.[key] || key
  }, [lang])

  const switchLang = (newLang) => {
    setLang(newLang)
    localStorage.setItem('taskgenie_lang', newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
