'use client';

import { use } from 'react';
import { JatanlinVerifyModule } from '@/src/modules/jatanlin/verify';

export default function JatanlinVerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <JatanlinVerifyModule id={id} />;
}
