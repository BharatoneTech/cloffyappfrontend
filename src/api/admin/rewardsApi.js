import client from "../axiosClient";

// ---------- ADMIN REWARD APIs ----------

// get all rewards (admin)
export const getRewards = () => client.get("/rewards/admin");

// get single reward by id (admin)
export const getRewardById = (id) =>
  client.get(`/rewards/admin/${id}`);

// create reward (admin)
export const createReward = (data) =>
  client.post("/rewards", data);

// update reward (admin)
export const updateReward = (id, data) =>
  client.put(`/rewards/admin/${id}`, data);

// delete reward (admin)
export const deleteReward = (id) =>
  client.delete(`/rewards/admin/${id}`);
