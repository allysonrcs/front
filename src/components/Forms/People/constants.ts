import * as Yup from "yup";
import { isValidCPF, isValidPhone } from "../../../functions/number";

type AutocompleteOptionString = {
    id: string;
    label: string;
};

export type PeopleProps = {
    name: string;
    email: string;
    document_cpf: string;
    document_rg: string;
    issuing_agency_rg: string;
    birthday_date: string;
    gender: AutocompleteOptionString;
    marital_status: AutocompleteOptionString;
    cel_phone_personal: string;
    cel_phone_company: string;
    description?: string | null;
};

export const validationPeopleSchema = Yup.object().shape({
    people: Yup.object().shape({
        name: Yup.string().max(255, "Excedeu 255 caracteres").required("Obrigatório"),
        email: Yup.string().max(255, "Excedeu 255 caracteres").email("Email inválido").required("Obrigatório"),
        document_cpf: Yup.string()
            .test("isValidCPF", "Cpf inválido", (val) => isValidCPF(val ?? ""))
            .transform((value) => value.replace(/[\-\.]/g, ""))
            .required("Obrigatório"),
        document_rg: Yup.string()
            .transform((value) => value.replace(/[\-\.]/g, ""))
            .required("Obrigatório"),
        issuing_agency_rg: Yup.string().max(10, "Excedeu 10 caracteres").required("Obrigatório"),
        birthday_date: Yup.date().typeError("Digite uma data válida").required("Obrigatório"),
        gender: Yup.object().typeError("Obrigatório"),
        marital_status: Yup.object().typeError("Obrigatório"),
        cel_phone_personal: Yup.string()
            .transform((value) => value.replace(/[\(\)\- ]/g, ""))
            .test("isValidPhone", "Número inválido", (val) => isValidPhone(val ?? ""))
            .typeError("Digite um número válido")
            .required("Obrigatório"),
        cel_phone_company: Yup.string()
            .transform((value) => value.replace(/[\(\)\- ]/g, ""))
            .typeError("Digite um número válido"),
        description: Yup.string().nullable().max(4000, "Excedeu 4000 caracteres"),
    }),
});

export const validationPeopleEmployeeSchema = Yup.object().shape({
    people: Yup.object().shape({
        name: Yup.string().max(255, "Excedeu 255 caracteres").required("Obrigatório").trim(),
        email: Yup.string().max(255, "Excedeu 255 caracteres").email("Email inválido").trim(),
        document_cpf: Yup.string()
            .test("isValidCPF", "Cpf inválido", (val) => (val ? isValidCPF(val) : true))
            .transform((value) => value.replace(/[\-\.]/g, ""))
            .required("Obrigatório")
            .trim(),
        document_rg: Yup.string()
            .max(10, "Excedeu 10 caracteres")
            .transform((value) => value.replace(/[\-\.]/g, ""))
            .trim(),
        issuing_agency_rg: Yup.string().max(10, "Excedeu 10 caracteres").trim(),
        birthday_date: Yup.date().typeError("Digite uma data válida").nullable(),
        cel_phone_company: Yup.string()
            .transform((value) => value.replace(/[\(\)\- ]/g, ""))
            .test("isValidCelPhoneCompany", "Número inválido", (val) => (!val ? true : isValidPhone(val)))
            .typeError("Digite um número válido"),
        cel_phone_personal: Yup.string()
            .transform((value) => value.replace(/[\(\)\- ]/g, ""))
            .test("isValidCelPhonePersonal", "Número inválido", (val) => (!val ? true : isValidPhone(val)))
            .typeError("Digite um número válido"),
        gender: Yup.object().typeError("Obrigatório").required("Obrigatório"),
        marital_status: Yup.object().typeError("Obrigatório"),
        description: Yup.string().nullable().max(4000, "Excedeu 4000 caracteres"),
    }),
});

export const validationCandidateSchema = Yup.object().shape({
    people: Yup.object().shape({
        name: Yup.string().max(255, "Excedeu 255 caracteres").required("Obrigatório"),
        email: Yup.string().max(255, "Excedeu 255 caracteres").email("Email inválido"),
        document_cpf: Yup.string()
            .test("isValidCPF", "Cpf inválido", (val) => (val ? isValidCPF(val) : true))
            .transform((value) => value.replace(/[\-\.]/g, ""))
            .required("Obrigatório"),
        document_rg: Yup.string()
            .max(10, "Excedeu 10 caracteres")
            .transform((value) => value.replace(/[\-\.]/g, "")),
        issuing_agency_rg: Yup.string().max(10, "Excedeu 10 caracteres"),
        cel_phone_company: Yup.string().transform((value) => value.replace(/[\(\)\- ]/g, "")),
        cel_phone_personal: Yup.string().transform((value) => value.replace(/[\(\)\- ]/g, "")),
        gender: Yup.object().typeError("Obrigatório").required("Obrigatório"),
    }),
});
