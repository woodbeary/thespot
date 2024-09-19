import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { QRCodeSVG } from 'qrcode.react';
import toast, { Toaster } from 'react-hot-toast';
import Confetti from 'react-confetti';
import { ClipLoader } from 'react-spinners';

const FREE_NAMES = ['jack', 'darren', 'andrew', 'frank'];

export default function TicketPurchase({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [ticketOption, setTicketOption] = useState('free');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (agreeTerms) {
      setIsLoading(true);
      if (ticketOption === 'free') {
        const lowercaseName = name.toLowerCase();
        if (FREE_NAMES.some(freeName => lowercaseName.includes(freeName))) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced delay to 1 second
          setIsLoading(false);
          setShowCheckmark(true);
          await new Promise(resolve => setTimeout(resolve, 500)); // Show checkmark for 0.5 seconds
          setIsSubmitted(true);
          setShowConfetti(true);
          toast.success('Ticket confirmed! 🎉');
        } else {
          setIsLoading(false);
          setError("For the free option, your name must be Jack, Darren, Andrew, or Frank. Try the $2 option instead.");
        }
      } else {
        // Redirect to Stripe landing page for $2 option
        window.location.href = 'https://buy.stripe.com/your_stripe_link_here';
      }
    }
  };

  const GreenCheckmark = () => (
    <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]" onClick={onClose}>
        <div className="bg-black border border-white p-6 rounded-lg max-w-md w-full text-white" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-2xl font-bold mb-4">Ticket Confirmed</h2>
          <p className="mb-4">Alright, {name}.. present this at the gate:</p>
          <div className="flex justify-center mb-4">
            <QRCodeSVG value={`${name}-${ticketOption}`} size={200} />
          </div>
          <Button onClick={onClose} className="w-full bg-blue-500 hover:bg-blue-600">Close</Button>
        </div>
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="bg-black border border-white p-6 rounded-lg max-w-md w-full text-white" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Get Your Ticket</h2>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40">
            <ClipLoader color="#ffffff" size={50} />
            <p className="mt-4">Processing your ticket...</p>
          </div>
        ) : showCheckmark ? (
          <div className="flex flex-col items-center justify-center h-40">
            <GreenCheckmark />
            <p className="mt-4">Ticket confirmed!</p>
          </div>
        ) : (
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
            
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="mb-4 text-sm">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  required
                />
                <Label htmlFor="terms" className="text-white">
                  I have read and accept the terms and conditions
                </Label>
              </div>
              <p className="mt-2 text-gray-400 text-xs">
                By registering for a ticket or whatever, u agree to not do anything stupid or illegal.
                You alone are responsible for what you do.
              </p>
            </div>

            <div className="flex justify-between">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={!agreeTerms || isLoading}>
                Submit
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="text-white border-white hover:bg-gray-800">Cancel</Button>
            </div>
          </form>
        )}
      </div>
      <Toaster position="top-center" />
    </div>
  );
}