import { Link, useNavigate } from 'react-router-dom'
import { TaskGenieLogo } from '../components/TaskGenieLogo'
import { getUserId, getDisplayName, clearSession } from '../lib/authStorage'

export default function Landing() {
  const navigate = useNavigate()
  const loggedIn = Boolean(getUserId())
  const userName = getDisplayName()

  function handleLogout() {
    clearSession()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-rose-500/5 blur-[100px]"></div>
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 lg:px-12 backdrop-blur-sm">
        <TaskGenieLogo variant="aurora" className="[&_svg]:h-9 [&_svg]:w-9 [&_span]:text-xl" />
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-400">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Tính năng</a>
          <a href="#roles" className="hover:text-cyan-400 transition-colors">Hướng dẫn sử dụng</a>
          <a href="#ai" className="hover:text-cyan-400 transition-colors">About Us</a>
        </div>
        <div className="flex items-center gap-4">
          {loggedIn ? (
            <>
              <Link to="/dashboard" className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-sm font-bold text-white uppercase tracking-widest hover:from-cyan-500/30 hover:to-purple-500/30 transition-all shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                Bảng điều khiển
              </Link>
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 via-violet-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white shadow-md ring-2 ring-white/10 group-hover:ring-cyan-500/40 transition-all">
                  {userName ? userName.substring(0, 2).toUpperCase() : '??'}
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-all"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-white hover:text-cyan-400 transition-all">Đăng nhập</Link>
              <Link to="/register" className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]">Khởi tạo ngay</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-8 animate-bounce-subtle">
             ✨ Next-Gen AI Management Platform
           </div>
           <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
             THAY ĐỔI CÁCH <br/> 
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500">QUẢN LÝ DỰ ÁN</span>
           </h1>
           <p className="max-w-2xl mx-auto text-lg text-slate-400 font-medium mb-12 leading-relaxed">
             TaskGenie kết hợp sức mạnh của AI để phân tích kỹ năng, dự báo rủi ro 
             và tối ưu hóa hiệu suất cho cá nhân và tổ chức.
           </p>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {loggedIn ? (
                <Link to="/dashboard" className="group relative px-8 py-5 rounded-2xl bg-cyan-500 text-slate-950 font-black uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95 transition-all">
                  VÀO BẢNG ĐIỀU KHIỂN
                </Link>
              ) : (
                <Link to="/register" className="group relative px-8 py-5 rounded-2xl bg-cyan-500 text-slate-950 font-black uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95 transition-all">
                  BẮT ĐẦU MIỄN PHÍ
                </Link>
              )}
           </div>
        </div>

        {/* Feature Grid based on Roles */}
        <section id="roles" className="mt-40 max-w-7xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] mb-4">SEGMENTED SOLUTIONS</h2>
              <h3 className="text-3xl font-black text-white uppercase">Giải pháp theo từng đối tượng</h3>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              <RoleCard 
                title="Khách Hàng (Guest)"
                desc="Giao diện Landing Page bắt mắt, dễ dàng khám phá tính năng và đăng ký tài khoản nhanh chóng qua Google."
                icon="🌍"
                color="from-cyan-500/20 to-teal-500/5"
              />
              <RoleCard 
                title="Thành Viên (Member)"
                desc="Quản lý Task cá nhân, theo dõi Skill và nhận đánh giá từ Leader. Tối ưu hóa lộ trình phát triển bản thân."
                icon="⚡"
                color="from-purple-500/20 to-indigo-500/5"
              />
              <RoleCard 
                title="Tổ chức (Organization)"
                desc="Phân quyền Enterprise, quản lý đa dự án, xây dựng đội ngũ và theo dõi hiệu suất toàn diện."
                icon="🏢"
                color="from-rose-500/20 to-amber-500/5"
              />
           </div>
        </section>

        {/* AI Showcase */}
        <section id="ai" className="mt-40 max-w-7xl mx-auto p-12 lg:p-20 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-white/5 rounded-[60px] relative overflow-hidden group">
           <div className="absolute top-0 right-0 h-96 w-96 bg-cyan-500/5 blur-[120px] rounded-full group-hover:bg-cyan-500/10 transition-all duration-700"></div>
           
           <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
              <div className="flex-1">
                 <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-6">AI POWERED ANALYSIS</div>
                 <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-8 leading-tight">
                    TỰ ĐỘNG HÓA <br/> VỚI AI GENIE
                 </h2>
                 <p className="text-slate-400 text-lg leading-relaxed mb-10">
                    Sử dụng LLM để phân tích mô tả công việc, tự động gán nhãn, 
                    phát hiện rủi ro thời hạn và đề xuất nhân sự dựa trên 
                    bản đồ kỹ năng của từng thành viên.
                 </p>
                 <ul className="space-y-4">
                    <li className="flex gap-3 text-sm font-bold text-slate-300">
                       <span className="text-cyan-400">✔</span> Risk Analysis Metrics
                    </li>
                    <li className="flex gap-3 text-sm font-bold text-slate-300">
                       <span className="text-cyan-400">✔</span> Skill-Match Algorithms
                    </li>
                    <li className="flex gap-3 text-sm font-bold text-slate-300">
                       <span className="text-cyan-400">✔</span> Intelligent Scheduling
                    </li>
                 </ul>
              </div>
              
              <div className="flex-1 w-full max-w-md">
                 <div className="relative aspect-square rounded-[40px] border border-white/10 bg-slate-950/50 p-8 shadow-3xl flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent"></div>
                    <div className="h-48 w-48 rounded-full border border-cyan-500/30 flex items-center justify-center animate-spin-slow">
                       <div className="h-32 w-32 rounded-full border border-purple-500/30 flex items-center justify-center animate-reverse-spin">
                          <div className="h-16 w-16 bg-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.8)] rounded-full"></div>
                       </div>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                       <div className="text-[10px] font-bold text-cyan-400 uppercase mb-1">AI Recommendation</div>
                       <div className="text-xs text-white opacity-80 italic">"Gợi ý gán Task #204 cho user @Trong (Skills: Next.js, API Integration)"</div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <TaskGenieLogo variant="aurora" className="scale-75" />
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">
              © 2026 AI TASKGENIE · BUILT FOR THE FUTURE
            </div>
            <div className="flex gap-6">
              <span className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer opacity-50">𝕏</span>
              <span className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer opacity-50">𝑓</span>
            </div>
         </div>
      </footer>
    </div>
  )
}

function RoleCard({ title, desc, icon, color }) {
  return (
    <div className={`p-8 rounded-[40px] bg-gradient-to-br ${color} border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative shadow-2xl`}>
       <div className="text-4xl mb-6 transform group-hover:scale-125 transition-transform duration-500">{icon}</div>
       <h4 className="text-xl font-bold text-white uppercase mb-4 tracking-tight">{title}</h4>
       <p className="text-sm text-slate-400 leading-relaxed font-medium">{desc}</p>
       <div className="absolute top-0 right-0 h-24 w-24 bg-white/5 blur-3xl rounded-full -mr-12 -mt-12 transition-all"></div>
    </div>
  )
}
