export type autocompleteModuleProps = {
    id: number;
    label: string;
};

export type ModuleProps = {
    is_active: autocompleteModuleProps;
    id_access_module?: autocompleteModuleProps;
};
