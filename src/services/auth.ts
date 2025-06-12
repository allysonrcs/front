import api from "./api";
// import { encrypt } from "../functions/cryptography";

const baseUrl = "/auth";

export interface LoginResponse {
    access_token: string;
    device_authenticated: boolean;
    user: {
        id_cooperative: number;
        id_people: number;
        name: string;
        email: string;
        url_image_profile: string | null;
        id_employee: number;
        id_user: number;
        id_agency: number;
        id_portfolio: number | null;
        id_team: number | null;
        agency_sisbr_id: number;
        portfolio_sisbr_id: number | null;
        sisbr_id: number | null;
        ipbx_identifier: string | null;
        is_birthday: boolean;
        id_imageprofile: number | null;
        phone_ramal: number | null;
        id_sector: number;
        agency_name: string;
        portfolio_name: string | null;
        sector_name: string;
        team_name: string | null;
        role_name: string | undefined;
        is_president: boolean;
        is_counselor: boolean;
        is_director: boolean;
        is_coordinator: boolean;
        is_manager: boolean;
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
}

interface LoginProps {
    login: string;
    password: string;
}

export interface recoverPasswordProps {
    email: string;
}

export function login(params: LoginProps): Promise<LoginResponse> {
    return new Promise(async (resolve, reject) => {
        try {
            // const encrypted = await encrypt(JSON.stringify(params)).catch((error) => {
            //     throw error;
            // });
            const { data } = await api()
                // .post(`${baseUrl}/login`, {
                //     data: encrypted,
                // })
                .post(`${baseUrl}/login`, params)
                .catch((error) => {
                    throw error;
                });
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

export function recoverPassword(params: recoverPasswordProps): Promise<any> {
    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}/recover-password`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type CodeProps = {
    code: string;
};

export function sendCode(params: CodeProps): Promise<LoginResponse> {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await api()
                .post(`${baseUrl}/two-factor`, params)
                .catch((error) => {
                    throw error;
                });
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

export function getPublicKey(): Promise<string> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/public-key`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function logoutApi(): Promise<void> {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/logout`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
