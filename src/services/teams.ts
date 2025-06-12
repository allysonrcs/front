import api from "./api";

const baseUrl = "/teams";

export type CreateTeamProps = {
    id_sector: number;
    id_leader: number;
    name: string;
    ref_team_id?: number | null;
    description?: string | null;
};

export function createTeam(data: CreateTeamProps): Promise<any> {
    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}`, data)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type UpdateTeamProps = {
    id_leader: number;
    name: string;
    ref_team_id?: number | null;
    description?: string | null;
};

export function updateTeam(id_team: number, data: UpdateTeamProps): Promise<any> {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/${id_team}`, data)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function deleteTeam(id_team: number) {
    return new Promise((resolve, reject) => {
        api()
            .delete(`${baseUrl}/${id_team}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type UpdateStatusTeamProps = {
    is_active: boolean;
};

export function updateStatusTeam(id: number, params: UpdateStatusTeamProps) {
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

type SearchAutocompleteTeamTdo = {
    id_sector?: number;
    is_active?: boolean;
};

export interface ITeamAutocomplete {
    id: number;
    name: string;
}

export async function searchTeamAutocomplete(params: SearchAutocompleteTeamTdo): Promise<ITeamAutocomplete[]> {
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

type SearchTeamProps = {
    id_agency?: number;
    id_sector?: number;
    is_active?: boolean;
};

export interface ISearchTeam {
    id: number;
    description?: string | null;
    agency_name: string;
    sector_name: string;
    ref_team_id?: number | null;
    name: string;
    total_employee: number;
    created_at: string;
    is_active: boolean;
    updated_at?: string | null;
}

export async function searchTeam(params: SearchTeamProps): Promise<ISearchTeam[]> {
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

export interface ISearchOneTeam {
    id: number;
    name: string;
    description: string | null;
    ref_team_id: number | null;
    sectors: {
        id: number;
        name: string;
        agencies: {
            id: number;
            abbreviation: string;
        };
    };
    leader_employee: {
        id: number;
        peoples: {
            id: true;
            name: string;
        };
    };
    is_active: boolean;
}
export async function searchOneTeam(id_team: number): Promise<ISearchOneTeam> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/${id_team}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
