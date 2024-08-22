import { useEffect, useState } from "react";
import { differenceInDays, format, parseISO } from "date-fns";
import { Star } from "react-feather";

const skeletonLengths = new Array(10)
  .fill(null)
  .map(() => Math.random() * 25 + 5);

const LineSkeleton = ({ width }: { width: number }) => (
  <span style={{ width: `${width}ch` }} className="inline-block flex items-center">
    <span className="w-0 inline-block text-transparent">A</span>
    <span className="inline-block grow rounded-sm h-[1em] skeleton-box"></span>
  </span>
);

export const ListSkeleton = () => (
  <>{
    new Array(10)
      .fill(null)
      .map((_, i) => (
        <li key={i} className="items-center py-2 px-3 rounded-md bg-zinc-100 bg-opacity-5 mb-2">
          <div className="flex gap-2">
            <span className="text-zinc-400 shrink-0"><LineSkeleton width={10} /></span>
            <span className="grow" />
            <span className="text-zinc-400 whitespace-nowrap"><LineSkeleton width={6} /></span>
          </div>
          <span className="font-semibold mt-0.5 text-zinc-200 block"><LineSkeleton width={skeletonLengths[i]} /></span>
        </li>
      ))
  }</>
);

const formatRelative = (time: Date) => {
  const diff = differenceInDays(time, new Date());

  if (diff === 0) {
    return 'Today';
  } else if (diff === -1) {
    return 'Yesterday';
  } else {
    return `${-diff} days ago`;
  }
};

type RecentlyStockedResponse = Array<{
  time: string
  name: string
  count: number
  isNew: boolean
}>;

export const RecentlyStockedList = () => {
  const [recentlyStocked, setRecentlyStocked] = useState<RecentlyStockedResponse | null>(null);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`/api/stocked`);
      const data = await response.json();

      setRecentlyStocked(data);
    };

    run();
  }, []);

  return (
    <div>
      <h2 className="text-2xl text-zinc-200 font-semibold">Recently stocked</h2>
      <ul className="mt-4">
        { !recentlyStocked && <ListSkeleton /> }
        { recentlyStocked && recentlyStocked.map(({ time, name, isNew, count }) => (
          <li key={name} className="items-center py-2 px-3 rounded-md bg-zinc-100 bg-opacity-5 mb-2">
            <div className="flex gap-2">
              <span className="text-zinc-400 w-[12ch] shrink-0">{formatRelative(parseISO(time))}</span>
              <span className="grow" />
              { isNew && <span className="text-yellow-400 flex items-center">New!</span> }
              <span className="text-zinc-400 whitespace-nowrap">{count} pcs</span>
            </div>
            <span className="font-semibold mt-0.5 text-zinc-200 block">{name}</span>
          </li>
        )) }
      </ul>
    </div>
  )
};
