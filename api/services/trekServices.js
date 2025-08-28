import axiosInstance from "../axiosInstance";

export const trekService = {
  getAllTreks: async () => {
    const res = await axiosInstance.get("/trek/all");
    return res.data;
  },
  getTrending: async () => {
    const res = await axiosInstance.get("/trek/trending");
    return res.data;
  },
  getPopular: async () => {
    const res = await axiosInstance.get("/trek/popular");
    return res.data;
  },
  getRecommendations: async (userId) => {
    const res = await axiosInstance.get(`/trek/recommendations/${userId}`);
    return res.data;
  },
};
