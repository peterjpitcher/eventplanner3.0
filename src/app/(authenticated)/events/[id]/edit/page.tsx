'use client'

import { useRouter } from 'next/navigation'
import { EventFormSimple } from '@/components/EventFormSimple'
import { updateEvent } from '@/app/actions/events'
import { Event } from '@/types/database'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { use } from 'react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditEventPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [event, setEvent] = useState<Event | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      // Load event and categories in parallel
      const [eventResult, categoriesResult] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .eq('id', resolvedParams.id)
          .single(),
        supabase
          .from('event_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')
      ])
      
      if (eventResult.error) {
        toast.error('Event not found')
        router.push('/events')
        return
      }
      
      setEvent(eventResult.data)
      setCategories(categoriesResult.data || [])
      setLoading(false)
    }
    
    loadData()
  }, [resolvedParams.id, router])

  const handleSubmit = async (data: Partial<Event>) => {
    if (!event) return

    try {
      const formData = new FormData()
      
      // Add all fields to formData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, value.toString())
          }
        }
      })

      const result = await updateEvent(event.id, formData)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Event updated successfully')
        router.push(`/events/${event.id}`)
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event')
    }
  }

  const handleCancel = () => {
    router.push(`/events/${resolvedParams.id}`)
  }

  if (loading || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update event details
        </p>
      </div>
      
      <EventFormSimple 
        event={event}
        categories={categories}
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
      />
    </div>
  )
}