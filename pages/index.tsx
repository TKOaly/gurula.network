import chroma from 'chroma-js';
import sql from 'sql-template-strings';
import { Bar, BarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import mysql from 'mysql2/promise';
import { differenceInDays, format, isEqual, parseISO, startOfDay, subDays, subHours } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronsDown, ChevronsUp, ExternalLink } from 'react-feather';
import { TabPane, TabPaneContainer } from '@/components/TabPane';
import { Logo } from '@/components/Logo';
import { Histogram } from '@/components/Histogram';
import { pool } from '@/db';
import { MostPopularList } from '@/components/MostPopularList';
import { MostRecentList } from '@/components/MostRecentList';

export default function Home() {
  const [purchasesPerHour, setPurchasesPerHour] = useState<{ count: number, diff: number }[] | null>(null);
  const [timestamp, setTimestamp] = useState(new Date());

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`/api/spending`);
      const { timestamp, purchasesPerHour } = await response.json();

      setPurchasesPerHour(purchasesPerHour);
      setTimestamp(parseISO(timestamp));
    };

    run();
  }, []);

  const data = useMemo(() => {
    if (purchasesPerHour === null) {
      return [];
    }

    return [...purchasesPerHour].splice(purchasesPerHour.length - 5 * 24, 5 * 24) as { diff: number, count: number }[];
  }, [purchasesPerHour]);


  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-3 lg:py-16 lg:px-24">
      <div className="mb-3 lg:mb-10 flex self-stretch py-6 md:px-6">
        <div className="h-[2.5em] lg:h-[5em]">
          <Logo />
        </div>
        <div className="grow" />
        <div className="items-center justify-end grow gap-5 hidden sm:flex">
          <a href="https://tko-aly.fi/" className={`py-1 pl-2 pr-1 cursor-pointer rounded-md font-bold text-zinc-200 bg-zinc-100 bg-opacity-10`}>
            <span className="flex items-center gap-0.5">TKO-äly <ExternalLink className="h-4" /></span>
          </a>
          <a href="https://heppa.tko-aly.fi/" className={`py-1 pl-2 pr-1 cursor-pointer rounded-md font-bold text-zinc-200 bg-zinc-100 bg-opacity-10`}>
            <span className="flex items-center gap-0.5">Heppa <ExternalLink className="h-4" /></span>
          </a>
        </div>
      </div>
      <div className="w-full lg:w-[60em] items-center flex flex-col justify-between font-mono text-sm">
        <div className="h-[10em] sm:mt-14 sm:mb-10 lg:h-[20em] w-full">
          <Histogram data={data} timestamp={timestamp} />
        </div>
        <div className="grid max-w-[30em] lg:w-full lg:max-w-full grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10 mt-3">
          <MostPopularList />
          <MostRecentList />
        </div>
      </div>
    </main>
  )
}
