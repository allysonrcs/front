import api from "./api";

const baseUrl = "/addresses-states";

export interface IState {
    id: number;
    id_region: number;
    abbreviation: string;
    name: string;
}

export function findAllState(): Promise<IState[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
