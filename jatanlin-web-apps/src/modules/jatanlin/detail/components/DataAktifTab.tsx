/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import type { VehicleActualData } from '../../types';
import { VehicleInfoCard } from './VehicleInfoCard';
import { VehicleClassCard } from './VehicleClassCard';
import { ViolationCard } from './ViolationCard';
import { TimelineCard } from './TimelineCard';
import { EvidenceCard } from './EvidenceCard';
import { WimDetailCard } from './WimDetailCard';
import { VacDetailCard } from './VacDetailCard';

interface DataAktifTabProps {
  vehicle: VehicleActualData;
}

export const DataAktifTab: React.FC<DataAktifTabProps> = ({ vehicle }) => {
  return (
    <div className="space-y-6">
      {/* Informasi Kendaraan & Jenis Pelanggaran - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informasi Kendaraan - Kiri */}
        <VehicleInfoCard vehicle={vehicle} />

        {/* Jenis Pelanggaran - Kanan */}
        <ViolationCard vehicle={vehicle} />
      </div>

      {/* Kelas Kendaraan & Batas Legal */}
      <VehicleClassCard vehicle={vehicle} />

      {/* WIM Detail & Error Codes */}
      <WimDetailCard vehicle={vehicle} />

      {/* VAC Axle Detail & Lift Axle Score */}
      <VacDetailCard vehicle={vehicle} />

      {/* Timeline Proses & Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Proses - Kiri (50%) */}
        <TimelineCard vehicle={vehicle} />

        {/* Evidence Tambahan - Kanan (50%) */}
        <EvidenceCard vehicle={vehicle} />
      </div>
    </div>
  );
};
