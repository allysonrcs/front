import api from "./api";

const baseUrl = "/homepage-config";

export type IListBanners = {
    id: number;
    title: string;
    display_order: number;
    is_external_link: boolean;
    link_url: string;
    image_url: string;
    is_active: boolean;
};

export interface ISearchLBanners {
    id: number;
    origin: string;
    title: string;
    description?: string | null;
    is_external_link: boolean;
    link_url?: string | null;
    display_order: number;
    image_url: string;
    image_name?: string;
    created_by_name: string;
    start_date?: Date | null;
    end_date?: Date | null;
    respect_period: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface ISearchOneBannerByID {
    id: number;
    title: string;
    description?: string | null;
    is_external_link: boolean;
    link_url?: string | null;
    display_order: number;
    image_url: string;
    image_name?: string;
    id_image_banner: number;
    start_date?: Date | null;
    end_date?: Date | null;
    respect_period: boolean;
    is_active: boolean;
}

type ListActiveBanners = {
    is_active: boolean;
};

export function searchListActiveBanners(params: ListActiveBanners): Promise<IListBanners[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/banners/list-active?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchAllBanners(params: any): Promise<ISearchLBanners[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/banners?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function searchOneBannerByID(id: number): Promise<ISearchOneBannerByID> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/banners/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type CreateBannerFieldsProps = {
    title: string;
    description?: string | null;
    link_url?: string | null;
    is_external_link: boolean;
    is_active: boolean;
    respect_period: boolean;
    start_date?: Date | null;
    end_date?: Date | null;
    file_image_banner: File;
};

export function createBannerFormData(params: CreateBannerFieldsProps) {
    var formData = new FormData();

    formData.append("title", params.title);
    formData.append("description", params?.description ?? "");
    formData.append("link_url", params?.link_url ?? "");
    formData.append("is_external_link", String(params.is_external_link));
    formData.append("respect_period", String(params.respect_period));
    formData.append("is_active", String(params.is_active));
    formData.append("start_date", params.start_date ? params.start_date.toISOString() : "");
    formData.append("end_date", params.end_date ? params.end_date.toISOString() : "");
    formData.append("file_image_banner", params.file_image_banner);

    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}/banners`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type UpdateBannerFieldsProps = {
    title: string;
    description?: string | null;
    link_url?: string | null;
    is_external_link: boolean;
    is_active: boolean;
    respect_period: boolean;
    start_date?: Date | null;
    end_date?: Date | null;
    id_image_banner?: number;
    file_image_banner: File;
};

export function updateBannerFormDataByID(
    id: number,
    params: UpdateBannerFieldsProps,
): Promise<{ id_image_banner: number }> {
    var formData = new FormData();

    formData.append("title", params.title);
    formData.append("description", params?.description || "");
    formData.append("link_url", params?.link_url || "");
    formData.append("is_external_link", String(params.is_external_link));
    formData.append("respect_period", String(params.respect_period));
    formData.append("is_active", String(params.is_active));
    formData.append("start_date", params.start_date ? params.start_date.toISOString() : "");
    formData.append("end_date", params.end_date ? params.end_date.toISOString() : "");
    formData.append("file_image_banner", params.file_image_banner);
    if (params.id_image_banner !== undefined && params.id_image_banner !== null) {
        formData.append("id_image_banner", String(params.id_image_banner));
    }

    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/banners/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type ChangeStatusBannerProps = {
    is_active: boolean;
};

export function changeStatusBannerByID(id: number, params: ChangeStatusBannerProps) {
    return new Promise((resolve, reject) => {
        api()
            .patch(`${baseUrl}/banners/${id}/status`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type ReorderBannersProps = {
    id: number;
    display_order: number;
}[];

export function changeReorderBanners(params: ReorderBannersProps) {
    return new Promise((resolve, reject) => {
        api()
            .patch(`${baseUrl}/banners/reorder`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function deleteBannerByID(id: number) {
    return new Promise((resolve, reject) => {
        api()
            .delete(`${baseUrl}/banners/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
