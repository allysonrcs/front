import api from "./api";

const baseUrl = "/access-modules";

export type ISearchCompleteModuleProps = {
    id_access_module: number;
    name: string;
};

export type IModule = {
    is_active?: boolean;
};

export function autocompleteModule(params: IModule): Promise<ISearchCompleteModuleProps[]> {
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
