import React, { createContext, useEffect, useState, useContext } from "react";
import { TOKEN, INFO_USER, PUBLIC_KEY, STATUS_CHAT } from "@/constants/local-storage";
import { CodeProps, login as authLogin, LoginResponse, sendCode, logoutApi } from "@/services/auth";
import { updateSocketStatus } from "@/services/employees";
import { states } from "@/constants/array-status-user";
import { getBaseURL } from "@/functions/getBaseURL";

type Props = {
    children: React.ReactNode;
};

export type User = {
    name: string;
    email: string;
    url_image_profile: string | null;
    id_cooperative: number;
    id_employee: number;
    id_people: number;
    id_user: number;
    id_agency: number;
    id_portfolio: number | null;
    id_sector: number;
    id_team: number | null;
    agency_sisbr_id: number;
    portfolio_sisbr_id: number | null;
    sisbr_id: number | null;
    agency_name: string;
    portfolio_name: string | null;
    sector_name: string;
    team_name: string | null;
    ipbx_identifier: string | null;
    is_birthday: boolean;
    id_imageprofile: number | null;
    phone_ramal: number | null;
    role_name: string | undefined;
    is_president: boolean;
    is_counselor: boolean;
    is_director: boolean;
    is_manager: boolean;
    is_coordinator: boolean;
    is_supervisor: boolean;
    is_assistent: boolean;
    is_analyst: boolean;
    is_attendant: boolean;
    is_agent: boolean;
    is_cashier: boolean;
    is_trainee: boolean;
    is_apprentice: boolean;
    is_first_password: boolean;
};

export type RoutesProps = {
    route: string;
    label: string;
    component: string;
    icon: string;
    isMenu: boolean;
    routes?: Array<{
        route: string;
        label: string;
        component: string;
        routes?: Array<{
            route: string;
            label: string;
            component: string;
        }>;
    }>;
};

type AuthContextType = {
    user: User | null;
    routes: RoutesProps[];
    saveRoute: (params: RoutesProps[]) => Promise<void>;
    signIn: (login: string, password: string) => Promise<boolean | LoginResponse>;
    logOut: () => Promise<void>;
    sendCodeVerification: (code: CodeProps) => void;
    toogleTokenAuthorization: (value: string) => Promise<void>;
    verifyAccessPage: (route: string) => Promise<boolean>;
    updateLocalUser: (data: User | null) => void;
    socketStatus: StatesProps;
    setSocketStatus: React.Dispatch<React.SetStateAction<StatesProps>>;
    checkStatusChat: () => Promise<void>;
};

export type StatesProps = {
    id: number;
    status: string;
    color: string;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthContextProvider: React.FC<Props> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [routes, setRoutes] = useState<RoutesProps[]>([]);
    const [socketStatus, setSocketStatus] = useState<StatesProps>(states[0]);

    useEffect(() => {
        const token = sessionStorage.getItem(window.btoa(TOKEN));
        const user = sessionStorage.getItem(window.btoa(INFO_USER));

        if (user && token) {
            const parsedUser = JSON.parse(user);

            if (parsedUser.url_image_profile && !parsedUser.url_image_profile.startsWith(getBaseURL())) {
                parsedUser.url_image_profile = getBaseURL() + parsedUser.url_image_profile;
            }

            setUser(parsedUser);
        }
    }, []);

    async function signIn(login: string, password: string): Promise<boolean | LoginResponse> {
        let data = await authLogin({ login, password });

        toogleTokenAuthorization(data.access_token);

        if (!data.device_authenticated) {
            return data;
        } else {
            const fullUrlImage = getBaseURL() + data.user.url_image_profile;

            setUser({
                ...data.user,
                url_image_profile: fullUrlImage,
            });

            sessionStorage.setItem(window.btoa(INFO_USER), JSON.stringify(data.user));
            return true;
        }
    }

    async function logOut() {
        await logoutApi().catch(console.error);
        toogleTokenAuthorization("");
        sessionStorage.removeItem(window.btoa(INFO_USER));
        sessionStorage.removeItem(window.btoa(PUBLIC_KEY));
        setUser(null);
    }

    async function saveRoute(params: RoutesProps[]) {
        setRoutes(params);
    }

    async function sendCodeVerification(code: CodeProps) {
        let data = await sendCode(code);

        toogleTokenAuthorization(data.access_token);

        sessionStorage.setItem(window.btoa(INFO_USER), JSON.stringify(data.user));
        setUser(data.user);
    }

    async function toogleTokenAuthorization(value: string) {
        if (value.length) {
            sessionStorage.setItem(window.btoa(TOKEN), value);
        } else {
            sessionStorage.removeItem(window.btoa(TOKEN));
        }
    }

    async function verifyAccessPage(route: string): Promise<boolean> {
        let existRoute = false;

        for (var i in routes) {
            if (routes[i].route === route) {
                existRoute = true;
                break;
            }

            routes[i].routes?.forEach((value) => {
                if (value.route === route) {
                    existRoute = true;
                    return;
                }

                value.routes?.forEach((sub) => {
                    if (sub.route === route) {
                        existRoute = true;
                        return;
                    }
                });
            });
        }

        return existRoute;
    }

    const updateLocalUser = (data: User | null) => {
        setUser(data);
        sessionStorage.setItem(window.btoa(INFO_USER), JSON.stringify(data));
    };

    const checkStatusChat = async (): Promise<void> => {
        const state = sessionStorage.getItem(window.btoa(STATUS_CHAT));

        if (state) {
            const currentState = JSON.parse(state);
            if (currentState.status != "online") {
                await updateSocketStatus({
                    socket_status: currentState.status.charAt(0).toUpperCase() + currentState.status.slice(1),
                }).catch(console.log);
                setSocketStatus(currentState);
            }
        } else {
            sessionStorage.setItem(
                window.btoa(STATUS_CHAT),
                JSON.stringify(states.find((state) => state.status === "online")),
            );
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                routes,
                saveRoute,
                signIn,
                logOut,
                sendCodeVerification,
                toogleTokenAuthorization,
                verifyAccessPage,
                updateLocalUser,
                socketStatus,
                setSocketStatus,
                checkStatusChat,
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    return context;
}
