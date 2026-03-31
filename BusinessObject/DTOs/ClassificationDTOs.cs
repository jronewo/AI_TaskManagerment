namespace BusinessObject.DTOs;

public class TaskClassificationRequest
{
    public int TaskId { get; set; }
}

public class TaskClassificationResponse
{
    public int TaskId { get; set; }
    public string TaskType { get; set; } = string.Empty;
    public double TaskTypeConfidence { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public double DifficultyConfidence { get; set; }
    public List<ClassificationScore> AllScores { get; set; } = new();
}

public class ClassifyTextRequest
{
    public string Text { get; set; } = string.Empty;
}

public class ClassificationScore
{
    public string Label { get; set; } = string.Empty;
    public double Confidence { get; set; }
}
