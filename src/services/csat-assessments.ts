import api from "./api";

const baseUrl = "/csat-assessments";

interface ISearchAllParams {
    rating?: number;
    context?: string;
    module?: string;
    route_path?: string;
    date_start?: string | null;
    date_end?: string | null;
    id_user_by_evaluation?: number;
    is_active?: boolean;
}

export interface ISearchCsatAssessments {
    id: number;
    rating: number;
    selected_tags?: string;
    description?: string;
    context?: string;
    module: string;
    route_path?: string;
    socket_status: string;
    user_avatar_created: string;
    user_name_created: string;
    agency_name_created: string;
    portfolio_name_created: string;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface ISearchOneCsatAssessmentsByID {
    id: number;
    rating: number;
    selected_tags?: string;
    description?: string;
    context?: string;
    module: string;
    route_path?: string;
    is_active: boolean;
}

export function searchAllCsatAssessments(params: ISearchAllParams): Promise<ISearchCsatAssessments[]> {
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

export function searchOneCsatAssessmentsByID(id: number): Promise<ISearchOneCsatAssessmentsByID> {
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

type ISearchAvarageRatingCsatAssessments = {
    average_rating: number;
    total_reviews: number;
};

export function searchAverageRatingCsatAssessments(
    params: ISearchAllParams,
): Promise<ISearchAvarageRatingCsatAssessments> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/average-rating?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type CreateCsatAssessmentsProps = {
    rating: number;
    selected_tags?: string;
    description?: string;
    context?: string;
    module: string;
    route_path?: string;
};

export function createCsatAssessments(params: CreateCsatAssessmentsProps) {
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

type UpdateCsatAssessmentsProps = {
    rating: number;
    selected_tags?: string;
    description?: string;
    context?: string;
    module: string;
    route_path?: string;
};

export function updateCsatAssessmentsByID(id: number, params: UpdateCsatAssessmentsProps) {
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

type ChangeStatusCsatAssessmentsProps = {
    is_active: boolean;
};

export function changeStatusCsatAssessmentsByID(id: number, params: ChangeStatusCsatAssessmentsProps) {
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

export function deleteCsatAssessmentsByID(id: number) {
    return new Promise((resolve, reject) => {
        api()
            .delete(`${baseUrl}/${id}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
