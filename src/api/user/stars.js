import client from "../axiosClient";

// GET user stars
export const fetchUserStars = () => client.get("/user/stars");

// GET user rewards
export const fetchUserRewards = () => client.get("/user/rewards");
