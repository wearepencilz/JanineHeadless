'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';

interface Settings {
  logo: string;
  email: string;
  companyName: string;
  formatEligibilityRules?: {
    [flavourTypeId: string]: string[];
  };
}

export default function SettingsPage() {
  const [formData, setFormData] = useState<Settings>({
    logo: '',
    email: '',
    companyName: '',
    formatEligibilityRules: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      console.log('Fetched settings:', data);
      setFormData({
        logo: data.logo || '',
        email: data.email || '',
        companyName: data.companyName || '',
        formatEligibilityRules: data.formatEligibilityRules || {},
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();
      console.log('Upload response:', data);
      
      if (data.url) {
        setFormData((prev) => ({ ...prev, logo: data.url }));
        console.log('Logo URL set to:', data.url);
      } else {
        alert('Upload failed: No URL returned');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    console.log('Saving settings:', formData);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const saved = await res.json();
        console.log('Settings saved:', saved);
        alert('Settings saved successfully');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your site settings</p>
      </div>

      {/* Format Eligibility Rules */}
      {formData.formatEligibilityRules && Object.keys(formData.formatEligibilityRules).length > 0 && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Format Eligibility Rules</h2>
          <p className="text-sm text-gray-600 mb-4">
            Default mappings that define which formats accept which flavour types. These rules guide product generation.
          </p>
          
          <div className="space-y-3">
            {Object.entries(formData.formatEligibilityRules).map(([flavourType, formats]) => (
              <div key={flavourType} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    {flavourType}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-600 mb-1">Eligible formats:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {formats.map((format) => (
                      <span
                        key={format}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white border border-gray-300 text-gray-700"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            These rules are used as defaults when creating new formats. Individual formats can override these settings.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div>
            <Input
              label="Company Name"
              type="text"
              value={formData.companyName}
              onChange={(value) => setFormData({ ...formData, companyName: value })}
              isRequired
            />
          </div>

          <div>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              isRequired
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">
              Logo
            </label>
            {formData.logo && (
              <div className="mb-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                <img
                  src={formData.logo}
                  alt="Logo"
                  className="h-24 object-contain"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            {uploading && (
              <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>
                Uploading...
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Supports JPEG, PNG, GIF, WebP, and SVG
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
            isDisabled={saving}
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
