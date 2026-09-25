import { env } from '../config/env';

/**
 * Generates a WhatsApp deep-link URL pre-filled with a service request message.
 * The engineer's number is pulled from env so it stays out of source code.
 */
export const buildWhatsAppLink = (params: {
  name: string;
  phone: string;
  service: string;
  notes?: string;
}): string => {
  const message = [
    `Hello,`,
    `I would like to request a cold storage service.`,
    ``,
    `Name: ${params.name}`,
    `Phone: ${params.phone}`,
    `Service: ${params.service}`,
    params.notes ? `Notes: ${params.notes}` : '',
  ]
    .filter((l) => l !== undefined)
    .join('\n');

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${env.WHATSAPP_ENGINEER_NUMBER}?text=${encoded}`;
};
