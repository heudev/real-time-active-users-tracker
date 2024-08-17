# Real-Time Active Users Tracker

This project is a Node.js application that tracks the number of active users on a website in real-time using Socket.IO. The application stores the maximum number of concurrent users and the timestamp of when this peak occurred for each domain, and serves this data through a RESTful API.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/heudev/real-time-active-users-tracker.git
   cd real-time-active-users-tracker
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Variables**:

   Create a `.env` file in the root directory and add the following variables:

   ```bash
   APP_PORT=8080
   DB_HOST=localhost
   DB_PORT=27017
   DB_NAME=userStats
   DB_USERNAME=root
   DB_PASSWORD=root
   ```

4. **Database Connection**:

   Ensure that MongoDB is running on your machine and accessible through the URI provided in the `.env` file.

## Usage

1. **Start the server**:

   ```bash
   npm start
   ```

   The server will start and listen on the port specified in your `.env` file.

2. **Accessing Real-Time Data**:

   The application tracks the number of active users for each domain and emits this data through the following events:

   - **Connection Event**: On each new connection, the active users count is updated and broadcasted to the respective domain.
   - **Disconnect Event**: On disconnection, the active users count is updated and broadcasted.

3. **API Endpoint**:

   - **GET /traffic**: Returns the current number of active users, the maximum number of users recorded, and the timestamp for the current domain.

   Example request:

   ```bash
   curl -H "Origin: http://example.com" http://localhost:3000/traffic
   ```

   Example response:

   ```json
   {
     "activeUsers": 5,
     "maxUsers": 10,
     "timestamp": "2024-08-17T12:34:56.789Z"
   }
   ```

## Example of how you can use it in react:

```javascript
import { useEffect, useState } from "react";
import io from "socket.io-client";

export default function App() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [maxUsers, setMaxUsers] = useState(0);
  const [timestamp, setTimestamp] = useState("");

  const resetState = () => {
    setActiveUsers(0);
    setMaxUsers(0);
    setTimestamp("No connection");
  };

  useEffect(() => {
    const socket = io("SERVER_ADDRESS");

    socket.on("traffic", (data) => {
      setActiveUsers(data.activeUsers);
      setMaxUsers(data.maxUsers);
      setTimestamp(new Date(data.timestamp).toLocaleString());
    });

    socket.on("connect_error", () => {
      resetState();
    });

    socket.on("disconnect", () => {
      resetState();
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h1>Realtime User Tracker</h1>
      <div>
        <strong>Active Users:</strong> {activeUsers}
      </div>
      <div>
        <strong>Max Users:</strong> {maxUsers} {timestamp && `at ${timestamp}`}
      </div>
    </div>
  );
}
```

## License

This project is licensed under the MIT License

## Acknowledgments

- Thanks to the creators of [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [Socket.IO](https://socket.io/), and [Mongoose](https://mongoosejs.com/) for their awesome tools.
