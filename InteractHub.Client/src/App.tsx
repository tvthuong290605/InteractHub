// import { UserRoutes } from "./routes/UserRoute";
// import { AdminRoutes } from "./routes/AdminRoute";
// import LoginRoute from "./components/LoginRoute";

// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./pages/login";
// import OAuthCallbackPage from "./pages/OAuthCallbackPage";

// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" />} />
//         <Route path="/login" element={<LoginRoute><Login /></LoginRoute>} />
//         <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
//         {UserRoutes}
//         {AdminRoutes}
//       </Routes>

//       {/* 🔥 Toast global */}
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         theme="dark"
//         newestOnTop
//       />
//     </Router>
//   );
// }

// export default App;


import { UserRoutes } from "./routes/UserRoute";
import { AdminRoutes } from "./routes/AdminRoute";
import LoginRoute from "./components/LoginRoute";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ForbiddenPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="text-5xl font-bold text-red-500">403</h1>
      <p className="text-lg text-gray-700 mt-2">
        Bạn không có quyền truy cập trang này
      </p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔥 default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 🔥 login */}
        <Route
          path="/login"
          element={
            <LoginRoute>
              <Login />
            </LoginRoute>
          }
        />

        {/* 🔥 OAuth callback */}
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

        {/* 🔥 USER ROUTES */}
        {UserRoutes}

        {/* 🔥 ADMIN ROUTES */}
        {AdminRoutes}

        {/* 🔥 403 inline */}
        <Route path="/403" element={<ForbiddenPage />} />

        {/* 🔥 fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>

      {/* Toast */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        newestOnTop
      />
    </Router>
  );
}

export default App;