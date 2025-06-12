import api from "./api";

const baseUrl = "/productivities-control";

export interface ISearchListProductivityDaily {
    id: number;
    status: string;
    is_client: boolean;
    is_client_rural: boolean;
    client_date_movement: string | null;
    client_sisbr_id: number | null;
    client_name: string;
    client_document: string;
    client_porftfolio_name: string;
    client_agency_name: string;
    product_name: string;
    modality_name: string;
    modality_multiplier: number;
    price: number | null;
    amount: number | null;
    observation: string | null;
    detail: string;
    created_by_id: number;
    created_by_name: string;
    creator_agency_name: string;
    created_portfolio_name: string;
    audited_by_name: string;
    date_audit: string;
    created_at: string;
    mob_validation_agency_name: string;
    mob_validation_portfolio_name: string;
    mob_validation_date: string | null;
    mob_validation_is_counted: boolean;
    updated_at: string;
    is_active: boolean;
    interaction_count_manual: number;
}

export type SearchProductivitiesControlProps = {
    status?: string;
    is_client?: boolean;
    id_product?: number;
    id_modality_product?: number;
    date_search?: string;
    date_start?: string | null;
    date_end?: string | null;
    created_by_id?: number;
    id_agency?: number;
    client_document?: string;
    is_active?: boolean;
    mob_validation_is_counted?: boolean;
};

export interface ISearchProductivityDailyByID {
    id: number;
    status: string;
    is_client: boolean;
    client_date_movement: string | null;
    client_sisbr_id: number;
    client_name: string;
    client_document: string;
    client_agency_name: string;
    client_id_portfolio: number;
    client_portfolio_name: string;
    is_client_rural: boolean;
    id_product: number;
    product_name: string;
    id_modality: number;
    modality_name: string;
    price: number;
    amount: number;
    detail: string;
    observation: string;
    created_by_name: string;
    creator_agency_name: string;
    created_portfolio_name: string;
    audited_by_name: string;
    date_audit: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    mob_validation_agency_ref_id: number;
    mob_validation_portfolio_ref_id: number;
    mob_validation_agency_name: string;
    mob_validation_portfolio_name: string;
    mob_validation_date: Date | null;
    mob_validation_is_counted: boolean;
    interaction_count_manual: number;
}

export interface IDashboardProductivityDailyTotalizer {
    total: number;
    total_with_canceled: number;
    approved: number;
    failed: number;
    pending: number;
    correction: number;
    sketch: number;
}

export interface ICreateProductivityDaily {
    is_client: boolean;
    client_date_movement: string | null;
    client_sisbr_id: number | null;
    client_name: string;
    client_document: string;
    is_client_rural: boolean;
    id_product: number;
    product_name: string;
    id_modality: number;
    modality_name: string;
    price: number | null;
    amount: number | null;
    detail: string | null;
    observation: string | null;
    status: string;
    mob_validation_agency_id: number;
    mob_validation_portfolio_id: number;
}

export interface ICreateInteractionProductivityDaily {
    content_manual: string;
}

export interface IUpdateProductivityDaily {
    is_client: boolean;
    client_date_movement: string | null;
    client_sisbr_id: number | null;
    client_name: string;
    client_document: string;
    is_client_rural: boolean;
    id_product: number;
    product_name: string;
    id_modality: number;
    modality_name: string;
    price: number | null;
    amount: number | null;
    detail: string | null;
    observation: string | null;
    status: string;
}

export interface ISynchronizeProductivityDaily {
    is_client: boolean;
    client_date_movement: Date | null;
    client_sisbr_id: number | null;
    client_name: string;
    client_document: string;
    client_agency_name: string;
    client_portfolio_name: string;
    is_client_rural: boolean;
    is_updated: boolean;
    message: string;
}

export type changeStatusProductivityDailyProps = {
    status?: string;
    is_active?: boolean;
    content_manual?: string | null;
    mob_validation_agency_id?: number | null;
    mob_validation_portfolio_id?: number | null;
    mob_validation_date?: Date | null;
    mob_validation_is_counted?: boolean;
};

type transferResponsibleProductivityDaily = {
    id_employee: number;
    content_manual?: string | null;
};

type validationProductivityDaily = {
    mob_validation_agency_id: number;
    mob_validation_portfolio_id: number;
    mob_validation_date: Date;
    mob_validation_is_counted: boolean;
};

type paramsDashboardProductivityDaily = {
    is_active?: boolean;
    only_current_month?: boolean;
};

export interface IProductivityDailyInteraction {
    id: number;
    id_productivity_control: number;
    id_employee: number;
    name_employee: string;
    content_manual: string;
    content_automatic: string | null;
    created_at: string;
    profile_image?: string;
}

type SearchProductivitiesControlInteractionParams = {
    type_message?: string;
    created_by_id?: number;
};

export type IHistoryProductivityDaily = {
    id: number;
    status: string;
    action: string;
    is_client: boolean;
    is_active: boolean;
    changed_by_name: string;
    created_by_name: string;
    audited_by_name: string;
    date_audit: string;
    created_at: string;
    productivities_control_type: string | null;
    mob_validation_agency_name: string | null;
    mob_validation_portfolio_name: string | null;
    mob_validation_is_counted: boolean;
};

export function searchAllHistoryProductivityDaily(id: number): Promise<IHistoryProductivityDaily[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/productivity-daily/${id}/history`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchAllInteractionProductivityDailyByID(
    id: number,
    params: SearchProductivitiesControlInteractionParams,
): Promise<IProductivityDailyInteraction[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/productivity-daily/${id}/interaction?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function getDashboardProductivityDailyTotalizer(
    params: paramsDashboardProductivityDaily,
): Promise<IDashboardProductivityDailyTotalizer> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/productivity-daily/dashboard/totalizer?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchListProductivityDaily(
    params: SearchProductivitiesControlProps,
): Promise<ISearchListProductivityDaily[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/productivity-daily?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchProductivityDailyByID(id: number): Promise<ISearchProductivityDailyByID> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/productivity-daily/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function createInteractionProductivityDailyByID(
    id: number,
    params: ICreateInteractionProductivityDaily,
): Promise<{ id: number }> {
    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}/productivity-daily/${id}/interaction`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function createProductivityDaily(params: ICreateProductivityDaily) {
    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}/productivity-daily`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function updateProductivityDaily(id: number, params: IUpdateProductivityDaily) {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/productivity-daily/${id}`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function synchronizeProductivityDaily(id: number): Promise<ISynchronizeProductivityDaily> {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/productivity-daily/${id}/synchronize-register`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function changeIsActiveProductivityDaily(
    id: number,
    params: changeStatusProductivityDailyProps,
): Promise<{ status: string }> {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/productivity-daily/${id}/is_active`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function transferResponsibleProductivityDaily(id: number, params: transferResponsibleProductivityDaily) {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/productivity-daily/${id}/transfer-responsible`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function validationProductivityDaily(id: number, params: validationProductivityDaily) {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/productivity-daily/${id}/validation`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function changeStatusProductivityDaily(id: number, params: changeStatusProductivityDailyProps) {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/productivity-daily/${id}/status`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function deleteProductivityDaily(params: number) {
    return new Promise((resolve, reject) => {
        api()
            .delete(`${baseUrl}/productivity-daily/${params}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
