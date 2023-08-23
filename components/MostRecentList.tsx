import { useEffect, useState } from "react";
import { ListSkeleton } from "./ListSkeleton";

type RecentResponse = Array<{ time: string, neame: string }>;

export const MostRecentList = () => {
  const [mostRecentPurchases, setMostRecentPurchases] = useState<RecentResponse | null>(null);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`/api/recent`);
      const data = await response.json();

      setMostRecentPurchases(data);
    };

    run();
  }, []);
  
  return (
    <div className="grow">
      <h2 className="text-2xl text-zinc-200 font-semibold">Most recent purchases</h2>
      <ul className="mt-4 lg:mt-[3.75em]">
        { !mostRecentPurchases && <ListSkeleton /> }
        { mostRecentPurchases && mostRecentPurchases.map(({ time, name }: any) => (
          <li key={name} className="items-center py-2 px-3 rounded-md bg-zinc-100 bg-opacity-5 flex gap-2 mb-2">
            <span className="text-zinc-400">{time}</span>
            <span className="font-semibold text-zinc-200">{name}</span>
            { name === 'Coffee' && (
              <a href="https://www.netlight.com/" className="text-zinc-400 hover:underline">Sponsored by Netlight</a>
            ) }
          </li>
        )) }
      </ul>
    </div>
  );
};
