"use client";

import PageContainer from "@/components/PageContainer";
import ActivityFeedSection from "./_components/ActivityFeedSection";

const RecentActivityPage = () => {
  return (
    <PageContainer className="border-h-background !px-0 md:border-r">
      <div className="border-h-background flex flex-1 flex-col border-t px-4 py-8 lg:px-8">
        <div className="flex flex-1 flex-col gap-y-8">
          <h1 className="text-3xl font-bold">Actividad reciente</h1>

          <hr className="border-h-background" />

          <ActivityFeedSection />
        </div>
      </div>
    </PageContainer>
  );
};

export default RecentActivityPage;
