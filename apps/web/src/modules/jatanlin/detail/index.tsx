'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Button,
  Spinner,
  Tab,
  TabList,
} from '@fluentui/react-components';
import {
  ArrowLeft24Regular,
  Info24Regular,
} from '@fluentui/react-icons';
import { useGetVehicleActualByIdQuery } from '@/src/graphql/hooks/transact-vehicle-actual';
import { DataAktifTab } from './components/DataAktifTab';
import { HistoriTab } from './components/HistoriTab';

interface JatanlinDetailModuleProps {
  id: string;
  hideHeader?: boolean;
}

export const JatanlinDetailModule: React.FC<JatanlinDetailModuleProps> = ({
  id,
  hideHeader = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedTab, setSelectedTab] = useState<string>('data-aktif');
  const listPath = pathname.startsWith('/')
    ? '/transaction/jatanlin'
    : '/jatanlin';

  const { data, loading, error } = useGetVehicleActualByIdQuery({
    variables: { id },
  });

  const vehicle = data?.transact_vehicle_actual_by_pk;

  const handleBack = () => {
    router.push(listPath);
  };

  // Debug logging
  React.useEffect(() => {
    console.log('Detail Query State:', { id, loading, error, data, vehicle });
  }, [id, loading, error, data, vehicle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="large" label="Memuat data..." />
      </div>
    );
  }

  if (error || !vehicle) {
    console.error('Detail Error:', error);
    console.log('Vehicle data:', vehicle);
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center">
          <Info24Regular className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Data Tidak Ditemukan
          </h2>
          <p className="text-gray-500 mb-4">
            {error ? `Error: ${error.message}` : 'Data kendaraan yang Anda cari tidak ditemukan atau telah dihapus'}
          </p>
          <p className="text-xs text-gray-400 mb-4">ID: {id}</p>
          <Button appearance="primary" onClick={handleBack}>
            Kembali ke Daftar
          </Button>
        </div>
      </div>
    );
  }

  const plateNo = vehicle.actual_plat_no || vehicle.transact_anpr_capture?.plate_no || '-';

  return (
    <div className={`flex flex-col h-full ${hideHeader ? "" : "p-6"}`}>
      {/* Header */}
      <div className={`${hideHeader ? "mb-3" : "mb-4"} shrink-0`}>
        {!hideHeader && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                appearance="subtle"
                icon={<ArrowLeft24Regular />}
                onClick={handleBack}
              >
                Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Detail Transaksi Kendaraan
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {plateNo}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <TabList
          selectedValue={selectedTab}
          onTabSelect={(_, data) => setSelectedTab(data.value as string)}
        >
          <Tab value="data-aktif">Data Aktif</Tab>
          <Tab value="histori">Histori</Tab>
        </TabList>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {selectedTab === 'data-aktif' && (
          <DataAktifTab vehicle={vehicle} />
        )}
        {selectedTab === 'histori' && (
          <HistoriTab plateNo={plateNo} />
        )}
      </div>
    </div>
  );
};

export default JatanlinDetailModule;
