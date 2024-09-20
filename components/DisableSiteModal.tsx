import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DisableSiteModal: React.FC = () => {
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Site Temporarily Unavailable</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4 p-4 text-center">
          <p>We are currently working on some exciting updates!</p>
          <p>Please check back soon for a brand new experience.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisableSiteModal;