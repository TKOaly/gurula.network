import { useCallback, useEffect, useRef } from "react";

export interface TabBarTab {
  key: string
  label: string
}

export type TabBarProps<T extends TabBarTab> = {
  tabs: T[],
  selected: string,
  onSelect: (key: string, i: number, tab: T) => void,
}

export const TabBar = <T extends TabBarTab>({ tabs, selected, onSelect }: TabBarProps<T>) => {
  const tabRefs = useRef<HTMLDivElement[]>([]);
  const backgroundRef = useRef<HTMLDivElement>(null);

  const setTabRef = (i: number) => (ref: HTMLDivElement) => tabRefs.current[i] = ref;

  const handleSelect = useCallback((tab: T, i: number) => {
    const ref = tabRefs.current[i];
    onSelect(tab.key, i, tab);
  }, [tabRefs, backgroundRef, onSelect]);

  useEffect(() => {
    const ref = tabRefs.current[tabs.findIndex(t => t.key === selected)];

    if (ref && backgroundRef.current) {
      const size = ref.getBoundingClientRect();
      backgroundRef.current.style.opacity = '1';
      backgroundRef.current.style.width = size.width + 'px';
      backgroundRef.current.style.height = size.height + 'px';
      backgroundRef.current.style.left = ref.offsetLeft + 'px';
      backgroundRef.current.style.top = ref.offsetTop + 'px';
    }

  }, [selected]);

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
        className={`absolute rounded-md -z-10 transition-[width,heigth,left,top] bg-[#6e6e75] duration-200`}
        style={{ opacity: '0' }}
      />
      {
        tabs.map((tab, i) => (
          <div
            key={tab.key}
            ref={setTabRef(i)}
            style={{ WebkitTapHighlightColor: 'rgba(0,0,0,0)' }}
            className={`py-1 px-2 select-none transition duration-0 cursor-pointer rounded-md font-bold text-zinc-200 ${selected === tab.key && 'bg-[#6e6e75] delay-200'}`}
            onClick={() => handleSelect(tab, i)}
          >
            {tab.label}
          </div>
        ))
      }
    </div>
  );
}
