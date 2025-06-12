export type AutoComplete = {
    id: string | number;
    label: string;
};

export type CreateUserProps = {
    name: string;
    document_cpf: string;
    email: string;
    cel_phone: string;
    password: string;
    password_confirm: string;
};

export interface IStatusNewUserProps {
    id_agent: number;
    type_agent: string;
    status_agent: string;
}
