import api from "./api";

const baseUrl = "/system-configs";

export interface ISystemConfig {
    id: number;
    id_agency: number;
    variable: string;
    value: string;
}

type SearchConfigsProps = {
    variable: string[];
};

export function searchConfigs(params: SearchConfigsProps): Promise<ISystemConfig[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/configs?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type SearchOneConfigsProps = {
    variable: string;
};

export function searchConfig(params: SearchOneConfigsProps): Promise<ISystemConfig> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/config?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
