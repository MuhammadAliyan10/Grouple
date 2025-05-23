"use client";
import { Cone, Webcam } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";
import { Home, Video, Users, Bot, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

type Props = {};

export const sidebarData = [
  {
    id: 0,
    title: "Home",
    icon: <Home size={20} />,
    link: "/home",
  },
  {
    id: 1,
    title: "Webinars",
    icon: <Webcam size={20} />,
    link: "/webinars",
  },
  {
    id: 2,
    title: "Leads",
    icon: <Users size={20} />,
    link: "/leads",
  },
  {
    id: 3,
    title: "Ai Agents",
    icon: <Bot size={20} />,
    link: "/ai-agents",
  },
  {
    id: 4,
    title: "Setting",
    icon: <Settings size={20} />,
    link: "/setting",
  },
];

const Sidebar = (props: Props) => {
  const pathName = usePathname();
  return (
    <div className="w-18 sm:w-28 h-screen sticky top-0 py-10 px-2 sm:px-6 border bg-background border-border flex flex-col items-center justify-start gap-10">
      <div className="">
        <Cone />
      </div>
      <div className="w-full h-full flex justify-between items-center flex-col">
        <div className="w-full h-fit flex flex-col gap-4 items-center justify-center">
          {sidebarData.map((item) => (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.link}
                    className={`flex items-center gap-2 justify-center cursor-pointer rounded-lg p-4 ${
                      pathName.includes(item.link) ? "iconBackground" : ""
                    }`}
                  >
                    <span
                      className={`w-4 h-4 ${
                        pathName.includes(item.link) ? "" : "opacity-80"
                      }`}
                    >
                      {item.icon}
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="text-sm"> {item.title}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default Sidebar;
