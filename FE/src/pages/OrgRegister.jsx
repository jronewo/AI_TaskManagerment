import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUrl, safeFetch, parseBody } from '../api/client'

export default function OrgRegister() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await safeFetch(apiUrl('api/Organizations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })
      const data = await parseBody(res)

      if (res.ok) {
        // Redirect to newly created org dashboard (to be implemented)
        navigate('/org-management')
      } else {
        setError(data.message || 'Đã có lỗi xảy ra khi đăng ký tổ chức.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#020617] overflow-hidden">
      {/* Background neon blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="w-full max-w-lg relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10 opacity-50"></div>
        
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
              Khởi tạo Tổ chức 🏢
            </h1>
            <p className="text-slate-400 text-sm">
              Xây dựng đế chế của bạn. Kết nối đội ngũ và quy trình làm việc chuyên nghiệp.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                Tên tổ chức
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: BeeCyber Corp, FPT Software..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                Mô tả
              </label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chia sẻ về tầm nhìn hoặc lĩnh vực hoạt động..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium resize-none"
              ></textarea>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium animate-shake">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center p-[1px] rounded-xl overflow-hidden shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-transform"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-full bg-slate-900 rounded-[11px] py-4 text-sm font-bold text-white group-hover:bg-transparent transition-colors tracking-widest flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                ) : (
                  <>
                    XÁC NHẬN ĐĂNG KÝ
                    <svg className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full text-[11px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors mt-2"
            >
              HỦY BỎ & QUAY LẠI
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
