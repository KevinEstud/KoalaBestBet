import PersistLogin from "views/Dashboard/PersistLogin.js"
import RequireAuth from "views/Dashboard/RequireAuth.js"
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from "layouts/Auth.js";
import Home from "views/Home/Home"
import MainLayout from "layouts/Main.js";
import Layout from "views/Dashboard/Layout.js";

function App() {

    return (
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/" element={<Layout />}>
        <Route path="*" element={<Navigate to="/main/dashboard"/>} />
        <Route path="auth/" element={<Navigate to="/auth/signin"/>} />
        <Route path="auth/*" element={<AuthLayout />} />
        <Route element={<PersistLogin />}>
        <Route element={<RequireAuth />}>
        <Route path="main/*" element={<MainLayout />} />
        </Route>
        </Route>
        </Route>
        </Routes>
  );
}

export default App;