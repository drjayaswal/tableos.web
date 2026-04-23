# tableOS Frontend 🎨

The user interface layer for tableOS, built with **Next.js 16**, **Tailwind CSS**, and **Framer Motion**. Designed for maximum performance on mobile and desktop.

## 🌟 Key Features

### 1. Guest Experience (Scan-to-Order)
- **Zero App Footprint**: Fully responsive web interface that feels like a native app.
- **Image-Rich Menu**: High-fidelity product imagery with dietary filters.
- **Cart Logic**: Robust local state management for building complex orders.
- **Live Status Tracking**: Real-time order progress updates via WebSockets.

### 2. Owner Dashboard
- **Live Orders Feed**: Real-time management of pending, active, and served orders.
- **Session Management**: Full control over table occupancy and session closure.
- **Menu Management**: CRUD interface for categories and menu items.
- **Store Settings**: Configure UPI IDs, store hours, and branding.

### 3. Real-time Audio-Visual System
- **Synthesized Tones**: Pleasant UI alerts generated via Web Audio API (no audio assets to load).
- **Pill Notifications**: Non-blocking toast notifications for status updates.

## 📂 Directory Structure

- `app/(pages)/scan/`: Guest-facing QR landing and ordering flow.
- `app/(pages)/dashboard/`: Management interface (Protected Routes).
- `app/components/`: Reusable UI components (Notification Drawer, Navbar, Modals).
- `app/context/`: Global state providers (User, Socket, Notification).
- `hooks/`: Custom hooks for socket communication and notifications.

## 🛠️ Tech Stack

- **Next.js 16 (App Router)**: For SEO-friendly routing and server-side optimization.
- **Tailwind CSS**: For high-performance, maintainable styling.
- **Framer Motion**: For premium micro-interactions and transitions.
- **Socket.IO Client**: For persistent, real-time bi-directional communication.
- **Phosphor Icons**: For a consistent, professional iconography set.

## 🚀 Development

```bash
bun install
bun dev     # Starts development server on port 3000
bun build   # Optimizes for production
```

## 🔒 State Management
- **Persistence**: `localStorage` is used to restore session and order states across refreshes.
- **Real-time**: Custom `useSocket` hook manages global connection state and auto-rejoins.
