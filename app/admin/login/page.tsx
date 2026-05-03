'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import styles from './login.module.css'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('Galat email ya password. Dobara try karo.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.iconWrap}>
          <ShieldCheck size={32} className={styles.icon} />
        </div>
        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.sub}>RentIt Admin Panel — Authorized Access Only</p>

        <form onSubmit={handleLogin} className={styles.form}>
          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrap}>
              <Mail size={15} className={styles.inputIcon} />
              <input
                type="email"
                className={styles.input}
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={15} className={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass(v => !v)}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.error}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <><span className={styles.spinner} /> Signing in…</>
            ) : (
              <>Enter Admin Panel <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className={styles.note}>
          🔒 This panel is for authorized admins only.
          Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  )
}
