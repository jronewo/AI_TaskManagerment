using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessObject.Migrations
{
    /// <inheritdoc />
    public partial class initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "activity_logs",
                columns: table => new
                {
                    log_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    action = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    entity_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    entity_id = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__activity__9E2397E0D2B13D2D", x => x.log_id);
                });

            migrationBuilder.CreateTable(
                name: "skills",
                columns: table => new
                {
                    skill_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    skill_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__skills__FBBA83797F619518", x => x.skill_id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    avatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "MEMBER"),
                    status = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    deleted_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__users__B9BE370FDD62F7C2", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "evaluations",
                columns: table => new
                {
                    evaluation_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    leader_id = table.Column<int>(type: "int", nullable: true),
                    skill_score = table.Column<int>(type: "int", nullable: true),
                    teamwork_score = table.Column<int>(type: "int", nullable: true),
                    communication_score = table.Column<int>(type: "int", nullable: true),
                    deadline_score = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__evaluati__827C592D8C87BA03", x => x.evaluation_id);
                    table.ForeignKey(
                        name: "FK__evaluatio__leade__5FB337D6",
                        column: x => x.leader_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__evaluatio__user___5EBF139D",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "teams",
                columns: table => new
                {
                    team_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_by = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__teams__F82DEDBC30602299", x => x.team_id);
                    table.ForeignKey(
                        name: "FK__teams__created_b__6383C8BA",
                        column: x => x.created_by,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "user_availability",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    day_of_week = table.Column<int>(type: "int", nullable: true),
                    available_hours = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__user_ava__3213E83FB13E13B5", x => x.id);
                    table.ForeignKey(
                        name: "FK__user_avai__user___5BE2A6F2",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "user_skills",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    skill_id = table.Column<int>(type: "int", nullable: true),
                    level = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__user_ski__3213E83FFDF7CCA2", x => x.id);
                    table.ForeignKey(
                        name: "FK__user_skil__skill__5812160E",
                        column: x => x.skill_id,
                        principalTable: "skills",
                        principalColumn: "skill_id");
                    table.ForeignKey(
                        name: "FK__user_skil__user___571DF1D5",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "invitations",
                columns: table => new
                {
                    invitation_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    team_id = table.Column<int>(type: "int", nullable: true),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__invitati__94B74D7CA75E2E4F", x => x.invitation_id);
                    table.ForeignKey(
                        name: "FK__invitatio__team___6B24EA82",
                        column: x => x.team_id,
                        principalTable: "teams",
                        principalColumn: "team_id");
                });

            migrationBuilder.CreateTable(
                name: "projects",
                columns: table => new
                {
                    project_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    team_id = table.Column<int>(type: "int", nullable: true),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    deadline = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__projects__BC799E1FAD18A4D5", x => x.project_id);
                    table.ForeignKey(
                        name: "FK__projects__team_i__6E01572D",
                        column: x => x.team_id,
                        principalTable: "teams",
                        principalColumn: "team_id");
                });

            migrationBuilder.CreateTable(
                name: "team_members",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    team_id = table.Column<int>(type: "int", nullable: true),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__team_mem__3213E83F1EBDEBBB", x => x.id);
                    table.ForeignKey(
                        name: "FK__team_memb__team___6754599E",
                        column: x => x.team_id,
                        principalTable: "teams",
                        principalColumn: "team_id");
                    table.ForeignKey(
                        name: "FK__team_memb__user___68487DD7",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "tasks",
                columns: table => new
                {
                    task_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    project_id = table.Column<int>(type: "int", nullable: true),
                    title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    priority = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    deadline = table.Column<DateOnly>(type: "date", nullable: true),
                    estimated_time = table.Column<int>(type: "int", nullable: true),
                    difficulty = table.Column<int>(type: "int", nullable: true),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    version = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    progress = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    risk_level = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ai_summary = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__tasks__0492148DFA0DD50E", x => x.task_id);
                    table.ForeignKey(
                        name: "FK__tasks__created_b__71D1E811",
                        column: x => x.created_by,
                        principalTable: "users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__tasks__project_i__70DDC3D8",
                        column: x => x.project_id,
                        principalTable: "projects",
                        principalColumn: "project_id");
                });

            migrationBuilder.CreateTable(
                name: "ai_analysis",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    task_id = table.Column<int>(type: "int", nullable: true),
                    analysis_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ai_analy__3214EC0789A501F9", x => x.id);
                    table.ForeignKey(
                        name: "FK_ai_analysis_tasks",
                        column: x => x.task_id,
                        principalTable: "tasks",
                        principalColumn: "task_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ai_recommendations",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    task_id = table.Column<int>(type: "int", nullable: true),
                    suggested_user_id = table.Column<int>(type: "int", nullable: true),
                    score = table.Column<double>(type: "float", nullable: true),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    recommendation_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "assign")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ai_recom__3213E83F21EB708F", x => x.id);
                    table.ForeignKey(
                        name: "FK__ai_recomm__sugge__04E4BC85",
                        column: x => x.suggested_user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__ai_recomm__task___03F0984C",
                        column: x => x.task_id,
                        principalTable: "tasks",
                        principalColumn: "task_id");
                });

            migrationBuilder.CreateTable(
                name: "task_assignees",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    task_id = table.Column<int>(type: "int", nullable: true),
                    user_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__task_ass__3213E83FEEB4DF50", x => x.id);
                    table.ForeignKey(
                        name: "FK__task_assi__task___7C4F7684",
                        column: x => x.task_id,
                        principalTable: "tasks",
                        principalColumn: "task_id");
                    table.ForeignKey(
                        name: "FK__task_assi__user___7D439ABD",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "task_comments",
                columns: table => new
                {
                    comment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    task_id = table.Column<int>(type: "int", nullable: true),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__task_com__E7957687818A02F9", x => x.comment_id);
                    table.ForeignKey(
                        name: "FK__task_comm__task___00200768",
                        column: x => x.task_id,
                        principalTable: "tasks",
                        principalColumn: "task_id");
                    table.ForeignKey(
                        name: "FK__task_comm__user___01142BA1",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "task_embeddings",
                columns: table => new
                {
                    task_id = table.Column<int>(type: "int", nullable: false),
                    embedding = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__task_emb__0492148D47BA0192", x => x.task_id);
                    table.ForeignKey(
                        name: "FK_task_embeddings_tasks",
                        column: x => x.task_id,
                        principalTable: "tasks",
                        principalColumn: "task_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "task_logs",
                columns: table => new
                {
                    log_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    task_id = table.Column<int>(type: "int", nullable: true),
                    progress = table.Column<int>(type: "int", nullable: true),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__task_log__9E2397E02B7D9E0A", x => x.log_id);
                    table.ForeignKey(
                        name: "FK_task_logs_tasks",
                        column: x => x.task_id,
                        principalTable: "tasks",
                        principalColumn: "task_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "task_versions",
                columns: table => new
                {
                    version_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    task_id = table.Column<int>(type: "int", nullable: true),
                    title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    priority = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    version = table.Column<int>(type: "int", nullable: true),
                    updated_by = table.Column<int>(type: "int", nullable: true),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__task_ver__07A58869AABF27E6", x => x.version_id);
                    table.ForeignKey(
                        name: "FK__task_vers__task___76969D2E",
                        column: x => x.task_id,
                        principalTable: "tasks",
                        principalColumn: "task_id");
                    table.ForeignKey(
                        name: "FK__task_vers__updat__778AC167",
                        column: x => x.updated_by,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "TaskRequiredSkill",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaskId = table.Column<int>(type: "int", nullable: true),
                    SkillId = table.Column<int>(type: "int", nullable: true),
                    RequiredLevel = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskRequiredSkill", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskRequiredSkill_skills_SkillId",
                        column: x => x.SkillId,
                        principalTable: "skills",
                        principalColumn: "skill_id");
                    table.ForeignKey(
                        name: "FK_TaskRequiredSkill_tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "tasks",
                        principalColumn: "task_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ai_analysis_task_id",
                table: "ai_analysis",
                column: "task_id");

            migrationBuilder.CreateIndex(
                name: "IX_ai_recommendations_suggested_user_id",
                table: "ai_recommendations",
                column: "suggested_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_ai_recommendations_task_id",
                table: "ai_recommendations",
                column: "task_id");

            migrationBuilder.CreateIndex(
                name: "IX_evaluations_leader_id",
                table: "evaluations",
                column: "leader_id");

            migrationBuilder.CreateIndex(
                name: "IX_evaluations_user_id",
                table: "evaluations",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_invitations_team_id",
                table: "invitations",
                column: "team_id");

            migrationBuilder.CreateIndex(
                name: "IX_projects_team_id",
                table: "projects",
                column: "team_id");

            migrationBuilder.CreateIndex(
                name: "UQ__skills__73C038ADD9DB64DB",
                table: "skills",
                column: "skill_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_task_assignees_user_id",
                table: "task_assignees",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "UQ__task_ass__EF09F7FCF68B3887",
                table: "task_assignees",
                columns: new[] { "task_id", "user_id" },
                unique: true,
                filter: "[task_id] IS NOT NULL AND [user_id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_task_comments_task_id",
                table: "task_comments",
                column: "task_id");

            migrationBuilder.CreateIndex(
                name: "IX_task_comments_user_id",
                table: "task_comments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_task_logs_task_id",
                table: "task_logs",
                column: "task_id");

            migrationBuilder.CreateIndex(
                name: "IX_task_versions_task_id",
                table: "task_versions",
                column: "task_id");

            migrationBuilder.CreateIndex(
                name: "IX_task_versions_updated_by",
                table: "task_versions",
                column: "updated_by");

            migrationBuilder.CreateIndex(
                name: "IX_TaskRequiredSkill_SkillId",
                table: "TaskRequiredSkill",
                column: "SkillId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskRequiredSkill_TaskId",
                table: "TaskRequiredSkill",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_created_by",
                table: "tasks",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_project_id",
                table: "tasks",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_team_members_user_id",
                table: "team_members",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "UQ__team_mem__13B60ECD231DA964",
                table: "team_members",
                columns: new[] { "team_id", "user_id" },
                unique: true,
                filter: "[team_id] IS NOT NULL AND [user_id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_teams_created_by",
                table: "teams",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_user_availability_user_id",
                table: "user_availability",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_skills_skill_id",
                table: "user_skills",
                column: "skill_id");

            migrationBuilder.CreateIndex(
                name: "UQ__user_ski__36059F39A964580F",
                table: "user_skills",
                columns: new[] { "user_id", "skill_id" },
                unique: true,
                filter: "[user_id] IS NOT NULL AND [skill_id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UQ__users__AB6E61644BB714A5",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "activity_logs");

            migrationBuilder.DropTable(
                name: "ai_analysis");

            migrationBuilder.DropTable(
                name: "ai_recommendations");

            migrationBuilder.DropTable(
                name: "evaluations");

            migrationBuilder.DropTable(
                name: "invitations");

            migrationBuilder.DropTable(
                name: "task_assignees");

            migrationBuilder.DropTable(
                name: "task_comments");

            migrationBuilder.DropTable(
                name: "task_embeddings");

            migrationBuilder.DropTable(
                name: "task_logs");

            migrationBuilder.DropTable(
                name: "task_versions");

            migrationBuilder.DropTable(
                name: "TaskRequiredSkill");

            migrationBuilder.DropTable(
                name: "team_members");

            migrationBuilder.DropTable(
                name: "user_availability");

            migrationBuilder.DropTable(
                name: "user_skills");

            migrationBuilder.DropTable(
                name: "tasks");

            migrationBuilder.DropTable(
                name: "skills");

            migrationBuilder.DropTable(
                name: "projects");

            migrationBuilder.DropTable(
                name: "teams");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
