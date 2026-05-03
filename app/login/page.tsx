'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import styles from '../auth.module.css'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back! 🙏')
      router.push(redirect)
      router.refresh()
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>🏠 <span>RentIt</span></Link>
        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subtext}>Log in to your RentIt account</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label className="label">Email address</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                className={`input ${styles.inputInner}`}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className="label">Password</label>
              <Link href="#" className={styles.forgotLink}>Forgot password?</Link>
            </div>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                className={`input ${styles.inputInner}`}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={`btn btn-primary btn-lg w-full ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Signing in...' : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <div className={styles.divider}><span>or</span></div>

        <p className={styles.switchText}>
          Don&apos;t have an account? <Link href={`/signup${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className={styles.switchLink}>Create one →</Link>
        </p>
      </div>
    </div>
  )
}
