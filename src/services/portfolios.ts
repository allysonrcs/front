import { DataStepperPortfolio, SearchAllParamsPortfoliosById } from "@/types/portfolios";
import api from "./api";

const baseUrl = "/portfolios";

export interface IAutoCompletePortfolios {
    id: number;
    name: string;
    ref_id?: number | null;
    id_agency?: number | null;
    id_agency_sisbr?: number | null;
}

type SearchAutoCompletePortfoliosProps = {
    id_portfolio?: number;
    ref_id?: number;
    id_agency?: number;
    agency_sisbr_id?: number;
    is_active?: boolean;
    with_restrict_agency?: boolean;
    has_id_ref?: boolean;
    has_id_agency?: boolean;
    has_agency_sisbr_id?: boolean;
};

export function searchAutoCompletePortfolios(
    params: SearchAutoCompletePortfoliosProps,
): Promise<IAutoCompletePortfolios[]> {
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

export function searchPortfolioByID(id_portfolio: number): Promise<SearchAllParamsPortfoliosById> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/${id_portfolio}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface ISearchPortfolioResponsibleEmployees {
    id: number;
    name: string;
    type_responsible: string;
}

export function searchPortfolioResponsibleEmployeesByID(
    id_portfolio: number,
): Promise<ISearchPortfolioResponsibleEmployees[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/responsible-employees/${id_portfolio}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface ISearchPortfolioEmployees {
    id: number;
    name: string;
}

export function searchPortfolioEmployeesByID(id_portfolio: number): Promise<ISearchPortfolioEmployees[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/employees/${id_portfolio}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function createPortfolio(params: DataStepperPortfolio) {
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

export type searchPortfoliosProps = {
    id_agency?: number;
    is_global?: boolean;
    is_active?: boolean;
};

export interface ISearchPortfolios {
    id: number;
    ref_id: number | null;
    name: string;
    agency: string;
    is_active: boolean;
    count_substitute: number;
    count_assistant: number;
    count_employee: number;
    main_responsible: string;
    created_at: string;
    updated_at: string;
}

export function searchListPortfolios(params: searchPortfoliosProps): Promise<ISearchPortfolios[]> {
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

export function deletePortfolio(params: number) {
    return new Promise((resolve, reject) => {
        api()
            .delete(`${baseUrl}/${params}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function updatePortfolio(id: number, params: DataStepperPortfolio) {
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

type updateStatusPortfolioProps = {
    is_active: boolean;
};

export function changeStatusPortfolio(id: number, params: updateStatusPortfolioProps) {
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
