import PageHeader from "@/components/ReuseableComponents/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlignLeft,
  LucideMessageCircleWarning,
  User,
  Webcam,
} from "lucide-react";
import React from "react";
import { onAuthenticateUser } from "@/app/actions/auth";
import { fetchAttendeeWebinar } from "@/app/actions/attendance";
import { toast } from "sonner";

interface AttendeeData {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    callStatus: string;
  };
  joinedAt: Date;
  leftAt: Date | null;
  webinar: {
    id: string;
    title: string;
  };
}

const page = async () => {
  const user = await onAuthenticateUser();
  if (!user?.user) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <LucideMessageCircleWarning className="w-5 h-5 mr-2" />
        <span>You need to authenticate.</span>
      </div>
    );
  }

  const webinarAttendeeData = await fetchAttendeeWebinar(user.user.id);
  if (!webinarAttendeeData.success || !webinarAttendeeData.data) {
    toast.error(
      webinarAttendeeData.message || "Failed to fetch attendee data."
    );
    return (
      <div className="w-full h-full flex justify-center items-center">
        <LucideMessageCircleWarning className="w-5 h-5 mr-2" />
        <span>
          {webinarAttendeeData.message || "Failed to fetch attendee data."}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 p-4">
      <PageHeader
        leftIcon={<Webcam className="w-4 h-4" />}
        mainIcon={<User className="w-6 h-6" />}
        rightIcon={<AlignLeft className="w-4 h-4" />}
        heading="Attendees for Your Webinars"
        placeHolder="Search attendees..."
      />
      {webinarAttendeeData.data.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No attendees found for your webinars.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm text-muted-foreground">
                Webinar
              </TableHead>
              <TableHead className="text-sm text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-sm text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="text-sm text-muted-foreground">
                Call Status
              </TableHead>
              <TableHead className="text-sm text-muted-foreground">
                Joined At
              </TableHead>
              <TableHead className="text-sm text-muted-foreground">
                Left At
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webinarAttendeeData.data.map(
              (attendee: AttendeeData, index: number) => (
                <TableRow key={index} className="border-0">
                  <TableCell className="font-bold">
                    {attendee.webinar.title}
                  </TableCell>
                  <TableCell className="font-bold">
                    {attendee.user.name}
                  </TableCell>
                  <TableCell>{attendee.user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        attendee.user.callStatus === "PENDING"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {attendee.user.callStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(attendee.joinedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {attendee.leftAt ? (
                      new Date(attendee.leftAt).toLocaleString()
                    ) : (
                      <Badge variant={"secondary"}>PRESENT</Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default page;
