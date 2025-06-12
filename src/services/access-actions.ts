import api from "./api";

const baseUrl = "/access-actions";

export type AllRoutesProps = {
    is_active?: boolean;
    id_access_module?: string;
};
export type IsearchRoutesProps = {
    module_name: string;
    id: number;
    name: string;
    type_route: string;
    route: string;
    is_active?: boolean;
};
export function searchAllRoutes(params: AllRoutesProps): Promise<IsearchRoutesProps[]> {
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

export type ModuleProps = {
    id: number;
    name: string;
};

export type IsearchIdRoutesProps = {
    id: number;
    name: string;
    type_route: string;
    route: string;
    is_active: boolean;
    access_modules: ModuleProps;
};
export function searchRouteById(id: number): Promise<any> {
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

export interface CreateProps {
    id_access_module: number;
    name: string;
    type_route: string;
    route: string;
}
export async function createRoute(params: CreateProps): Promise<any> {
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

export interface UpdateProps {
    id_access_module: number;
    name: string;
    type_route: string;
    route: string;
}

export function updateRoute(id: number, params: UpdateProps): Promise<any> {
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

type ChangeStatusRoute = {
    is_active: boolean;
};

export function changeStatusRoute(id: number, params: ChangeStatusRoute) {
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

export function deleteRoute(id: number) {
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
