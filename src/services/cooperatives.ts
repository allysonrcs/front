import api from "./api";

const baseUrl = "/cooperatives";

export interface IAutoCompleteCooperatives {
    id: number;
    abbreviation: string;
}

type SearchAutoCompleteCooperativesProps = {
    is_active?: boolean;
};

export function searchAutoCompleteCooperatives(
    params: SearchAutoCompleteCooperativesProps,
): Promise<IAutoCompleteCooperatives[]> {
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

export interface ISearchCooperativeByID {
    id: number;
    code_cooperative: number;
    name: string;
    abbreviation: string;
    description: string | null;
    matriz_name: string;
    center_name: string;
    is_active: boolean;
    employees_president: {
        id: number;
        peoples: {
            name: string;
        };
    };
}

export function searchCooperativeByID(id: number): Promise<ISearchCooperativeByID> {
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

type createCooperativeProps = {
    code_cooperative: number;
    name: string;
    abbreviation: string;
    id_president: number;
    matriz_name: string;
    center_name: string;
    description?: string | null | undefined;
};

export function createCooperative(params: createCooperativeProps) {
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

export type searchCooperativesProps = {
    is_active?: boolean;
    limit?: number;
    offset?: number;
};

export interface ISearchCooperatives {
    id: number;
    code_cooperative: number;
    name: string;
    abbreviation?: string | null | undefined;
    name_president: string;
    created_at?: string;
    is_active: boolean;
}

export function searchCooperatives(params: searchCooperativesProps): Promise<ISearchCooperatives[]> {
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

export function deleteCooperative(params: number) {
    return new Promise((resolve, reject) => {
        api()
            .delete(`${baseUrl}/${params}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type updateCooperativeProps = {
    code_cooperative: number;
    name: string;
    abbreviation: string;
    id_president: number;
    matriz_name: string;
    center_name: string;
    description?: string | null | undefined;
};

export function updateCooperative(id: number, params: updateCooperativeProps) {
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

type updateStatusCooperativeProps = {
    is_active: boolean;
};

export function updateStatusCooperative(id: number, params: updateStatusCooperativeProps) {
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
