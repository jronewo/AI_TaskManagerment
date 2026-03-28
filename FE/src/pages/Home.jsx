import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { TaskGenieLogo } from '../components/TaskGenieLogo'
import { clearSession, getRole, getToken } from '../lib/authStorage'

const COLS = [
  { id: 'todo', title: 'To Do', accent: 'bg-slate-100' },
  { id: 'inProgress', title: 'In Progress', accent: 'bg-amber-50' },
  { id: 'done', title: 'Done', accent: 'bg-emerald-50' },
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

export default function Home() {
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
    const list = tasks[colId]
    let insertIndex = list.findIndex((t) => t.id === beforeTaskId)
    if (insertIndex < 0) insertIndex = list.length

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
    <div className="min-h-svh bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="shrink-0">
            <TaskGenieLogo />
          </Link>
          <form
            onSubmit={handleAdd}
            className="mx-auto hidden max-w-md flex-1 sm:flex"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Thêm thẻ nhanh vào To Do…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </form>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {loggedIn ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">
                  Vai trò:{' '}
                  <strong className="text-slate-800">
                    {session.role || '—'}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
        <form onSubmit={handleAdd} className="border-t border-slate-100 px-4 pb-3 sm:hidden">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Thêm thẻ vào To Do…"
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />
        </form>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
              Bảng dự án
            </h1>
            <p className="text-sm text-slate-500">
              Kéo thả thẻ giữa các cột (demo phía client).
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {COLS.map((col) => (
            <section
              key={col.id}
              className={`flex max-h-[min(70vh,640px)] flex-col rounded-2xl border border-slate-200/80 ${col.accent} shadow-sm`}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(col.id, e)}
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 px-4 py-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                  {col.title}
                </h2>
                <span className="rounded-md bg-white/80 px-2 py-0.5 text-xs font-semibold text-slate-600">
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
                    className="cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"
                  >
                    <p className="text-sm font-medium text-slate-800">
                      {task.title}
                    </p>
                    {task.tag ? (
                      <span className="mt-2 inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        {task.tag}
                      </span>
                    ) : null}
                  </article>
                ))}
                <div
                  className="min-h-8 flex-1 rounded-lg border border-dashed border-slate-300/60"
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
