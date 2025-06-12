import api from "./api";

const baseUrl = "/reports";

export type SearchAllReportsCatalogProps = {
    id?: number;
    route?: string;
    card_type?: string;
    title?: string;
    is_active?: boolean;
};

export interface ISearchAllReportsCatalog {
    id: number;
    sguid: string;
    card_order: number | null;
    card_type: string;
    route: string | null;
    title: string;
    description: string | null;
    label_card: string | null;
    label_bignumber: string | null;
    label_icon: string | null;
    card_height: string;
    background_color: string;
    id_card_image: string | null;
    use_card_image: boolean;
    external_link: string | null;
    powerbi_link: string | null;
    powerbi_height: string | null;
    is_new: boolean;
    is_active: boolean;
    is_public: boolean;
    visibility_scope: string | null;
    created_at: string;
    updated_at: string | null;
    media_rating_report: number;
}

export function searchAllReportsCatalogRecords(
    params: SearchAllReportsCatalogProps,
): Promise<ISearchAllReportsCatalog[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type SearchBusinessPanelProps = {
    filter_client_agencies?: string[];
    filter_client_portfolio?: string[];
    filter_client_profile?: string[];
    filter_client_type?: string[];
    filter_client_marital?: string[];
    filter_client_gender?: string[];
    filter_client_cc_sitconta?: string[];
    filter_client_is_rural?: boolean;
    filter_client_is_cooperated?: boolean;
    filter_client_is_employee?: boolean;
};

export type SearchBusinessPanelParams = {
    agencia_id?: number;
    carteira_nome?: string;
    cliente_perfil?: string;
    cliente_tipo?: string;
    cliente_estado_civil?: string;
    cliente_sexo?: string;
    cliente_cc_sitconta?: string;
    e_rural?: boolean;
    e_cooperado?: boolean;
    e_funcionario?: boolean;
    cliente_documento?: string;
    risco_crl_min?: number;
    risco_crl_max?: number;
    iap_min?: number;
    iap_max?: number;
    renda_mensal_min?: number;
    renda_mensal_max?: number;
    credito_saldo_min?: number;
    credito_saldo_max?: number;
    saldo_devedor_sfn_min?: number;
    saldo_devedor_sfn_max?: number;
    valor_rdc_min?: number;
    valor_rdc_max?: number;
    valor_lca_min?: number;
    valor_lca_max?: number;
    valor_dap_min?: number;
    valor_dap_max?: number;
    tem_ad?: boolean;
    renda_tipo?: string;
    anot_vigentes_abs?: boolean;
    anot_vigentes_rel?: boolean;
    anot_baixadas_abs?: boolean;
    anot_baixadas_rel?: boolean;
    seg_vida?: boolean;
    seg_automovel?: boolean;
    seg_residencial?: boolean;
    seg_empresarial?: boolean;
    seg_multirisco?: boolean;
    cons_moto?: boolean;
    cons_automovel?: boolean;
    cons_imoveis?: boolean;
    cons_equipamento?: boolean;
    cons_viagem?: boolean;
    cartao_plastico?: string;
    cartao_situacao?: string;
    cartao_valor_limite_min?: number;
    cartao_valor_limite_max?: number;
};
export interface IListBusinessPanel {
    id: string;
    data_movimento: string;
    agencia_id: number;
    agencia_nome: string;
    carteira_id: number;
    carteira_nome: string;
    cliente_id: number;
    cliente_documento: string;
    cliente_nome: string;
    cliente_fantasia: string;
    cliente_sexo: string;
    cliente_estado_civil: string;
    cliente_tipo: string;
    cliente_perfil: string;
    cliente_nascimento: string;
    cliente_relacionamento: string;
    melhor_contato: string;
    cc_sitconta: string;
    e_rural: boolean;
    e_cooperado: boolean;
    e_funcionario: boolean;
    risco_crl: number;
    iap: number;
    renda_tipo: string;
    renda_mensal: number;
    credito_saldo: number;
    credito_maxdiasatraso: number;
    tem_ad: boolean;
    saldo_devedor_sfn: number;
    anot_vigentes_abs: number;
    anot_vigentes_rel: number;
    anot_baixadas_abs: number;
    anot_baixadas_rel: number;
    valor_rdc: number;
    valor_lca: number;
    valor_dap: number;
    seg_vida: number;
    seg_automovel: number;
    seg_residencial: number;
    seg_empresarial: number;
    seg_multirisco: number;
    cons_moto: number;
    cons_automovel: number;
    cons_imoveis: number;
    cons_equipamento: number;
    cons_viagem: number;
    plastico: string;
    sitcartao: string;
    valor_limite: number;
    chesp_limite: number;
    chesp_usado: number;
    chesp_diasuso: number;
}

export function searchReportsCatalogPanelBusiness(params: SearchBusinessPanelParams): Promise<IListBusinessPanel[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/panel/business-panel?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type SearchCooperatedPanelProps = {
    cliente_perfil?: string;
    cliente_tipo?: string;
    cliente_estado_civil?: string;
    cliente_sexo?: string;
    e_rural?: boolean;
    e_cooperado?: boolean;
    e_funcionario?: boolean;
};
export interface IListCooperatedPanel {
    id: number;
    data_movimento: string;
    cliente_documento: string;
    cliente_nome: string;
    cliente_fantasia: string;
    cliente_estadocivl: string;
    cliente_sexo: string;
    cliente_tipo: string;
    cliente_perfil: string;
    cliente_nascimento: string;
    cliente_relacionamento: string;
    agencia_nome: string;
    carteira_nome: string;
    e_rural: boolean;
    e_cooperado: boolean;
    e_funcionario: boolean;
    cc_sitconta: string;
    em_migracao_carteira: boolean;
}

interface IPanelCooperatedPanel {
    painel_cooperados: IListCooperatedPanel[];
    data_movimento: string;
}

export function searchReportsCatalogCooperatedPanel(
    params: SearchCooperatedPanelProps,
): Promise<IPanelCooperatedPanel> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/panel/cooperated-panel?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListPanelInadCards {
    id: number;
    cliente_id: number;
    cliente_nome: string;
    cliente_documento: string;
    e_rural: boolean;
    agencia_nome: string;
    carteira_nome: string;
    data_vencimento: string;
    dias_atraso: number;
    conta_cartao: string;
    bandeira: string;
    situacao: string;
    valor_limite: number;
    valor_fatura: number;
    valor_divida_cons: number;
    pag_minimo: number;
    contato_sipagnet: string;
    contato_sisbr: string;
    vira_honra_em: Date;
    vira_honra_esse_mes: boolean;
    anot_vigentes_abs: boolean;
}

interface IPanelInadCards {
    inad_cartoes: IListPanelInadCards[];
    big_number_quantidade: number;
    data_movimento: string;
}

export function searchReportsCatalogPanelInadCards(params: any): Promise<IPanelInadCards> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/panel/inad-cards?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListPanelInadOperations {
    id: number;
    cliente_id: number;
    data_movimento: string;
    cliente_nome: string;
    cliente_documento: string;
    e_rural: boolean;
    melhor_contato: string;
    agencia_nome: string;
    carteira_nome: string;
    data_vencimento: string;
    dias_atraso: number;
    tipo_contrato: string;
    num_contrato: string;
    saldo_total: number;
    parcelas_abertas: number;
    anot_vigentes_abs: boolean;
}

interface IPanelInadOperations {
    inad_cartoes: IListPanelInadOperations[];
    big_number_quantidade: number;
    data_movimento: string;
}

export function searchReportsCatalogPanelInadOperations(params: any): Promise<IPanelInadOperations> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/panel/inad-operations?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListPanelDepositAdvance {
    id: number;
    data_movimento: string;
    cliente_nome: string;
    cliente_documento: string;
    carteira_nome: string;
    melhor_contato: string;
    agencia_nome: string;
    e_rural: boolean;
    ad_atual: number;
    ultima_att_ad: number;
    status_ad: string;
    cheque_especial_atual: number;
    ultima_att_cheque_especial: number;
    status_cheque_especial: string;
    saldo_investimento_disponivel: number;
}

interface IPanelDepositAdvance {
    adiantamento_depositantes: IListPanelDepositAdvance[];
    data_movimento: string;
}

export function searchReportsCatalogPanelDepositAdvance(params: any): Promise<IPanelDepositAdvance> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/panel/deposit-advance?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListBirthdaysExpiring {
    id: number;
    data_movimento: string;
    cliente_nome: string;
    cliente_documento: string;
    cliente_nascimento: string;
    melhor_contato: string;
    agencia_nome: string;
    carteira_nome: string;
    e_funcionario: boolean;
    e_cooperado: boolean;
    e_rural: boolean;
    dias_faltantes_numero: number;
    dias_faltantes: string;
    idade_fazendo: number;
}

interface IPanelBirthdaysExpiring {
    proximos_aniversarios: IListBirthdaysExpiring[];
    big_number_quantidade: number;
    data_movimento: string;
}

export function searchReportsCatalogPanelBirthdaysExpiring(params: any): Promise<IPanelBirthdaysExpiring> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/panel/birthdays-expiring?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListEventsExpiring {
    id: number;
    data_movimento: string;
    natureza: string;
    dias_restantes: number;
    data_alvo: string;
    cliente_id: number;
    cliente_nome: string;
    cliente_documento: string;
    melhor_contato: string;
    obs1: string;
    obs2: string;
    obs3: string;
    agencia_nome: string;
    carteira_nome: string;
    e_rural: boolean;
}

interface IPanelEventsExpiring {
    eventos_expirados: IListEventsExpiring[];
    big_number_quantidade: number;
}

export function searchReportsCatalogPanelEventsExpiring(params: any): Promise<IPanelEventsExpiring> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/panel/events-expiring?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListPanelDiscountedTitles {
    id: number;
    data_movimento: string;
    cliente_nome: string;
    cliente_documento: string;
    melhor_contato: string;
    e_rural: boolean;
    agencia_nome: string;
    carteira_nome: string;
    noccb: string;
    inicio_vigencia: string;
    fim_vigencia: string;
    cls_total: number;
    cls_utilizado: number;
    cls_disponivel: number;
    limite_total_contratado: number;
    limite_distribuido: number;
    limite_distribuido_utilizado: number;
    limite_distribuido_disponivel: number;
    b_margem_total: number;
    b_margem_utilizada: number;
    b_margem_disponivel: number;
    b_perc_margem_disponivel: number;
    c_margem_total: number;
    c_margem_utilizada: number;
    c_margem_disponivel: number;
    c_perc_margem_disponivel: number;
}

interface IPanelDiscountedTitles {
    titulos_descontados: IListPanelDiscountedTitles[];
    big_number_soma: number;
    data_movimento: string;
}

export function searchReportsCatalogPanelDiscountedTitles(params: any): Promise<IPanelDiscountedTitles> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/panel/discounted-titles?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListPreApproved {
    id: number;
    cliente_id: number;
    data_movimento: string;
    agencia_nome: string;
    carteira_nome: string;
    cliente_nome: string;
    cliente_fantasia: string;
    cliente_documento: string;
    e_rural: boolean;
    cliente_perfil: string;
    melhor_contato: string;
    email: string;
    risco_crl: string;
    pd: string;
    portifolio: string;
    modalidade: string;
    submodalidade: string;
    valor_presente: number;
    limite_atribuido: number;
    limite_automatico: number;
    uso_automatico: number;
    limite_pre_aprovado: number;
    uso_preaprov: number;
    endividamento_intrames: number;
    max_parcela_mensal: number;
    chesp_limite: number;
    chesp_usado: number;
    chesp_diasuso: number;
}

interface IPanelPreApproved {
    pre_aprovado: IListPreApproved[];
    big_number_soma: number;
    data_movimento: string;
}

export function searchReportsCatalogPanelPreApproved(params: any): Promise<IPanelPreApproved> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/panel/pre-approved?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListDisbursement {
    id: string;
    refmes: string;
    data_apuracao: Date;
    cliente_id: number;
    cliente_nome: string;
    cliente_documento: string;
    e_funcionario: boolean;
    conta_corrente: string;
    linha: number;
    modalidade: string;
    valor: number;
    usuario: string;
    nome_usuario: string;
    renda_mensal: string;
    risco_crl: string;
    iap: string;
    agencia_nome: string;
    carteira_nome: string;
    cliente_perfil: string;
    e_rural: boolean;
    em_migracao_carteira: boolean;
}

interface IPanelDisbursement {
    painel_desembolso: IListDisbursement[];
    data_movimento: string;
}

export function searchReportsCatalogPanelDisbursement(params: any): Promise<IPanelDisbursement> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/panel/disbursement?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListSurveyRH {
    id: string;
    data_movimento: Date;
    nome_colaborador: string;
    sing_nome_agencia: string;
    agencia_id: number;
    carteira_id: number;
    carteira_nome: string;
    sing_nome_setor: string;
    sing_nome_time: string;
    funcionario_documento: string;
    banco_hora: string;
    bate_ponto: boolean;
    batidas_pares: boolean;
    treinamento: boolean;
    sing_situacao_colaborador: boolean;
    origem_dados: string;
}

interface IPanelSurveyRH {
    levantamento_rh: IListSurveyRH[];
    data_movimento: string;
    lista_data_movimento: string[];
}

export function searchReportsCatalogPanelSurveyRH(params: any): Promise<IPanelSurveyRH> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/panel/survey-rh?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListQualifiedAccounts {
    id: string;
    data_movimento: Date;
    cliente_id: number;
    cliente_documento: string;
    cliente_nome: string;
    agencia_nome: string;
    carteira_nome: string;
    e_rural: boolean;
    risco_crl: string;
    renda_bruta: number;
    numconta: string;
    conta_modalidade: string;
    conta_tipo: string;
    conta_situacao: string;
    tarifa: boolean;
    limite: boolean;
    cartao: boolean;
    seguro: boolean;
    previ_domicilio: boolean;
    stack: number;
    e_qualificada: boolean;
    anot_baixadas_abs: boolean;
    anot_baixadas_rel: boolean;
    anot_vigentes_abs: boolean;
    anot_vigentes_rel: boolean;
    pacote_nome: string;
    pacote_valor: number;
    chesp_limite: number;
    chsp_data_implantacao: Date;
    plastico: string;
    sitcartao: string;
    data_pri_compra_cred: Date;
    valor_limite: number;
    limite_atribuido: number;
}

interface IPanelQualifiedAccounts {
    painel_contas_qualificadas: IListQualifiedAccounts[];
    data_movimento: string;
}

export function searchReportsCatalogPanelQualifiedAccounts(params: any): Promise<IPanelQualifiedAccounts> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/panel/qualified-accounts?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListRelationshipMatrix {
    id: string;
    data_movimento: Date;
    cliente_id: number;
    cliente_nome: string;
    cliente_documento: string;
    agencia_nome: string;
    carteira_nome: string;
    cliente_perfil: string;
    e_cooperado: boolean;
    e_rural: boolean;
    cc_sitconta: string;
    iap: number;
    soc: number;
    classe_iap: string;
    classe_soc: string;
    linha: number;
    quartil: string;
    renda_bruta: number;
    risco_crl: number;
    anot_vigentes_rel: boolean;
    anot_vigentes_abs: boolean;
    historico_inad: boolean;
    emprestimo: number;
    financiamento: number;
    financiamento_rural: number;
    margem_contribuicao: number;
}

interface IPanelRelationshipMatrix {
    painel_matriz_relacionamento: IListRelationshipMatrix[];
    data_movimento: string;
}

export function searchReportsCatalogPanelRelationshipMatrix(params: any): Promise<IPanelRelationshipMatrix> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/panel/relationship-matrix?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IListInsights {
    birthdays_cooperated: string;
    pre_approved: string;
    inad_cards: string;
    inad_operations: string;
    events_expiring: string;
    disbursement: string;
    qualified_account: string;
    discounted_titles: string;
    deposit_advance: string;
    new_cooperated: string;
}

export function getListInsights(params: any): Promise<IListInsights> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/list-insights?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchOneReportsCatalogDashboardById(id: number): Promise<ISearchAllReportsCatalog> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/dashboard/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type Permission = {
    id: string;
    agencies: string;
    id_agency: number | null;
    sectors: string;
    id_sector: number | null;
    teams: string;
    id_team: number | null;
    employees: string;
    id_employee: number | null;
    granted_by_name: string | null;
};

type SearchOneReportsCatalogByID = {
    id: number;
    title: string;
    description: string | null;
    card_height: string | null;
    card_type: string;
    card_order: number | null;
    label_card: string | null;
    label_bignumber: string | null;
    label_icon: string | null;
    external_link: string | null | undefined;
    powerbi_height: string | null | undefined;
    powerbi_link: string | null | undefined;
    background_color: string;
    use_card_image: boolean;
    is_active: boolean;
    is_new: boolean;
    is_public: boolean;
    visibility_scope?: string | null | undefined;
    route: string | null | undefined;
    permissions: Permission[];
};

export interface ReportsCatalogProps {
    card_type: string;
    card_height: string | null;
    card_order: number | null;
    title: string;
    description: string | null;
    label_icon: string | null;
    background_color: string;
    label_card: string | null;
    label_bignumber: string | null;
    use_card_image: boolean;
    is_new: boolean;
    is_active: boolean;
    is_public: boolean;
    route: string | null | undefined;
    external_link: string | null | undefined;
    powerbi_link: string | null | undefined;
    powerbi_height: string | null | undefined;
    visibility_scope?: string | null | undefined;
    permission?: {
        id_agency: string | null | undefined;
        id_sector: string | null | undefined;
        id_team: string | null | undefined;
        id_employee: string | null | undefined;
    }[];
}

export function searchOneReportsCatalogByID(id: number): Promise<SearchOneReportsCatalogByID> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/catalog/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function createReportsCatalog(params: ReportsCatalogProps) {
    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}/catalog`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function updateReportsCatalog(id: number, params: ReportsCatalogProps) {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/catalog/${id}`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function deleteReportsCatalog(id: number) {
    return new Promise((resolve, reject) => {
        api()
            .delete(`${baseUrl}/catalog/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

interface CatalogStatusProps {
    is_active: boolean;
}
export function changeStatusReportsCatalog(id: number, params: CatalogStatusProps) {
    return new Promise((resolve, reject) => {
        api()
            .patch(`${baseUrl}/catalog/${id}/status`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
