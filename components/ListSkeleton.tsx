const skeletonLengths = new Array(10)
  .fill(null)
  .map(() => Math.random() * 10 + 5);

export const ListSkeleton = () => (
  <>{
    new Array(10)
      .fill(null)
      .map((_, i) => (
        <li key={i} className="py-2 pl-3 pr-1 rounded-md bg-zinc-100 bg-opacity-5 flex gap-2 mb-2 items-center">
          <span className="text-transparent rounded-sm skeleton-box">86x</span>
          <span style={{ width: `${skeletonLengths[i]}em` }} className="inline-block font-semibold skeleton-box rounded-sm text-transparent">Loading...</span>
        </li>
      ))
  }</>
);
