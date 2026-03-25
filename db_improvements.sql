-- AI Task Management Database Improvements
USE ai_task_management;
GO

-- 1. Create task_embeddings table
CREATE TABLE task_embeddings (
    task_id INT PRIMARY KEY,
    embedding NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_task_embeddings_tasks FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);
GO

-- 2. Create task_logs table
CREATE TABLE task_logs (
    log_id INT IDENTITY PRIMARY KEY,
    task_id INT,
    progress INT,
    note NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_task_logs_tasks FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);
GO

-- 3. Create ai_analysis table
CREATE TABLE ai_analysis (
    id INT IDENTITY PRIMARY KEY,
    task_id INT,
    analysis_type NVARCHAR(50), -- risk / summary / suggestion
    content NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_ai_analysis_tasks FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);
GO

-- 4. Extend tasks table
ALTER TABLE tasks ADD 
    progress INT DEFAULT 0,
    risk_level NVARCHAR(20), -- LOW / MEDIUM / HIGH
    ai_summary NVARCHAR(MAX);
GO

-- 5. Extend ai_recommendations table
ALTER TABLE ai_recommendations ADD 
    recommendation_type NVARCHAR(50) DEFAULT 'assign';
GO
