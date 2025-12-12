
type ProgressProps = {
  counts: Record<string, number>;
  total: number;
};

export function ProgressBar({ counts, total }: ProgressProps) {
  if (total === 0) return null;

  const mastered = counts['Mastered'] || 0;
  const stable = counts['Stable'] || 0;
  const inProgress = counts['In Progress'] || 0;

  // Weighted score: Mastered=1, Stable=0.75, InProgress=0.25
  const score = (mastered * 1 + stable * 0.75 + inProgress * 0.25);
  const percent = Math.round((score / total) * 100);

  return (
    <div className="progress-container">
      <div className="progress-label">
        <span>Level {Math.floor(percent / 10) + 1}</span>
        <span>{percent}% EXP</span>
      </div>
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${percent}%` }}
        />
        <div 
            className="progress-glimmer" 
            style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
