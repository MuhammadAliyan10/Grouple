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
import { AlignLeft, User, Webcam } from "lucide-react";
import React from "react";
import { leadData } from "./__test__/data";

const page = () => {
  return (
    <div className="w-full flex flex-col gap-8">
      <PageHeader
        leftIcon={<Webcam className="w-3 h-3" />}
        mainIcon={<User className="w-5 h-5" />}
        rightIcon={<AlignLeft className="w-3 h-3" />}
        heading="The home to all your customers"
        placeHolder="Search customer..."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-sm text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="text-sm text-muted-foreground">
              Email
            </TableHead>
            <TableHead className="text-sm text-muted-foreground">
              Phone
            </TableHead>
            <TableHead className="text-sm text-right text-muted-foreground">
              Tags
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leadData.map((lead, index) => (
            <TableRow key={index} className="border-0">
              <TableCell className="font-bold">{lead.name}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.phone}</TableCell>
              <TableCell className="text-right">
                {lead.tags.map((tag, idx) => (
                  <Badge key={idx} variant={"outline"}>
                    {tag}
                  </Badge>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default page;
