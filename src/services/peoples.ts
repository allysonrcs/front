import api from "./api";

const baseUrl = "/peoples";

export interface IAddress {
    id?: number;
    id_addresses_city: number;
    number_cep: number;
    street: string;
    neighborhood: string;
    number: number;
    complement: string;
    addresses_cities: {
        id: number;
        name: string;
        addresses_states: {
            id: number;
            name: string;
        };
    };
}

export interface IInfoPeopleConnected {
    id?: number;
    created_at?: string;
    id_address?: number;
    email?: string;
    name: string;
    document_cpf: string;
    document_rg?: string;
    issuing_agency_rg?: string;
    cel_phone_personal?: number;
    cel_phone_company?: number;
    birthday_date?: string;
    gender?: string;
    marital_status?: string;
    description?: string;
    addresses?: IAddress;
}

export function searchInfoPeopleConnected(): Promise<IInfoPeopleConnected> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/my-profile`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type UpdateMyPersonProps = {
    id_address?: number;
    name: string;
    document_cpf?: string;
    document_rg?: string;
    cel_phone_personal?: number;
    cel_phone_company?: number;
    birthday_date?: string;
    gender?: string;
    marital_status?: string;
    issuing_agency_rg?: string;
    description?: string | null;
    email: string;
    addresses?: {
        id?: number;
        id_addresses_city: number;
        number_cep: number;
        street: string;
        neighborhood: string;
        number: number;
        complement?: string;
    };
};

export function updateMyPerson(params: UpdateMyPersonProps): Promise<any> {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/my-profile`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
