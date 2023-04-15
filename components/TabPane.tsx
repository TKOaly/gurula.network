import React, { PropsWithChildren, MouseEvent,  createContext, useContext, useMemo, useRef, useState } from "react";
import { TabBar, TabBarTab } from "./TabBar";

export type TabPaneProps = PropsWithChildren<{}>;

export const TabPane = ({ children }: PropsWithChildren<{ label: string }>) => {
  const context = useContext(TabPaneContext);

  return (
    <ul className="mt-4 shrink-0 snap-center snap-always w-full">
      {children}
    </ul>
  );
};

interface TabPaneContextValue {
  paneRefs: HTMLDivElement[]
}

const TabPaneContext = createContext<TabPaneContextValue>({
  paneRefs: [],
});

export const TabPaneContainer = ({ children }: TabPaneProps) => {
  const contextRef = useRef({ paneRefs: [] });
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollDetectionPause = useRef<{ state: null | { id: string, target: number } }>({ state: null });

  const tabs = useMemo(() => {
    const tabs: TabBarTab[] = [];

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;

      if (!child.key || !child.props.label) {
        throw new Error('TabPane should have key and label props.');
      }

      tabs.push({
        key: '' + child.key,
        label: child.props.label,
      })
    });

    return tabs;
  }, [children]);

  const [active, setActive] = useState(tabs[0].key);

  const handleSelect = (key: string, i: number) => {
    if (containerRef.current) {
      const target = containerRef.current.scrollWidth / tabs.length * i;
      const id = Math.random().toString(16).slice(2);

      scrollDetectionPause.current.state = {
        id,
        target,
      };

      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth / tabs.length * i,
        behavior: 'smooth',
      });

      setTimeout(() => {
        if (scrollDetectionPause.current.state?.id === id) {
          scrollDetectionPause.current.state = null;
        }
      }, 1000);
    }

    setActive(key);
  };

  const handleScroll = (evt: MouseEvent<HTMLDivElement>) => {
    if (scrollDetectionPause.current.state === null) {
      const newTab = Math.round(evt.currentTarget.scrollLeft / (evt.currentTarget.scrollWidth / 4));
      setActive(tabs[newTab].key);
    } else {
      const { target } = scrollDetectionPause.current.state;

      if (Math.abs(evt.currentTarget.scrollLeft - target) < 5) {
        scrollDetectionPause.current.state = null;
      }
    }
  };

  return (
    <TabPaneContext.Provider value={contextRef.current}>
      <TabBar
        tabs={tabs}
        selected={active}
        onSelect={handleSelect}
      />
      <div
        ref={containerRef}
        className="flex overflow-y-scroll sm:overflow-hidden snap-x gap-5 snap-mandatory"
        onScroll={handleScroll}
      >
        { children }
      </div>
    </TabPaneContext.Provider>
  );
};
