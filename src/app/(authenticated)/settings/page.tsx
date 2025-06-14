import Link from 'next/link';
import { 
  TagIcon, 
  ChatBubbleLeftRightIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const settingsSections = [
  {
    name: 'Attachment Categories',
    description: 'Manage categories for employee file attachments',
    href: '/settings/categories',
    icon: TagIcon,
  },
  {
    name: 'SMS Delivery Statistics',
    description: 'Monitor SMS delivery performance and manage customer messaging',
    href: '/settings/sms-delivery',
    icon: ChatBubbleLeftRightIcon,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage application settings and configurations
          </p>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <ul role="list" className="divide-y divide-gray-200">
          {settingsSections.map((section) => (
            <li key={section.href}>
              <Link href={section.href} className="block hover:bg-gray-50 px-4 py-4 sm:px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <section.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">{section.name}</p>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                  <div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}