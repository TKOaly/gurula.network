import chroma from 'chroma-js';
import sql from 'sql-template-strings';
import { Bar, BarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import mysql from 'mysql2/promise';
import { differenceInDays, format, isEqual, startOfDay, subDays, subHours } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronsDown, ChevronsUp, ExternalLink } from 'react-feather';

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
    <svg width="92.318mm" height="18.415mm" version="1.1" viewBox="0 0 92.318 18.415" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {Object.entries(colors).map(([ name, color ]) => generateGradient(`${name}_gradient`, color))}
      </defs>
      <g transform="translate(-60.315 -62.893)" stroke-width=".26458">
        <g aria-label="GUR">
          <path fill="url(#g_gradient)" d="m76.349 70.408v8.9958q-2.54 1.8521-6.4029 1.8521-4.2862 0-6.9585-2.4606t-2.6723-6.694q0-4.1804 2.7781-6.694 2.8046-2.5135 7.0908-2.5135 3.0162 0 5.2123 1.1112v4.0746q-2.54-1.4552-5.2123-1.4552-2.5135 0-3.9952 1.5081-1.4817 1.4817-1.4817 3.9687 0 2.5135 1.4552 3.9952 1.4552 1.4817 3.9687 1.4817 1.1377 0 2.249-0.34396v-3.3602h-2.884v-3.466z"/>
          <path fill="url(#u_gradient)" d="m89.948 74.165v-10.954h4.0746v10.927q0 3.4925-1.9579 5.3446-1.9579 1.8256-5.2917 1.8256-3.2808 0-5.2652-1.8256-1.9844-1.8256-1.9844-5.1594v-11.112h4.0746v11.086q0 3.3073 3.175 3.3073 3.175 0 3.175-3.4396z"/>
          <path fill="url(#r_gradient)" d="m101.4 66.518v5.0271h1.9315q2.6458 0 2.6458-2.5929 0-1.1377-0.68792-1.7727-0.68792-0.66146-1.8785-0.66146zm5.1064 14.526-3.8629-6.1912h-1.2435v6.1912h-4.0746v-17.833h6.1648q2.9898 0 4.789 1.5875 1.8256 1.5875 1.8256 4.1275 0 3.81-3.2544 5.2652l4.5244 6.8527z"/>
        </g>
        <g transform="translate(0 .52917)" fill="#36363c" aria-label="ULA">
          <path d="m118.18 68.37v-5.4769h2.0373v5.4637q0 1.7463-0.97896 2.6723-0.97896 0.91282-2.6458 0.91282-1.6404 0-2.6326-0.91282t-0.99219-2.5797v-5.5563h2.0373v5.543q0 1.6536 1.5875 1.6536 1.5875 0 1.5875-1.7198z"/>
          <path d="m123.91 70.024h3.2941v1.7859h-5.3314v-8.9165h2.0373z"/>
          <path d="m130.93 68.344h2.1431l-0.0926-0.3175q-0.38364-1.2965-0.635-2.2093-0.23812-0.91282-0.29104-1.1774l-0.0529-0.26458q-0.10583 0.72761-0.97896 3.6513zm3.175 3.4661-0.54239-1.8256h-3.1221l-0.5424 1.8256h-2.1299l2.9766-8.9165h2.5665l2.9766 8.9165z"/>
        </g>
        <g fill="#36363c" aria-label=".network">
          <path d="m113.52 81.118q-0.17992-0.17992-0.17992-0.4445 0-0.26458 0.17992-0.4445 0.17991-0.17992 0.4445-0.17992 0.26458 0 0.4445 0.17992 0.17991 0.17992 0.17991 0.4445 0 0.26458-0.17991 0.4445-0.17992 0.17992-0.4445 0.17992-0.26459 0-0.4445-0.17992z"/>
          <path d="m116.44 75.847v0.93133q0.47625-1.0054 1.6933-1.0054 0.78316 0 1.2488 0.47625t0.46567 1.27v3.6936h-0.83609v-3.4713q0-0.59266-0.30691-0.89958-0.29633-0.3175-0.78317-0.3175-0.60324 0-1.0477 0.46566-0.43392 0.46566-0.43392 1.2912v2.9316h-0.82549v-5.3657z"/>
          <path d="m124.75 78.186v-0.21167q0-0.66675-0.35983-1.0583-0.35983-0.40216-0.99483-0.40216-0.60325 0-1.0266 0.43392t-0.49741 1.2382zm0.49742 1.9685v0.78316q-0.62442 0.32808-1.524 0.32808-1.2171 0-1.9685-0.74083-0.74083-0.75141-0.74083-1.9791 0-1.2806 0.66675-2.0214 0.66674-0.74083 1.7145-0.74083 1.0054 0 1.5981 0.64558 0.59266 0.64558 0.59266 1.8309 0 0.33867-0.0529 0.62442h-3.6618q0.0953 0.79375 0.60324 1.2171 0.508 0.42333 1.3335 0.42333 0.89958 0 1.4393-0.37042z"/>
          <path d="m128.01 76.525v3.1432q0 0.85725 0.80433 0.85725 0.41275 0 0.73025-0.24342v0.79375q-0.34925 0.1905-0.78316 0.1905-1.5875 0-1.5875-1.6192v-3.1221h-0.85725v-0.67733h0.85725v-1.3335h0.83608v1.3335h1.4817v0.67733z"/>
          <path d="m131.9 81.213-1.651-5.3657h0.88899l0.51859 1.778q0.27516 0.93133 0.45508 1.6298 0.1905 0.68792 0.24341 0.92075l0.0529 0.22225q0.15875-0.67733 0.77258-2.7834l0.508-1.7674h0.889l0.51858 1.7674 0.79375 2.794q0.14816-0.62442 0.81491-2.794l0.53975-1.7674h0.85725l-1.6933 5.3657h-1.0266l-0.508-1.7568-0.74083-2.6776q-0.15875 0.67733-0.71967 2.6776l-0.48683 1.7568z"/>
          <path d="m141.32 81.308q-1.1536 0-1.8309-0.77258-0.66675-0.78316-0.66675-1.9685 0-1.1959 0.68791-1.9897 0.6985-0.80433 1.8098-0.80433 1.2171 0 1.8732 0.78316 0.66675 0.78316 0.66675 1.9897 0 1.1959-0.67733 1.9791t-1.8627 0.78316zm0-4.7942q-0.762 0-1.1959 0.59266-0.43391 0.59266-0.43391 1.4499 0 0.83608 0.4445 1.4287 0.4445 0.58208 1.1853 0.58208 0.80433 0 1.2382-0.5715 0.43392-0.58208 0.43392-1.4393 0-0.889-0.41275-1.4605-0.41275-0.58208-1.2594-0.58208z"/>
          <path d="m145.91 75.847v0.94191q0.42333-0.99483 1.4605-0.99483 0.1905 0 0.29633 0.02117v0.8255q-0.22225-0.07408-0.45508-0.07408-0.56092 0-0.93133 0.51858-0.37042 0.51858-0.37042 1.1959v2.9316h-0.83608l0.0106-5.3657z"/>
          <path d="m148.54 81.213v-7.4401h0.8255v7.4401zm1.9156-2.8152 2.1802 2.8152h-1.0054l-2.159-2.8152 2.1061-2.5506h0.99483z"/>
        </g>
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
    <div className="flex gap-x-3 gap-y-1 relative items-start">
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
    multipleStatements: true,
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
        <div className="grid max-w-[30em] lg:w-full lg:max-w-full grid-cols-1 lg:grid-cols-2 gap-10 mt-3">
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
              { mostPopularItems[popularTimeFrame].map(({ count, name, previous_count }: any) => {
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
            </ul>
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
