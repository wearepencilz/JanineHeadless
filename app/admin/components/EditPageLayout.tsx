'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/app/admin/components/ui/button';

interface EditPageLayoutProps {
  title: string;
  backHref: string;
  backLabel: string;
  onSave: () => void | Promise<void>;
  onDelete?: () => void;
  onCancel: () => void;
  saving?: boolean;
  deleting?: boolean;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
  children: ReactNode;
  error?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '7xl';
}

export default function EditPageLayout({
  title,
  backHref,
  backLabel,
  onSave,
  onDelete,
  onCancel,
  saving = false,
  deleting = false,
  deleteDisabled = false,
  deleteDisabledReason,
  children,
  error,
  maxWidth = '3xl',
}: EditPageLayoutProps) {
  const handleDeleteClick = () => {
    if (deleteDisabled) {
      // Delete is disabled, do nothing (tooltip shows reason)
      return;
    }
    if (onDelete) {
      onDelete();
    }
  };

  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '7xl': 'max-w-7xl',
  }[maxWidth];

  return (
    <div className={maxWidthClass}>
      {/* Header with Back Link */}
      <div className="mb-6">
        <Link
          href={backHref}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </Link>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          
          {onDelete && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeleteClick}
              isDisabled={deleting || deleteDisabled}
              isLoading={deleting}
              title={deleteDisabled ? deleteDisabledReason : 'Delete'}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {children}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onSave}
          isLoading={saving}
          isDisabled={saving}
          className="flex-1"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
