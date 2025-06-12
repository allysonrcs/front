import api from "./api";
// import { encrypt } from "@/functions/cryptography";

const baseUrl = "/users";

type UpdatePasswordProps = {
    password: string;
    token: string;
};

type changePasswordProps = {
    current_password: string;
    new_password: string;
};

export type searchProps = {
    is_active?: boolean;
    id_agency?: number;
    limit?: number;
    offset?: number;
    id_sector?: number;
    id_team?: number;
};

export interface ISearchUser {
    id: number;
    login?: string;
    url_avatar?: string | null;
    socket_status?: string;
    agency_name?: string;
    name_people?: string;
    sector_name?: string;
    team_name?: string;
    role_name?: string;
    portfolio_name?: string | null;
    is_active?: boolean;
    created_at?: string;
}

export type UserAccessDepartmentProps = {
    id_agency: number;
    id_sector: number;
};

export interface ISearchUserID {
    id: number;
    login: string;
    is_active: boolean;
    employees: {
        id: number;
        id_agency: number;
        peoples: {
            id: number;
            name: string;
        };
        agencies: {
            id: number;
            abbreviation: string;
        };
    };
    user_access_groups?: Array<{
        id: number;
        access_groups: {
            id: number;
            name: string;
        };
    }>;
    user_access_departments: UserAccessDepartmentProps[];
}

export interface IUpdateStatusUser {
    is_active: boolean;
}

export type createUserProps = {
    id_employee: number;
    sisbr_id: number | null;
    login: string;
    password: string;
    access_groups: number[];
    user_access_agencies_and_sectors?: Array<{ agencies: { id: number; sectors: number[] } }>;
};

export function updatePassword(params: UpdatePasswordProps): Promise<void> {
    const headers = {
        authorization: `Bearer ${params.token}`,
    };

    return new Promise((resolve, reject) => {
        api()
            .patch(`${baseUrl}/update-password`, { password: params.password }, { headers })
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export const changePassword = (params: changePasswordProps): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            // const encrypted = await encrypt(JSON.stringify(params)).catch((error) => {
            //     throw error;
            // });
            const { data } = await api()
                // .patch(`${baseUrl}/change-password`, { data: encrypted })
                .patch(`${baseUrl}/change-password`, params)
                .catch((error) => {
                    throw error;
                });
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
};

export function searchUser(params: searchProps): Promise<ISearchUser[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchUserByID(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function updateStatusUser(id: number, params: IUpdateStatusUser) {
    return new Promise((resolve, reject) => {
        api()
            .patch(`${baseUrl}/${id}/status`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function createUser(params: createUserProps) {
    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function updateUser(id: number, params: createUserProps) {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/${id}`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function register(data: any): Promise<object> {
    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}/register`, data)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
