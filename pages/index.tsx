import chroma from 'chroma-js';
import sql from 'sql-template-strings';
import { Bar, BarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import mysql from 'mysql2/promise';
import { differenceInDays, format, isEqual, startOfDay, subDays, subHours } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const shuffle = <T extends unknown>(unshuffled: T[]): T[] => unshuffled
  .map(value => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value);

const Logo = () => {
  const [g, u, r] = useMemo(() => shuffle(['#ef4444', '#22c55e', '#0ea5e9']), []);
  const colors = {
    g, u, r,
    ula: 'gray',
    network: 'gray',
  };

  const generateGradient = (id: string, color: string) => (
    <linearGradient id={id} x1={0} x2={0} y1={0} y2={1}>
      <stop offset="0%" stop-color={chroma(color).brighten(0.33)} />
      <stop offset="100%" stop-color={chroma(color).darken(0.33)} />
    </linearGradient>
  );

  return (
    <svg width="92.318mm" height="18.415mm" version="1.1" viewBox="0 0 92.318 18.415" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <defs>
        {Object.entries(colors).map(([ name, color ]) => generateGradient(`${name}_gradient`, color))}
      </defs>
      <g transform="translate(-60.315 -62.893)" stroke-width=".26458">
        <g aria-label="GUR">
          <path fill="url(#g_gradient)" d="m76.349 70.408v8.9958q-2.54 1.8521-6.4029 1.8521-4.2862 0-6.9585-2.4606t-2.6723-6.694q0-4.1804 2.7781-6.694 2.8046-2.5135 7.0908-2.5135 3.0162 0 5.2123 1.1112v4.0746q-2.54-1.4552-5.2123-1.4552-2.5135 0-3.9952 1.5081-1.4817 1.4817-1.4817 3.9687 0 2.5135 1.4552 3.9952 1.4552 1.4817 3.9687 1.4817 1.1377 0 2.249-0.34396v-3.3602h-2.884v-3.466z"/>
          <path fill="url(#u_gradient)" d="m89.948 74.165v-10.954h4.0746v10.927q0 3.4925-1.9579 5.3446-1.9579 1.8256-5.2917 1.8256-3.2808 0-5.2652-1.8256-1.9844-1.8256-1.9844-5.1594v-11.112h4.0746v11.086q0 3.3073 3.175 3.3073 3.175 0 3.175-3.4396z"/>
          <path fill="url(#r_gradient)" d="m101.4 66.518v5.0271h1.9315q2.6458 0 2.6458-2.5929 0-1.1377-0.68792-1.7727-0.68792-0.66146-1.8785-0.66146zm5.1064 14.526-3.8629-6.1912h-1.2435v6.1912h-4.0746v-17.833h6.1648q2.9898 0 4.789 1.5875 1.8256 1.5875 1.8256 4.1275 0 3.81-3.2544 5.2652l4.5244 6.8527z"/>
        </g>
        <text style={{ opacity: 0.33 }} x="112.17315" y="71.809914" fill="#000000" font-family="sans-serif" font-size="13.229px"><tspan x="112.17315" y="71.809914" font-family="Hind" font-size="13.229px" font-weight="bold" stroke-width=".26458">ULA</tspan></text>
        <text style={{ opacity: 0.33 }} x="113.08331" y="81.213181" fill="#000000" font-family="Hind" font-size="10.583px"><tspan x="113.08331" y="81.213181" font-family="Hind" font-size="10.583px" stroke-width=".26458">.network</tspan></text>
      </g>
    </svg>
  );
};

const coffeineContentLookup: Record<string, number> = {
  'Coffee': 96,
  'Aks Al': 32/100*250,
  'Battery no calories': 32/100*250,
  'Pepsi max tÃ¶lkissÃ¤': 32,
};

interface TabBarTab {
  key: string
  label: string
}

type TabBarProps<T extends TabBarTab> = {
  tabs: T[],
  selected: string,
  onSelect: (key: string, i: number, tab: T) => void,
}

const TabBar = <T extends TabBarTab>({ tabs, selected, onSelect }: TabBarProps<T>) => {
  const tabRefs = useRef<HTMLDivElement[]>([]);
  const backgroundRef = useRef<HTMLDivElement>(null);

  const setTabRef = (i: number) => (ref: HTMLDivElement) => tabRefs.current[i] = ref;

  const handleSelect = useCallback((tab: T, i: number) => {
    const ref = tabRefs.current[i];

    if (ref && backgroundRef.current) {
      const size = ref.getBoundingClientRect();
      backgroundRef.current.style.opacity = '1';
      backgroundRef.current.style.width = size.width + 'px';
      backgroundRef.current.style.height = size.height + 'px';
      backgroundRef.current.style.left = ref.offsetLeft + 'px';
      backgroundRef.current.style.top = ref.offsetTop + 'px';
    }

    onSelect(tab.key, i, tab);
  }, [tabRefs, backgroundRef, onSelect]);

  useEffect(() => {
    const background = backgroundRef.current;

    if (background) {
      const handler = () => {
        if (background) {
          background.style.opacity = '0';
        }
      };

      background.addEventListener('transitionend', handler);

      return () => background.removeEventListener('transitionend', handler);
    }
  }, [backgroundRef]);

  return (
    <div className="flex-col md:flex-row flex gap-x-3 gap-y-1 relative items-start">
      <div
        ref={backgroundRef}
        className={`absolute rounded-md bg-zinc-100 transition-[width,heigth,left,top] bg-opacity-20 duration-200`}
        style={{ opacity: '0' }}
      />
      {
        tabs.map((tab, i) => (
          <div
            key={tab.key}
            ref={setTabRef(i)}
            className={`py-1 px-2 transition duration-0 cursor-pointer rounded-md font-bold text-zinc-200 ${selected === tab.key && 'bg-zinc-100 bg-opacity-20 delay-200'}`}
            onClick={() => handleSelect(tab, i)}
          >
            {tab.label}
          </div>
        ))
      }
    </div>
  );
}

export async function getServerSideProps() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  });

  const [purchasesPerHourRows]: [Array<{ diff: number, count: number }>] = await db.execute(`
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

  const [purchasesPerItemPerHourRows]: [Array<{ diff: number, count: number, name: string }>] = await db.execute(`
    SELECT
      TIMESTAMPDIFF(HOUR, time, NOW()) diff,
      COUNT(*) count,
      descr AS name
    FROM ITEMHISTORY
    JOIN RVITEM ON RVITEM.itemid = ITEMHISTORY.itemid
    WHERE actionid = 5 AND time > DATE_SUB(NOW(), INTERVAL 31 DAY)
    GROUP BY DATE(time), HOUR(time), RVITEM.itemid
    ORDER BY TIMESTAMPDIFF(HOUR, time, NOW()) DESC
  `) as any;

  let caffeinePerHour: { diff: number, count: number }[] = [];

  purchasesPerItemPerHourRows
    .forEach(({ diff, count, name }) => {
      if (!caffeinePerHour[diff]) {
        caffeinePerHour[diff] = { diff, count: 0 };
      }

      caffeinePerHour[diff].count += (coffeineContentLookup[name] ?? 0) * count;
    });

  for (let i = 0; i < purchasesPerItemPerHourRows[0].diff; i++) {
    if (!caffeinePerHour[i]) {
      caffeinePerHour[i] = { diff: i, count: 0 };
    }
  }

  const queryPopular = (hours: number) => db.execute(sql`
    SELECT
      RVITEM.descr name,
      COUNT(*) count,
      PRICE.sellprice price
    FROM ITEMHISTORY
    JOIN RVITEM ON RVITEM.itemid = ITEMHISTORY.itemid
    JOIN PRICE ON PRICE.priceid = ITEMHISTORY.priceid1
    WHERE actionid = 5 AND TIMESTAMPDIFF(HOUR, time, NOW()) <= ${hours} AND ITEMHISTORY.itemid NOT IN (58, 56, 1432)
    GROUP BY RVITEM.itemid
    ORDER BY COUNT(*) DESC
    LIMIT 10
  `)

  const [[day], [week], [month], [year]] = await Promise.all([
    queryPopular(24),
    queryPopular(24 * 7),
    queryPopular(24 * 31),
    queryPopular(24 * 365),
  ]);
  
  const mostPopularItems = { day, week, month, year };

  const [mostRecentPurchases] = await db.query<any>(`
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
      caffeinePerHour,
    },
  }
}

export default function Home({ purchasesPerHour, caffeinePerHour, mostPopularItems, mostRecentPurchases }: any) {
  const MyBar = ({ fill, diff, ...props }: any) => {
    return <Rectangle {...props} radius={3} fill={fill} />;
  };

  const [metric, setMetric] = useState('spending');
  const [resolution, setResolution] = useState('hourly');
  const [popularTimeFrame, setPopularTimeFrame] = useState('day');

  const data = useMemo(() => {
    let data: { diff: number, count: number }[];

    if (metric === 'spending') {
      data = purchasesPerHour;
    } else if (metric === 'caffeine') {
      data = caffeinePerHour;
    } else {
      data = [];
    }

    if (resolution === 'hourly') {
      return [...data].splice(data.length - 5 * 24, 5 * 24);
    } else {
      const byDate: { date: Date, diff: number, count: number }[] = [];

      data
        .forEach(({ diff, count }) => {
          let previous = byDate[byDate.length - 1];

          let newDate = null;

          if (!previous) {
            newDate = startOfDay(new Date());
          }

          if (previous) {
            let date = startOfDay(subHours(new Date(), diff));

            if (!isEqual(date, previous.date)) {
              newDate = date;
            }
          }

          if (newDate) {
            byDate.push({
              date: newDate,
              diff: differenceInDays(new Date(), newDate),
              count,
            });
          } else if (previous) {
            previous.count += count;
          }
        });

      return byDate;
    }
  }, [metric, resolution, caffeinePerHour, purchasesPerHour]);

  const ticks = useMemo(() => {
    if (resolution === 'daily') {
      return 
    }

    const ticks = [];
    const currentHour = new Date().getHours();

    for (let i = data.length - currentHour; i >= 0; i -= 24) {
      ticks.push(data.length - i - 1);
    }

    return ticks;
  }, [data, resolution]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-6 py-3 lg:py-16 lg:px-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="w-[15em] lg:w-[30em] mb-3 lg:mb-10">
          <Logo />
        </div>
        <div className="h-[10em] lg:h-[20em]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar
                dataKey="count"
                fill="rgba(255,255,255, 0.3)"
                barSize={20}
                shape={MyBar}
              />
              <XAxis
                dataKey="diff"
                ticks={ticks}
                tickFormatter={(diff) => resolution === 'hourly' ? format(subHours(new Date(), diff), 'EEE') : format(subDays(new Date(), diff), 'EEE')}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                content={({ payload, label }) => {
                  try {
                    return (
                      <div className="bg-zinc-900 py-1 px-2 rounded-sm bg-opacity-80 text-zinc-200 shadow-lg">
                        <b>{format(subHours(new Date(), label + 1), 'HH:mm')}-{format(subHours(new Date(), label), 'HH:mm')}</b> <br/>
                        {payload?.[0]?.value} purchases
                      </div>
                    );
                  } catch (e) {
                    return null;
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-5">
          <div className="grow">
            <h2 className="text-2xl text-zinc-200 font-semibold mb-2">Most popular items</h2>
            <TabBar
              tabs={[
                { key: 'day', label: 'Day' },
                { key: 'week', label: 'Week' },
                { key: 'month', label: 'Month' },
                { key: 'year', label: 'Year' },
              ]}
              selected={popularTimeFrame}
              onSelect={(key) => setPopularTimeFrame(key)}
            />
            <ul className="mt-4">
              { mostPopularItems[popularTimeFrame].map(({ count, name }: any) => (
                <li key={name} className="py-2 px-3 rounded-md bg-zinc-100 bg-opacity-5 flex gap-2 mb-2">
                  <span className="text-zinc-400">{count}x</span>
                  <span className="font-semibold text-zinc-200">{name}</span>
                </li>
              )) }
            </ul>
          </div>
          <div className="grow">
            <h2 className="text-2xl text-zinc-200 font-semibold">Most recent purchases</h2>
            <ul className="mt-[3.75em]">
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
