-- =========================================
-- 1. CREATE DATABASE
-- =========================================
IF DB_ID('ai_task_management') IS NOT NULL
    DROP DATABASE ai_task_management;
GO

CREATE DATABASE ai_task_management;
GO

USE ai_task_management;
GO

-- =========================================
-- 2. USERS
-- =========================================
CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(MAX) NOT NULL,
    avatar NVARCHAR(MAX),
    role NVARCHAR(20) CHECK (role IN ('ADMIN','LEADER','MEMBER')) DEFAULT 'MEMBER',

    status INT DEFAULT 1 CHECK (status IN (0,1)),
    deleted_at DATETIME,

    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME
);

-- =========================================
-- TRIGGER USER STATUS
-- =========================================
GO
CREATE TRIGGER trg_user_status
ON users
AFTER UPDATE
AS
BEGIN
    UPDATE u
    SET deleted_at = CASE 
        WHEN i.status = 0 THEN GETDATE()
        WHEN i.status = 1 THEN NULL
    END
    FROM users u
    JOIN inserted i ON u.user_id = i.user_id;
END;
GO

-- =========================================
-- 3. SKILLS
-- =========================================
CREATE TABLE skills (
    skill_id INT IDENTITY(1,1) PRIMARY KEY,
    skill_name NVARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_skills (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(user_id),
    skill_id INT FOREIGN KEY REFERENCES skills(skill_id),
    level INT CHECK (level BETWEEN 1 AND 5),
    UNIQUE(user_id, skill_id)
);

-- =========================================
-- 4. USER AVAILABILITY
-- =========================================
CREATE TABLE user_availability (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(user_id),
    day_of_week INT,
    available_hours INT
);

-- =========================================
-- 5. EVALUATIONS
-- =========================================
CREATE TABLE evaluations (
    evaluation_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(user_id),
    leader_id INT FOREIGN KEY REFERENCES users(user_id),
    skill_score INT,
    teamwork_score INT,
    communication_score INT,
    deadline_score INT,
    created_at DATETIME DEFAULT GETDATE()
);

-- =========================================
-- 6. TEAM
-- =========================================
CREATE TABLE teams (
    team_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255),
    description NVARCHAR(MAX),
    created_by INT FOREIGN KEY REFERENCES users(user_id)
);

CREATE TABLE team_members (
    id INT IDENTITY(1,1) PRIMARY KEY,
    team_id INT FOREIGN KEY REFERENCES teams(team_id),
    user_id INT FOREIGN KEY REFERENCES users(user_id),
    role NVARCHAR(20),
    UNIQUE(team_id, user_id)
);

CREATE TABLE invitations (
    invitation_id INT IDENTITY(1,1) PRIMARY KEY,
    team_id INT FOREIGN KEY REFERENCES teams(team_id),
    email NVARCHAR(255),
    status NVARCHAR(20)
);

-- =========================================
-- 7. PROJECT
-- =========================================
CREATE TABLE projects (
    project_id INT IDENTITY(1,1) PRIMARY KEY,
    team_id INT FOREIGN KEY REFERENCES teams(team_id),
    name NVARCHAR(255),
    description NVARCHAR(MAX),
    status NVARCHAR(20),
    deadline DATE
);

-- =========================================
-- 8. TASK
-- =========================================
CREATE TABLE tasks (
    task_id INT IDENTITY(1,1) PRIMARY KEY,
    project_id INT FOREIGN KEY REFERENCES projects(project_id),
    title NVARCHAR(255),
    description NVARCHAR(MAX),
    priority NVARCHAR(10),
    status NVARCHAR(20),
    deadline DATE,
    estimated_time INT,
    difficulty INT,
    created_by INT FOREIGN KEY REFERENCES users(user_id),
    created_at DATETIME DEFAULT GETDATE(),
    version INT DEFAULT 1
);

CREATE TABLE task_versions (
    version_id INT IDENTITY(1,1) PRIMARY KEY,
    task_id INT FOREIGN KEY REFERENCES tasks(task_id),
    title NVARCHAR(255),
    description NVARCHAR(MAX),
    priority NVARCHAR(10),
    status NVARCHAR(20),
    version INT,
    updated_by INT FOREIGN KEY REFERENCES users(user_id),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE task_assignees (
    id INT IDENTITY(1,1) PRIMARY KEY,
    task_id INT FOREIGN KEY REFERENCES tasks(task_id),
    user_id INT FOREIGN KEY REFERENCES users(user_id),
    UNIQUE(task_id, user_id)
);

CREATE TABLE task_comments (
    comment_id INT IDENTITY(1,1) PRIMARY KEY,
    task_id INT FOREIGN KEY REFERENCES tasks(task_id),
    user_id INT FOREIGN KEY REFERENCES users(user_id),
    content NVARCHAR(MAX)
);

-- =========================================
-- 9. AI + LOG
-- =========================================
CREATE TABLE ai_recommendations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    task_id INT FOREIGN KEY REFERENCES tasks(task_id),
    suggested_user_id INT FOREIGN KEY REFERENCES users(user_id),
    score FLOAT,
    reason NVARCHAR(MAX)
);

CREATE TABLE activity_logs (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    action NVARCHAR(MAX),
    entity_type NVARCHAR(50),
    entity_id INT,
    created_at DATETIME DEFAULT GETDATE()
);

-- =========================================
-- TRIGGER TASK
-- =========================================
GO
CREATE TRIGGER trg_task_update
ON tasks
AFTER UPDATE
AS
BEGIN
    -- Lưu version cũ
    INSERT INTO task_versions (task_id, title, description, priority, status, version, updated_by)
    SELECT d.task_id, d.title, d.description, d.priority, d.status, d.version, d.created_by
    FROM deleted d;

    -- Tăng version (FIX ambiguous)
    UPDATE t
    SET t.version = t.version + 1
    FROM tasks t
    JOIN inserted i ON t.task_id = i.task_id;

    -- Log
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
    SELECT d.created_by, 'UPDATE_TASK', 'TASK', d.task_id
    FROM deleted d;
END;
GO

-- =========================================
-- ========== INSERT DATA (ALL AT END) ======
-- =========================================

-- USERS
INSERT INTO users (name, email, password, role) VALUES
(N'Admin', 'admin@gmail.com', '123', 'ADMIN'),
(N'Minh', 'minh@gmail.com', '123', 'LEADER'),
(N'Long', 'long@gmail.com', '123', 'MEMBER'),
(N'An', 'an@gmail.com', '123', 'MEMBER');

-- SKILLS
INSERT INTO skills (skill_name) VALUES
(N'Java'), (N'React'), (N'SQL'), (N'NodeJS');

-- USER SKILLS (FIX: bỏ DEFAULT)
INSERT INTO user_skills (user_id, skill_id, level) VALUES
(2, 2, 4),
(3, 2, 2),
(4, 2, 5),
(4, 3, 4);

-- AVAILABILITY
INSERT INTO user_availability (user_id, day_of_week, available_hours) VALUES
(2, 1, 4),
(3, 1, 2),
(4, 1, 6);

-- EVALUATIONS
INSERT INTO evaluations (user_id, leader_id, skill_score, teamwork_score, communication_score, deadline_score)
VALUES
(3, 2, 3, 4, 3, 3),
(4, 2, 5, 4, 5, 5);

-- TEAM
INSERT INTO teams (name, description, created_by) VALUES
(N'Dev Team', N'Team phát triển', 2);

INSERT INTO team_members (team_id, user_id, role) VALUES
(1, 2, 'LEADER'),
(1, 3, 'MEMBER'),
(1, 4, 'MEMBER');

-- PROJECT
INSERT INTO projects (team_id, name, description, status) VALUES
(1, N'AI Task System', N'Quản lý task bằng AI', 'IN_PROGRESS');

-- TASK
INSERT INTO tasks (project_id, title, description, priority, status, estimated_time, difficulty, created_by)
VALUES
(1, N'Build login', N'Create login page', 'HIGH', 'TODO', 5, 2, 2),
(1, N'Build database', N'Design DB schema', 'HIGH', 'IN_PROGRESS', 8, 4, 2);

-- ASSIGNEE
INSERT INTO task_assignees (task_id, user_id) VALUES
(1, 2),
(2, 4);

-- COMMENT
INSERT INTO task_comments (task_id, user_id, content) VALUES
(1, 3, N'I will handle UI');

-- AI
INSERT INTO ai_recommendations (task_id, suggested_user_id, score, reason) VALUES
(1, 2, 85, N'Best React skill');