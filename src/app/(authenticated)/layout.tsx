'use client'

import { Navigation } from '@/components/Navigation'
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { BottomNavigation } from '@/components/BottomNavigation'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import AddNoteModal from '@/components/modals/AddNoteModal'
import { redirect } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { PermissionProvider } from '@/contexts/PermissionContext'
import type { User } from '@supabase/supabase-js'
import { BugReporterButton } from '@/components/BugReporterButton'

function AuthenticatedLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = useSupabase()
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user)
      }
      setLoading(false)
    })

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
      setLoading(false)
    }

    getUser()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user) {
    redirect('/login')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const openAddNoteModal = () => setIsAddNoteModalOpen(true)
  const closeAddNoteModal = () => setIsAddNoteModalOpen(false)

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden bg-white">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex w-64 flex-col">
            <div className="flex min-h-0 flex-1 flex-col border-r border-gray-300 bg-sidebar">
              <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <div className="px-4">
                  <div className="w-full mb-2">
                    <Image 
                      src="/logo.png" 
                      alt="Management Tools Logo" 
                      width={192}
                      height={192}
                      className="w-full h-auto"
                      priority 
                    />
                  </div>
                  <h1 className="text-xl font-bold text-white text-center w-full">Management Tools</h1>
                </div>
                <div className="mt-5 flex-1">
                  <Navigation onQuickAddNoteClick={openAddNoteModal} />
                </div>
              </div>
              <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                <button
                  onClick={handleSignOut}
                  className="group flex w-full items-center px-2 py-2 text-sm font-medium text-white hover:bg-gray-700 hover:text-gray-100 rounded-md"
                >
                  <ArrowRightOnRectangleIcon
                    className="mr-3 h-6 w-6 text-gray-200 group-hover:text-gray-100"
                    aria-hidden="true"
                  />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 flex max-w-xs w-full bg-sidebar">
              <div className="flex w-full flex-col">
                <div className="flex items-center justify-between h-16 px-4 border-b border-green-600">
                  <h2 className="text-lg font-semibold text-white">Menu</h2>
                  <button
                    type="button"
                    className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                  <Navigation onQuickAddNoteClick={() => {
                    openAddNoteModal()
                    setIsMobileMenuOpen(false)
                  }} />
                </div>
                <div className="flex flex-shrink-0 border-t border-green-600 p-4">
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="group flex w-full items-center px-2 py-2 text-sm font-medium text-white hover:bg-gray-700 hover:text-gray-100 rounded-md"
                  >
                    <ArrowRightOnRectangleIcon
                      className="mr-3 h-6 w-6 text-gray-200 group-hover:text-gray-100"
                      aria-hidden="true"
                    />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="md:hidden bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                type="button"
                className="rounded-md text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <span className="sr-only">Open menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="flex items-center">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="ml-2 text-sm font-semibold text-gray-900">Management Tools</span>
              </div>
              <div className="w-6" /> {/* Spacer for centering */}
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 pb-20 md:pb-6">
            {children}
          </main>
          
          {/* Footer - Desktop only */}
          <footer className="hidden md:block bg-gray-100 border-t border-gray-200 py-4 px-6">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <p>&copy; 2024 The Anchor. All rights reserved.</p>
              <div className="flex space-x-4">
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">
                  Privacy Policy
                </a>
                <a href="/terms" className="hover:text-gray-900">
                  Terms of Service
                </a>
              </div>
            </div>
          </footer>
          
          <BottomNavigation onQuickAddNoteClick={openAddNoteModal} />
        </div>
      </div>
      <AddNoteModal isOpen={isAddNoteModalOpen} onClose={closeAddNoteModal} />
      <BugReporterButton />
    </div>
  )
}

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <PermissionProvider>
      <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
    </PermissionProvider>
  )
} 