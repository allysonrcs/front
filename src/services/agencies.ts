import api from "./api";
const baseUrl = "/agencies";

type AgencyCreateProps = {
    agency_sisbr_id: number;
    name: string;
    ipbx_identifier?: string | null;
    id_headquarters?: number;
    id_cooperative: number;
    id_manager_agency?: number;
    type_area: string;
    abbreviation: string;
    description?: string | null | undefined;
};

type AgencyUpdateProps = {
    agency_sisbr_id: number;
    name: string;
    ipbx_identifier?: string | null;
    id_headquarters?: number;
    id_cooperative: number;
    id_manager_agency?: number;
    type_area: string;
    abbreviation: string;
    description?: string | null | undefined;
};

export interface IAgencyProps {
    id: number;
    agency_sisbr_id: number | null;
    name: string;
    abbreviation: string;
    ipbx_identifier: string;
    id_headquarters?: number | null;
    id_cooperative: number;
    id_manager_agency?: number;
    type_area: string;
    is_active: boolean;
    created_at: string;
    description?: string | null | undefined;
    matriz_name?: string | null | undefined;
    agency_employee_manager?: string | null | undefined;
    cooperative_code?: number;
}

type ChangeStatusAgencyProps = {
    is_active: boolean;
};

export type SearchAgencyDTO = {
    is_active?: boolean;
    with_agency_sisbr_id?: boolean;
    with_restrict_agency?: boolean;
};

export interface IAgenciesAutocomplete {
    id: number;
    abbreviation: string;
    agency_sisbr_id: number;
}

export interface IUnitAndSectorsProps {
    id: number;
    name: string;
    id_unique: string;
    children: Array<{
        id: number;
        name: string;
        id_unique: string;
        id_agency: number;
        id_parent: number;
    }>;
}

export type searchAgencyProps = {
    is_active?: boolean;
    id_cooperative?: number;
    type_area?: string;
    limit?: number;
    offset?: number;
};

export async function createAgency(params: AgencyCreateProps): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await api().post(baseUrl, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

export async function updateAgency(id_agency: number, params: AgencyUpdateProps): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await api().put(`${baseUrl}/${id_agency}`, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

export async function removeAgency(id_agency: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await api().delete(`${baseUrl}/${id_agency}`);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

export async function listAgencies(params: searchAgencyProps): Promise<IAgencyProps[]> {
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

export async function getAgencyByID(id: number): Promise<IAgencyProps> {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await api().get(`${baseUrl}/${id}`);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

export async function changeStatusAgency(id: number, params: ChangeStatusAgencyProps) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await api().patch(`${baseUrl}/${id}/status`, params);
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

export async function searchAutocompleteAgencies(params: SearchAgencyDTO): Promise<IAgenciesAutocomplete[]> {
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

export async function searchAllAgencies(): Promise<IAgenciesAutocomplete[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/all-agencies`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export async function getAgenciesAndSectors(): Promise<IUnitAndSectorsProps[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/agencies-and-sectors`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
