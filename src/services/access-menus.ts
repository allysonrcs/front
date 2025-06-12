import api from "./api";

const baseUrl = "/access-menus";

export interface IAccessMenu {
    id: number;
    name: string;
    route: string;
    icon: string;
    is_active?: boolean;
}
export type searchMenuProps = {
    is_active?: boolean;
};
export async function getAllMenuAccess(params: searchMenuProps): Promise<IAccessMenu[]> {
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

export type ISearchCompleteMenuProps = {
    id_access_menu: number;
    name: string;
};

export type IAutoCompleteMenuProps = {
    is_active?: boolean;
};

export function autocompleteMenu(params: IAutoCompleteMenuProps): Promise<ISearchCompleteMenuProps[]> {
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

export interface CreateProps {
    name: string;
    icon?: string;
    route: string;
    description?: string;
}
export async function createMenu(params: CreateProps): Promise<any> {
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

export type UpdateMenuProps = {
    name: string;
    icon?: string;
    route: string;
    description?: string;
};
export function updateMenu(id: number, params: UpdateMenuProps): Promise<any> {
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

type UpdateStatusMenuProps = {
    is_active: boolean;
};
export function updateStatusMenu(id: number, params: UpdateStatusMenuProps) {
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

export interface ISearchMenuByID {
    id: number;
    name: string;
    route: string;
    icon: string;
    description: string;
    is_active: boolean;
}
export function searchMenuById(id: number): Promise<ISearchMenuByID> {
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

type UpdateStatusProps = {
    is_active: boolean;
};
export function updateMenuStatus(id: number, params: UpdateStatusProps) {
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

export function deleteMenu(id: number) {
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
