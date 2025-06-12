export type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

export type AutoCompleteString = {
    id: string;
    label: string;
};

export type AutoCompleteNumber = {
    id: number;
    label: string;
};

export interface ISearchCollaborator {
    id: number;
    name: string;
}

export type SearchPortfolios = {
    id_agency?: AutoCompleteNumber;
    is_global?: AutoCompleteBoolean;
    is_active?: AutoCompleteBoolean;
};

export interface IPortfolios {
    id: number;
    name: string;
    agency: string;
    is_global: boolean;
    main_responsible?: string;
    ref_id?: number | null;
    portfolio_sisbr_id?: number | null;
    description?: string | null | undefined;
}

export interface IPortfoliosUpdateColumn {
    id: number;
    ref_id?: number;
    name?: string;
    agency?: string;
    is_active?: boolean;
    is_global?: boolean;
    count_substitute?: number;
    count_assistant?: number;
    count_employee?: number;
    main_responsible?: string;
    interaction_count_manual?: number;
    updated_at?: string;
}

export interface IPortfolioDataProps {
    name: string;
    agencies: AutoCompleteNumber;
    type_portfolio: AutoCompleteBoolean;
    main_responsible: AutoCompleteNumber;
    ref_id?: number | null;
    portfolio_sisbr_id?: number | null;
    is_visible: AutoCompleteBoolean;
    description?: string | null | undefined;
    substitutes: AutoCompleteNumber[];
    assistants: AutoCompleteNumber[];
}

export type AutoCompletePortfoliosProps = {
    is_active?: boolean;
};

export type CollaboratorsDataProps = { id: number; name: string }[];

export interface ICollaborators {
    id_employee: number;
}

export type SearchAllParamsPortfoliosById = {
    id?: number;
    name?: string;
    id_agency?: number;
    ref_id?: number | null;
    portfolio_sisbr_id?: number | null;
    id_main_responsible?: number;
    is_global?: boolean;
    description?: string | null | undefined;
    is_active?: boolean;
    is_visible?: boolean;
    substitutes?: AutoCompleteNumber[];
    assistants?: AutoCompleteNumber[];
    collaborators?: ISearchCollaborator[];
    employees_portfolio?: ISearchCollaborator[];
    autocomplete_agencies?: AutoCompleteNumber[];
    autocomplete_managers_employees?: AutoCompleteNumber[];
};

export type SearchAllParamsPortfolios = {
    employees_portfolio: ISearchCollaborator[];
};

export type DataStepperPortfolio = {
    portfolio: {
        name: string;
        id_agency: number;
        ref_id: number;
        portfolio_sisbr_id: number;
        is_global: string;
        is_visible: string;
        id_main_responsible: string;
        description?: string;
    };
    substitutes: ICollaborators[];
    assistants: ICollaborators[];
    collaborators?: ICollaborators[];
    delete_collaborators?: number[];
    added_collaborators?: number[];
};
