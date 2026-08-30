import axiosInstance from './axiosInstance';

export const chatbotApi = {
  sendQuery: (message, sessionId) => axiosInstance.post('/chatbot/query', { message, sessionId }),
  createSupportTicket: (ticketData) => axiosInstance.post('/support/tickets', ticketData),
  getUserSupportTickets: () => axiosInstance.get('/support/tickets'),
};
