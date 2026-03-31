import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { BoardCard, CreateBoardCard } from '../components/dashboard/BoardCard'
import { getProjects, createProject } from '../api/projects'
import { createTeam } from '../api/teams'
import { getMyTasks } from '../api/notifications'
import { getUserId } from '../lib/authStorage'
import { useLang } from '../lib/LanguageContext'

export default function Dashboard() {
  const { t } = useLang()
  const [personalProjects, setPersonalProjects] = useState([])
  const [orgProjects, setOrgProjects] = useState([])
  const [myTasks, setMyTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    teamName: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await getProjects()
      const personal = data.filter((p) => !p.organizationId)
      const org = data.filter((p) => p.organizationId)
      setPersonalProjects(personal)
      setOrgProjects(org)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyTasks = async () => {
    try {
      const tasks = await getMyTasks()
      setMyTasks(tasks)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchProjects()
    fetchMyTasks()
  }, [])

  const handleCreateProject = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const uid = getUserId()
      const userId = uid ? parseInt(uid, 10) : 0

      // 1. Create team first (gắn liền với project)
      const teamName = newProject.teamName || newProject.name
      const team = await createTeam({
        name: teamName,
        description: `Team cho dự án: ${newProject.name}`,
        createdBy: userId
      })

      // 2. Create project with teamId
      await createProject({
        name: newProject.name,
        description: newProject.description,
        teamId: team.teamId,
        createdBy: userId
      })

      setShowModal(false)
      setNewProject({ name: '', description: '', teamName: '' })
      fetchProjects()
    } catch (error) {
      alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getGradient = (index) => {
    const gradients = [
      'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-800',
      'bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-900',
      'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-800',
      'bg-gradient-to-br from-amber-500 via-orange-600 to-red-800'
    ]
    return gradients[index % gradients.length]
  }

  const tasksByStatus = (status) => myTasks.filter(t => t.status === status)

  const statusColors = {
    'Todo': 'border-amber-500/20 bg-amber-500/5',
    'In Progress': 'border-blue-500/20 bg-blue-500/5',
    'Review': 'border-purple-500/20 bg-purple-500/5',
    'Done': 'border-emerald-500/20 bg-emerald-500/5',
  }
  const statusDot = {
    'Todo': 'bg-amber-400',
    'In Progress': 'bg-blue-400',
    'Review': 'bg-purple-400',
    'Done': 'bg-emerald-400',
  }

  return (
    <DashboardLayout>
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t('hello')}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {t('manage_projects')}
          </p>
        </div>

        {loading ? (
          <div className="text-slate-400">{t('loading_projects')}</div>
        ) : (
          <>
            {/* My Tasks Section */}
            {myTasks.length > 0 && (
              <section className="mb-12">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 text-sm">📋</span>
                  {t('my_tasks')}
                  <span className="text-xs text-slate-500 font-normal ml-2">({myTasks.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {['Todo', 'In Progress', 'Review', 'Done'].map(status => {
                    const tasks = tasksByStatus(status)
                    if (tasks.length === 0) return null
                    return (
                      <div key={status} className={`rounded-2xl border p-4 ${statusColors[status]}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`h-2 w-2 rounded-full ${statusDot[status]}`} />
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{t(status.toLowerCase().replace(' ', '_')) || status}</span>
                          <span className="text-xs text-slate-500">{tasks.length}</span>
                        </div>
                        <div className="space-y-2 max-h-52 overflow-y-auto">
                          {tasks.map(task => (
                            <Link
                              key={task.taskId}
                              to={`/task/${task.taskId}`}
                              className="block p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition group"
                            >
                              <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                                {task.priority && <span className={`${task.priority === 'High' ? 'text-rose-400' : task.priority === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>● {task.priority}</span>}
                                {task.deadline && <span>📅 {task.deadline}</span>}
                              </div>
                              {task.progress > 0 && (
                                <div className="mt-1.5 h-1 rounded-full bg-slate-800 overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" style={{ width: `${task.progress}%` }} />
                                </div>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Personal Projects */}
            <section className="mb-12">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 text-sm font-bold text-white shadow-lg shadow-violet-500/25">
                      K
                    </span>
                    <h2 className="text-base font-semibold text-white">{t('personal_space')}</h2>
                  </div>
                  <p className="mt-1 pl-11 text-xs text-slate-500">{t('personal_space_desc')}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 min-h-[100px] p-2 rounded-xl">
                {personalProjects.map((board, idx) => (
                  <BoardCard
                    key={board.projectId}
                    title={board.name}
                    colorClass={getGradient(idx)}
                    to={`/board/${board.projectId}`}
                  />
                ))}
                <CreateBoardCard onClick={() => setShowModal(true)} />
              </div>
            </section>

            {/* Org Projects */}
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-sm font-bold text-slate-300">
                  T
                </span>
                <div>
                  <h2 className="text-base font-semibold text-white">{t('org_space')}</h2>
                  <p className="text-xs text-slate-500">{t('org_space_desc')}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 min-h-[100px] p-2 rounded-xl">
                {orgProjects.map((board, idx) => (
                  <BoardCard
                    key={board.projectId}
                    title={board.name}
                    colorClass={getGradient(idx + 1)}
                    to={`/board/${board.projectId}`}
                  />
                ))}
                {orgProjects.length === 0 && (
                  <div className="text-slate-500 text-sm pt-2">{t('no_org_yet')}</div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white">{t('create_project')}</h2>
            <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">{t('project_name')}</label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="Nhập tên dự án..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">{t('team_name')}</label>
                <input
                  type="text"
                  value={newProject.teamName}
                  onChange={(e) => setNewProject({ ...newProject, teamName: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="Để trống = lấy tên dự án"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">{t('project_desc')}</label>
                <textarea
                  rows="3"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="Mô tả dự án..."
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
                >
                  {isSubmitting ? t('creating') : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
