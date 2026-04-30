import axiosInstance from "./axiosInstance";

export const getNotifications = async () => {
  const res = await axiosInstance.get("/api/notifications");
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await axiosInstance.get("/api/notifications/unread-count");
  return res.data.count;
};

export const markAsRead = async (id) => {
  const res = await axiosInstance.patch(`/api/notifications/${id}/read`);
  return res.data;
};

export const markAllAsRead = async () => {
  await axiosInstance.post("/api/notifications/read-all");
};