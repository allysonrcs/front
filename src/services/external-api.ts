import api from "./api";

const baseUrl = "/external-api";

export interface IFinancialDolarAPI {
    dolar: string;
}

export function fetchFinancialDolarAwesomeAPI(): Promise<IFinancialDolarAPI> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/dolar-awesome-api`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function fetchFinancialDolarBCBAPI(): Promise<IFinancialDolarAPI> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/dolar-bcb`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IFinancialEuroAPI {
    euro: string;
}

export function fetchFinancialEuroAwesomeAPI(): Promise<IFinancialEuroAPI> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/euro-awesome-api`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function fetchFinancialEuroBCBAPI(): Promise<IFinancialEuroAPI> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/euro-bcb`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IFinancialCdiAPI {
    cdi: string;
}

export function fetchFinancialCdiAPI(): Promise<IFinancialCdiAPI> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/cdi`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IFinancialSelicAPI {
    selic: string;
}

export function fetchFinancialSelicAPI(): Promise<IFinancialSelicAPI> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/selic`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IFinancialPoupancaAPI {
    poupanca: string;
}

export function fetchFinancialPoupancaAPI(): Promise<IFinancialPoupancaAPI> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/poupanca`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
