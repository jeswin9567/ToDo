# 🚀 Organic Mind - Modern Todo Application

A feature-rich, responsive todo application built with React and Tailwind CSS, inspired by the Organic Mind design system.


## ✨ Features

### Core Features
- ✅ **CRUD Operations**: Create, Read, Update, and Delete todos
- 📱 **Responsive Design**: Works seamlessly on all devices
- 💾 **Data Persistence**: Todos saved in localStorage
- 🔄 **API Integration**: Syncs with DummyJSON API
- 🎨 **Clean UI**: Inspired by Organic Mind design system

### Advanced Features
- ⏰ **Reminders**: Get browser notifications for important tasks
- 📂 **Categories**: Organize tasks with custom categories
- ⭐ **Priority**: Mark important tasks

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API**: DummyJSON
- **Storage**: LocalStorage + API sync

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [https://github.com/jeswin9567/ToDo]
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📚 API Integration

The application integrates with the DummyJSON API:

- **Base URL**: https://dummyjson.com
- **Endpoints**:
  - `GET /todos` - Fetch all todos
  - `GET /todos/:id` - Fetch a single todo
  - `POST /todos/add` - Add a new todo
  - `PUT /todos/:id` - Update a todo
  - `DELETE /todos/:id` - Delete a todo

## 🎯 Features in Detail

### Todo Management
- Create new todos with title and due date
- Mark todos as important
- Set reminders with browser notifications
- Organize todos by categories
- Delete and update existing todos

### Data Persistence
- All todos are stored in localStorage
- Synced with DummyJSON API
- Persistent across page reloads

### Categories
- Create custom categories
- Color-coded categories
- Easy category management

### Reminders
- Set custom reminders for todos
- Browser notifications
- Time-based alerts

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop
- Tablet
- Mobile devices

## 🧪 Testing

To run tests:
```bash
npm test
```

## 📦 Build

To create a production build:
```bash
npm run build
```

## 🚀 Deployment

The application can be deployed to:
- Vercel
- Netlify
- GitHub Pages

## 📄 License

MIT License - feel free to use this project for learning or personal use.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, please open an issue in the GitHub repository.

---

Made with ❤️ by Jeswin Mathew
