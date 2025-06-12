import api from "./api";

const baseUrl = "/working-breaks";

export interface IWorkingBreakProps {
    id: number;
    abbreviation_agency: string;
    type: string;
    is_active: boolean;
    time_start: string;
    time_end: string;
    created_at?: string;
}

type workingBreakProps = {
    id_agency?: number;
    type?: string;
    is_active?: boolean;
};

export function getListWorkingBreak(params: workingBreakProps): Promise<IWorkingBreakProps[]> {
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

export function deleteWorkingBreak(id: number) {
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

type workingIntervalBreakProps = {
    id_agency: number;
    type: string;
    time_start: string;
    time_end: string;
    description?: string | null | undefined;
};

export function createIntervalWork(params: workingIntervalBreakProps): Promise<any> {
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

type UpdateIntervalWork = {
    time_start: string;
    time_end: string;
    description?: string | null | undefined;
};

export function updateIntervalWork(id: number, params: UpdateIntervalWork): Promise<any> {
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

type IWorkingIntervalBreakProps = {
    id: number;
    agencies: {
        id: number;
        abbreviation: string;
    };
    type: string;
    is_active: boolean;
    time_start: string;
    time_end: string;
    description: string | null | undefined;
};

export function searchIntervalById(id: number): Promise<IWorkingIntervalBreakProps> {
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

type ChangeStatusIntervalProps = {
    is_active?: boolean;
};

export function changeStatusInterval(id: number, params: ChangeStatusIntervalProps): Promise<any> {
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

type autocompleteWorkBreakProps = {
    id_agency: number;
    is_active?: boolean;
};

export interface IAgencyIntervalAutocomplete {
    id: number;
    id_agency: number;
    type: string;
    time_start: string;
    time_end: string;
}

export async function autocompleteWorkBreak(
    params: autocompleteWorkBreakProps,
): Promise<IAgencyIntervalAutocomplete[]> {
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
