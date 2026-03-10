'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import QR scanner to avoid SSR issues
// @ts-ignore - react-qr-scanner doesn't have types
const QrScanner = dynamic(() => import('react-qr-scanner'), { ssr: false });

export default function QuickScanPage() {
  const router = useRouter();
  const [claimCode, setClaimCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleScan = async (code: string) => {
    if (!code || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Check if it's a URL (from QR code) or just a code
      let extractedCode = code;
      if (code.includes('/claim/')) {
        // Extract code from URL
        const parts = code.split('/claim/');
        extractedCode = parts[parts.length - 1];
      }

      // Look up the reward to get campaign ID
      const response = await fetch(`/api/game/rewards/${extractedCode.toUpperCase()}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Reward not found');
      }

      const reward = await response.json();
      
      // Redirect to claim page
      router.push(`/admin/games/${reward.campaign_id}/claim/${extractedCode.toUpperCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to look up reward');
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!claimCode.trim()) {
      setError('Please enter a claim code');
      return;
    }

    await handleScan(claimCode);
  };

  const handleQRScan = (data: any) => {
    if (data?.text) {
      handleScan(data.text);
    }
  };

  const handleQRError = (err: any) => {
    console.error('QR Scanner error:', err);
    setCameraError('Camera access denied or not available');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quick Scan</h1>
          <p className="text-gray-600">Scan QR code or enter claim code</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setScanMode(false);
              setCameraError(null);
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              !scanMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setScanMode(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              scanMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📷 Scan QR
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {cameraError && scanMode && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded text-sm">
            {cameraError}
            <p className="mt-2">Please allow camera access or use manual entry.</p>
          </div>
        )}

        {scanMode ? (
          /* QR Scanner Mode */
          <div className="space-y-4">
            <div className="bg-black rounded-lg overflow-hidden">
              {React.createElement(QrScanner as any, {
                delay: 300,
                onError: handleQRError,
                onScan: handleQRScan,
                style: { width: '100%' },
                constraints: {
                  video: { facingMode: 'environment' }
                }
              })}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Position the QR code within the frame
            </p>
          </div>
        ) : (
          /* Manual Entry Mode */
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Code
              </label>
              <input
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg font-mono text-center uppercase"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enter the 6-character code from the player's phone
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !claimCode.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Looking up...' : 'Look Up Reward'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <Link
              href="/admin/games"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Back to Campaigns
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            💡 Quick Tips
          </h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Claim codes are 6 characters (e.g., ABC123)</li>
            <li>• QR codes link directly to claim page</li>
            <li>• Camera access required for QR scanning</li>
            <li>• Expired rewards cannot be claimed</li>
            <li>• Each code can only be used once</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
