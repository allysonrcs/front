import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobal } from "@/contexts/GlobalContext";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import { INFO_USER } from "@/constants/local-storage";

const Route = () => {
    const [connected, setConnected] = useState(sessionStorage.getItem(window.btoa(INFO_USER)) ? true : false);
    const [isDark, setIsDark] = useState(false);

    const { user } = useAuth();
    const { theme } = useGlobal();

    useEffect(() => {
        setConnected(sessionStorage.getItem(window.btoa(INFO_USER)) ? true : false);
    }, [user]);

    useEffect(() => {
        setIsDark(theme === "dark");
    }, [theme]);

    return (
        <>
            {connected ? <PrivateRoute /> : <PublicRoute />}

            <ToastContainer closeOnClick autoClose={3000} position='bottom-right' theme={isDark ? "dark" : "light"} />
        </>
    );
};

export default Route;
