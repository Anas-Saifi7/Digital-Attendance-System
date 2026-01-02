// import { io } from "socket.io-client";

// export const socket = io("http://localhost:5000", {
//   autoConnect: false,
//   transports: ["websocket"],
// });

import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false, // ✅ manual control
});
