import api from "./api";

const baseUrl = "/coop-mais";

export type ISearchDashboardParams = {
    ref_month: string;
    id_ref_agency: string;
    id_ref_portfolio?: string;
};

export interface DateCoopMaisStepKeysProps {
    id: string;
    title: string;
    current_value: number;
    goal_value: number;
    target_date: string;
    achievement_percentage: number;
    weight: number;
    points: number;
    is_inverse: boolean;
    order: number;
}

export interface ITimelineMonthsProps {
    month: string;
    icon: string;
    is_active: boolean;
    points: number;
}

interface IListCoopMaisStepKeysProps {
    step_keys: DateCoopMaisStepKeysProps[];
    sum_ranking_points: number;
    timeline_months: ITimelineMonthsProps[];
}
export function searchDashboardCoopMais(params: ISearchDashboardParams): Promise<IListCoopMaisStepKeysProps> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/dashboard?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type ISearchRankingDetailParams = {
    ref_month: string;
};

export interface Wallet {
    id: string;
    name: string;
    values: number[];
    achievement?: number | null;
    ideal_speed?: number | null;
}

export interface Agency {
    id: string;
    name: string;
    achievement?: number | null;
    ideal_speed?: number | null;
    values: number[];
    wallets: Wallet[];
}

export function searchRankingDetail(params: ISearchRankingDetailParams): Promise<{ agencies: Agency[] }> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/ranking-detail?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type ISearchRefYearAndMonthParams = {
    with_last_year: boolean;
    from_database: "bi_coop_chave_etapa" | "bi_coop_mobilizadores";
};

type AutoCompleteString = {
    id: string;
    label: string;
};

export interface IListRefYearAndMonthProps {
    ref_date: AutoCompleteString[];
}

export function searchRefYearAndMonth(params: ISearchRefYearAndMonthParams): Promise<IListRefYearAndMonthProps> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/ref-date?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListMobilizerProps {
    id_product: number;
    name_mobilizer: string;
    objective: number;
    accumulated: number;
    variation: number;
    attainment: number;
    type_operator: string;
    correction: number;
    analysis: number;
    weight: number;
    points: number;
    ideal_speed: number;
    date_moviment_mob: string;
    ref_month: string;
}

export interface IMobilizerProps {
    list_mobilizer: IListMobilizerProps[];
    ideal_speed: number;
    date_update: string;
    mensagem?: string | null;
}
export function searchListMobilizer(params: any): Promise<IMobilizerProps> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/mobilizer?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type SearchProductInMobilizerParams = {
    ref_month: string;
    id_product: number;
};

export function searchProductInMobilizerModal(
    params: SearchProductInMobilizerParams,
): Promise<{ agencies: Agency[]; product_name: string; date_update: string }> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/mobilizer-product-modal?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type SearchMobilizerConsolidatedParams = {
    ref_month: string;
};

export interface PortfoliosMobConsolidated {
    id: string;
    name: string;
    achievement_array: string[];
    ideal_speed: number[] | string[];
    achievement_mob: string;
}

export interface AgenciesMobConsolidated {
    id: string;
    id_portfolio: number;
    name: string;
    achievement_array: string[];
    portfolios: PortfoliosMobConsolidated[];
    ideal_speed: number[] | string[];
    achievement_mob: string;
}

export function searchMobilizerConsolidatedModal(params: SearchMobilizerConsolidatedParams): Promise<{
    agencies: AgenciesMobConsolidated[];
    products: string[];
    ideal_speed: number[];
    date_moviment: string[];
    date_update: string;
}> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/mobilizer-consolidated?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListCreditPortfolioProps {
    sguid: string;
    id_agencia: number;
    id_carteira: number;
    aloc_name: string;
    data_atualizacao: string;
    ano_mes: string;
    data_movimento: string;
    mes_ref: string;
    mes_ref_saldo: number;
    val_saldo_devedor: number;
    var_val_saldo_devedor: number;
    var_val_saldo_devedor_per: number;
    val_inad10: number;
    perc_inad10: number;
    val_inad90: number;
    perc_inad90: number;
    objetivo_perc_inad90: number;
    reducao_inad: number;
}

export interface ICreditPortfolioProps {
    list_credit_portfolio: IListCreditPortfolioProps[];
    date_update: string;
    year_month_actual: string;
    year_month_before: string;
    message: string;
}
export function searchListCreditPortfolio(params: any): Promise<ICreditPortfolioProps> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/credit-portfolio?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
export interface WalletCredit {
    id: string;
    name: string;
    values: number[];
    achievement?: number | null;
    ideal_speed?: number | null;
}

export interface AgencyCredit {
    id: string;
    name: string;
    achievement?: number | null;
    ideal_speed?: number | null;
    values: number[];
    wallets: WalletCredit[];
}

export function searchCreditPortfolioConsolidatedModal(params: { ref_month: string }): Promise<{
    agencies: AgencyCredit[];
    date_update: string;
    date_moviment: string;
    year_month_actual: string;
    year_month_before: string;
}> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/credit-portfolio-consolidated?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
