import { format, parseISO, subHours } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const MyBar = ({ fill, diff, ...props }: any) => {
  return <Rectangle {...props} radius={3} fill={fill} />;
};

export const Histogram = () => {
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

    return [...purchasesPerHour].slice(0, 5 * 24) as { diff: number, count: number }[];
  }, [purchasesPerHour]);


  const ticks = useMemo(() => {
    const ticks = [];
    const currentHour = timestamp.getHours();

    for (let i = data.length - currentHour; i >= 0; i -= 24) {
      ticks.push(data.length - i - 1);
    }

    return ticks;
  }, [data]);

  return (
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
          tickFormatter={(diff) => format(subHours(timestamp, diff), 'EEE')}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.1)' }}
          content={({ payload, label }) => {
            try {
              return (
                <div className="bg-zinc-900 py-1 px-2 rounded-sm bg-opacity-80 text-zinc-200 shadow-lg">
                  <b>{format(subHours(timestamp, label + 1), 'HH:mm')}-{format(subHours(timestamp, label), 'HH:mm')}</b> <br/>
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
  );
};
