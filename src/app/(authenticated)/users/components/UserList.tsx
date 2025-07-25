'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Role } from '@/types/rbac';
import UserRolesModal from './UserRolesModal';
import { format } from 'date-fns';
import { DataTable, Column } from '@/components/ui-v2/display/DataTable';
import { Button } from '@/components/ui-v2/forms/Button';
import { Card } from '@/components/ui-v2/layout/Card';

interface UserListProps {
  users: User[];
  roles: Role[];
}

export default function UserList({ users, roles }: UserListProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);

  const handleManageRoles = (user: User) => {
    setSelectedUser(user);
    setIsRolesModalOpen(true);
  };

  const columns: Column<User>[] = [
    {
      key: 'email',
      header: 'User',
      cell: (user) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {user.email}
          </div>
          <div className="text-sm text-gray-500">
            ID: {user.id}
          </div>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      cell: (user) => (
        <span className="text-sm text-gray-500">
          {format(new Date(user.created_at), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      key: 'last_sign_in_at',
      header: 'Last Sign In',
      cell: (user) => (
        <span className="text-sm text-gray-500">
          {user.last_sign_in_at
            ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy h:mm a')
            : 'Never'}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (user) => (
        <Button
          onClick={() => handleManageRoles(user)}
          variant="link"
          size="sm"
        >
          Manage Roles
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card padding="none">
        <DataTable
          data={users}
          columns={columns}
          getRowKey={(user) => user.id}
          emptyMessage="No users found"
        />
      </Card>

      {selectedUser && (
        <UserRolesModal
          isOpen={isRolesModalOpen}
          onClose={() => {
            setIsRolesModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          allRoles={roles}
        />
      )}
    </>
  );
}