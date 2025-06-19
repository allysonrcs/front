import api from "./api";
import { RoutesProps } from "@/contexts/AuthContext";

const baseUrl = "/access-pages";

export type IsearchPagesProps = {
    id: number;
    name: string;
    route: string;
    icon: string;
    is_active?: boolean;
    name_route_father: string;
    menu_name: string;
};

export type AllPagesProps = {
    is_active?: boolean;
    id_access_menu?: string;
};

export interface UpdateProps {
    id_access_menu: number;
    id_access_page?: number;
    name: string;
    route: string;
    icon: string;
    component: string;
}

export interface ISearchPageByID {
    id: number;
    access_menus: {
        id: number;
        name: string;
    };
    name: string;
    icon: string | null;
    component: string;
    route: string;
    is_active: boolean;
}

type ISearchCompletePageProps = {
    id_access_page: number;
    name: string;
};
type IPage = {
    is_active: boolean;
    id_access_menu?: number;
};

type UpdateStatusPage = {
    is_active: boolean;
};

export interface CreateProps {
    id_access_menu?: number;
    id_access_page?: number;
    name: string;
    route: string;
    icon: string;
    component: string;
}

export function searchPagesMenu(params: AllPagesProps): Promise<IsearchPagesProps[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/all-pages?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchPageById(id: number): Promise<ISearchPageByID> {
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

export function autocompletePages(params: IPage): Promise<ISearchCompletePageProps[]> {
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

export function updatePageStatus(id: number, params: UpdateStatusPage) {
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

export function deletePage(id: number) {
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

export function updatePage(id: number, params: UpdateProps): Promise<any> {
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

export async function createPage(params: CreateProps): Promise<any> {
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

export function findAllAccessPage(): Promise<RoutesProps[]> {
    const routes: RoutesProps[] = [
        {
            route: "/acessos/usuarios",
            label: "Usuários",
            component: "ListRecordsUsers",
            icon: "person",
            isMenu: true,
            routes: [
                {
                    route: "/acessos/usuarios/cadastrar",
                    label: "Cadastro",
                    component: "Users",
                },
            ],
        },
    ];

    return Promise.resolve(routes);
}
