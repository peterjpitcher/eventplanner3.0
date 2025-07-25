'use server'

import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit-server'
import { logAuditEvent } from './audit'
import { headers } from 'next/headers'

export async function signIn(email: string, password: string) {
  try {
    // Rate limit auth attempts by IP
    await checkRateLimit('api', 5) // 5 attempts per minute
    
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Log failed login attempt
      const headersList = await headers()
      const userAgent = headersList.get('user-agent') || 'Unknown'
      const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
                 headersList.get('x-real-ip') || 
                 '127.0.0.1'

      await logAuditEvent({
        user_email: email,
        operation_type: 'login_failed',
        resource_type: 'auth',
        operation_status: 'failure',
        additional_info: {
          error: error.message,
          ip_address: ip,
          user_agent: userAgent
        }
      })

      return { error: 'Invalid email or password' }
    }

    if (data.user) {
      // Log successful login
      await logAuditEvent({
        user_id: data.user.id,
        user_email: data.user.email || undefined,
        operation_type: 'login',
        resource_type: 'auth',
        operation_status: 'success',
        additional_info: { method: 'password' }
      })
    }

    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Too many requests')) {
      return { error: 'Too many login attempts. Please try again later.' }
    }
    console.error('Sign in error:', error)
    return { error: 'An error occurred during sign in' }
  }
}

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  try {
    // Rate limit signup attempts
    await checkRateLimit('api', 2) // 2 signups per minute
    
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      // Log signup
      await logAuditEvent({
        user_id: data.user.id,
        user_email: data.user.email || undefined,
        operation_type: 'signup',
        resource_type: 'auth',
        operation_status: 'success',
        additional_info: {
          method: 'password'
        }
      })
    }

    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Too many requests')) {
      return { error: 'Too many signup attempts. Please try again later.' }
    }
    console.error('Sign up error:', error)
    return { error: 'An error occurred during sign up' }
  }
}

export async function signOut() {
  try {
    const supabase = await createClient()
    
    // Get current user before signing out
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Log signout
      await logAuditEvent({
        user_id: user.id,
        user_email: user.email || undefined,
        operation_type: 'logout',
        resource_type: 'auth',
        operation_status: 'success'
      })
    }
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error: 'An error occurred during sign out' }
  }
}