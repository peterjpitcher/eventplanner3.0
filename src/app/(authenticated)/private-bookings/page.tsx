import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  PlusIcon, 
  CalendarIcon, 
  CurrencyPoundIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  MapPinIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { deletePrivateBooking } from '@/app/actions/privateBookingActions'
import DeleteBookingButton from '@/components/private-bookings/DeleteBookingButton'
import type { PrivateBookingWithDetails, BookingStatus, PrivateBookingItem } from '@/types/private-bookings'
import { formatDateFull, formatTime12Hour } from '@/lib/dateUtils'

async function handleDeleteBooking(formData: FormData) {
  'use server'
  
  const bookingId = formData.get('bookingId') as string
  const result = await deletePrivateBooking(bookingId)
  
  if (result.error) {
    console.error('Error deleting booking:', result.error)
  }
  
  // The revalidatePath in the action will refresh the page
}

// Status configuration
const statusConfig: Record<BookingStatus, { 
  label: string
  color: string
  bgColor: string
}> = {
  draft: { 
    label: 'Draft', 
    color: 'text-gray-700', 
    bgColor: 'bg-gray-100'
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'text-green-700', 
    bgColor: 'bg-green-100'
  },
  completed: { 
    label: 'Completed', 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-100'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'text-red-700', 
    bgColor: 'bg-red-100'
  }
}

export default async function PrivateBookingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check permissions
  const { data: hasViewPermission } = await supabase.rpc('user_has_permission', {
    p_user_id: user.id,
    p_module_name: 'private_bookings',
    p_action: 'view'
  })

  if (!hasViewPermission) {
    redirect('/unauthorized')
  }

  const { data: hasCreatePermission } = await supabase.rpc('user_has_permission', {
    p_user_id: user.id,
    p_module_name: 'private_bookings',
    p_action: 'create'
  })

  const { data: hasDeletePermission } = await supabase.rpc('user_has_permission', {
    p_user_id: user.id,
    p_module_name: 'private_bookings',
    p_action: 'delete'
  })

  // Check management permissions
  const { data: hasManageSpacesPermission } = await supabase.rpc('user_has_permission', {
    p_user_id: user.id,
    p_module_name: 'private_bookings',
    p_action: 'manage_spaces'
  })

  const { data: hasManageCateringPermission } = await supabase.rpc('user_has_permission', {
    p_user_id: user.id,
    p_module_name: 'private_bookings',
    p_action: 'manage_catering'
  })

  const { data: hasManageVendorsPermission } = await supabase.rpc('user_has_permission', {
    p_user_id: user.id,
    p_module_name: 'private_bookings',
    p_action: 'manage_vendors'
  })

  const hasAnyManagementPermission = hasManageSpacesPermission || hasManageCateringPermission || hasManageVendorsPermission

  // Fetch bookings with customer details
  const { data: bookings, error } = await supabase
    .from('private_bookings')
    .select(`
      *,
      customer:customers(id, first_name, last_name, mobile_number),
      items:private_booking_items(line_total)
    `)
    .order('event_date', { ascending: true })

  if (error) {
    console.error('Error fetching private bookings:', error)
  }

  // Calculate totals and enrich data
  const enrichedBookings: PrivateBookingWithDetails[] = bookings?.map(booking => ({
    ...booking,
    calculated_total: booking.items?.reduce((sum: number, item: PrivateBookingItem) => sum + (item.line_total || 0), 0) || 0,
    deposit_status: booking.deposit_paid_date 
      ? 'Paid' 
      : booking.status === 'confirmed' 
        ? 'Required' 
        : 'Not Required',
    days_until_event: Math.ceil((new Date(booking.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  })) || []

  const today = new Date().toISOString().split('T')[0]
  const completedBookings = enrichedBookings.filter(b => b.status === 'completed' || b.event_date < today)
  const upcomingBookings = enrichedBookings.filter(b => b.status !== 'completed' && b.event_date >= today)

  const formatDate = (date: string) => {
    return formatDateFull(date)
  }

  const formatTime = (time: string) => {
    return formatTime12Hour(time)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Private Bookings</h1>
              <p className="text-gray-600 mt-1">Manage venue hire and private events</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                href="/private-bookings/sms-queue"
                className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm sm:text-base"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">SMS Queue</span>
                <span className="sm:hidden">SMS</span>
              </Link>
              <Link
                href="/private-bookings/calendar"
                className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
              >
                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Calendar View</span>
                <span className="sm:hidden">Calendar</span>
              </Link>
              {hasCreatePermission && (
                <Link
                  href="/private-bookings/new"
                  className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm sm:text-base"
                >
                  <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">New Booking</span>
                  <span className="sm:hidden">New</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Upcoming Bookings Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Bookings ({upcomingBookings.length})</h2>
          </div>
          <div className="border-t border-gray-200">
            {upcomingBookings.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming bookings</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new booking.</p>
                {hasCreatePermission && (
                  <div className="mt-6">
                    <Link href="/private-bookings/new">
                      <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        New Booking
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingBookings.map((booking) => {
                      const status = statusConfig[booking.status]
                      const daysUntil = Math.ceil((new Date(booking.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      const isToday = booking.event_date === today
                      const isTomorrow = daysUntil === 1
                      const isThisWeek = daysUntil >= 0 && daysUntil <= 7
                      
                      return (
                        <tr key={booking.id} className={isToday ? 'bg-yellow-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <Link href={`/private-bookings/${booking.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-900">
                                {booking.customer_full_name || booking.customer_name}
                              </Link>
                              {booking.contact_phone && (
                                <div className="text-sm text-gray-500">
                                  <PhoneIcon className="inline h-3 w-3 mr-1" />
                                  {booking.contact_phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {booking.event_type || 'Private Event'}
                            </div>
                            {booking.guest_count && (
                              <div className="text-sm text-gray-500">
                                <UserGroupIcon className="inline h-3 w-3 mr-1" />
                                {booking.guest_count} guests
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(booking.event_date)}
                              {isToday && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Today</span>}
                              {isTomorrow && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Tomorrow</span>}
                              {!isToday && !isTomorrow && isThisWeek && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">This week</span>}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTime(booking.start_time)}
                              {booking.end_time && ` - ${formatTime(booking.end_time)}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                                {status.label}
                              </span>
                              {booking.deposit_status === 'Paid' && (
                                <CheckCircleIcon className="ml-2 h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <CurrencyPoundIcon className="h-4 w-4 text-gray-400 mr-1" />
                              £{(booking.calculated_total || 0).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <Link href={`/private-bookings/${booking.id}`} className="text-blue-600 hover:text-blue-900">
                                View
                              </Link>
                              {hasDeletePermission && (
                                <DeleteBookingButton 
                                  bookingId={booking.id}
                                  bookingName={booking.customer_full_name || booking.customer_name}
                                  deleteAction={handleDeleteBooking}
                                  eventDate={booking.event_date}
                                  status={booking.status}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                <div className="space-y-4 p-4">
                  {upcomingBookings.map((booking) => {
                    const status = statusConfig[booking.status]
                    const daysUntil = Math.ceil((new Date(booking.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    const isToday = booking.event_date === today
                    const isTomorrow = daysUntil === 1
                    const isThisWeek = daysUntil >= 0 && daysUntil <= 7
                    
                    return (
                      <div key={booking.id} className={`bg-white rounded-lg shadow border ${isToday ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'} p-4`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <Link href={`/private-bookings/${booking.id}`} className="font-semibold text-blue-600 hover:text-blue-900">
                              {booking.customer_full_name || booking.customer_name}
                            </Link>
                            {booking.contact_phone && (
                              <div className="text-sm text-gray-500 mt-1">
                                <PhoneIcon className="inline h-3 w-3 mr-1" />
                                {booking.contact_phone}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                              {status.label}
                            </span>
                            {booking.deposit_status === 'Paid' && (
                              <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-900">
                              {booking.event_type || 'Private Event'}
                              {booking.guest_count && (
                                <span className="text-gray-500 ml-2">
                                  • {booking.guest_count} guests
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {formatDate(booking.event_date)}
                              {isToday && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Today</span>}
                              {isTomorrow && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Tomorrow</span>}
                              {!isToday && !isTomorrow && isThisWeek && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">This week</span>}
                            </div>
                            <div className="text-gray-500">
                              {formatTime(booking.start_time)}
                              {booking.end_time && ` - ${formatTime(booking.end_time)}`}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center font-medium text-gray-900">
                            <CurrencyPoundIcon className="h-4 w-4 text-gray-400 mr-1" />
                            £{(booking.calculated_total || 0).toFixed(2)}
                          </div>
                          <div className="flex items-center gap-3">
                            <Link href={`/private-bookings/${booking.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                              View
                            </Link>
                            {hasDeletePermission && (
                              <DeleteBookingButton 
                                bookingId={booking.id}
                                bookingName={booking.customer_full_name || booking.customer_name}
                                deleteAction={handleDeleteBooking}
                                eventDate={booking.event_date}
                                status={booking.status}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              </>
            )}
          </div>
        </div>

        {/* Completed Bookings */}
        {completedBookings.length > 0 && (
          <details className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <summary className="px-4 py-5 sm:px-6 bg-gray-50 cursor-pointer hover:bg-gray-100">
              <h2 className="text-lg font-medium text-gray-900 inline">Completed Bookings ({completedBookings.length})</h2>
            </summary>
            <div className="border-t border-gray-200">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completedBookings.slice(-20).reverse().map((booking) => (
                      <tr key={booking.id} className="text-gray-500">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {booking.customer_full_name || booking.customer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {booking.event_type || 'Private Event'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(booking.event_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          £{(booking.calculated_total || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/private-bookings/${booking.id}`} className="text-blue-600 hover:text-blue-900">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile List View */}
              <div className="md:hidden">
                <div className="divide-y divide-gray-200">
                  {completedBookings.slice(-20).reverse().map((booking) => (
                    <div key={booking.id} className="px-4 py-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.customer_full_name || booking.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.event_type || 'Private Event'} • {formatDate(booking.event_date)}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            £{(booking.calculated_total || 0).toFixed(2)}
                          </div>
                          <Link href={`/private-bookings/${booking.id}`} className="text-sm text-blue-600 hover:text-blue-900">
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>
        )}

        {/* Quick Links Section */}
        {hasAnyManagementPermission && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hasManageSpacesPermission && (
                <Link
                  href="/private-bookings/settings/spaces"
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Manage Spaces
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Configure venue spaces and pricing</p>
                    </div>
                    <MapPinIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
              )}
              
              {hasManageCateringPermission && (
                <Link
                  href="/private-bookings/settings/catering"
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Catering Packages
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Manage food and drink options</p>
                    </div>
                    <SparklesIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
              )}
              
              {hasManageVendorsPermission && (
                <Link
                  href="/private-bookings/settings/vendors"
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Vendor Database
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Maintain preferred vendor list</p>
                    </div>
                    <UserGroupIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}