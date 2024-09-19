import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Confetti from 'react-confetti';

export default function TicketPurchase({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [ticketOption, setTicketOption] = useState('free');
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-black border border-white p-6 rounded-lg max-w-md w-full text-white">
        <h2 className="text-2xl font-bold mb-4">Get Your Ticket</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name" className="text-white">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-gray-800 text-white border-gray-700"
            />
          </div>
          <div className="mb-4">
            <Label className="text-white">Ticket Option</Label>
            <RadioGroup value={ticketOption} onValueChange={setTicketOption}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free" id="free" />
                <Label htmlFor="free" className="text-white">Free</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid" className="text-white">$2</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex justify-between">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">Submit</Button>
            <Button variant="outline" onClick={onClose} className="text-white border-white hover:bg-gray-800">Cancel</Button>
          </div>
        </form>
      </div>
      {showConfetti && <Confetti />}
    </div>
  );
}