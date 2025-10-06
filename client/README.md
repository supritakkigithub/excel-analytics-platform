# 📊 Excel Analytics Platform

A **MERN-based platform** that allows users to upload Excel spreadsheets, parse them, and generate interactive **2D/3D charts**.  
It also provides **JWT authentication**, secure file handling, and supports exporting insights with **AI-powered summaries**.

---

## 🚀 Tech Stack
- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB
- **Authentication:** JWT (JSON Web Token)
- **Data Parsing:** SheetJS, Multer
- **Charts & Visualization:** Chart.js, Three.js
- **Other Tools:** Git, Postman

---

## 📂 Project Structure
```
excel-analytics-platform/
│── client/         # React frontend
│── server/         # Express backend
│── .env.example    # Example environment variables
│── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/excel-analytics-platform.git
cd excel-analytics-platform
```

### 2. Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd ../client
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `server/` folder (use `.env.example` as reference).  
Never commit your real `.env` file to GitHub.

**Example (`server/.env`):**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
CLIENT_URL=http://localhost:3000
```

---

## ▶️ Running the Project

### Run Backend (Server)
```bash
cd server
npm start
```
Server will run on 👉 [http://localhost:5000](http://localhost:5000)

### Run Frontend (Client)
```bash
cd client
npm start
```
Frontend will run on 👉 [http://localhost:3000](http://localhost:3000)

---

## 🧪 Features
- ✅ Upload Excel sheets and parse structured data
- ✅ Generate interactive charts (2D & 3D) using Chart.js and Three.js
- ✅ Export visualizations to PNG/PDF
- ✅ AI-powered summaries for quick insights
- ✅ JWT-based secure authentication
- ✅ Responsive UI for web & mobile

---

## 📸 Screenshots (Optional)
*(You can add screenshots of your dashboard, upload screen, and charts here to impress interviewers and recruiters.)*

---

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you’d like to change.

---

## 📜 License
This project is licensed under the **MIT License**.
