import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const LoginRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth(); //

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#18191a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#1877f2] border-t-transparent"></div>
      </div>
    );
  }

  // ✅ Nếu đã login → phân luồng theo role
  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/homepage" replace />;
    }
  }

  // ❌ chưa login → vào login
  return <>{children}</>;
};

export default LoginRoute;

// import { Navigate } from "react-router-dom";
// import { useEffect, useState } from "react";

// const LoginRoute = ({ children }: { children: React.ReactNode }) => {
//   const [checked, setChecked] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("interact_hub_token");

//     // 🔥 CHỈ CHECK LOCALSTORAGE (KHÔNG GỌI API)
//     if (token) {
//       setIsAuthenticated(true);
//     }

//     setChecked(true);
//   }, []);

//   if (!checked) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Loading...
//       </div>
//     );
//   }

//   // đã login → vào homepage
//   if (isAuthenticated) {
//     return <Navigate to="/homepage" replace />;
//   }

//   // chưa login → vào login
//   return <>{children}</>;
// };

// export default LoginRoute;