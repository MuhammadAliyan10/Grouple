import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, LucideMessageCircleWarning } from "lucide-react";
import React from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rtmpURL: string;
  streamKey: string;
};

const ObsDialogBox = ({ open, onOpenChange, rtmpURL, streamKey }: Props) => {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard.`);
    } catch (error) {
      console.log("Error", error);
      toast.error(`Failed to copy ${label} to clipboard.`);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OBS Streaming Credential</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">RTMP URL</Label>
            <div className="flex">
              <Input className="flex-1" value={rtmpURL} readOnly />
              <Button
                className="ml-2"
                size={"icon"}
                variant={"outline"}
                onClick={() => copyToClipboard(rtmpURL, "RTMP URL")}
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Stream Key</Label>
            <div className="flex">
              <Input
                className="flex-1"
                value={streamKey}
                readOnly
                type="password"
              />
              <Button
                className="ml-2"
                size={"icon"}
                variant={"outline"}
                onClick={() => copyToClipboard(streamKey, "Stream Key")}
              >
                <Copy size={16} />
              </Button>
            </div>
            <div className="flex justify-start items-center text-sm text-yellow-300 mt-3">
              <LucideMessageCircleWarning className="w-4 h-4 mr-1" />
              <p>
                This is your personal stream key. Kindly don't share it with
                anyone.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ObsDialogBox;
