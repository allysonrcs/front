import api from "./api";

const baseUrl = "/external-tables";

export type SearchExtClientProps = {
    id_cooperative?: number;
    type_segment?: string;
    is_active?: boolean;
};

export interface ISearchListExtClient {
    id: number;
    cliente_documento: string;
    cliente_nome: string;
    cliente_perfil: string;
    cliente_tipo: string;
    agencia_id: number;
    carteira_id: number;
    carteira_nome: string;
    e_rural: boolean;
    e_cooperado: boolean;
    cc_ativa: boolean;
    data_movimento: string;
}

export interface ISearchExtClientAllCards {
    id: string;
    data_movimento: string;
    cliente_documento: string;
    cliente_id: number;
    nome_cartao: string;
    titularidade: string;
    conta_cartao: string;
    sit_conta_cartao: string;
    data_sit_conta_cartao: Date;
    numero_cartao: string;
    produto_cartao: string;
    sit_cartao: string;
    data_sit_cartao: Date;
    bandeira: string;
    cartao_chip: number;
    fatura_impressa: number;
    dia_vencimento: number;
    deb_auto: number;
    conta_deb_auto: string;
    conta_fun_deb: string;
    servico_add: string;
    data_cadastro: Date;
    data_emissao: Date;
    data_atv_cred: Date;
    data_pri_compra_cred: Date;
    data_ult_compra_cred: Date;
    data_validade_cartao: Date;
    data_inad: Date;
    valor_limite: number;
    valor_divida_cons: number;
    valor_prox_fatura: number;
}

export interface ISearchExtClientAllAccounts {
    id: string;
    data_movimento: Date | null;
    cliente_id: number | null;
    numconta: number | null;
    conta_modalidade: string | null;
    conta_tipo: string | null;
    conta_situacao: string | null;
    pacote_nome: string | null;
    pacote_valor: number | null;
    tem_limite: boolean | null;
    tem_chequeplus: boolean | null;
    tem_segprestamista: boolean | null;
    dt_abertura: Date | null;
    dt_ultmovimento: Date | null;
    dt_inativacao: Date | null;
    dt_encerramento: Date | null;
}

export interface ISearchExtClientAllDisbursement {
    id: string;
    refmes: string | null;
    data_apuracao: Date | null;
    conta_corrente: string | null;
    linha: number | null;
    modalidade: string | null;
    valor: number | null;
    usuario: string | null;
    nome_agencia: string | null;
    nome_carteira: string | null;
}

export interface ISearchExtClientAllInfo {
    // ext_clientes
    data_movimento: Date | null;
    cliente_id: number | null;
    cliente_documento: string | null;
    cliente_nome: string | null;
    cliente_fantasia: string | null;
    cliente_estadocivl: string | null;
    cliente_sexo: string | null;
    cliente_tipo: string | null;
    cliente_perfil: string | null;
    cliente_nascimento: Date | null;
    cliente_relacionamento: Date | null;
    agencia_id: number | null;
    carteira_id: number | null;
    carteira_nome: string | null;
    carteira_real_nome: string | null;
    e_rural: boolean;
    e_cooperado: boolean;
    e_funcionario: boolean;
    cc_ativa: boolean;
    cc_sitconta: string;
    cc_data_movimento: Date | null;
    celular: string | null;
    comercial: string | null;
    residencial: string | null;
    fax: string | null;
    melhor_contato: string | null;
    email: string | null;
    ce_data_movimento: Date | null;
    logradouro_tipo: string | null;
    logradouro: string | null;
    logradouro_numero: string | null;
    bairro: string | null;
    municipio: string | null;
    uf: string | null;
    cep: string | null;
    cf_data_movimento: Date | null;
    renda_bruta: number | null;
    saldo_devedor_sfn: number | null;
    valor_vencido_sfn: number | null;
    cliente_conta_ativa: boolean | null;
    iap: number | null;
    risco_crl: string | null;
    margem_contribuicao: number | null;
    deposito_avista: number | null;
    deposito_aprazo: number | null;
    credito_saldo: number | null;
    credito_maxdiasatraso: number | null;
    cliente_agencia_nome: string | null;
    refmes: string;
    posse: number;
    deb_auto_efetivado: number;
    ch_esp_conta_garant: number;
    cons_auto: number;
    cons_imovel: number;
    cons_moto: number;
    cons_servicos: number;
    cons_pesado: number;
    cons_bens_moveis: number;
    lca: number;
    lci: number;
    rdc: number;
    fundo_investimento: number;
    credito_rural: number;
    emprestimo: number;
    financiamento: number;
    poupanca: number;
    tag: number;
    cambio: number;
    pix: number;
    coopcerto: number;
    seg_vida_pf_pj: number;
    vida_prestamista: number;
    seg_auto: number;
    seg_massificado: number;
    seg_rural: number;
    seg_patrimonial: number;
    seg_risco_financ: number;
    utiliz_cartao_cred: number;
    utiliz_cart_deb: number;
    pgbl: number;
    vgbl: number;
    sipag: number;
    cobranca: number;
    td: number;
    unimed: number;
    egd: number;
    is_in_portfolio_migration: boolean;
}

export interface IAutoCompleteExtClients {
    id: number;
    name: string;
}

export type SearchExtClientsProps = {
    cliente_nome?: string;
    cliente_id?: number;
    cliente_tipo?: string;
    cliente_documento?: number;
    agencia_id?: number;
    carteira_nome?: string;
    e_rural?: boolean;
    e_cooperado?: boolean;
    cc_sitconta?: string;
    filtro_agencia?: boolean;
};

export type searchProductsModalitiesProps = {
    is_active?: boolean;
};

export function searchAllCardsClientByID(id: number): Promise<ISearchExtClientAllCards[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/clientes-cartoes/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchAllAccountsClientByID(id: number): Promise<ISearchExtClientAllAccounts[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/clientes-contas/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchAllDisbursementClientByID(id: number): Promise<ISearchExtClientAllDisbursement[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/clientes-desembolso/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchAllDataClientByID(id: number): Promise<ISearchExtClientAllInfo> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/clientes-todas-informacoes/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchExtClientByID(id: number): Promise<ISearchListExtClient> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/clientes/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchListExtClients(params: SearchExtClientsProps): Promise<ISearchListExtClient[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/clientes?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchAutoCompleteExtClients(params: SearchExtClientsProps): Promise<IAutoCompleteExtClients[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/clientes/autocomplete?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
