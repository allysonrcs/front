import api from "./api";

const baseUrl = "/portfolios-management";

export interface ISearchListPortfoliosMigration {
    id: number;
    status_finished: string;
    // status_validation_origin: string;
    status_validation_destiny: string;
    migration_type: string;
    is_client: boolean;
    client_date_movement: string;
    client_sisbr_id: number;
    client_name: string;
    client_document: string;
    client_agency_name: string;
    client_id_portfolio: number;
    client_portfolio_name: string;
    client_profile: string;
    client_is_rural: boolean;
    new_client_agency_name: string;
    new_client_id_portfolio: number;
    new_client_portfolio_name: string;
    //
    // manager_origin_by_id: number;
    // manager_origin_by_name: string;
    // date_validation_origin: string;
    //
    reason: string;
    observation: string | null;
    created_by_id: number;
    created_by_name: string;
    creator_portfolio_name: string;
    manager_destiny_by_id: number;
    manager_destiny_by_name: string;
    date_validation_destiny: string;
    audited_by_id: number;
    audited_by_name: string;
    date_finished: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ISearchListPortfoliosMigrationValidation {
    id: number;
    status_finished: string;
    // status_validation_origin: string;
    status_validation_destiny: string;
    migration_type: string;
    client_sisbr_id: number;
    client_name: string;
    client_agency_name: string;
    client_portfolio_name: string;
    new_client_id_agency: number;
    new_client_agency_name: string;
    new_client_portfolio_name: string;
    created_by_name: string;
    creator_portfolio_name: string;
    created_at: string;
}

export type SearchPortfoliosMigrationProps = {
    status_finished?: string;
    status_validation_origin?: string;
    status_validation_destiny?: string;
    created_by_id?: number;
    date_search?: string;
    date_start?: string | null;
    date_end?: string | null;
    is_active?: boolean;
    client_document?: string;
};

export interface ISearchPortfoliosMigrationByID {
    id: number;
    status_finished: string;
    // status_validation_origin: string;
    status_validation_destiny: string;
    migration_type: string;
    is_client: boolean;
    client_date_movement: string;
    client_sisbr_id: number;
    client_name: string;
    client_document: string;
    client_agency_name: string;
    client_id_agency: number;
    client_id_portfolio: number;
    client_portfolio_name: string;
    client_profile: string;
    client_is_rural: boolean;
    origin_portfolio_manager_name: string | null;
    new_client_id_agency: number;
    new_client_agency_name: string;
    new_client_id_portfolio: number;
    new_client_portfolio_name: string;
    destiny_portfolio_manager_name: string | null;
    origin_real_portfolio_name: string;
    //
    // manager_origin_by_id: number;
    // manager_origin_by_name: string;
    // date_validation_origin: string;
    //
    reason: string;
    observation: string | null;
    created_by_id: number;
    created_by_name: string;
    manager_destiny_by_id: number;
    manager_destiny_by_name: string;
    date_validation_destiny: string;
    audited_by_id: number;
    audited_by_name: string;
    date_finished: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface IDashboardPortfoliosMigration {
    pending: number | null;
    waiting: number | null;
    finished: number | null;
    approved: number | null;
    failed: number | null;
    correction: number | null;
    total: number;
    total_with_canceled: number | null;
    validation_count: number | null;
}

export interface ICreatePortfoliosMigration {
    migration_type: string;
    client_sisbr_id: number;
    new_client_id_agency: number;
    new_client_id_portfolio: number;
    new_client_portfolio_name: number;
    reason: string;
    observation: string | null;
}

export interface IUpdatePortfoliosMigration {
    id: number;
    migration_type: string;
    client_sisbr_id: number;
    new_client_id_agency: number;
    new_client_id_portfolio: number;
    new_client_portfolio_name: number;
    reason: string;
    observation: string | null;
}

type changeStatusPortfoliosMigration = {
    status_finished?: string;
    status_validation_destiny?: string;
    is_active?: boolean;
    content_manual?: string | null;
};

type paramsDashboardPortfoliosMigration = {
    is_active?: boolean;
};

export type IHistoryPortfoliosMigration = {
    id: number;
    status_finished: string;
    status_validation_destiny: string;
    action: string;
    migration_type: string;
    content_manual: string;
    content_automatic: string;
    changed_by_name: string;
    created_by_name: string;
    audited_by_name: string;
    manager_destiny_by_name: string;
    date_validation_destiny: string;
    date_finished: string;
    created_at: string;
    is_active: boolean;
};

export interface ICreateInteractionPortfoliosMigration {
    content_manual: string;
}

export interface ISynchronizePortfoliosMigration {
    is_client: boolean;
    client_date_movement: Date;
    client_sisbr_id: number;
    client_name: string;
    client_document: string;
    client_agency_name: string;
    client_portfolio_name: string;
    client_is_rural: boolean;
    is_synchronized: boolean;
    message: string;
}

export function searchAllHistoryPortfoliosMigration(id: number): Promise<IHistoryPortfoliosMigration[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/portfolios-migration/${id}/history`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function getDashboardPortfoliosMigrationTotalizer(
    params: paramsDashboardPortfoliosMigration,
): Promise<IDashboardPortfoliosMigration> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/portfolios-migration/dashboard/totalizer?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchListPortfoliosMigration(
    params: SearchPortfoliosMigrationProps,
): Promise<ISearchListPortfoliosMigration[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/portfolios-migration?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchAllPortfoliosMigrationForValidation(
    params: SearchPortfoliosMigrationProps,
): Promise<ISearchListPortfoliosMigrationValidation[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/portfolios-migration/validation?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchPortfoliosMigrationByID(id: number): Promise<ISearchPortfoliosMigrationByID> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/portfolios-migration/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function createPortfoliosMigration(params: ICreatePortfoliosMigration) {
    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}/portfolios-migration`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function updatePortfoliosMigration(id: number, params: IUpdatePortfoliosMigration) {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/portfolios-migration/${id}`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function changeIsActivePortfoliosMigration(
    id: number,
    params: changeStatusPortfoliosMigration,
): Promise<{ status_finished: string }> {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/portfolios-migration/${id}/is_active`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function changeStatusPortfoliosMigrationValidation(id: number, params: changeStatusPortfoliosMigration) {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/portfolios-migration/${id}/status_validation`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function changeStatusPortfoliosMigrationFinished(id: number, params: changeStatusPortfoliosMigration) {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/portfolios-migration/${id}/status_finished`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function synchronizePortfoliosMigration(id: number): Promise<ISynchronizePortfoliosMigration> {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/portfolios-migration/${id}/synchronize-register`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function deletePortfoliosMigration(params: number) {
    return new Promise((resolve, reject) => {
        api()
            .delete(`${baseUrl}/portfolios-migration/${params}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
