-- Script tạo Seed Data cho hệ thống AI Task Management
-- Chạy trên SSMS (Microsoft SQL Server)
-- Lưu ý: Đảm bảo chọn đúng CSDL (USE ai_task_management)

USE ai_task_management;
GO

-----------------------------------------------------------------------------------
-- users
-----------------------------------------------------------------------------------
SET IDENTITY_INSERT [users] ON;
INSERT INTO [users] (user_id, email, password, role, name, created_at) VALUES 
(1, 'admin@test.com', '$2a$11$bxmN91e1k1cZtwWGfIHDp.P.G3ocb39EOSR5LGyP1yJLF553mcZDe', 'Admin', N'Trần Quản Trị', GETDATE()),
(2, 'leader1@test.com', '$2a$11$bxmN91e1k1cZtwWGfIHDp.P.G3ocb39EOSR5LGyP1yJLF553mcZDe', 'TeamLeader', N'Nguyễn Trưởng Nhóm 1', GETDATE()),
(3, 'leader2@test.com', '$2a$11$bxmN91e1k1cZtwWGfIHDp.P.G3ocb39EOSR5LGyP1yJLF553mcZDe', 'TeamLeader', N'Lê Trưởng Nhóm 2', GETDATE()),
(4, 'dev1@test.com', '$2a$11$bxmN91e1k1cZtwWGfIHDp.P.G3ocb39EOSR5LGyP1yJLF553mcZDe', 'Member', N'Nguyễn Dev 1 (Frontend)', GETDATE()),
(5, 'dev2@test.com', '$2a$11$bxmN91e1k1cZtwWGfIHDp.P.G3ocb39EOSR5LGyP1yJLF553mcZDe', 'Member', N'Trần Dev 2 (Backend)', GETDATE()),
(6, 'dev3@test.com', '$2a$11$bxmN91e1k1cZtwWGfIHDp.P.G3ocb39EOSR5LGyP1yJLF553mcZDe', 'Member', N'Lê Dev 3 (Fullstack)', GETDATE()),
(7, 'tester1@test.com', '$2a$11$bxmN91e1k1cZtwWGfIHDp.P.G3ocb39EOSR5LGyP1yJLF553mcZDe', 'Member', N'Phạm Tester 1', GETDATE()),
(8, 'designer1@test.com', '$2a$11$bxmN91e1k1cZtwWGfIHDp.P.G3ocb39EOSR5LGyP1yJLF553mcZDe', 'Member', N'Hoàng Design 1', GETDATE()),
(9, 'dev4@test.com', '$2a$11$bxmN91e1k1cZtwWGfIHDp.P.G3ocb39EOSR5LGyP1yJLF553mcZDe', 'Member', N'Đỗ Dev 4 (AI/Data)', GETDATE()),
(10, 'tester2@test.com', '$2a$11$bxmN91e1k1cZtwWGfIHDp.P.G3ocb39EOSR5LGyP1yJLF553mcZDe', 'Member', N'Ngô Tester 2', GETDATE());
SET IDENTITY_INSERT [users] OFF;
GO

-----------------------------------------------------------------------------------
-- skills
-----------------------------------------------------------------------------------
SET IDENTITY_INSERT [skills] ON;
INSERT INTO [skills] (skill_id, skill_name) VALUES
(1, 'React'),
(2, 'C# / .NET'),
(3, 'SQL Server'),
(4, 'UI/UX Design'),
(5, 'Manual Testing'),
(6, 'Automation Testing'),
(7, 'Node.js'),
(8, 'Python'),
(9, 'DevOps'),
(10, 'Project Management');
SET IDENTITY_INSERT [skills] OFF;
GO

-----------------------------------------------------------------------------------
-- user_skills (no identity insert required)
-----------------------------------------------------------------------------------
INSERT INTO [user_skills] (user_id, skill_id, level) VALUES
(4, 1, 4), (4, 4, 3),
(5, 2, 5), (5, 3, 4),
(6, 1, 3), (6, 2, 3), (6, 7, 3),
(7, 5, 4), (7, 6, 2),
(8, 4, 5), (8, 1, 2),
(9, 8, 4), (9, 3, 3),
(10, 5, 5),
(2, 10, 4), (2, 2, 4),
(3, 10, 5), (3, 1, 4);
GO

-----------------------------------------------------------------------------------
-- organizations
-----------------------------------------------------------------------------------
SET IDENTITY_INSERT [organizations] ON;
INSERT INTO [organizations] (organization_id, name, description, owner_id) VALUES
(1, N'Công ty Cổ phần Công nghệ ABC', N'Nghiên cứu và phát triển phần mềm TaskGenie', 1);
SET IDENTITY_INSERT [organizations] OFF;
GO

-----------------------------------------------------------------------------------
-- teams
-----------------------------------------------------------------------------------
SET IDENTITY_INSERT [teams] ON;
INSERT INTO [teams] (team_id, name, description, created_by) VALUES
(1, N'Team Project: TaskGenie Frontend App', N'Đội tập thể cho dự án', 2),
(2, N'Team Project: TaskGenie Backend API', N'Đội tập thể cho dự án', 2),
(3, N'Team Project: TaskGenie Testing & QA', N'Đội tập thể cho dự án', 3),
(4, N'Team Project: AI Risk Predictor', N'Đội tập thể cho dự án', 3),
(5, N'Team Project: Hệ Thống Design System', N'Đội tập thể cho dự án', 2),
(6, N'Team Project: Mobile App Launch', N'Đội tập thể cho dự án', 3),
(7, N'Team Project: Infrastructure Move', N'Đội tập thể cho dự án', 2),
(8, N'Team Project: Security Audit 2026', N'Đội tập thể cho dự án', 3),
(9, N'Team Project: Campaign Automation', N'Đội tập thể cho dự án', 2),
(10, N'Team Project: Helpdesk Portal', N'Đội tập thể cho dự án', 3);
SET IDENTITY_INSERT [teams] OFF;
GO

-----------------------------------------------------------------------------------
-- team_members (no identity insert required)
-----------------------------------------------------------------------------------
INSERT INTO [team_members] (team_id, user_id, role) VALUES
(1, 2, 'Leader'), (1, 4, 'Member'), (1, 8, 'Member'),
(2, 2, 'Leader'), (2, 5, 'Member'), (2, 6, 'Member'),
(3, 3, 'Leader'), (3, 6, 'Member'), (3, 7, 'Member'), (3, 10, 'Member'),
(4, 3, 'Leader'), (4, 9, 'Member'),
(5, 2, 'Leader'), (5, 8, 'Member'),
(6, 3, 'Leader'), (6, 4, 'Member'),
(7, 2, 'Leader'), (7, 5, 'Member'),
(8, 3, 'Leader'), (8, 6, 'Member'),
(9, 2, 'Leader'), (9, 4, 'Member'),
(10, 3, 'Leader'), (10, 10, 'Member');
GO

-----------------------------------------------------------------------------------
-- projects
-----------------------------------------------------------------------------------
SET IDENTITY_INSERT [projects] ON;
INSERT INTO [projects] (project_id, team_id, organization_id, name, description, status, created_at) VALUES
(1, 1, 1, N'TaskGenie Frontend App', N'Xây dựng giao diện React cho hệ thống quản lý Task', 'Active', GETDATE()),
(2, 2, 1, N'TaskGenie Backend API', N'Xây dựng API C# .NET cho hệ thống quản lý Task', 'Active', GETDATE()),
(3, 3, 1, N'TaskGenie Testing & QA', N'Kiểm thử toàn bộ luồng chức năng của ứng dụng', 'Active', GETDATE()),
(4, 4, 1, N'AI Risk Predictor', N'Phát triển mô hình AI dự báo rủi ro dự án', 'Active', GETDATE()),
(5, 5, 1, N'Hệ Thống Design System', N'Xây dựng thư viện component UI dùng chung', 'Completed', GETDATE()),
(6, 6, 1, N'Mobile App Launch', N'Triển khai ứng dụng di động', 'Active', GETDATE()),
(7, 7, 1, N'Infrastructure Move', N'Chuyển đổi hạ tầng lên cloud', 'Active', GETDATE()),
(8, 8, 1, N'Security Audit 2026', N'Kiểm tra bảo mật toàn diện', 'Active', GETDATE()),
(9, 9, 1, N'Campaign Automation', N'Tự động hoá chiến dịch Marketing', 'Active', GETDATE()),
(10, 10, 1, N'Helpdesk Portal', N'Cổng thông tin hỗ trợ người dùng', 'Active', GETDATE());
SET IDENTITY_INSERT [projects] OFF;
GO

-----------------------------------------------------------------------------------
-- tasks (100 tasks cho 5 project đầu tiên - 20 tasks/project)
-----------------------------------------------------------------------------------
SET IDENTITY_INSERT [tasks] ON;
DECLARE @taskId INT = 1;
DECLARE @projId INT = 1;

-- Loop để sinh 100 tasks
WHILE @taskId <= 100
BEGIN
    SET @projId = ((@taskId - 1) / 20) + 1; -- 20 task mỗi project
    
    DECLARE @status NVARCHAR(50) = 
        CASE 
            WHEN @taskId % 4 = 1 THEN 'Todo'
            WHEN @taskId % 4 = 2 THEN 'In Progress'
            WHEN @taskId % 4 = 3 THEN 'Review'
            ELSE 'Done'
        END;

    DECLARE @title NVARCHAR(255) = N'Task ' + CAST(@taskId AS NVARCHAR(10)) + N' của Project ' + CAST(@projId AS NVARCHAR(10));
    DECLARE @desc NVARCHAR(MAX) = N'Mô tả chi tiết công việc cần làm cho Task ' + CAST(@taskId AS NVARCHAR(10)) + N'. Nội dung này được sinh tự động.';
    DECLARE @priority NVARCHAR(50) = CASE WHEN @taskId % 3 = 0 THEN 'High' WHEN @taskId % 3 = 1 THEN 'Medium' ELSE 'Low' END;
    DECLARE @risk NVARCHAR(50) = CASE WHEN @status = 'Todo' AND @taskId % 7 = 0 THEN 'HIGH' WHEN @status = 'In Progress' AND @taskId % 5 = 0 THEN 'MEDIUM' ELSE 'LOW' END;
    DECLARE @progress FLOAT = CASE WHEN @status = 'Done' THEN 100 WHEN @status = 'Review' THEN 90 WHEN @status = 'In Progress' THEN 50 ELSE 0 END;
    DECLARE @estTime FLOAT = CAST((@taskId % 8) + 2 AS FLOAT); -- 2-9 hours

    INSERT INTO [tasks] (task_id, project_id, title, description, status, priority, risk_level, created_by, created_at, deadline, progress, estimated_time)
    VALUES (
        @taskId, 
        @projId, 
        @title, 
        @desc, 
        @status, 
        @priority, 
        @risk, 
        2, 
        GETDATE(), 
        DATEADD(DAY, (@taskId % 15) - 5, GETDATE()), -- Deadline từ quá khứ 5 ngày đến tương lai 10 ngày
        @progress, 
        @estTime
    );

    SET @taskId = @taskId + 1;
END;
SET IDENTITY_INSERT [tasks] OFF;
GO

-----------------------------------------------------------------------------------
-- task_assignees
-----------------------------------------------------------------------------------
DECLARE @assignTask INT = 1;
WHILE @assignTask <= 100
BEGIN
    DECLARE @assignedUser INT;
    IF @assignTask <= 20
        SET @assignedUser = CASE WHEN @assignTask % 2 = 0 THEN 4 ELSE 8 END;
    ELSE IF @assignTask <= 40
        SET @assignedUser = CASE WHEN @assignTask % 2 = 0 THEN 5 ELSE 6 END;
    ELSE IF @assignTask <= 60
        SET @assignedUser = CASE WHEN @assignTask % 3 = 0 THEN 7 WHEN @assignTask % 3 = 1 THEN 10 ELSE 6 END;
    ELSE IF @assignTask <= 80
        SET @assignedUser = 9;
    ELSE 
        SET @assignedUser = 8;
        
    INSERT INTO [task_assignees] (task_id, user_id) VALUES (@assignTask, @assignedUser);
    SET @assignTask = @assignTask + 1;
END;
GO

-----------------------------------------------------------------------------------
-- task_dependencies
-----------------------------------------------------------------------------------
INSERT INTO [task_dependencies] (task_id, depends_on_task_id) VALUES
(2, 1), (3, 2), (4, 3), (15, 12),
(22, 21), (25, 22), (30, 25),
(45, 41), (46, 45), (50, 49),
(62, 61), (65, 62), (70, 69),
(82, 81), (85, 82), (90, 89);
GO

-----------------------------------------------------------------------------------
-- notifications
-----------------------------------------------------------------------------------
INSERT INTO [notifications] (user_id, type, title, message, reference_id, reference_type, is_read, created_at) VALUES
(4, 'TASK_ASSIGN', N'Phân công mới', N'Bạn vừa được gán task 1', 1, 'Task', 0, GETDATE()),
(4, 'TASK_UPDATE', N'Tin nhắn mới', N'Có comment mới trong task 1', 1, 'Task', 0, GETDATE()),
(4, 'SYSTEM', N'Hệ thống', N'Chào mừng bạn đến với TaskGenie', NULL, NULL, 1, DATEADD(DAY, -5, GETDATE())),
(5, 'TASK_ASSIGN', N'Phân công mới', N'Bạn vừa được gán task 21', 21, 'Task', 0, GETDATE()),
(5, 'TASK_UPDATE', N'Cập nhật tiến độ', N'Task 22 vừa chuyển sang Review', 22, 'Task', 1, GETDATE()),
(4, 'WARNING', N'Trễ hạn', N'Task 3 sắp đến hạn chót!', 3, 'Task', 0, GETDATE()),
(5, 'WARNING', N'Rủi ro', N'Phát hiện rủi ro cao ở Project 2', 2, 'Project', 0, GETDATE()),
(4, 'SYSTEM', N'Maintenance', N'Hệ thống bảo trì lúc 00:00', NULL, NULL, 1, GETDATE()),
(5, 'TASK_UPDATE', N'Review xong', N'Task 23 đã Done', 23, 'Task', 0, GETDATE()),
(4, 'TASK_ASSIGN', N'Chuyển giao', N'Task 5 đã được chuyển cho bạn', 5, 'Task', 0, GETDATE());
GO

-----------------------------------------------------------------------------------
-- activity_logs
-----------------------------------------------------------------------------------
INSERT INTO [activity_logs] (user_id, action, entity_type, entity_id, created_at) VALUES 
(2, 'CREATE', 'Project', 1, DATEADD(DAY, -10, GETDATE())),
(2, 'CREATE', 'Task', 1, DATEADD(DAY, -5, GETDATE())),
(4, 'UPDATE', 'Task', 1, DATEADD(DAY, -4, GETDATE())),
(2, 'CREATE', 'Project', 2, DATEADD(DAY, -10, GETDATE())),
(5, 'UPDATE', 'Task', 21, DATEADD(DAY, -2, GETDATE())),
(3, 'CREATE', 'Project', 3, DATEADD(DAY, -10, GETDATE())),
(7, 'COMMENT', 'Task', 45, DATEADD(DAY, -1, GETDATE())),
(8, 'UPDATE', 'Task', 85, GETDATE()),
(9, 'CREATE', 'Task', 65, GETDATE()),
(2, 'ASSIGN', 'Task', 2, GETDATE());
GO

PRINT 'Tạo Seed Data thành công! Dữ liệu mẫu đã được ghi.';
