import { onAuthenticateUser } from "@/app/actions/auth";
import { getWebinarsByPresenterId } from "@/app/actions/webinar";
import PageHeader from "@/components/ReuseableComponents/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, HomeIcon, Webcam } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import WebinarCard from "./_components/WebinarCard";
import { Webinar, WebinarStatusEnum } from "@prisma/client";
// type props = {
//   searchParam: Promise<{
//     webinarStatus: string | undefined;
//   }>;
// };
const page = async () => {
  const checkUser = await onAuthenticateUser();
  if (!checkUser.user) {
    redirect("/");
  }
  const webinars = await getWebinarsByPresenterId(checkUser?.user?.id);
  const upComingWebinars = webinars.filter(
    (webinar) => webinar.webinarStatus === "SCHEDULED"
  );
  const endedWebinars = webinars.filter(
    (webinar) =>
      webinar.webinarStatus === "ENDED" || webinar.webinarStatus === "CANCELLED"
  );
  const liveWebinars = webinars.filter(
    (webinar) => webinar.webinarStatus === "LIVE"
  );
  return (
    <Tabs className="w-full flex flex-col gap-8" defaultValue="all">
      <PageHeader
        leftIcon={<HomeIcon className="w-3 h-3" />}
        mainIcon={<Webcam className="w-5 h-5" />}
        rightIcon={<Activity className="w-3 h-3" />}
        heading="The home to all you webinars"
        placeHolder="Search option..."
      >
        <TabsList className="bg-transparent space-x-3">
          <TabsTrigger
            value="all"
            className="bg-secondary opacity-50 data-[state=active]:opacity-100 px-8 py-4"
          >
            All
          </TabsTrigger>
          <TabsTrigger value="live" className="bg-secondary px-8 py-4">
            Live
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="bg-secondary px-8 py-4">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="ended" className="bg-secondary px-8 py-4">
            Ended
          </TabsTrigger>
        </TabsList>
      </PageHeader>
      <TabsContent
        value="all"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start gap-x-6 gap-y-10"
      >
        {webinars.length > 0 ? (
          webinars.map((webinar: Webinar, index: number) => {
            return <WebinarCard key={index} webinar={webinar} />;
          })
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12">
            No Webinar found.
          </div>
        )}
      </TabsContent>
      <TabsContent
        value="live"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start gap-x-6 gap-y-10"
      >
        {liveWebinars.length > 0 ? (
          liveWebinars.map((webinar: Webinar, index: number) => {
            return <WebinarCard key={index} webinar={webinar} />;
          })
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12">
            No live Webinar.
          </div>
        )}
      </TabsContent>
      <TabsContent
        value="upcoming"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start gap-x-6 gap-y-10"
      >
        {upComingWebinars.length > 0 ? (
          upComingWebinars.map((webinar: Webinar, index: number) => {
            return <WebinarCard key={index} webinar={webinar} />;
          })
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12">
            No upcoming Webinar.
          </div>
        )}
      </TabsContent>
      <TabsContent
        value="ended"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start gap-x-6 gap-y-10"
      >
        {endedWebinars.length > 0 ? (
          endedWebinars.map((webinar: Webinar, index: number) => {
            return <WebinarCard key={index} webinar={webinar} />;
          })
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12">
            No Webinar found.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default page;
