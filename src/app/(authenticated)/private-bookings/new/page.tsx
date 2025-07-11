'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  UserIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  CurrencyPoundIcon
} from '@heroicons/react/24/outline'
import { createPrivateBooking } from '@/app/actions/privateBookingActions'
import CustomerSearchInput from '@/components/CustomerSearchInput'

interface Customer {
  id: string
  first_name: string
  last_name: string
  mobile_number: string | null
  email: string | null
}

export default function NewPrivateBookingPage() {
  const router = useRouter()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerFirstName, setCustomerFirstName] = useState('')
  const [customerLastName, setCustomerLastName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Update form when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerFirstName(selectedCustomer.first_name)
      setCustomerLastName(selectedCustomer.last_name)
      setContactPhone(selectedCustomer.mobile_number || '')
      setContactEmail(selectedCustomer.email || '')
    }
  }, [selectedCustomer])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    // Add customer_id if a customer was selected
    if (selectedCustomer) {
      formData.set('customer_id', selectedCustomer.id)
    }

    try {
      const result = await createPrivateBooking(formData)
      
      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
      } else if (result.success && result.data) {
        router.push(`/private-bookings/${result.data.id}`)
      }
    } catch {
      setError('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  // Get tomorrow's date as default event date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]
  
  // Set min date to today and max to 1 year from now
  const today = new Date().toISOString().split('T')[0]
  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
  const maxDate = oneYearFromNow.toISOString().split('T')[0]

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/private-bookings"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Back to bookings
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-2xl font-bold text-gray-900">New Private Booking</h2>
          <p className="text-gray-600 mt-1">Create a new venue hire booking</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
              Customer Information
            </h3>
            
            <div className="space-y-4">
              {/* Customer Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Existing Customer
                </label>
                <CustomerSearchInput
                  onCustomerSelect={setSelectedCustomer}
                  placeholder="Search by name or phone number..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Search for an existing customer or leave blank to create a new one
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customer_first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="customer_first_name"
                    name="customer_first_name"
                    value={customerFirstName}
                    onChange={(e) => setCustomerFirstName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="customer_last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="customer_last_name"
                    name="customer_last_name"
                    value={customerLastName}
                    onChange={(e) => setCustomerLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    <PhoneIcon className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="contact_phone"
                    name="contact_phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="07700 900000"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                  <EnvelopeIcon className="inline h-4 w-4 mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
              Event Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  id="event_date"
                  name="event_date"
                  required
                  defaultValue={defaultDate}
                  min={today}
                  max={maxDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-1">
                  <CalendarIcon className="inline h-4 w-4 mr-1" />
                  Event Type
                </label>
                <input
                  type="text"
                  id="event_type"
                  name="event_type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Birthday Party, Wedding, Corporate Event..."
                />
              </div>
              <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                  <BuildingOfficeIcon className="inline h-4 w-4 mr-1" />
                  Booking Source
                </label>
                <select
                  id="source"
                  name="source"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select source...</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="walk-in">Walk-in</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                  <ClockIcon className="inline h-4 w-4 mr-1" />
                  Start Time *
                </label>
                <input
                  type="time"
                  id="start_time"
                  name="start_time"
                  required
                  defaultValue="18:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  id="end_time"
                  name="end_time"
                  defaultValue="23:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="guest_count" className="block text-sm font-medium text-gray-700 mb-1">
                  <UserGroupIcon className="inline h-4 w-4 mr-1" />
                  Guest Count
                </label>
                <input
                  type="number"
                  id="guest_count"
                  name="guest_count"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="50"
                />
              </div>
            </div>
          </div>

          {/* Setup Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-400" />
              Setup Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="setup_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Setup Date
                </label>
                <input
                  type="date"
                  id="setup_date"
                  name="setup_date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="mt-1 text-xs text-gray-500">Leave blank if same as event date</p>
              </div>
              <div>
                <label htmlFor="setup_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Setup Time
                </label>
                <input
                  type="time"
                  id="setup_time"
                  name="setup_time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="mt-1 text-xs text-gray-500">When vendors can start setup</p>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CurrencyPoundIcon className="h-5 w-5 mr-2 text-gray-400" />
              Financial Details (Optional)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit Amount (£)
                </label>
                <input
                  type="number"
                  id="deposit_amount"
                  name="deposit_amount"
                  step="0.01"
                  min="0"
                  defaultValue="250"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="mt-1 text-xs text-gray-500">Default is £250</p>
              </div>
              <div>
                <label htmlFor="balance_due_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Balance Due Date
                </label>
                <input
                  type="date"
                  id="balance_due_date"
                  name="balance_due_date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="mt-1 text-xs text-gray-500">Leave blank to auto-calculate (7 days before event)</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-400" />
              Additional Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="customer_requests" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Requests
                </label>
                <textarea
                  id="customer_requests"
                  name="customer_requests"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Special requests, dietary requirements, decorations..."
                />
              </div>
              
              <div>
                <label htmlFor="internal_notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Notes
                </label>
                <textarea
                  id="internal_notes"
                  name="internal_notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Staff notes, setup requirements, important reminders..."
                />
              </div>
              
              <div>
                <label htmlFor="special_requirements" className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requirements
                </label>
                <textarea
                  id="special_requirements"
                  name="special_requirements"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Equipment needs, layout preferences, technical requirements..."
                />
              </div>
              
              <div>
                <label htmlFor="accessibility_needs" className="block text-sm font-medium text-gray-700 mb-1">
                  Accessibility Needs
                </label>
                <textarea
                  id="accessibility_needs"
                  name="accessibility_needs"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Wheelchair access, hearing loops, dietary restrictions..."
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Link
              href="/private-bookings"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isSubmitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}