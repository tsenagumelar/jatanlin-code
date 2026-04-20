'use client';

import { use } from 'react';
import { JatanlinDetailModule } from '@/src/modules/jatanlin/detail';

export default function JatanlinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <JatanlinDetailModule id={id} />;
}
