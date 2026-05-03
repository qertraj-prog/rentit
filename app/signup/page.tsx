'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Home, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import styles from '../auth.module.css'

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [role, setRole] = useState<'tenant' | 'owner'>('tenant')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { toast.error('Password kam se kam 6 characters ka hona chahiye'); return }
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role }
      }
    })
    setLoading(false)
    if (error) {
      // Rate limit hit
      if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('email rate')) {
        toast.error('Bahut zyada signup attempts. 1 ghante baad try karo ya doosra email use karo.')
      } else {
        toast.error(error.message)
      }
    } else if (data.session) {
      // Email confirm OFF — user immediately logged in
      toast.success(`Welcome, ${fullName}! 🎉`)
      router.push(redirect)
      router.refresh()
    } else {
      // Email confirm ON — need to verify
      toast.success('Confirmation email bheja gaya! Inbox check karo.')
      router.push(`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>🏠 <span>RentIt</span></Link>
        <h1 className={styles.heading}>Create account</h1>
        <p className={styles.subtext}>Join 1 lakh+ people on RentIt</p>

        {/* Role selector */}
        <div className={styles.roleSelect}>
          <button
            type="button"
            className={`${styles.roleBtn} ${role === 'tenant' ? styles.roleBtnActive : ''}`}
            onClick={() => setRole('tenant')}
          >
            <Users size={20} />
            <span>I&apos;m a Tenant</span>
            <span className={styles.roleDesc}>Looking for a room</span>
          </button>
          <button
            type="button"
            className={`${styles.roleBtn} ${role === 'owner' ? styles.roleBtnActive : ''}`}
            onClick={() => setRole('owner')}
          >
            <Home size={20} />
            <span>I&apos;m an Owner</span>
            <span className={styles.roleDesc}>Have a room to rent</span>
          </button>
        </div>

        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.field}>
            <label className="label">Full Name</label>
            <div className={styles.inputWrap}>
              <User size={16} className={styles.inputIcon} />
              <input
                type="text"
                className={`input ${styles.inputInner}`}
                placeholder="Your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className="label">Phone Number</label>
            <div className={styles.inputWrap}>
              <Phone size={16} className={styles.inputIcon} />
              <input
                type="tel"
                className={`input ${styles.inputInner}`}
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className="label">Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                className={`input ${styles.inputInner}`}
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={`btn btn-primary btn-lg w-full ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Creating account...' : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className={styles.terms}>
          By signing up, you agree to our <Link href="#">Terms</Link> and <Link href="#">Privacy Policy</Link>.
        </p>

        <p className={styles.switchText}>
          Already have an account? <Link href="/login" className={styles.switchLink}>Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
