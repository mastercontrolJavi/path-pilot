"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MotionRoot } from "@/components/pp/motion-root";
import { sampleReport } from "@/lib/fixtures/sample-report";
import { track } from "@/lib/analytics";
import { DestinationList } from "./destination-list";
import { PayView } from "./pay-view";
import { SkillGaps } from "./skill-gaps";
import { PlanItinerary } from "./plan-itinerary";

export const SAMPLE_TABS = [
  ["destinations", "Destinations"],
  ["pay", "Pay"],
  ["gaps", "Skill gaps"],
  ["plan", "Plan"],
] as const;

/** The real report components, driven by the sample fixture. Loaded lazily on the landing page. */
export function SampleReport() {
  const [tab, setTab] = useState<string>("destinations");
  const paths = sampleReport.career_paths;

  return (
    <MotionRoot>
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(String(value));
          track("sample_tab_switched", { tab: String(value) });
        }}
      >
        <TabsList aria-label="Sample report sections">
          {SAMPLE_TABS.map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="destinations">
          <DestinationList paths={paths} animate idPrefix="sample-destination" />
        </TabsContent>
        <TabsContent value="pay">
          <PayView paths={paths} animate />
        </TabsContent>
        <TabsContent value="gaps">
          <SkillGaps paths={paths} idPrefix="sample-gaps" />
        </TabsContent>
        <TabsContent value="plan">
          <PlanItinerary steps={sampleReport.action_plan} />
        </TabsContent>
      </Tabs>
    </MotionRoot>
  );
}
