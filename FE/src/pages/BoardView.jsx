import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { TaskGenieLogo } from '../components/TaskGenieLogo'
import { clearSession, getRole, getToken } from '../lib/authStorage'

const COLS = [
  { id: 'todo', title: 'To Do', bar: 'from-cyan-500 to-teal-600' },
  { id: 'inProgress', title: 'In Progress', bar: 'from-amber-500 to-rose-500' },
  { id: 'done', title: 'Done', bar: 'from-emerald-500 to-cyan-600' },
]

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const initialTasks = {
  todo: [
    { id: '1', title: 'Thiết kế wireframe dashboard', tag: 'Design' },
    { id: '2', title: 'Gọi API đăng nhập từ FE', tag: 'API' },
  ],
  inProgress: [{ id: '3', title: 'Tích hợp Google OAuth', tag: 'Auth' }],
  done: [{ id: '4', title: 'Khởi tạo repo TaskGenie', tag: 'Dev' }],
}

export default function BoardView() {
  const [session, setSession] = useState(() => ({
    token: getToken(),
    role: getRole(),
  }))
  const [tasks, setTasks] = useState(initialTasks)
  const [draft, setDraft] = useState('')
  const [drag, setDrag] = useState(null)
  const loggedIn = Boolean(session.token)

  function logout() {
    clearSession()
    setSession({ token: null, role: null })
  }

  const moveTask = useCallback((fromCol, toCol, taskId) => {
    setTasks((prev) => {
      const fromList = [...prev[fromCol]]
      const idx = fromList.findIndex((t) => t.id === taskId)
      if (idx === -1) return prev
      const [item] = fromList.splice(idx, 1)
      const toList = [...prev[toCol], item]
      return { ...prev, [fromCol]: fromList, [toCol]: toList }
    })
  }, [])

  function handleAdd(e) {
    e.preventDefault()
    const t = draft.trim()
    if (!t) return
    setTasks((prev) => ({
      ...prev,
      todo: [...prev.todo, { id: uid(), title: t, tag: 'Mới' }],
    }))
    setDraft('')
  }

  function onDragStart(colId, taskId) {
    setDrag({ colId, taskId })
  }

  function onDragOver(e) {
    e.preventDefault()
  }

  function onDrop(colId, e) {
    e.preventDefault()
    if (!drag) return
    if (drag.colId === colId) {
      setDrag(null)
      return
    }
    moveTask(drag.colId, colId, drag.taskId)
    setDrag(null)
  }

  function onCardDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  function onCardDrop(colId, beforeTaskId, e) {
    e.preventDefault()
    e.stopPropagation()
    if (!drag) return

    if (drag.colId === colId) {
      setTasks((prev) => {
        const arr = [...prev[colId]]
        const fromIdx = arr.findIndex((t) => t.id === drag.taskId)
        if (fromIdx === -1) return prev
        const [item] = arr.splice(fromIdx, 1)
        let target = arr.findIndex((t) => t.id === beforeTaskId)
        if (target < 0) target = arr.length
        if (fromIdx < target) target -= 1
        arr.splice(target, 0, item)
        return { ...prev, [colId]: arr }
      })
      setDrag(null)
      return
    }

    setTasks((prev) => {
      const fromList = [...prev[drag.colId]]
      const idx = fromList.findIndex((t) => t.id === drag.taskId)
      if (idx === -1) return prev
      const [item] = fromList.splice(idx, 1)
      const toList = [...prev[colId]]
      let at = toList.findIndex((t) => t.id === beforeTaskId)
      if (at < 0) at = toList.length
      toList.splice(at, 0, item)
      return { ...prev, [drag.colId]: fromList, [colId]: toList }
    })
    setDrag(null)
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#070a12] text-slate-300">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.1),transparent)]"
        aria-hidden
      />

      <header className="relative z-10 flex flex-wrap items-center gap-3 border-b border-white/[0.06] bg-slate-950/50 px-4 py-3 backdrop-blur-xl">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
        <Link
          to="/"
          className="flex items-center gap-2 text-slate-400 transition hover:text-cyan-300"
        >
          <span className="text-lg leading-none">←</span>
          <TaskGenieLogo variant="aurora" className="[&_svg]:h-7 [&_svg]:w-7 [&_span]:text-base" />
        </Link>
        <form onSubmit={handleAdd} className="mx-auto flex max-w-md flex-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Thêm thẻ nhanh vào To Do…"
            className="w-full rounded-full border border-white/[0.08] bg-slate-900/70 px-4 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/30 focus:ring-2 focus:ring-cyan-500/15"
          />
        </form>
        <div className="flex items-center gap-2">
          {loggedIn ? (
            <>
              <span className="hidden text-xs text-slate-500 sm:inline">{session.role}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-white/5"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 px-3 py-1.5 text-xs font-semibold text-slate-950"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-xl font-bold text-white">Bảng Kanban</h1>
        <p className="mb-8 text-sm text-slate-500">
          Kéo thả thẻ giữa các cột (demo trên trình duyệt).
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          {COLS.map((col) => (
            <section
              key={col.id}
              className="flex max-h-[min(70vh,640px)] flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-950/50 shadow-xl shadow-black/30 backdrop-blur-sm"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(col.id, e)}
            >
              <div
                className={`h-1 shrink-0 bg-gradient-to-r ${col.bar} opacity-90`}
                aria-hidden
              />
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {col.title}
                </h2>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-semibold text-cyan-300/90">
                  {tasks[col.id].length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
                {tasks[col.id].map((task) => (
                  <article
                    key={task.id}
                    draggable
                    onDragStart={() => onDragStart(col.id, task.id)}
                    onDragOver={onCardDragOver}
                    onDrop={(e) => onCardDrop(col.id, task.id, e)}
                    className="cursor-grab rounded-xl border border-white/[0.06] bg-slate-900/80 p-3 shadow-md transition hover:border-cyan-500/20 active:cursor-grabbing"
                  >
                    <p className="text-sm font-medium text-slate-200">{task.title}</p>
                    {task.tag ? (
                      <span className="mt-2 inline-block rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
                        {task.tag}
                      </span>
                    ) : null}
                  </article>
                ))}
                <div
                  className="min-h-8 flex-1 rounded-xl border border-dashed border-white/10"
                  onDragOver={onDragOver}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (!drag) return
                    if (drag.colId !== col.id) {
                      moveTask(drag.colId, col.id, drag.taskId)
                    }
                    setDrag(null)
                  }}
                />
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
