using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class TaskEmbedding
{
    public int TaskId { get; set; }

    public string? Embedding { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Task Task { get; set; } = null!;
}
