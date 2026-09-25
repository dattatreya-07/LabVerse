'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ExperimentPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const id = params?.id ? String(params.id) : 'antenna-radiation';
    router.replace(`/?exp=${id}`);
  }, [params, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
      <div className="animate-pulse text-sm text-cyan-400 font-mono">
        Loading Experiment Workspace...
      </div>
    </div>
  );
}
