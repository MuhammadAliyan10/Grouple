import { getWebinarAttendance } from "@/app/actions/attendance";
import { onAuthenticateUser } from "@/app/actions/auth";
import { getWebinarsByPresenterId } from "@/app/actions/webinar";
import PageHeader from "@/components/ReuseableComponents/PageHeader";
import { AttendedTypeEnum } from "@prisma/client";
import { Activity, AlignLeft, HomeIcon } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: Promise<{
    webinarId: string;
  }>;
};

const page = async ({ params }: Props) => {
  const checkUser = await onAuthenticateUser();
  if (!checkUser) {
    redirect("/");
  }
  const { webinarId } = await params;
  const pipelineData = await getWebinarAttendance(webinarId);
  if (!pipelineData.data) {
    return (
      <div className="text-3xl h-[400px] flex justify-center items-center">
        No pipeline found
      </div>
    );
  }
  return (
    <div className="w-full flex flex-col gap-8">
      <PageHeader
        leftIcon={<Activity className="w-3 h-3" />}
        mainIcon={<AlignLeft className="w-5 h-5" />}
        rightIcon={<HomeIcon className="w-3 h-3" />}
        heading="To track all of your customers."
        placeHolder="Search name, email or tag..."
      />
      <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6">
        {Object.entries(pipelineData.data).map(([columnType, columnData]) => (
          <></>
          // <PipelineLayout
          //   key={columnType}
          //   title={formatColumnTitle(columnType as AttendedTypeEnum)}
          //   count={columnData.count}
          //   users={columnData.users}
          //   tags={pipelineData.webinarTags}
          // />
        ))}
      </div>
    </div>
  );
};

export default page;
