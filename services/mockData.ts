import { MockOrder, Ticket, TicketStatus, TicketPriority, Sentiment } from '../types';

export const MOCK_ORDERS: Record<string, MockOrder> = {
  'ORD-1001': { id: 'ORD-1001', items: ['Wireless Headphones', 'USB-C Cable'], total: 89.99, date: '2023-10-15', status: 'Delivered' },
  'ORD-1002': { id: 'ORD-1002', items: ['Gaming Mouse', 'Mechanical Keyboard'], total: 150.00, date: '2023-10-20', status: 'Shipped' },
  'ORD-1003': { id: 'ORD-1003', items: ['4K Monitor'], total: 399.99, date: '2023-10-01', status: 'Delivered' },
};

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'T-8821',
    customerName: 'Alice Johnson',
    email: 'alice@example.com',
    orderId: 'ORD-1001',
    subject: 'Headphones not working',
    description: 'I received the headphones yesterday but the left ear cup has no sound. I tried resetting them but it did not help.',
    status: TicketStatus.OPEN,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    aiPriority: TicketPriority.HIGH,
    aiSentiment: Sentiment.NEGATIVE,
    aiSummary: 'Defective product received (Left ear cup audio failure).',
    aiSuggestedResponse: 'Dear Alice, I am so sorry to hear about the issue with your new headphones. Since you have already tried resetting them, we can proceed with an immediate replacement. Please confirm your shipping address.',
    history: [{ timestamp: new Date(Date.now() - 86400000).toISOString(), action: 'Ticket Created', actor: 'System' }],
    tags: ['Hardware', 'Return']
  },
  {
    id: 'T-8822',
    customerName: 'Bob Smith',
    email: 'bob@example.com',
    orderId: 'ORD-1002',
    subject: 'When will it arrive?',
    description: 'Just checking the status of my order. It says shipped but tracking hasn\'t updated.',
    status: TicketStatus.IN_PROGRESS,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 100000).toISOString(),
    aiPriority: TicketPriority.LOW,
    aiSentiment: Sentiment.NEUTRAL,
    aiSummary: 'Order status inquiry; tracking stagnant.',
    aiSuggestedResponse: 'Hi Bob, thanks for reaching out. I see your order ORD-1002 is in transit. Sometimes tracking takes 24-48 hours to update once handed to the carrier. I will keep an eye on this for you.',
    history: [{ timestamp: new Date(Date.now() - 172800000).toISOString(), action: 'Ticket Created', actor: 'System' }],
    tags: ['Shipping']
  }
];

export const getOrderDetails = (orderId: string): string => {
  const order = MOCK_ORDERS[orderId];
  if (!order) return "No order history found.";
  return `Order ID: ${order.id}, Items: ${order.items.join(', ')}, Total: $${order.total}, Date: ${order.date}, Status: ${order.status}`;
};