import React from 'react';

export default function TaskCard({ task, onClick, members = [] }) {
  const isHighRisk = task.riskLevel === 'HIGH';
  const isMediumRisk = task.riskLevel === 'MEDIUM';

  const riskColor = isHighRisk ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 
                    isMediumRisk ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 
                    'bg-slate-500/20 text-slate-300 border-slate-500/30';

  const priorityColor = task.priority === 'High' ? 'text-rose-400' :
                        task.priority === 'Medium' ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-white/10 p-4 transition duration-200 hover:bg-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 relative z-10 bg-slate-900/50"
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="text-sm font-medium text-slate-100 group-hover:text-white line-clamp-2">
          {task.title}
        </h3>
        {task.riskLevel && task.riskLevel !== 'LOW' && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${riskColor}`}>
            {task.riskLevel}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 relative">
          <span className={`font-semibold ${priorityColor}`}>
             {task.priority || 'Normal'}
          </span>
        </div>
        
        {/* Assignees avatars list */}
        <div className="flex items-center gap-2">
          {task.deadline && (
            <span className="text-slate-400 border border-white/10 rounded px-1.5 py-0.5 whitespace-nowrap">
              {new Date(task.deadline).toLocaleDateString('vi-VN')}
            </span>
          )}
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-2 shrink-0">
              {task.assignees.slice(0, 3).map((a, i) => (
                <div key={i} title={a.userName} className="h-6 w-6 rounded-full border border-slate-900 bg-slate-700 flex items-center justify-center overflow-hidden">
                  {a.avatar ? (
                    <img src={a.avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-white bg-gradient-to-br from-cyan-600 to-violet-600 h-full w-full flex items-center justify-center">
                      {(a.userName || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
              {task.assignees.length > 3 && (
                <div className="h-6 w-6 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-cyan-500 transition-all duration-500" 
          style={{ width: `${task.progress || 0}%` }}
        />
      </div>

    </div>
  );
}
