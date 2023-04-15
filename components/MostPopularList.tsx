import { useEffect, useMemo, useState } from "react";
import { TabPane, TabPaneContainer } from "./TabPane";
import { ChevronsDown, ChevronsUp } from "react-feather";
import { ListSkeleton } from "./ListSkeleton";

type PopularResponse = Record<'day' | 'week' | 'month' | 'year', { itemid: number, name: string, count: number, previous_count: null | number }[]>;

export const MostPopularList = () => {
  const [mostPopularItems, setMostPopularItems] = useState<PopularResponse | null>(null);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`/api/popular`);
      const data = await response.json();

      setMostPopularItems(data);
    };

    run();
  }, []);

  const popularPanes = useMemo(() => {
    return ([['day', 'Day'], ['week', 'Week'], ['month', 'Month'], ['year', 'Year']] as const)
      .map(([key, label]) => {
        let content;

        if (mostPopularItems === null) {
          content = <ListSkeleton />;
        } else {
          content = mostPopularItems[key]
            .map(({ count, name, previous_count }: any) => {
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
            });
        }

        return (
          <TabPane key={key} label={label}>
            {content}
          </TabPane>
        );
      });
  }, [mostPopularItems]);

  return (
    <div className="grow">
      <h2 className="text-2xl text-zinc-200 font-semibold mb-2">Most popular items</h2>
      <TabPaneContainer>
        {popularPanes}
      </TabPaneContainer>
    </div>
  );
};
