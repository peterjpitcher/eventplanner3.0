'use client'

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { EmployeeAttachment } from '@/types/database';
import { deleteEmployeeAttachment, getAttachmentSignedUrl } from '@/app/actions/employeeActions';
import {
  PaperClipIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { formatBytes } from '@/lib/utils'; // Ensuring this path is correct

interface EmployeeAttachmentsListProps {
  employeeId: string;
  attachments: EmployeeAttachment[] | null; // Pass attachments as prop
  categoriesMap: Map<string, string>; // Pass categories map for display
  onDelete?: () => void; // Callback when attachment is deleted
}

function DeleteAttachmentButton({ employeeId, attachmentId, storagePath, attachmentName, onDelete }: {
  employeeId: string;
  attachmentId: string;
  storagePath: string;
  attachmentName: string;
  onDelete?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, dispatch] = useActionState(deleteEmployeeAttachment, null);

  useEffect(() => {
    if (state?.type === 'success') {
      setIsOpen(false);
      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete();
      }
    } else if (state?.type === 'error') {
      setIsOpen(false);
      alert(`Error: ${state.message}`); // Simple alert for now
    }
  }, [state, onDelete]);

  // This Submit button is specific to the modal's form
  function SubmitActualDeleteButton() {
    const { pending: formSubmitting } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={formSubmitting}
            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50"
        >
            {formSubmitting ? 'Deleting...' : 'Delete'}
        </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="p-2 sm:p-1 font-medium text-red-600 hover:text-red-500 disabled:opacity-50 touch-target"
        title="Delete Attachment"
      >
        <TrashIcon className="h-5 w-5" />
        <span className="sr-only">Delete {attachmentName}</span>
      </button>

      {isOpen && (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <form 
                action={dispatch} // The form element for the modal
                className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full max-w-lg sm:p-6"
              >
                 <input type="hidden" name="employee_id" value={employeeId} />
                 <input type="hidden" name="attachment_id" value={attachmentId} />
                 <input type="hidden" name="storage_path" value={storagePath} />
                 <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                      Delete Attachment
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the attachment &quot;{attachmentName}&quot;? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                {state?.type === 'error' && (
                    <p className="mt-3 text-sm text-red-600 text-center sm:text-left sm:ml-14">
                        {state.message}
                    </p>
                )}
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <SubmitActualDeleteButton />
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function EmployeeAttachmentsList({ attachments, categoriesMap, employeeId, onDelete }: EmployeeAttachmentsListProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);

  const handleDownload = async (attachment: EmployeeAttachment) => {
    try {
      setDownloading(attachment.attachment_id);
      
      const result = await getAttachmentSignedUrl(attachment.storage_path);
      
      if (result.error) {
        alert(`Error: ${result.error}`);
        return;
      }
      
      if (result.url) {
        const link = document.createElement('a');
        link.href = result.url;
        link.setAttribute('download', attachment.file_name || 'download');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Could not generate download link. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('An error occurred while downloading the file. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleView = async (attachment: EmployeeAttachment) => {
    try {
      setViewing(attachment.attachment_id);
      
      const result = await getAttachmentSignedUrl(attachment.storage_path);
      
      if (result.error) {
        alert(`Error: ${result.error}`);
        return;
      }
      
      if (result.url) {
        // Open in new tab
        window.open(result.url, '_blank');
      } else {
        alert('Could not generate view link. Please try again.');
      }
    } catch (error) {
      console.error('View error:', error);
      alert('An error occurred while viewing the file. Please try again.');
    } finally {
      setViewing(null);
    }
  };

  // Check if file type is viewable in browser
  const isViewable = (mimeType: string) => {
    const viewableTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
      'text/plain',
      'text/html',
    ];
    return viewableTypes.includes(mimeType.toLowerCase());
  };

  if (!attachments) {
    return <p className="text-sm text-red-500 mt-1">Could not load attachments.</p>;
  }

  if (attachments.length === 0) {
    return <p className="text-sm text-gray-500 mt-1">No attachments for this employee yet.</p>;
  }

  return (
    <ul role="list" className="divide-y divide-gray-200 rounded-md border border-gray-200 mt-4">
      {attachments.map((attachment) => (
        <li key={attachment.attachment_id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-3 sm:pl-3 sm:pr-4 text-sm">
          <div className="flex items-start sm:items-center w-full sm:w-0 sm:flex-1 mb-2 sm:mb-0">
            <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5 sm:mt-0" aria-hidden="true" />
            <div className="ml-2 flex-1 min-w-0">
              <p className="font-medium text-gray-900 break-words">
                {attachment.file_name}
              </p>
              <p className="text-xs text-gray-500">({formatBytes(attachment.file_size_bytes)})</p>
              {attachment.description && <p className="text-xs text-gray-500 mt-1">{attachment.description}</p>}
              <p className="text-xs text-gray-400 mt-1">Category: {categoriesMap.get(attachment.category_id) || 'Unknown'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-2 sm:ml-4 self-end sm:self-auto">
            {isViewable(attachment.mime_type) && (
              <button 
                  onClick={() => handleView(attachment)}
                  type="button" 
                  className="p-2 sm:p-1 font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 touch-target"
                  title="View Attachment"
                  disabled={viewing === attachment.attachment_id}
              >
                <EyeIcon className={`h-5 w-5 ${viewing === attachment.attachment_id ? 'animate-pulse' : ''}`}/>
                <span className="sr-only">View {attachment.file_name}</span>
              </button>
            )}
            <button 
                onClick={() => handleDownload(attachment)}
                type="button" 
                className="p-2 sm:p-1 font-medium text-secondary hover:text-secondary-emphasis disabled:opacity-50 touch-target"
                title="Download Attachment"
                disabled={downloading === attachment.attachment_id}
            >
              <ArrowDownTrayIcon className={`h-5 w-5 ${downloading === attachment.attachment_id ? 'animate-pulse' : ''}`}/>
              <span className="sr-only">Download {attachment.file_name}</span>
            </button>
            <DeleteAttachmentButton 
              employeeId={employeeId}
              attachmentId={attachment.attachment_id}
              storagePath={attachment.storage_path}
              attachmentName={attachment.file_name}
              onDelete={onDelete}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Helper function (move to lib/utils.ts if not already there)
// export function formatBytes(bytes: number, decimals = 2): string {
//   if (bytes === 0) return '0 Bytes';
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
// } 