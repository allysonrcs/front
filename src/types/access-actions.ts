export type autocompleteTypeRouteProps = {
    id?: string;
    label?: string;
};

export type IRouteProps = {
    id_access_module: {
        id?: number;
        label?: string;
    };
    name: string;
    type_route: autocompleteTypeRouteProps;
    route: string;
};

export type IsearchRoutesEditProps = {
    module_name?: string;
    name?: string;
    type_route?: string;
    route?: string;
    is_active?: boolean;
};
