import {
    IProductDataProps,
    IProductModalityDataProps,
    SearchAllParamsProductByID,
    SearchAllParamsProductModalityByID,
} from "@/types/products";
import api from "./api";

const baseUrl = "/products";

export interface IAutoCompleteProductsModalities {
    id: number;
    name: string;
    input_components: string;
    product_name: string;
    is_operator_price: boolean;
    is_operator_amount: boolean;
    is_operator_percentage: boolean;
    is_operator_points: boolean;
}
export interface IAutoCompleteProducts {
    id: number;
    name: string;
}

type SearchAutoCompleteProductsProps = {
    is_active?: boolean;
    is_productivity_control?: boolean;
    with_product_name?: boolean;
};

export type searchProductsProps = {
    id_cooperative?: number;
    type_segment?: string;
    is_active?: boolean;
};

interface ISearchListProducts {
    id: number;
    cooperative_name: string;
    coopcard_name: string;
    name: string;
    type_segment: string;
    type_polarity: string;
    type_operator: string;
    is_active: boolean;
    created_at: string;
}

type changeStatusProductProps = {
    is_active?: boolean;
};

export type searchProductsModalitiesProps = {
    is_active?: boolean;
};

interface ISearchListProductsModalities {
    id: number;
    id_product: number;
    product_name: string;
    name: string;
    description: string;
    multiplier: string;
    is_active: boolean;
    created_at: string;
}

type SearchAutoCompleteProductsModalitiesProps = {
    is_active?: boolean;
    id_product?: number;
    with_product_name?: boolean;
    has_input_components?: boolean;
    has_is_operators?: boolean;
};

export function searchProductByID(id: number): Promise<SearchAllParamsProductByID> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchListProducts(params: searchProductsProps): Promise<ISearchListProducts[]> {
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

export function searchAutoCompleteProducts(params: SearchAutoCompleteProductsProps): Promise<IAutoCompleteProducts[]> {
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

export function createProduct(params: IProductDataProps) {
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

export function updateProduct(id: number, params: IProductDataProps) {
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

export function deleteProduct(params: number) {
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

export function changeStatusProduct(id: number, params: changeStatusProductProps) {
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

export function searchListProductsModalities(
    params: searchProductsModalitiesProps,
): Promise<ISearchListProductsModalities[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/modalities?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchOneProductModalityByID(id: number): Promise<SearchAllParamsProductModalityByID> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/modalities/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchAutoCompleteProductsModalities(
    params: SearchAutoCompleteProductsModalitiesProps,
): Promise<IAutoCompleteProductsModalities[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/modalities/autocomplete?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function createProductModality(params: IProductModalityDataProps) {
    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}/modalities`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function updateProductModality(id: number, params: IProductModalityDataProps) {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/modalities/${id}`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function changeStatusProductModality(id: number, params: searchProductsModalitiesProps) {
    return new Promise((resolve, reject) => {
        api()
            .patch(`${baseUrl}/modalities/${id}/status`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function deleteProductModality(params: number) {
    return new Promise((resolve, reject) => {
        api()
            .delete(`${baseUrl}/modalities/${params}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
