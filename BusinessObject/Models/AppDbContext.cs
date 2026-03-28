using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace BusinessObject.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ActivityLog> ActivityLogs { get; set; }

    public virtual DbSet<AiAnalysis> AiAnalyses { get; set; }

    public virtual DbSet<AiRecommendation> AiRecommendations { get; set; }

    public virtual DbSet<Evaluation> Evaluations { get; set; }

    public virtual DbSet<Invitation> Invitations { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    public virtual DbSet<Skill> Skills { get; set; }

    public virtual DbSet<Task> Tasks { get; set; }

    public virtual DbSet<TaskAssignee> TaskAssignees { get; set; }

    public virtual DbSet<TaskComment> TaskComments { get; set; }

    public virtual DbSet<TaskEmbedding> TaskEmbeddings { get; set; }

    public virtual DbSet<TaskLog> TaskLogs { get; set; }

    public virtual DbSet<TaskVersion> TaskVersions { get; set; }

    public virtual DbSet<Team> Teams { get; set; }

    public virtual DbSet<TeamMember> TeamMembers { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserAvailability> UserAvailabilities { get; set; }

    public virtual DbSet<UserSkill> UserSkills { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=LEGION5;Database=ai_task_management;User Id=sa;Password=123;TrustServerCertificate=true;Trusted_Connection=SSPI;Encrypt=false;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ActivityLog>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("PK__activity__9E2397E0EE5103A4");

            entity.ToTable("activity_logs");

            entity.Property(e => e.LogId).HasColumnName("log_id");
            entity.Property(e => e.Action).HasColumnName("action");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.EntityType)
                .HasMaxLength(50)
                .HasColumnName("entity_type");
            entity.Property(e => e.UserId).HasColumnName("user_id");
        });

        modelBuilder.Entity<AiAnalysis>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ai_analy__3213E83F74B63A47");

            entity.ToTable("ai_analysis");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AnalysisType)
                .HasMaxLength(50)
                .HasColumnName("analysis_type");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.TaskId).HasColumnName("task_id");

            entity.HasOne(d => d.Task).WithMany(p => p.AiAnalyses)
                .HasForeignKey(d => d.TaskId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ai_analysis_tasks");
        });

        modelBuilder.Entity<AiRecommendation>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ai_recom__3213E83FF227C486");

            entity.ToTable("ai_recommendations");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Reason).HasColumnName("reason");
            entity.Property(e => e.RecommendationType)
                .HasMaxLength(50)
                .HasDefaultValue("assign")
                .HasColumnName("recommendation_type");
            entity.Property(e => e.Score).HasColumnName("score");
            entity.Property(e => e.SuggestedUserId).HasColumnName("suggested_user_id");
            entity.Property(e => e.TaskId).HasColumnName("task_id");

            entity.HasOne(d => d.SuggestedUser).WithMany(p => p.AiRecommendations)
                .HasForeignKey(d => d.SuggestedUserId)
                .HasConstraintName("FK__ai_recomm__sugge__71D1E811");

            entity.HasOne(d => d.Task).WithMany(p => p.AiRecommendations)
                .HasForeignKey(d => d.TaskId)
                .HasConstraintName("FK__ai_recomm__task___70DDC3D8");
        });

        modelBuilder.Entity<Evaluation>(entity =>
        {
            entity.HasKey(e => e.EvaluationId).HasName("PK__evaluati__827C592DBCF1FB91");

            entity.ToTable("evaluations");

            entity.Property(e => e.EvaluationId).HasColumnName("evaluation_id");
            entity.Property(e => e.CommunicationScore).HasColumnName("communication_score");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.DeadlineScore).HasColumnName("deadline_score");
            entity.Property(e => e.LeaderId).HasColumnName("leader_id");
            entity.Property(e => e.SkillScore).HasColumnName("skill_score");
            entity.Property(e => e.TeamworkScore).HasColumnName("teamwork_score");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Leader).WithMany(p => p.EvaluationLeaders)
                .HasForeignKey(d => d.LeaderId)
                .HasConstraintName("FK__evaluatio__leade__4CA06362");

            entity.HasOne(d => d.User).WithMany(p => p.EvaluationUsers)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__evaluatio__user___4BAC3F29");
        });

        modelBuilder.Entity<Invitation>(entity =>
        {
            entity.HasKey(e => e.InvitationId).HasName("PK__invitati__94B74D7C938D73DA");

            entity.ToTable("invitations");

            entity.Property(e => e.InvitationId).HasColumnName("invitation_id");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.TeamId).HasColumnName("team_id");

            entity.HasOne(d => d.Team).WithMany(p => p.Invitations)
                .HasForeignKey(d => d.TeamId)
                .HasConstraintName("FK__invitatio__team___5812160E");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.ProjectId).HasName("PK__projects__BC799E1F9E7CEF3B");

            entity.ToTable("projects");

            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.Deadline).HasColumnName("deadline");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.TeamId).HasColumnName("team_id");

            entity.HasOne(d => d.Team).WithMany(p => p.Projects)
                .HasForeignKey(d => d.TeamId)
                .HasConstraintName("FK__projects__team_i__5AEE82B9");
        });

        modelBuilder.Entity<Skill>(entity =>
        {
            entity.HasKey(e => e.SkillId).HasName("PK__skills__FBBA837902EF6DE9");

            entity.ToTable("skills");

            entity.HasIndex(e => e.SkillName, "UQ__skills__73C038AD12806053").IsUnique();

            entity.Property(e => e.SkillId).HasColumnName("skill_id");
            entity.Property(e => e.SkillName)
                .HasMaxLength(100)
                .HasColumnName("skill_name");
        });

        modelBuilder.Entity<Task>(entity =>
        {
            entity.HasKey(e => e.TaskId).HasName("PK__tasks__0492148D776260FB");

            entity.ToTable("tasks", tb => tb.HasTrigger("trg_task_update"));

            entity.Property(e => e.TaskId).HasColumnName("task_id");
            entity.Property(e => e.AiSummary).HasColumnName("ai_summary");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.Deadline).HasColumnName("deadline");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Difficulty).HasColumnName("difficulty");
            entity.Property(e => e.EstimatedTime).HasColumnName("estimated_time");
            entity.Property(e => e.Priority)
                .HasMaxLength(10)
                .HasColumnName("priority");
            entity.Property(e => e.Progress)
                .HasDefaultValue(0)
                .HasColumnName("progress");
            entity.Property(e => e.ProjectId).HasColumnName("project_id");
            entity.Property(e => e.RiskLevel)
                .HasMaxLength(20)
                .HasColumnName("risk_level");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.Version)
                .HasDefaultValue(1)
                .HasColumnName("version");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Tasks)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__tasks__created_b__5EBF139D");

            entity.HasOne(d => d.Project).WithMany(p => p.Tasks)
                .HasForeignKey(d => d.ProjectId)
                .HasConstraintName("FK__tasks__project_i__5DCAEF64");
        });

        modelBuilder.Entity<TaskAssignee>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__task_ass__3213E83F508CE41A");

            entity.ToTable("task_assignees");

            entity.HasIndex(e => new { e.TaskId, e.UserId }, "UQ__task_ass__EF09F7FCB797C73F").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TaskId).HasColumnName("task_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Task).WithMany(p => p.TaskAssignees)
                .HasForeignKey(d => d.TaskId)
                .HasConstraintName("FK__task_assi__task___693CA210");

            entity.HasOne(d => d.User).WithMany(p => p.TaskAssignees)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__task_assi__user___6A30C649");
        });

        modelBuilder.Entity<TaskComment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("PK__task_com__E795768799D9D2A0");

            entity.ToTable("task_comments");

            entity.Property(e => e.CommentId).HasColumnName("comment_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.TaskId).HasColumnName("task_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Task).WithMany(p => p.TaskComments)
                .HasForeignKey(d => d.TaskId)
                .HasConstraintName("FK__task_comm__task___6D0D32F4");

            entity.HasOne(d => d.User).WithMany(p => p.TaskComments)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__task_comm__user___6E01572D");
        });

        modelBuilder.Entity<TaskEmbedding>(entity =>
        {
            entity.HasKey(e => e.TaskId).HasName("PK__task_emb__0492148DABF2B4CD");

            entity.ToTable("task_embeddings");

            entity.Property(e => e.TaskId)
                .ValueGeneratedNever()
                .HasColumnName("task_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Embedding).HasColumnName("embedding");

            entity.HasOne(d => d.Task).WithOne(p => p.TaskEmbedding)
                .HasForeignKey<TaskEmbedding>(d => d.TaskId)
                .HasConstraintName("FK_task_embeddings_tasks");
        });

        modelBuilder.Entity<TaskLog>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("PK__task_log__9E2397E0AC4592A4");

            entity.ToTable("task_logs");

            entity.Property(e => e.LogId).HasColumnName("log_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.Progress).HasColumnName("progress");
            entity.Property(e => e.TaskId).HasColumnName("task_id");

            entity.HasOne(d => d.Task).WithMany(p => p.TaskLogs)
                .HasForeignKey(d => d.TaskId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_task_logs_tasks");
        });

        modelBuilder.Entity<TaskVersion>(entity =>
        {
            entity.HasKey(e => e.VersionId).HasName("PK__task_ver__07A58869984DD8BA");

            entity.ToTable("task_versions");

            entity.Property(e => e.VersionId).HasColumnName("version_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Priority)
                .HasMaxLength(10)
                .HasColumnName("priority");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.TaskId).HasColumnName("task_id");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");
            entity.Property(e => e.Version).HasColumnName("version");

            entity.HasOne(d => d.Task).WithMany(p => p.TaskVersions)
                .HasForeignKey(d => d.TaskId)
                .HasConstraintName("FK__task_vers__task___6383C8BA");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.TaskVersions)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("FK__task_vers__updat__6477ECF3");
        });

        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(e => e.TeamId).HasName("PK__teams__F82DEDBCF1BFE95F");

            entity.ToTable("teams");

            entity.Property(e => e.TeamId).HasColumnName("team_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Teams)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__teams__created_b__5070F446");
        });

        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__team_mem__3213E83FA2B300EE");

            entity.ToTable("team_members");

            entity.HasIndex(e => new { e.TeamId, e.UserId }, "UQ__team_mem__13B60ECD7B0D1141").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasColumnName("role");
            entity.Property(e => e.TeamId).HasColumnName("team_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Team).WithMany(p => p.TeamMembers)
                .HasForeignKey(d => d.TeamId)
                .HasConstraintName("FK__team_memb__team___5441852A");

            entity.HasOne(d => d.User).WithMany(p => p.TeamMembers)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__team_memb__user___5535A963");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__users__B9BE370FA9E917F7");

            entity.ToTable("users", tb => tb.HasTrigger("trg_user_status"));

            entity.HasIndex(e => e.Email, "UQ__users__AB6E616414D1BC50").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Avatar).HasColumnName("avatar");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.DeletedAt)
                .HasColumnType("datetime")
                .HasColumnName("deleted_at");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Password).HasColumnName("password");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasDefaultValue("MEMBER")
                .HasColumnName("role");
            entity.Property(e => e.Status)
                .HasDefaultValue(1)
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<UserAvailability>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__user_ava__3213E83FAD6E302D");

            entity.ToTable("user_availability");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AvailableHours).HasColumnName("available_hours");
            entity.Property(e => e.DayOfWeek).HasColumnName("day_of_week");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.UserAvailabilities)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__user_avai__user___48CFD27E");
        });

        modelBuilder.Entity<UserSkill>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__user_ski__3213E83FF7FE70DE");

            entity.ToTable("user_skills");

            entity.HasIndex(e => new { e.UserId, e.SkillId }, "UQ__user_ski__36059F39B938ADFF").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Level).HasColumnName("level");
            entity.Property(e => e.SkillId).HasColumnName("skill_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Skill).WithMany(p => p.UserSkills)
                .HasForeignKey(d => d.SkillId)
                .HasConstraintName("FK__user_skil__skill__44FF419A");

            entity.HasOne(d => d.User).WithMany(p => p.UserSkills)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__user_skil__user___440B1D61");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
