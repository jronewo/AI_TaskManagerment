import { useState, useEffect } from 'react'
import { apiUrl, safeFetch, parseBody } from '../../api/client'
import { updateTaskSkills } from '../../api/tasks'

export default function CreateTaskModal({ projectId, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    deadline: '',
    difficulty: 5,
    requiredSkillIds: []
  })
  const [availableSkills, setAvailableSkills] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadSkills() {
      try {
        const res = await safeFetch(apiUrl('api/Skills'))
        const data = await parseBody(res)
        if (Array.isArray(data)) setAvailableSkills(data)
      } catch (err) {
        console.error("Lỗi lấy danh sách skill:", err)
      }
    }
    loadSkills()
  }, [])

  const handleToggleSkill = (skillId) => {
    setFormData(prev => {
      const skills = prev.requiredSkillIds || [];
      if (skills.includes(skillId)) {
        return { ...prev, requiredSkillIds: skills.filter(id => id !== skillId) }
      } else {
        return { ...prev, requiredSkillIds: [...skills, skillId] }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        projectId: parseInt(projectId, 10),
        ...formData
      }
      if (!payload.deadline) delete payload.deadline
      delete payload.requiredSkillIds // Optional: clean up before send
      const createdTask = await onCreate(payload)
      
      // Step 2: Gán tags
      if (createdTask?.taskId && formData.requiredSkillIds.length > 0) {
        await updateTaskSkills(createdTask.taskId, formData.requiredSkillIds)
      }
      
      onClose()
    } catch (error) {
      alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-white">Tạo kết quả hoặc Task mới</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Tên Task</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Nhập tên task..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Mô tả chi tiết</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Mô tả công việc cần làm..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Mức độ ưu tiên</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="Low">Thấp (Low)</option>
                <option value="Medium">Trung bình (Medium)</option>
                <option value="High">Cao (High)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Hạn chót (Deadline)</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center justify-between text-sm font-medium text-slate-300">
              <span>Độ khó (1-10)</span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white">
                {formData.difficulty}
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value, 10) })}
              className="w-full accent-cyan-500"
            />
            <p className="mt-1 flex justify-between text-[10px] text-slate-500">
              <span>Rất dễ</span>
              <span>Bình thường</span>
              <span>Cực khó</span>
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Kỹ năng yêu cầu (AI Required Skills)</label>
            <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-slate-800 p-3 min-h-[50px]">
              {availableSkills.map(skill => {
                const isSelected = (formData.requiredSkillIds || []).includes(skill.skillId);
                return (
                  <button
                    type="button"
                    key={skill.skillId}
                    onClick={() => handleToggleSkill(skill.skillId)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
                      isSelected 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30 shadow-sm shadow-cyan-900/20' 
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {skill.skillName} {isSelected && '×'}
                  </button>
                )
              })}
              {availableSkills.length === 0 && <span className="text-xs text-slate-500">Đang tải kỹ năng...</span>}
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Thiết lập tags chuyên môn để AI tự do quét hồ sơ nhân sự trùng khớp.</p>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
