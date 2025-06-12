import { getFormData } from "../functions/object";
import api from "./api";
import { ISearchAutoCompleteEmployee } from "./employees";
import { IAgenciesAutocomplete, SearchAgencyDTO } from "./agencies";

const baseUrl = "/conversation";

export interface IConversationChats {
    id: string;
    type: "Chat" | "Group";
    name: string;
    content: null | string;
    created_at: string;
    qntd_msg_not_read: null | string;
    id_to: number;
    abbreviation: string;
    sector_name: string;
    public_url?: null | string;
    status?: "Online" | "Ocupado" | "Ausente" | "Invisível" | "Em reunião";
    is_writing?: boolean;
    phone_ramal: number | null;
    ipbx_identifier: string | null;
    is_birthday?: boolean;
    is_partnership: boolean;
    role?: string;
    email_corporate?: string;
    cel_phone_personal: string | null;
}

export function searchConversationChats(): Promise<IConversationChats[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/chats`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IConversationGroups {
    id: string;
    type: "Chat" | "Group";
    name: string;
    content: null | string;
    created_at: string;
    qntd_msg_not_read: null | string;
    only_admin_send_msg: boolean;
    is_admin: boolean;
    is_partnership: boolean;
    status?: "Online" | "Ocupado" | "Ausente" | "Invisível" | "Em reunião";
    abbreviation: null | string;
    sector_name: null | string;
    public_url?: null | string;
    is_writing?: number[];
    cel_phone_personal?: string | null;
}

export function searchConversationGroups(): Promise<IConversationGroups[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/groups`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type PreviousMessageProps = {
    id_conversation: string;
    id_last_message?: string;
    message_limit: number;
    date_start?: string;
    date_end?: string;
    term?: string;
};

export type ConversationFileProps = {
    id: string;
    document_file: {
        id: number;
        size: number;
        file_name: string;
        type: string;
        duration?: number;
        base64?: string;
    };
};

export interface IMessageChats {
    id: string;
    id_conversation: string;
    content: string;
    date_read: string | null;
    created_at: string;
    created_by: number;
    people_name: string;
    url_image_profile: string;
    conversation_file?: ConversationFileProps[];
    conversation_chat_favorite: { id: number };
    ref_message?: {
        id: string;
        content: string;
        people_name: string;
        created_by: number;
    };
}

export function loadBase64(
    messages: (IMessageChats | IMessageGroups)[],
    type: "Group" | "Chat",
): Promise<
    {
        id_document_file: number;
        base64: string;
    }[]
> {
    let messages_with_img: ConversationFileProps[] = [];

    for (const message of messages) {
        if (!message.conversation_file) {
            continue;
        }
        const filtered = message.conversation_file.filter((item) =>
            ["image/jpg", "image/jpeg", "image/png", "image/gif"].includes(item.document_file.type),
        );

        messages_with_img = [...messages_with_img, ...filtered];
    }

    return new Promise((resolve, reject) => {
        if (messages_with_img.length) {
            let params = {
                id_conversation: messages[0].id_conversation,
                documents_id: messages_with_img.map((item) => item.document_file.id),
            };

            if (type === "Chat") {
                loadPreviewImagesConversationChat(params).then(resolve).catch(reject);
            } else {
                loadPreviewImagesConversationGroup(params).then(resolve).catch(reject);
            }
        } else {
            resolve([]);
        }
    });
}

export interface IPreviousMessageChats {
    has_more: boolean;
    messages: IMessageChats[];
}

export function searchPreviousMessageChats(params: PreviousMessageProps): Promise<IPreviousMessageChats> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/chats/previous-message?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IMessageGroups {
    id: string;
    id_conversation: string;
    content: string;
    is_read_by_all: boolean;
    created_at: string;
    created_by: number;
    people_name: string;
    url_image_profile: string;
    date_read: string | null;
    id_employee: number;
    conversation_file?: ConversationFileProps[];
    conversation_group_favorite: { id: number };
    ref_message?: {
        id: string;
        content: string;
        people_name: string;
        created_by: number;
    };
}

export interface IPreviousMessageGroups {
    has_more: boolean;
    messages: IMessageGroups[];
}

export function searchPreviousMessageGroups(params: PreviousMessageProps): Promise<IPreviousMessageGroups> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/groups/previous-message?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IContacts {
    id_employee: number;
    email_corporate: string;
    people_name: string;
    abbreviation: string;
    sector_name: string;
    phone_ramal: number | null;
    ipbx_identifier: string | null;
    status: "Online" | "Ocupado" | "Ausente" | "Invisível" | "Em reunião";
    url_image?: string;
    is_birthday: boolean;
    role?: string;
    cel_phone_personal: string | null;
}

export function searchContacts(): Promise<IContacts[]> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/contacts`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type AttachmentUploadProps = {
    type: "Chat" | "Group";
    id_conversation: number | null;
    conversation_chat_message: {
        id_conversation: number | null;
        id_to: number;
        id_conversation_chat_message: string | null;
        content: string;
        answering_group: boolean;
    } | null;
    conversation_group_message: {
        id_conversation: number | null;
        id_conversation_group_message: string | null;
        content: string;
    } | null;
    attachments: File[];
    duration?: number;
};

export interface IDocumentFile {
    id: string;
    id_conversation?: string;
    content: string;
    is_read_by_all: boolean;
    created_at: string;
    created_by: number;
    conversation_file: ConversationFileProps[];
}

export async function uploadAttachments(params: AttachmentUploadProps): Promise<IDocumentFile> {
    const paramsFormData = getFormData(params);

    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}/attachments`, paramsFormData, { headers: { "Content-Type": "multipart/form-data" } })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
}

export function searchAutocompleteEmployees(params: { id_agency: number }): Promise<ISearchAutoCompleteEmployee[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/partnership/employees?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type LoadPreviewImageChatProps = {
    id_conversation: string;
    documents_id: number[];
};

export function loadPreviewImagesConversationChat(params: LoadPreviewImageChatProps): Promise<any> {
    let myQuery = new URLSearchParams();
    myQuery.append("id_conversation", params.id_conversation);

    for (const value of params.documents_id) {
        myQuery.append(`documents_id[]`, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/load-images-chat-conversation/internal?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface ISearchNotificationNotNotify {
    id_conversation: string;
}

export async function searchNotificationNotNotify(): Promise<ISearchNotificationNotNotify[]> {
    return new Promise(async (resolve, reject) => {
        api()
            .get(`${baseUrl}/be-notified`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export function loadPreviewImagesConversationGroup(params: LoadPreviewImageChatProps): Promise<any> {
    let myQuery = new URLSearchParams();
    myQuery.append("id_conversation", params.id_conversation);

    for (const value of params.documents_id) {
        myQuery.append(`documents_id[]`, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/load-images-group-conversation/internal?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
