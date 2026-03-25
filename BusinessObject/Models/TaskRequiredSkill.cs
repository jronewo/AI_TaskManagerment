using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class TaskRequiredSkill
{
    public int Id { get; set; }

    public int? TaskId { get; set; }

    public int? SkillId { get; set; }

    public int? RequiredLevel { get; set; }

    public virtual Skill? Skill { get; set; }

    public virtual Task? Task { get; set; }
}
