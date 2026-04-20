'use client';

import React, { useState } from 'react';
import {
  Card,
  Button,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
} from '@fluentui/react-components';
import {
  Book24Regular,
  Video24Regular,
  ArrowDownload24Regular,
  Play24Filled,
} from '@fluentui/react-icons';
import { useGetConfigsQuery } from '@/src/graphql/hooks/configuration';

export default function PanduanPage() {
  const [faqOpen, setFaqOpen] = useState(false);
  const { data: configData } = useGetConfigsQuery({
    variables: {
      limit: 1,
      offset: 0,
      where: { config_key: { _eq: 'WHATSAPP' } },
    },
  });
  const whatsappNumber = configData?.master_config?.[0]?.config_value || 'nocontact';
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-8 bg-gray-50 pb-12">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Panduan</h1>
        <p className="text-sm text-gray-600 mt-1">
          Panduan dan tutorial penggunaan aplikasi JATANLIN
        </p>
      </div>

      {/* Section 1: Manual Book */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left - Text Content */}
          <div className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Book24Regular className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Manual Book</h2>
                <p className="text-sm text-gray-500">Panduan Lengkap Penggunaan</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Manual book ini berisi panduan lengkap penggunaan aplikasi JATANLIN
              (Jalan Tanpa Kelewatan Muatan). Dokumen ini mencakup semua fitur dan
              fungsi yang tersedia dalam aplikasi, mulai dari proses login,
              pengecekan kendaraan ODOL, hingga verifikasi data.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Pengenalan Sistem</p>
                  <p className="text-sm text-gray-500">Overview aplikasi dan fitur-fitur utama</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Proses Pengecekan ODOL</p>
                  <p className="text-sm text-gray-500">Langkah-langkah deteksi kendaraan bermuatan lebih</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Verifikasi & Pelaporan</p>
                  <p className="text-sm text-gray-500">Cara verifikasi data dan membuat laporan</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">4</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Konfigurasi Sistem</p>
                  <p className="text-sm text-gray-500">Pengaturan master data dan konfigurasi perangkat</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                appearance="primary"
                icon={<ArrowDownload24Regular />}
                size="large"
              >
                Download PDF
              </Button>
              <Button
                appearance="outline"
                size="large"
              >
                Baca Online
              </Button>
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative min-h-100 lg:min-h-full bg-linear-to-br from-blue-500 to-blue-700">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative w-full max-w-md">
                {/* Book mockup */}
                <div className="bg-white rounded-lg shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-gray-100 rounded h-8 w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 rounded h-3 w-full"></div>
                    <div className="bg-gray-200 rounded h-3 w-5/6"></div>
                    <div className="bg-gray-200 rounded h-3 w-4/6"></div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="bg-blue-100 rounded-lg h-20"></div>
                    <div className="bg-blue-100 rounded-lg h-20"></div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="bg-gray-200 rounded h-3 w-full"></div>
                    <div className="bg-gray-200 rounded h-3 w-3/4"></div>
                  </div>
                </div>
                {/* Shadow book behind */}
                <div className="absolute -bottom-2 -right-2 -z-10 bg-white/20 rounded-lg w-full h-full transform rotate-6"></div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-8 left-8 w-16 h-16 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-12 right-12 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute top-1/2 right-8 w-8 h-8 bg-white/20 rounded-full"></div>
          </div>
        </div>
      </Card>

      {/* Section 2: Video Tutorial */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left - Video */}
          <div className="relative min-h-100 lg:min-h-full bg-linear-to-br from-gray-800 to-gray-900">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative w-full max-w-md">
                {/* Video player mockup */}
                <div className="bg-gray-700 rounded-xl shadow-2xl overflow-hidden">
                  {/* Video thumbnail area */}
                  <div className="relative aspect-video bg-linear-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                    {/* Play button */}
                    <button className="w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-200 group">
                      <Play24Filled className="w-8 h-8 text-gray-800 ml-1 group-hover:text-blue-600" />
                    </button>
                    {/* Duration badge */}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      12:45
                    </div>
                  </div>
                  {/* Video controls */}
                  <div className="p-3 bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                      <div className="flex-1">
                        <div className="h-1 bg-gray-600 rounded-full">
                          <div className="h-1 bg-blue-500 rounded-full w-1/3"></div>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-8 right-8 w-16 h-16 bg-white/5 rounded-full"></div>
            <div className="absolute bottom-12 left-12 w-24 h-24 bg-white/5 rounded-full"></div>
          </div>

          {/* Right - Text Content */}
          <div className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Video24Regular className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Video Tutorial</h2>
                <p className="text-sm text-gray-500">Panduan Visual Step-by-Step</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Video tutorial ini akan membantu Anda memahami cara menggunakan
              aplikasi JATANLIN dengan lebih mudah. Ikuti langkah-langkah yang
              ditunjukkan dalam video untuk menguasai setiap fitur aplikasi.
            </p>

            <div className="space-y-4 mb-6">
              {/* Video list */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Play24Filled className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Tutorial Dasar</p>
                  <p className="text-sm text-gray-500">Pengenalan antarmuka dan navigasi</p>
                </div>
                <span className="text-sm text-gray-400">5:30</span>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Play24Filled className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Proses Pengecekan ODOL</p>
                  <p className="text-sm text-gray-500">Cara melakukan pengecekan kendaraan</p>
                </div>
                <span className="text-sm text-gray-400">8:15</span>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Play24Filled className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Verifikasi Data</p>
                  <p className="text-sm text-gray-500">Panduan verifikasi hasil pengecekan</p>
                </div>
                <span className="text-sm text-gray-400">6:45</span>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Play24Filled className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Konfigurasi Master Data</p>
                  <p className="text-sm text-gray-500">Pengaturan kelas kendaraan dan pengguna</p>
                </div>
                <span className="text-sm text-gray-400">7:20</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                appearance="primary"
                icon={<Play24Filled />}
                size="large"
                style={{ backgroundColor: '#7c3aed' }}
              >
                Tonton Semua Video
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Additional Help Section */}
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Butuh Bantuan Lebih?</h3>
          <p className="text-gray-600 mb-4">
            Jika Anda memiliki pertanyaan atau membutuhkan bantuan teknis,
            silakan hubungi tim support kami.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              appearance="outline"
              onClick={() => window.open(whatsappLink, '_blank')}
            >
              Hubungi Support
            </Button>
            <Button appearance="outline" onClick={() => setFaqOpen(true)}>
              FAQ
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={faqOpen} onOpenChange={(_, data) => !data.open && setFaqOpen(false)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>FAQ</DialogTitle>
            <DialogContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">Bagaimana cara verifikasi data kendaraan?</p>
                  <p className="text-sm text-gray-600">
                    Buka detail transaksi, lengkapi data aktual, lalu pilih Verifikasi.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Kenapa status masih "Perlu Ditinjau"?</p>
                  <p className="text-sm text-gray-600">
                    Data belum diverifikasi atau masih disimpan sebagai draf.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bagaimana mengubah master kelas kendaraan?</p>
                  <p className="text-sm text-gray-600">
                    Masuk ke menu Master Kelas Kendaraan, lalu edit data yang diperlukan.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Saya tidak bisa upload bukti tambahan</p>
                  <p className="text-sm text-gray-600">
                    Pastikan file gambar valid dan ukuran tidak melebihi batas.
                  </p>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setFaqOpen(false)}>
                Tutup
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      </div>
    </div>
  );
}
