import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { googleLoginApi } from '../../api/auth'
import { saveSession } from '../../lib/authStorage'

/**
 * @param {'signin_with' | 'signup_with' | 'continue_with'} props.text
 * @param {(msg: string) => void} [props.setError]
 */
export function GoogleConnectButton({ text = 'signin_with', setError }) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

  if (!clientId) {
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-xs leading-relaxed text-amber-900">
        Cấu hình{' '}
        <code className="rounded bg-amber-100/80 px-1 font-mono text-[11px]">
          VITE_GOOGLE_CLIENT_ID
        </code>{' '}
        trong{' '}
        <code className="rounded bg-amber-100/80 px-1 font-mono text-[11px]">
          FE/.env.development
        </code>{' '}
        (cùng Web Client ID với{' '}
        <code className="rounded bg-amber-100/80 px-1 font-mono text-[11px]">
          GoogleAuth:ClientId
        </code>{' '}
        trên API). Trên Google Cloud Console thêm Authorized JavaScript origins:{' '}
        <code className="font-mono text-[11px]">http://localhost:5173</code>.
      </p>
    )
  }

  return (
    <div className="relative w-full">
      {busy ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 text-sm text-gray-600">
          Đang xác thực với server…
        </div>
      ) : null}
      <div className="flex w-full justify-center overflow-hidden rounded-lg border border-gray-300 bg-white">
        <GoogleLogin
          text={text}
          shape="rectangular"
          size="large"
          width="384"
          theme="outline"
          onSuccess={async (credentialResponse) => {
            const cred = credentialResponse.credential
            if (!cred) {
              setError?.('Không nhận được token từ Google.')
              return
            }
            setBusy(true)
            setError?.('')
            try {
              const data = await googleLoginApi(cred)
              saveSession({ userId: data.userId, name: data.name, email: data.email, role: data.role, isOrgOwner: data.isOrgOwner })
              
              // Handle first login logic similarly
              if (data.isFirstLogin && data.role !== 'Admin' && data.role !== 'ADMIN') {
                navigate('/profile', { replace: true })
                return
              }

              // Role-based redirection
              if (data.role && data.role.toUpperCase() === 'ADMIN') {
                navigate('/admin/dashboard', { replace: true })
              } else if (data.isOrgOwner) {
                navigate('/org-dashboard', { replace: true })
              } else {
                navigate('/dashboard', { replace: true })
              }
            } catch (err) {
              setError?.(
                err instanceof Error ? err.message : 'Đăng nhập Google thất bại.'
              )
            } finally {
              setBusy(false)
            }
          }}
          onError={() =>
            setError?.('Đăng nhập Google bị hủy hoặc lỗi phía Google.')
          }
        />
      </div>
    </div>
  )
}
