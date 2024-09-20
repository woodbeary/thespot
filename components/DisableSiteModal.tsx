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
          <DialogTitle className="text-center">Site Permanently Unavailable</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4 p-4 text-center">
          <p className="font-bold text-red-600">Trespassers will be prosecuted, I am not joking.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisableSiteModal;