import api from "./api";

const baseUrl = "/roles";

type AutocompleteRoleProps = {
    id_cooperative?: number;
    is_active?: boolean;
};

interface IAutocompleteRole {
    id: number;
    name: string;
    abbreviation: string;
}

export function searchAutocompleteRole(params: AutocompleteRoleProps): Promise<IAutocompleteRole[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/autocomplete?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type searchFunctionsProps = {
    is_active?: boolean;
    id_cooperative?: number;
    grade?: number;
    level?: string;
    limit?: number;
    offset?: number;
};

export interface IsearchSectorProps {
    id: number;
    name: string;
    grade: string;
    level: string;
    abbreviation_cooperative: string;
    is_active: boolean;
    created_at: string;
}

export function searchAllRoles(params: searchFunctionsProps): Promise<IsearchSectorProps[]> {
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

export interface ICreatehRoleProps {
    id_cooperative: number;
    name: string;
    level: string;
    grade: number;
    base_salary?: number | null;
    gratification?: number | null;
    responsibility_allowance?: number | null;
    description?: string | null | undefined;
}
export function createRole(params: ICreatehRoleProps): Promise<any> {
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

export interface IUpdateRoleProps {
    name: string;
    level: string;
    grade: number;
    base_salary?: number | null;
    gratification?: number | null;
    responsibility_allowance?: number | null;
    description?: string | null | undefined;
}

export function updateRole(id: number, params: IUpdateRoleProps): Promise<any> {
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

export function deleteRole(id: number) {
    return new Promise((resolve, reject) => {
        api()
            .delete(`${baseUrl}/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type UpdateStatusProps = {
    is_active: boolean;
};
export function updateStatusRole(id: number, params: UpdateStatusProps) {
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

export interface ISearchSectorByID {
    name: string;
    level: string;
    grade: number;
    base_salary: number | null;
    gratification: number | null;
    responsibility_allowance: number | null;
    description: string | null | undefined;
    is_active: boolean;
    cooperatives: {
        id: number;
        abbreviation: string;
    };
}
export function searchRoleById(id: number): Promise<ISearchSectorByID> {
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
