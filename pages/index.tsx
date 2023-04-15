import chroma from 'chroma-js';
import sql from 'sql-template-strings';
import { Bar, BarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import mysql from 'mysql2/promise';
import { differenceInDays, format, isEqual, startOfDay, subDays, subHours } from 'date-fns';
import { useMemo, useRef, useState } from 'react';
import { ChevronsDown, ChevronsUp, ExternalLink } from 'react-feather';
import { TabPane, TabPaneContainer } from '@/components/TabPane';
import { Logo } from '@/components/Logo';
import { Histogram } from '@/components/Histogram';
import { pool } from '@/db';

export async function getServerSideProps() {
  const [purchasesPerHourRows]: [Array<{ diff: number, count: number }>] = await pool.execute(`
    SELECT
      TIMESTAMPDIFF(HOUR, time, NOW()) diff,
      COUNT(*) count
    FROM ITEMHISTORY
    WHERE actionid = 5 AND time > DATE_SUB(NOW(), INTERVAL 31 DAY)
    GROUP BY DATE(time), TIMESTAMPDIFF(HOUR, time, NOW())
    ORDER BY TIMESTAMPDIFF(HOUR, time, NOW()) DESC
  `) as any;

  let purchasesPerHour: any = [];
  let i = 0;

  for (let i = purchasesPerHourRows[0].diff; i >= 0; i--) {
    let count = purchasesPerHourRows.find(r => r.diff === i)?.count;

    if (count) {
      purchasesPerHour.push({ diff: i, count });
    } else {
      purchasesPerHour.push({ diff: i, count: 0 });
    }
  }

  const queryPopular = (hours: number) => pool.execute(sql`
    SELECT c.*, p.count AS previous_count
    FROM (
      SELECT
        RVITEM.itemid,
        RVITEM.descr name,
        COUNT(*) count
      FROM ITEMHISTORY
      JOIN RVITEM ON RVITEM.itemid = ITEMHISTORY.itemid
      WHERE actionid = 5
        AND TIMESTAMPDIFF(HOUR, time, NOW()) <= ${hours}
        AND ITEMHISTORY.itemid NOT IN (58, 56, 1432)
      GROUP BY RVITEM.itemid
      ORDER BY COUNT(*) DESC
      LIMIT 10
    ) c
    LEFT JOIN (
      SELECT
        itemid,
        COUNT(*) count
      FROM ITEMHISTORY
      WHERE actionid = 5
        AND TIMESTAMPDIFF(HOUR, time, NOW()) > ${hours}
        AND TIMESTAMPDIFF(HOUR, time, NOW()) <= ${hours * 2}
      GROUP BY itemid
    ) p ON p.itemid = c.itemid
    ORDER BY c.count DESC
  `)

  const [[day], [week], [month], [year]] = await Promise.all([
    queryPopular(24),
    queryPopular(24 * 7),
    queryPopular(24 * 31),
    queryPopular(24 * 365),
  ]);
  
  const mostPopularItems = { day, week, month, year };

  const [mostRecentPurchases] = await pool.query<any>(`
    SELECT
      descr AS name,
      time
    FROM ITEMHISTORY
    JOIN RVITEM ON RVITEM.itemid = ITEMHISTORY.itemid
    WHERE actionid = 5 AND ITEMHISTORY.itemid NOT IN (58, 56, 1432)
    ORDER BY time
    DESC LIMIT 10
  `);

  return {
    props: {
      purchasesPerHour,
      mostPopularItems,
      mostRecentPurchases: mostRecentPurchases.map((row: any) => ({ name: row.name, time: format(row.time, 'HH:mm') })),
    },
  }
}

export default function Home({ purchasesPerHour, mostPopularItems, mostRecentPurchases }: any) {
  const data = useMemo(() => {
    return [...purchasesPerHour].splice(purchasesPerHour.length - 5 * 24, 5 * 24) as { diff: number, count: number }[];
  }, [purchasesPerHour]);

  const popularPanes = useMemo(() => {
    return [['day', 'Day'], ['week', 'Week'], ['month', 'Month'], ['year', 'Year']]
      .map(([key, label]) => (
        <TabPane key={key} label={label}>
          { mostPopularItems[key].map(({ count, name, previous_count }: any) => {
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
              { mostRecentPurchases.map(({ time, name }: any) => (
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
