import { CommonNotificationProps, ISearchNotification, SearchAllNotificationProps } from "../types/notifications";

import api from "./api";

const baseUrl = "/notifications";

export interface INotificationAsideProps {
    id: number;
    type: string;
    title: string;
    subtitle?: string;
    content: string;
    image_cover?: string;
    priority_level: string;
    source: string;
    people_name?: string;
    url_image_profile?: string;
    moduleIcon?: string;
    is_read: boolean;
    is_active: boolean;
    created_at: string;
    // is_external_link: boolean
    // link_url?: string;
    // module?: string;
}

interface DocumentFile {
    id: number;
    type: string;
    size: number;
    file_name: string;
}

interface NotificationAttachment {
    id: number;
    document_file: DocumentFile;
}
export interface INotificationContent {
    id: number;
    type: string;
    title: string;
    subtitle?: string;
    content: string;
    image_cover?: string;
    priority_level: string;
    source: string;
    is_external_link: boolean;
    link_url?: string;
    people_name?: string;
    url_image_profile?: string;
    module?: string;
    moduleIcon?: string;
    is_read: boolean;
    is_active: boolean;
    created_at: string;
    notification_attachment?: NotificationAttachment[];
}

export function searchTotalNotificationNotViewed(): Promise<number> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/notifications/unread/count`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function findAllAdminNotifications(params: any): Promise<INotificationAsideProps[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/admin/notifications`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function listUserNotifications(params: any): Promise<INotificationAsideProps[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/notifications`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function getUserNotificationById(id_notification: number): Promise<any> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/notifications/${id_notification}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function updateNotificationStatusById(id: number, is_active: boolean) {
    return new Promise((resolve, reject) => {
        api()
            .patch(`${baseUrl}/admin/notifications/${id}/status`, { is_active })
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function markNotificationAsRead(id: number) {
    return new Promise((resolve, reject) => {
        api()
            .patch(`${baseUrl}/notifications/${id}/read`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type CreateNotificationFieldsProps = {
    title: string;
    subtitle?: string | null;
    content?: string | null;
    file_image_cover?: File | null;
    is_active: boolean;
    priority_level: string;
    is_external_link: boolean;
    link_url?: string | null;
    origin: string;
    module?: string | null;
    module_icon?: string | null;
    is_all?: boolean | null;
    is_agency?: boolean | null;
    is_portfolio?: boolean | null;
    is_sector?: boolean | null;
    is_users?: boolean | null;
    is_scheduled: boolean;
    scheduled_at?: Date | null;
    expires_at?: Date | null;
    attachments?: File[] | null;
};

export function createNotificationFormData(params: CreateNotificationFieldsProps) {
    var formData = new FormData();

    formData.append("title", params.title);
    formData.append("subtitle", params.subtitle ?? "");
    formData.append("content", params.content ?? "");
    formData.append("is_active", String(params.is_active));
    formData.append("priority_level", params.priority_level);
    formData.append("is_external_link", String(params.is_external_link));
    params.link_url && formData.append("link_url", params.link_url ?? "");
    formData.append("origin", params.origin);
    params.module && formData.append("module", params.module ?? "");
    params.module_icon && formData.append("module_icon", params.module_icon ?? "");
    formData.append("is_all", String(params.is_all));
    formData.append("is_agency", String(params.is_agency));
    formData.append("is_portfolio", String(params.is_portfolio));
    formData.append("is_sector", String(params.is_sector));
    formData.append("is_users", String(params.is_users));
    formData.append("is_scheduled", String(params.is_scheduled));
    params.scheduled_at && formData.append("scheduled_at", params.scheduled_at.toISOString());
    params.expires_at && formData.append("expires_at", params.expires_at.toISOString());

    if (params.attachments) {
        params.attachments?.forEach(function (element) {
            formData.append(`attachments_notification`, element);
        });
    }

    if (params.file_image_cover) {
        formData.append("file_image_cover", params.file_image_cover);
    }

    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}/admin/notifications`, formData, {
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
// ================================================================================================================

export function searchAllNotification(params: SearchAllNotificationProps): Promise<ISearchNotification[]> {
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

export async function downloadNotificationFile(id_conversation_file: number): Promise<any> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/notification-file/${id_conversation_file}`, { responseType: "arraybuffer" })
            .then((res) => {
                resolve(res);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function createNotification(params: CommonNotificationProps) {
    let paramsFormData = new FormData();

    paramsFormData.append("title", params.title);
    paramsFormData.append("content", params.content);
    paramsFormData.append("type_permission", String(params.type_permission));

    if (params.id_agent) {
        for (var i = 0; i < params.id_agent.length; i++) {
            paramsFormData.append("id_agent[]", String(params.id_agent[i]));
        }
    }

    if (params.id_city) {
        for (var i = 0; i < params.id_city.length; i++) {
            paramsFormData.append("id_city[]", String(params.id_city[i]));
        }
    }

    if (params.id_state) {
        for (var i = 0; i < params.id_state.length; i++) {
            paramsFormData.append("id_state[]", String(params.id_state[i]));
        }
    }

    if (params.attachment) {
        params.attachment.create?.forEach(function (element: any) {
            paramsFormData.append(`create_attachment_notification`, element);
        });
    }

    if (params.attachment) {
        params.attachment.delete?.forEach(function (element: any, index: number) {
            paramsFormData.append(`delete_attachment_notification[${index}]`, String(element));
        });
    }

    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}`, paramsFormData, {
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

export interface INotificationAside {
    id: number;
    title: string;
    created_at: string;
    user_name: string;
    created_by: number;
}

export function searchAllNotificationContentById(id_notification: number): Promise<INotificationContent> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/${id_notification}/info-content`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function donwloadAttachmentNotification(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/${id}/file-image-notification`, { responseType: "arraybuffer" })
            .then((res) => {
                resolve(res);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type CreateAssessmentProps = {
    id_notification: number;
    type: string;
};

export function createAssessment(params: CreateAssessmentProps) {
    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}/assessment`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type ChangeAssessmentType = {
    type: string;
};

export function changeTypeAssessment(id: number, params: ChangeAssessmentType) {
    return new Promise((resolve, reject) => {
        api()
            .patch(`${baseUrl}/${id}/assessment/type`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

// export type ChangeAssessmentType = {
//     type: "Curtir" | "Descurtir";
// };

// export type CreateAssessmentProps = {
//     id_notification: number;
// } & ChangeAssessmentType;

// export function createAssessment(params: CreateAssessmentProps) {
//     return new Promise((resolve, reject) => {
//         api()
//             .post(`${baseUrl}/assessment`, params)
//             .then((res) => {
//                 resolve(res.data);
//             })
//             .catch((res) => {
//                 reject(res);
//             });
//     });
// }

// export function changeTypeAssessment(id: number, params: ChangeAssessmentType) {
//     return new Promise((resolve, reject) => {
//         api()
//             .patch(`${baseUrl}/${id}/assessment/type`, params)
//             .then((res) => {
//                 resolve(res.data);
//             })
//             .catch((res) => {
//                 reject(res);
//             });
//     });
// }

export interface SearchAssessmentById extends ChangeAssessmentType {
    id: number;
    id_notification: number;
    id_user: number;
}

export function searchAssessmentById(id_notification: number): Promise<SearchAssessmentById[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/assessment/${id_notification}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
