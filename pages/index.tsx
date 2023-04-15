import chroma from 'chroma-js';
import sql from 'sql-template-strings';
import { Bar, BarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import mysql from 'mysql2/promise';
import { differenceInDays, format, isEqual, startOfDay, subDays, subHours } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronsDown, ChevronsUp, ExternalLink } from 'react-feather';
import { TabPane, TabPaneContainer } from '@/components/TabPane';
import { Logo } from '@/components/Logo';
import { Histogram } from '@/components/Histogram';
import { pool } from '@/db';

type PopularResponse = Record<'day' | 'week' | 'month' | 'year', { itemid: number, name: string, count: number, previous_count: null | number }[]>;
type RecentResponse = Array<{ time: string, neame: string }>;

export default function Home() {
  const [purchasesPerHour, setPurchasesPerHour] = useState<{ count: number, diff: number }[] | null>(null);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`/api/spending`);
      const data = await response.json();

      setPurchasesPerHour(data);
    };

    run();
  }, []);

  const [mostPopularItems, setMostPopularItems] = useState<PopularResponse | null>(null);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`/api/popular`);
      const data = await response.json();

      setMostPopularItems(data);
    };

    run();
  }, []);

  const [mostRecentPurchases, setMostRecentPurchases] = useState<RecentResponse | null>(null);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`/api/recent`);
      const data = await response.json();

      setMostRecentPurchases(data);
    };

    run();
  }, []);
  
  const data = useMemo(() => {
    if (purchasesPerHour === null) {
      return [];
    }

    return [...purchasesPerHour].splice(purchasesPerHour.length - 5 * 24, 5 * 24) as { diff: number, count: number }[];
  }, [purchasesPerHour]);

  const popularPanes = useMemo(() => {
    return ([['day', 'Day'], ['week', 'Week'], ['month', 'Month'], ['year', 'Year']] as const)
      .map(([key, label]) => (
        <TabPane key={key} label={label}>
          { (mostPopularItems?.[key] ?? []).map(({ count, name, previous_count }: any) => {
            let trend_indicator = null;

            if (previous_count !== null) {
              if (previous_count < count) {
                trend_indicator = (
                  <div className="flex items-center top-0.5 text-green-400 font-bold relative">
                    { count - previous_count }
                    <ChevronsUp className="h-4 relative -top-0.5 -left-0.5" strokeWidth={3} />
                  </div>
                );
              } else if (previous_count > count) {
                trend_indicator = (
                  <div className="flex items-center top-0.5 text-red-400 font-bold relative">
                    { previous_count - count }
                    <ChevronsDown className="h-4 relative -top-0.5 -left-0.5" strokeWidth={3} />
                  </div>
                );
              }
            }

            return (
              <li key={name} className="py-2 pl-3 pr-1 rounded-md bg-zinc-100 bg-opacity-5 flex gap-2 mb-2 items-center">
                <span className="text-zinc-400">{count}x</span>
                <span className="font-semibold text-zinc-200">{name}</span>
                <div className="grow" />
                { trend_indicator }
              </li>
            );
          }) }
        </TabPane>
      ));
  }, [mostPopularItems]);

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-3 lg:py-16 lg:px-24">
      <div className="mb-3 lg:mb-10 flex self-stretch p-6">
        <div className="h-[2.5em] lg:h-[5em]">
          <Logo />
        </div>
        <div className="grow" />
        <div className="items-center justify-end grow gap-5 hidden sm:flex">
          <a href="https://tko-aly.fi/" className={`py-1 pl-2 pr-1 cursor-pointer rounded-md font-bold text-zinc-200 bg-zinc-100 bg-opacity-10`}>
            <span className="relative top-0.5 flex items-center gap-0.5">TKO-äly <ExternalLink className="h-4 relative -top-0.5" /></span>
          </a>
          <a href="https://heppa.tko-aly.fi/" className={`py-1 pl-2 pr-1 cursor-pointer rounded-md font-bold text-zinc-200 bg-zinc-100 bg-opacity-10`}>
            <span className="relative top-0.5 flex items-center gap-0.5">Heppa <ExternalLink className="h-4 relative -top-0.5" /></span>
          </a>
        </div>
      </div>
      <div className="w-full lg:w-[60em] items-center flex flex-col justify-between font-mono text-sm">
        <div className="h-[10em] sm:mt-14 sm:mb-10 lg:h-[20em] w-full">
          <Histogram data={data} />
        </div>
        <div className="grid max-w-[30em] lg:w-full lg:max-w-full grid-cols-1 lg:grid-cols-2 gap-10 mt-3">
          <div className="grow">
            <h2 className="text-2xl text-zinc-200 font-semibold mb-2">Most popular items</h2>
            <TabPaneContainer>
              {popularPanes}
            </TabPaneContainer>
          </div>
          <div className="grow">
            <h2 className="text-2xl text-zinc-200 font-semibold">Most recent purchases</h2>
            <ul className="mt-4 lg:mt-[3.75em]">
              { (mostRecentPurchases ?? []).map(({ time, name }: any) => (
                <li key={name} className="py-2 px-3 rounded-md bg-zinc-100 bg-opacity-5 flex gap-2 mb-2">
                  <span className="text-zinc-400">{time}</span>
                  <span className="font-semibold text-zinc-200">{name}</span>
                </li>
              )) }
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
