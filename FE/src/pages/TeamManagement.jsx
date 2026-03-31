import { useState, useEffect } from 'react'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { getMyTeams, addTeamMember, removeTeamMember } from '../api/teams'
import { getUserId } from '../lib/authStorage'
import { createInvitation } from '../api/invitations'
import { useLang } from '../lib/LanguageContext'

export default function TeamManagement() {
  const { t } = useLang()
  const currentUserId = Number(getUserId())
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    try {
      setLoading(true)
      // Only fetch teams I belong to or created
      const data = await getMyTeams()
      setTeams(data)
      if (data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(e) {
    e.preventDefault()
    if (!selectedTeam || !inviteEmail.trim()) return
    setSending(true)
    try {
      await createInvitation({
        teamId: selectedTeam.teamId,
        email: inviteEmail,
        status: 'Pending'
      })
      alert('Đã gửi lời mời thành công!')
      setInviteEmail('')
    } catch (err) {
      alert(err.message || 'Lỗi gửi lời mời.')
    } finally {
      setSending(false)
    }
  }

  async function handleKick(memberId) {
    if (!confirm('Xác nhận kích thành viên này ra khỏi nhóm?')) return
    try {
      await removeTeamMember(memberId)
      fetchTeams()
    } catch (err) {
      alert(err.message)
    }
  }

  const isTeamCreator = selectedTeam?.createdBy === currentUserId

  return (
    <DashboardLayout>
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t('team_management')}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {t('team_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team List */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('team_list')}</p>
            {loading ? (
              <div className="text-sm text-slate-400">Đang tải...</div>
            ) : teams.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-slate-500">Bạn chưa thuộc nhóm nào.</p>
                <p className="text-xs text-slate-600 mt-2">Tạo dự án mới từ Dashboard để tự động tạo nhóm.</p>
              </div>
            ) : (
              teams.map(team => (
                <button
                  key={team.teamId}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full text-left p-4 rounded-2xl border transition ${
                    selectedTeam?.teamId === team.teamId 
                      ? 'border-cyan-500/30 bg-cyan-500/5' 
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                      {team.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{team.name}</p>
                      <p className="text-[10px] text-slate-500">{team.members?.length || 0} thành viên
                        {team.createdBy === currentUserId && <span className="ml-1 text-cyan-400">• Bạn tạo</span>}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Team Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTeam ? (
              <>
                {/* Members Table */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-xl">
                  <h3 className="text-sm font-bold text-white mb-4">{t('team_members')} — {selectedTeam.name}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-left">
                          <th className="py-2 px-3 text-xs font-bold text-slate-400">{t('full_name')}</th>
                          <th className="py-2 px-3 text-xs font-bold text-slate-400">{t('role_label')}</th>
                          {isTeamCreator && <th className="py-2 px-3 text-xs font-bold text-slate-400">{t('actions')}</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTeam.members?.length > 0 ? selectedTeam.members.map(member => (
                          <tr key={member.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
                                  {member.userName?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="text-slate-200 font-medium">{member.userName}</p>
                                  {member.userEmail && <p className="text-[10px] text-slate-500">{member.userEmail}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                member.role === 'LEADER' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'
                              }`}>
                                {member.role}
                              </span>
                            </td>
                            {isTeamCreator && (
                              <td className="py-2.5 px-3">
                                <div className="flex gap-2">
                                  {member.userId !== currentUserId && (
                                    <button
                                      onClick={() => handleKick(member.id)}
                                      className="text-[10px] font-bold text-rose-400 hover:text-rose-300 px-2 py-1 rounded border border-rose-500/20 hover:bg-rose-500/10"
                                    >
                                      {t('kick')}
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={isTeamCreator ? 3 : 2} className="py-6 text-center text-slate-500 text-xs">
                              {t('no_members')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Invite — Only for team creator */}
                {isTeamCreator && (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-xl">
                    <h3 className="text-sm font-bold text-white mb-2">{t('invite_title')}</h3>
                    <p className="text-xs text-slate-400 mb-4">{t('invite_desc')}</p>
                    <form onSubmit={handleInvite} className="flex gap-2">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder={t('invite_placeholder')}
                        className="flex-1 rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500/30 focus:outline-none"
                        required
                      />
                      <button
                        type="submit"
                        disabled={sending}
                        className="rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 transition disabled:opacity-50"
                      >
                        {sending ? '...' : t('send_invite')}
                      </button>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-slate-500">
                <p className="text-lg mb-2">👈</p>
                <p className="text-sm">Chọn một nhóm để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
