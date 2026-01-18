# ⚛️ Code of Clans - Frontend

The interactive client interface for **Code of Clans**, delivering a premium, gamified user experience. Built with performance and aesthetics in mind.

## ⚡ Technologies

- `React 19`
- `TypeScript`
- `Vite 7`
- `Tailwind CSS 4`
- `Framer Motion 12`
- `Zustand`
- `Radix UI`
- `Axios`
- `Lucide React`

## 🚀 Key Features

*   **Dynamic UI** - Glassmorphism effects, smooth spring animations, and responsive layouts.
*   **State Management** - Centralized auth and user data handling with Zustand.
*   **Real-time Updates** - WebSocket integration for instant chat and notification updates.
*   **Interactive Components** - Custom-built drag-and-drop interfaces and data visualization.

## 🛠️ Installation & Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the development server**:
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

3.  **Build for production**:
    ```bash
    npm run build
    ```

## 📂 Project Structure

| Directory | Description |
| :--- | :--- |
| `src/components/` | Reusable UI atoms and molecules. |
| `src/pages/` | Main application routes/views. |
| `src/stores/` | Global state management (Zustand). |
| `src/services/` | API clients and configuration. |
| `src/hooks/` | Custom React hooks. |

## ⚙️ Configuration

Ensure your `.env` (if applicable) or API constants point to the correct backend URL (default: `http://localhost:8000`).
