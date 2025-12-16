// src/api/user/rewards.js
import axios from "../axiosClient.js";

// ⭐ FETCH AVAILABLE REWARDS
export const fetchAvailableRewards = () => {
  return axios.get("/rewards");
};

// ⭐ FETCH USER CLAIMED REWARDS
export const fetchUserRewards = (userId) => {
  return axios.get(`/rewards/user/${userId}`);
};

// ⭐ CLAIM A REWARD
export const claimRewardApi = (data = {}) => {
  return axios.post("/rewards/claim", data);
};
