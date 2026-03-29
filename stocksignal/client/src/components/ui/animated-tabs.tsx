"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

const AnimatedTabs = ({ tabs, defaultTab, className }: AnimatedTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id);

  // Sync with external defaultTab changes
  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  if (!tabs?.length) return null;

  return (
    <div className={cn("w-full flex flex-col gap-y-1", className)}>
      <div className="flex gap-2 flex-wrap bg-white/80 backdrop-blur-md border border-border/50 shadow-sm p-1.5 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium rounded-lg outline-none transition-colors"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-primary shadow-md backdrop-blur-sm !rounded-lg"
                transition={{ type: "spring", duration: 0.6 }}
              />
            )}
            <span className={cn("relative z-10", activeTab === tab.id ? "text-white" : "text-foreground/70")}>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="p-5 bg-[#1a1a2e] shadow-lg text-white backdrop-blur-sm rounded-xl border border-border/20 min-h-72 h-full">
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, scale: 0.95, x: -10, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, x: -10, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: "circInOut", type: "spring" }}
              >
                {tab.content}
              </motion.div>
            )
        )}
      </div>
    </div>
  );
};

export { AnimatedTabs };
export type { Tab };
