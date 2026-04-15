'use client';

import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '91XXXXXXXXXX';
const WHATSAPP_MESSAGE = 'Hi, I have a question about Jivo products.';

export function WhatsAppWidget() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
