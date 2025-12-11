import client from "../axiosClient";

export const getRewards = () => client.get("/rewards");
export const getRewardById = (id) => client.get(`/rewards/${id}`);

export const createReward = (data) => client.post("/rewards", data);
export const updateReward = (id, data) => client.put(`/rewards/${id}`, data);

export const deleteReward = (id) => client.delete(`/rewards/${id}`);
