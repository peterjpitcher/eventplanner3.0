'use client'

import { useEffect, useState } from 'react'
import { getBusinessHours, updateBusinessHours } from '@/app/actions/business-hours'
import { BusinessHours, DAY_NAMES } from '@/types/business-hours'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

export function BusinessHoursManager() {
  const [hours, setHours] = useState<BusinessHours[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadBusinessHours()
  }, [])

  const loadBusinessHours = async () => {
    const result = await getBusinessHours()
    if (result.data) {
      setHours(result.data)
    } else if (result.error) {
      toast.error(result.error)
    }
    setIsLoading(false)
  }

  const handleTimeChange = (dayOfWeek: number, field: keyof BusinessHours, value: string | boolean) => {
    setHours(prevHours => 
      prevHours.map(h => 
        h.day_of_week === dayOfWeek 
          ? { ...h, [field]: value === '' ? null : value }
          : h
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData()
    
    hours.forEach(dayHours => {
      formData.append(`opens_${dayHours.day_of_week}`, dayHours.opens || '')
      formData.append(`closes_${dayHours.day_of_week}`, dayHours.closes || '')
      formData.append(`kitchen_opens_${dayHours.day_of_week}`, dayHours.kitchen_opens || '')
      formData.append(`kitchen_closes_${dayHours.day_of_week}`, dayHours.kitchen_closes || '')
      formData.append(`is_closed_${dayHours.day_of_week}`, dayHours.is_closed.toString())
    })

    const result = await updateBusinessHours(formData)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Business hours updated successfully')
    }
    
    setIsSaving(false)
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading business hours...</div>
  }

  // Reorder days to start with Monday (1) through Sunday (0)
  const reorderedHours = [
    ...hours.filter(h => h.day_of_week >= 1 && h.day_of_week <= 6),
    ...hours.filter(h => h.day_of_week === 0)
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Closed
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opens
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Closes
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kitchen Opens
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kitchen Closes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reorderedHours.map((dayHours) => (
              <tr key={dayHours.day_of_week}>
                <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {DAY_NAMES[dayHours.day_of_week]}
                </td>
                <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={dayHours.is_closed}
                    onChange={(e) => handleTimeChange(dayHours.day_of_week, 'is_closed', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                  <input
                    type="time"
                    value={dayHours.opens || ''}
                    onChange={(e) => handleTimeChange(dayHours.day_of_week, 'opens', e.target.value)}
                    disabled={dayHours.is_closed}
                    className="block w-full px-2 sm:px-3 py-2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 min-h-[40px]"
                  />
                </td>
                <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                  <input
                    type="time"
                    value={dayHours.closes || ''}
                    onChange={(e) => handleTimeChange(dayHours.day_of_week, 'closes', e.target.value)}
                    disabled={dayHours.is_closed}
                    className="block w-full px-2 sm:px-3 py-2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 min-h-[40px]"
                  />
                </td>
                <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                  <input
                    type="time"
                    value={dayHours.kitchen_opens || ''}
                    onChange={(e) => handleTimeChange(dayHours.day_of_week, 'kitchen_opens', e.target.value)}
                    disabled={dayHours.is_closed}
                    className="block w-full px-2 sm:px-3 py-2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 min-h-[40px]"
                  />
                </td>
                <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                  <input
                    type="time"
                    value={dayHours.kitchen_closes || ''}
                    onChange={(e) => handleTimeChange(dayHours.day_of_week, 'kitchen_closes', e.target.value)}
                    disabled={dayHours.is_closed}
                    className="block w-full px-2 sm:px-3 py-2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 min-h-[40px]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {reorderedHours.map((dayHours) => (
          <div key={dayHours.day_of_week} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">
                {DAY_NAMES[dayHours.day_of_week]}
              </h3>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={dayHours.is_closed}
                  onChange={(e) => handleTimeChange(dayHours.day_of_week, 'is_closed', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-2"
                />
                Closed
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Opens</label>
                <input
                  type="time"
                  value={dayHours.opens || ''}
                  onChange={(e) => handleTimeChange(dayHours.day_of_week, 'opens', e.target.value)}
                  disabled={dayHours.is_closed}
                  className="block w-full px-3 py-2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 min-h-[40px]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Closes</label>
                <input
                  type="time"
                  value={dayHours.closes || ''}
                  onChange={(e) => handleTimeChange(dayHours.day_of_week, 'closes', e.target.value)}
                  disabled={dayHours.is_closed}
                  className="block w-full px-3 py-2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 min-h-[40px]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Kitchen Opens</label>
                <input
                  type="time"
                  value={dayHours.kitchen_opens || ''}
                  onChange={(e) => handleTimeChange(dayHours.day_of_week, 'kitchen_opens', e.target.value)}
                  disabled={dayHours.is_closed}
                  className="block w-full px-3 py-2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 min-h-[40px]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Kitchen Closes</label>
                <input
                  type="time"
                  value={dayHours.kitchen_closes || ''}
                  onChange={(e) => handleTimeChange(dayHours.day_of_week, 'kitchen_closes', e.target.value)}
                  disabled={dayHours.is_closed}
                  className="block w-full px-3 py-2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 min-h-[40px]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}