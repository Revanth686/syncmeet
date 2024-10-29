import axios from "axios";

const serverApi = `${import.meta.env.VITE_APP_BACKEND_URL}/api`;

export const getRoomExists = async (roomId) => {
  const response = await axios.get(`${serverApi}/room-exists/${roomId}`);
  return response.data;
};
