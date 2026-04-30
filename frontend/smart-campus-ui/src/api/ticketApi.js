import axiosInstance from "./axiosInstance";

export const getResources = async () => {
  const res = await axiosInstance.get("/api/resources");
  return res.data;
};

export const createTicket = async (formData) => {
  const res = await axiosInstance.post("/api/tickets", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getMyTickets = async () => {
  const res = await axiosInstance.get("/api/tickets/my");
  return res.data;
};

export const getAllTickets = async () => {
  const res = await axiosInstance.get("/api/tickets");
  return res.data;
};

export const getTicketById = async (id) => {
  const res = await axiosInstance.get(`/api/tickets/${id}`);
  return res.data;
};

export const updateTicketStatus = async (id, data) => {
  const res = await axiosInstance.patch(`/api/tickets/${id}/status`, data);
  return res.data;
};

export const deleteTicket = async (id) => {
  await axiosInstance.delete(`/api/tickets/${id}`);
};

export const getComments = async (ticketId) => {
  const res = await axiosInstance.get(`/api/tickets/${ticketId}/comments`);
  return res.data;
};

export const addComment = async (ticketId, content) => {
  const res = await axiosInstance.post(`/api/tickets/${ticketId}/comments`, { content });
  return res.data;
};

export const editComment = async (ticketId, commentId, content) => {
  const res = await axiosInstance.put(`/api/tickets/${ticketId}/comments/${commentId}`, { content });
  return res.data;
};

export const deleteComment = async (ticketId, commentId) => {
  await axiosInstance.delete(`/api/tickets/${ticketId}/comments/${commentId}`);
};