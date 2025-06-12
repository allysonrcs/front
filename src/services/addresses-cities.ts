import api from "./api";

const baseUrl = "/addresses-cities";

export interface ICity {
    id: number;
    id_state: number;
    number_ibge: number;
    name: string;
    number_siafi: string;
}

type SearchCityTdo = {
    id_addresses_state: number;
};

export function searchCity(params: SearchCityTdo): Promise<ICity[]> {
    let myQuery = new URLSearchParams();

    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/search?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
