import axios from "axios";

const apiBrasil = axios.create({
    baseURL: "https://brasilapi.com.br/",
});

export interface IAddressV2 {
    cep: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    service: string;
    location?: {
        type: string;
        coordinates: {
            longitude: string;
            latitude: string;
        };
    };
}

export async function searchCep(cep: number): Promise<IAddressV2> {
    return new Promise((resolve, reject) => {
        apiBrasil
            .get(`api/cep/v2/${cep}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
