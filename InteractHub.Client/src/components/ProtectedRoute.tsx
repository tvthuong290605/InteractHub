// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/useAuth";

// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const { isAuthenticated, isLoading } = useAuth();

//   if (isLoading) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-[#18191a]">
//         <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1877f2] border-t-transparent"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = ({ children, role }: any) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) return null;

  if (role && !user.Roles?.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};
export default ProtectedRoute;