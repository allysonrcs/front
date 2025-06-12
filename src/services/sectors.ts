import api from "./api";

const baseUrl = "/sectors";

export interface IAutocompleteSector {
    id: number;
    name: string;
    id_agency_sisbr?: number | null;
}

type SearchAutocompleteProps = {
    id_agency?: number;
    has_agency_sisbr_id?: boolean;
    is_active?: boolean;
    is_customer_service?: boolean;
};

export function searchAutocompleteSector(params: SearchAutocompleteProps): Promise<IAutocompleteSector[]> {
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

export interface ISearchSectorByID {
    name: string;
    abbreviation: string | null;
    ref_sector_id: number | null;
    description: string | null;
    is_active: boolean;
    agencies: {
        id: number;
        name: string;
    };
    roles: {
        id: number;
        name: string;
    };
    sectors_roles_employees: [
        {
            id: number;
            type: "Gerente" | "Supervisor";
            employees: {
                id: number;
                peoples: {
                    id: number;
                    name: string;
                };
            };
        },
    ];
}

export function searchSectorByID(id_sector: number): Promise<ISearchSectorByID> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/${id_sector}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type createProps = {
    id_agency: number;
    supervisors: number[];
    managers: number[];
    name: string;
    abbreviation?: string | null;
    ref_sector_id?: number | null;
    description?: string | null | undefined;
};

export function createSector(params: createProps) {
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

export type searchProps = {
    is_active?: boolean;
    id_agency?: number;
    limit?: number;
    offset?: number;
};

export interface IsearchSector {
    id: number;
    ref_sector_id?: number | null;
    name?: string;
    abbreviation?: string | null;
    responsible_manager?: string | null;
    responsible_superior?: string | null;
    abbreviation_agency?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string | null;
}

export function searchSector(params: searchProps): Promise<IsearchSector[]> {
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

export function deleteSector(params: number) {
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

type updateSectorProps = {
    name: string;
    abbreviation?: string | null;
    supervisors: number[];
    managers: number[];
    ref_sector_id?: number | null;
    description?: string | null | undefined;
};

export function updateSector(id: number, params: updateSectorProps) {
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

type updateStatusProps = {
    is_active: boolean;
};

export function updateStatusSector(id: number, params: updateStatusProps) {
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
