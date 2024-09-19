import React, { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (agreeTerms) {
      setIsLoading(true);
      if (ticketOption === 'free') {
        const lowercaseName = name.toLowerCase();
        if (FREE_NAMES.some(freeName => lowercaseName.includes(freeName))) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setIsLoading(false);
          setShowCheckmark(true);
          await new Promise(resolve => setTimeout(resolve, 500));
          setIsSubmitted(true);
          setShowConfetti(true);
          toast.success('Ticket confirmed! 🎉');
        } else {
          setIsLoading(false);
          setError("For the free option, your name must be Jack, Darren, Andrew, or Frank. Try the $2 option instead.");
        }
      } else {
        window.location.href = 'https://buy.stripe.com/your_stripe_link_here';
      }
    }
  };

  const GreenCheckmark = () => (
    <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const modalClass = isMobile
    ? "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4"
    : "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]";

  const contentClass = isMobile
    ? "bg-black border border-white p-4 rounded-lg w-full max-w-sm text-white"
    : "bg-black border border-white p-6 rounded-lg max-w-md w-full text-white";

  if (isSubmitted) {
    return (
      <div className={modalClass} onClick={onClose}>
        <div className={contentClass} onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Ticket Confirmed</h2>
          <p className="mb-4">Alright, {name}.. present this at the gate:</p>
          <div className="flex justify-center mb-4">
            <QRCodeSVG value={`${name}-${ticketOption}`} size={isMobile ? 150 : 200} />
          </div>
          <Button onClick={onClose} className="w-full bg-blue-500 hover:bg-blue-600">Close</Button>
        </div>
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      </div>
    );
  }

  return (
    <div className={modalClass} onClick={onClose}>
      <div className={contentClass} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl md:text-2xl font-bold mb-4">Get Your Ticket</h2>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40">
            <ClipLoader color="#ffffff" size={40} />
            <p className="mt-4 text-sm md:text-base">Processing your ticket...</p>
          </div>
        ) : showCheckmark ? (
          <div className="flex flex-col items-center justify-center h-40">
            <GreenCheckmark />
            <p className="mt-4 text-sm md:text-base">Ticket confirmed!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white text-sm md:text-base">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-gray-800 text-white border-gray-700 mt-1"
              />
            </div>
            <div>
              <Label className="text-white text-sm md:text-base">Ticket Option</Label>
              <RadioGroup value={ticketOption} onValueChange={setTicketOption} className="mt-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="text-white text-sm md:text-base">Free</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="paid" />
                  <Label htmlFor="paid" className="text-white text-sm md:text-base">$2</Label>
                </div>
              </RadioGroup>
            </div>
            
            {error && <p className="text-red-500 text-sm md:text-base">{error}</p>}

            <div className="text-sm">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  required
                />
                <Label htmlFor="terms" className="text-white text-xs md:text-sm">
                  I have read and accept the terms and conditions
                </Label>
              </div>
              <p className="mt-2 text-gray-400 text-xs">
                By registering for a ticket or whatever, u agree to not do anything stupid or illegal.
                You alone are responsible for what you do.
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 md:space-x-2">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 w-full md:w-auto" disabled={!agreeTerms || isLoading}>
                Submit
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="text-white border-white hover:bg-gray-800 w-full md:w-auto">Cancel</Button>
            </div>
          </form>
        )}
      </div>
      <Toaster position="top-center" />
    </div>
  );
}