# 🕒 SlotSwapper — Peer-to-Peer Time Slot Swapping App

SlotSwapper is a **full-stack scheduling application** that enables users to mark their busy calendar slots as **swappable** and exchange them with other users.  
Built as part of the **Full Stack Intern Technical Challenge** at **ServiceHive**, this project demonstrates skills in authentication, database modeling, API logic, and frontend state management.

---

## 🚀 Features

### 🔐 Authentication
- User registration and login using **JWT (JSON Web Tokens)**.
- Protected routes and APIs with Bearer token verification.

### 🗓️ Calendar Management
- Users can create, update, or delete calendar events.
- Event status options:
  - `BUSY`
  - `SWAPPABLE`
  - `SWAP_PENDING`

### 🔄 Slot Swapping Logic
- View all **swappable slots** from other users.
- Request a slot swap by offering one of your own swappable events.
- Respond to incoming swap requests (Accept / Reject).
- If accepted:
  - The ownership of both slots is swapped.
  - Both are marked as `BUSY`.
- If rejected:
  - The slots return to `SWAPPABLE`.

### 🧭 Frontend UI
- Built with **React.js** (or your chosen frontend framework).
- Responsive dashboard views:
  - Calendar/List view of user’s own events.
  - Marketplace of swappable slots.
  - Swap requests (incoming/outgoing).

### 💬 Real-time (Bonus)
- Optional WebSocket integration for instant swap notifications.

---

## 🧩 Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React.js + Axios + Context API / Redux |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (jsonwebtoken) |
| **Extras** | bcrypt, cors, dotenv, nodemon |

---

## 📁 Folder Structure

