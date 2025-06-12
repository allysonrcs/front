export type SearchAllNotificationProps = {
    type?: string;
    created_at?: string;
};

export interface ISearchNotification {
    id: number;
    type: string;
    title: string;
    type_permission: string;
    created_at: string;
}

export type AutocompleteProps = {
    id: number;
    label: string;
};

export type AutocompleteString = {
    id: string;
    label: string;
};

export type NotificationData = {
    agent?: AutocompleteProps[] | null;
    state?: AutocompleteProps[] | null;
    city?: AutocompleteProps[] | null;
    type: AutocompleteString;
};

export type PermissionSelectedProps = {
    id: number;
    agent?: string | null;
    state?: string | null;
    city?: string | null;
};

export type TypePermission = {
    type: {
        id: string;
        label: string;
    };
};

export type NotificationDataProps = {
    title: string;
    content: string;
};

export type CommonNotificationProps = {
    content: string;
    title: string;
    attachment?: {
        create?: File[];
        delete?: number[];
    };
    id_agent?: number[] | null;
    id_state?: number[] | null;
    id_city?: number[] | null;
    type_permission: string | null;
};

export type IsearchNotificationAgentProps = {
    module_name?: string;
    name?: string;
    type_route?: string;
    route?: string;
    is_active?: boolean;
};
