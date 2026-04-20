'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { Button, Input, Text, Spinner } from '@/src/components/atoms';
import { FormField } from '@/src/components/molecules';
import { useLogin } from './hooks';

export default function LoginModule() {
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);
  const { formData, isLoading, error, handleChange, handleSubmit } = useLogin();

  return (
    <FluentProvider theme={webLightTheme}>
      <div className="min-h-screen flex">
        {/* Left Column - Branding & Background */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-linear-to-br from-[#0078D4] via-[#0066B8] to-[#005A9E] relative overflow-hidden">
          {/* Background Pattern/Image */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] bg-repeat"></div>
          </div>

          {/* IoT/Technology Illustration */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Camera Icon */}
              <rect x="200" y="150" width="200" height="150" rx="10" stroke="white" strokeWidth="4" fill="rgba(255,255,255,0.1)"/>
              <circle cx="300" cy="225" r="40" stroke="white" strokeWidth="4" fill="rgba(255,255,255,0.1)"/>
              <circle cx="300" cy="225" r="25" fill="white" opacity="0.3"/>

              {/* Robot Elements */}
              <rect x="150" y="350" width="100" height="120" rx="8" stroke="white" strokeWidth="4" fill="rgba(255,255,255,0.1)"/>
              <circle cx="175" cy="390" r="8" fill="white"/>
              <circle cx="225" cy="390" r="8" fill="white"/>
              <rect x="170" y="420" width="60" height="4" rx="2" fill="white" opacity="0.5"/>

              {/* Network Nodes */}
              <circle cx="450" cy="200" r="15" fill="white" opacity="0.6"/>
              <circle cx="500" cy="280" r="15" fill="white" opacity="0.6"/>
              <circle cx="420" cy="340" r="15" fill="white" opacity="0.6"/>
              <line x1="450" y1="200" x2="500" y2="280" stroke="white" strokeWidth="2" opacity="0.4"/>
              <line x1="500" y1="280" x2="420" y2="340" stroke="white" strokeWidth="2" opacity="0.4"/>
              <line x1="420" y1="340" x2="450" y2="200" stroke="white" strokeWidth="2" opacity="0.4"/>
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
            {/* Logo & Title */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <Image
                    src="/polantas.png"
                    alt="Logo Polantas"
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">KORLANTAS POLRI</h1>
                  <p className="text-xl text-neutral-100 font-bold">Direktorat Penegakan Hukum - Subdit Laka</p>
                </div>
              </div>
            </div>

            {/* Slogan */}
            <div className="mb-16">
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                JATANLIN
                <br />
              </h2>
              <p className="text-lg text-blue-100 max-w-xl font-semibold">
                Platform untuk penegakan hukum lalu lintas yang lebih cepat, akurat, dan transparan.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center bg-white p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#0078D4] rounded-lg flex items-center justify-center">
                <Image
                  src="/polantas.png"
                  alt="Logo Polantas"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#323130]">KORLANTAS POLRI</h1>
                <p className="text-xl text-[#605E5C] font-bold">Direktorat Penegakan Hukum - Subdit Laka</p>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-[#323130] mb-2">Selamat Datang Kembali</h2>
              <Text size={400} className="text-[#605E5C]">
                Masuk untuk melanjutkan ke akun Anda
              </Text>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField label="Alamat Email" required>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="anda@example.com"
                  required
                  disabled={isLoading}
                  fullWidth
                />
              </FormField>

              <FormField label="Kata Sandi" required>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  placeholder="Masukkan kata sandi Anda"
                  required
                  disabled={isLoading}
                  fullWidth
                />
              </FormField>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#8A8886] text-[#0078D4] focus:ring-[#0078D4]"
                  />
                  <Text size={300} className="text-[#605E5C]">Ingat saya</Text>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-[#FEF6F6] border-l-4 border-warning rounded-r">
                  <Text size={300} style={{ color: '#A4262C' }}>
                    {error}
                  </Text>
                </div>
              )}

              {/* Submit Button */}
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="small" />
                    <span>Masuk...</span>
                  </div>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>

            {/* Terms & Privacy */}
            <div className="mt-8 text-center">
              <Text size={300} className="text-[#605E5C]">
                Dengan masuk, anda menyetujui{' '}
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  className="text-[#0078D4] hover:underline font-semibold"
                >
                  Syarat & Ketentuan
                </button>{' '}
                dan{' '}
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="text-[#0078D4] hover:underline font-semibold"
                >
                  Kebijakan Privasi
                </button>
                .
              </Text>
            </div>
          </div>
        </div>
      </div>
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-3 top-3 text-[#605E5C] hover:text-[#323130]"
              aria-label="Tutup"
            >
              ✕
            </button>
            <div className="min-h-[120px]"></div>
          </div>
        </div>
      )}
    </FluentProvider>
  );
}
