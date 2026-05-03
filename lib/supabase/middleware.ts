import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const IS_DEV_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

export async function updateSession(request: NextRequest) {
  const url = request.nextUrl.clone()

  // ── DEV MODE (Supabase not configured yet) ───────────────────
  if (IS_DEV_MODE) {
    if (url.pathname.startsWith('/admin')) {
      // Allow the login page through
      if (url.pathname === '/admin/login') {
        return NextResponse.next({ request })
      }

      // Check for dev admin session cookie
      const session = request.cookies.get('dev_admin_session')?.value
      const secret  = process.env.DEV_ADMIN_SECRET ?? 'rentit_admin_local_secret_2026'

      if (session !== secret) {
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }
    }
    return NextResponse.next({ request })
  }

  // ── PRODUCTION MODE (Supabase configured) ────────────────────
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected =
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/admin')

  if (isProtected && !user) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (url.pathname.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

