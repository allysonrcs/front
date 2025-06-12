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

export type SearchProducts = {
    id_agency?: AutoCompleteNumber;
    is_global?: AutoCompleteBoolean;
    is_active?: AutoCompleteBoolean;
};

export interface IProducts {
    id: number;
    product_sisbr_id?: number | null;
    name: string;
    agency: string;
    is_global: boolean;
    main_responsible?: string;
    description?: string | null | undefined;
}

export type IProductsUpdateColumn = {
    id: number;
    product_sisbr_id?: number | null;
    name?: string;
    cooperative_name?: string;
    coopcard_name?: string | null;
    type_segment?: string;
    type_polarity?: string;
    type_operator?: string;
    is_active?: boolean;
};

export interface IProductDataProps {
    product_sisbr_id?: number | null;
    name: string;
    id_cooperative: number;
    type_segment: string;
    type_polarity: string;
    type_operator: string;
    coopcard_name?: string | null;
    coopcard?: number | null;
    is_productivity_control: boolean;
    is_bonus: boolean;
    description?: string | null | undefined;
}

export type AutoCompleteProductsProps = {
    is_active?: boolean;
};

export interface ISearchListProducts {
    id: number;
    product_sisbr_id?: number | null;
    name: string;
    cooperative_name: string;
    type_segment: string;
    type_polarity: string;
    type_operator: string;
    is_active: boolean;
    created_at: string;
}

export type SearchAllParamsProductByID = {
    id: number;
    product_sisbr_id?: number | null;
    name: string;
    id_cooperative: number;
    type_segment: string;
    type_polarity: string;
    type_operator: string;
    coopcard_name?: string | null;
    coopcard?: number | null;
    is_productivity_control: boolean;
    is_bonus: boolean;
    description?: string | null;
    is_active: boolean;
};

export type IProductsModalitiesUpdateColumn = {
    id: number;
    name?: string;
    modality?: string;
    multiplier?: number;
    product_name?: string;
    is_active?: boolean;
};

export interface IProductModalityDataProps {
    id_product: number;
    name: string;
    modality: string;
    multiplier: number;
    input_components?: string | null | undefined;
    product_modality_sisbr_id?: number | null;
    description?: string | null | undefined;
    is_operator_price: boolean;
    is_operator_amount: boolean;
    is_operator_percentage: boolean;
    is_operator_points: boolean;
}

export type SearchAllParamsProductModalityByID = {
    id: number;
    id_product: number;
    product_modality_sisbr_id: number;
    modality: string;
    name: string;
    description: string;
    multiplier: number;
    input_components: string;
    is_active: boolean;
    is_operator_price: boolean;
    is_operator_amount: boolean;
    is_operator_percentage: boolean;
    is_operator_points: boolean;
};

export interface ISearchListProductsModalities {
    id: number;

    product_name: string;
    name: string;
    description: string;
    multiplier: string;
    is_active: boolean;
    created_at: string;
}
