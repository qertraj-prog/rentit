import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  role: 'tenant' | 'owner' | 'admin'
  is_blocked: boolean
  profile_photo_url: string | null
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchProfile = async (u: User | null) => {
      if (!u) { setProfile(null); setLoading(false); return }
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', u.id)
        .single()
      setProfile(data as UserProfile | null)
      setLoading(false)
    }

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      fetchProfile(u)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      fetchProfile(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, profile, loading }
}
