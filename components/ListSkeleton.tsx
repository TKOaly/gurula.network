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
        <li key={i} className="py-2 pl-3 pr-1 rounded-md bg-zinc-100 bg-opacity-5 flex gap-2 mb-2 items-center">
          <span className="text-transparent rounded-sm"><LineSkeleton width={3} /></span>
          <span className="inline-block font-semibold rounded-sm text-transparent"><LineSkeleton width={skeletonLengths[i]} /></span>
        </li>
      ))
  }</>
);
