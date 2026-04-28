// import { Route } from "react-router-dom";
// import ProtectedRoute from "../components/ProtectedRoute.tsx"
// import AdminDashboard from "../pages/admin/DashboardAdminPage.tsx";
// import PostsAdminPage from "../pages/admin/PostsAdminPage.tsx"; 
// import UsersAdminPage from "../pages/admin/UsersAdminPage.tsx";
// import ReportsAdminPage from "../pages/admin/ReportsAdminPage.tsx";
// import ProfileAdminPage from "../pages/admin/ProfileAdminPage.tsx";

// export const AdminRoutes = (
//     <>
//         <Route path="/admin" element={
//             <ProtectedRoute><AdminDashboard /></ProtectedRoute>
//         } />

//         <Route path="/admin/posts" element={
//             <ProtectedRoute><PostsAdminPage /></ProtectedRoute>
//         } />

//         <Route path="/admin/users" element={
//             <ProtectedRoute><UsersAdminPage /></ProtectedRoute>
//         } />

//         <Route path="/admin/reports" element={
//             <ProtectedRoute><ReportsAdminPage /></ProtectedRoute>
//         } />

//         <Route path="/admin/profile" element={
//             <ProtectedRoute><ProfileAdminPage /></ProtectedRoute>
//         } />

//     </>
// );

import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminDashboard from "../pages/admin/DashboardAdminPage";
import PostsAdminPage from "../pages/admin/PostsAdminPage";
import UsersAdminPage from "../pages/admin/UsersAdminPage";
import ReportsAdminPage from "../pages/admin/ReportsAdminPage";
import ProfileAdminPage from "../pages/admin/ProfileAdminPage";

export const AdminRoutes = (
    <>
        <Route
            path="/admin"
            element={
                <ProtectedRoute role="Admin">
                    <AdminDashboard />
                </ProtectedRoute>
            }
        />

        <Route
            path="/admin/posts"
            element={
                <ProtectedRoute role="Admin">
                    <PostsAdminPage />
                </ProtectedRoute>
            }
        />

        <Route
            path="/admin/users"
            element={
                <ProtectedRoute role="Admin">
                    <UsersAdminPage />
                </ProtectedRoute>
            }
        />

        <Route
            path="/admin/reports"
            element={
                <ProtectedRoute role="Admin">
                    <ReportsAdminPage />
                </ProtectedRoute>
            }
        />

        <Route
            path="/admin/profile"
            element={
                <ProtectedRoute role="Admin">
                    <ProfileAdminPage />
                </ProtectedRoute>
            }
        />
    </>
);