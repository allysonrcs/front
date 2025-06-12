import api from "./api";

const baseUrl = "/access-groups";

export interface ITreeRouteProps {
    id: number;
    id_unique: string;
    name: string;
    origin?: string;
    id_parent?: string;
    children: ITreeRouteProps[];
}

export interface ITreeRoutes {
    array_page_tree: ITreeRouteProps[];
    array_action_tree: ITreeRouteProps[];
}

export function getTreeRoutes(): Promise<ITreeRoutes> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/search-tree-access`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type AccessGroupProps = {
    name: string;
    description: string;
    ids_access_pages: number[];
    ids_access_actions: number[];
};

export async function createGroupAccess(params: AccessGroupProps): Promise<void> {
    return new Promise((resolve, reject) => {
        api()
            .post(baseUrl, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IAccessGroup {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
}

export async function getAllGroupAccess(): Promise<IAccessGroup[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(baseUrl)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export async function searchAllAccessPermissionGroup(): Promise<
    Array<{
        group:
            | "GROUP_ADMIN"
            | "GROUP_ADMIN_TI"
            | "GROUP_ADMIN_UAD"
            | "GROUP_PRESIDENT"
            | "GROUP_COUNSELOR"
            | "GROUP_DIRECTOR"
            | "GROUP_MANAGER_GENERAL"
            | "GROUP_MANAGER_REGIONAL"
            | "GROUP_MANAGER_UAD"
            | "GROUP_MANAGER_AGENCY"
            | "GROUP_MANAGER_RELATIONSHIP"
            | "GROUP_AGENT_SERVICE"
            | "GROUP_AGENT_RELATIONSHIP"
            | "GROUP_COORDINATOR"
            | "GROUP_ANALYST"
            | "GROUP_AGENCY_CASHIER"
            | "GROUP_ATTENDANT"
            | "GROUP_ASSISTENT"
            | "GROUP_TRAINEE"
            | "GROUP_APPRENTICE"
            | "GROUP_BASE"
            | "GROUP_AUDITOR_PRODUCTIVITY_CONTROL"
            | "GROUP_AUDITOR_PORTFOLIOS_MANAGEMENT"
            | "GROUP_MANAGER_PORTFOLIOS_MANAGEMENT";
    }>
> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/access-groups-permission`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IAccessGroupPageAndRouteProps extends IAccessGroup {
    access_groups_pages: Array<{
        id_access_page: number;
    }>;
    access_groups_actions: Array<{
        id_access_action: number;
    }>;
}

export async function getOneGroupAccessById(id: number): Promise<IAccessGroupPageAndRouteProps> {
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

type UpdateAccessGroupProps = {
    name: string;
    description: string;
    ids_access_pages: number[];
    ids_access_actions: number[];
};

export async function updateAccessGroup(id: number, params: UpdateAccessGroupProps): Promise<void> {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/${id}`, params)
            .then(() => {
                resolve();
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export async function deleteAccessGroup(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
        api()
            .delete(`${baseUrl}/${id}`)
            .then(() => {
                resolve();
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type ChangeStatusProps = {
    is_active: boolean;
};

export async function changeStatusAccessGroup(id: number, params: ChangeStatusProps): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            await api().patch(`${baseUrl}/${id}/status`, params);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

type AutoCompleteAccessGroupProps = {
    is_active?: boolean;
};

interface IAccessGroupAutocomplete {
    id: number;
    name: string;
}

export async function autoCompleteAccessGroup(
    params: AutoCompleteAccessGroupProps,
): Promise<IAccessGroupAutocomplete[]> {
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

export type RouteActionsProps = {
    method: "POST" | "GET" | "DELETE" | "PUT" | "PATCH";
    route: string;
};

export interface IRoutesActionsPermission {
    method: string;
    route: string;
    access: boolean;
}

export async function getPermissionRoute(routes: RouteActionsProps[]): Promise<IRoutesActionsPermission[]> {
    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}/access-actions-permission`, routes)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

export async function getAdminPermissions(): Promise<Array<{ group: "GROUP_ADMIN" | "GROUP_ADMIN_TI" }>> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/has-admin-permission`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
