import * as Yup from "yup";

export type AutocompleteOption = {
    id: number;
    label: string;
};

export type AddressPros = {
    state: AutocompleteOption;
    city: AutocompleteOption;
    number_cep: string;
    neighborhood: string;
    number: number;
    street: string;
    complement?: string;
};

export const AddressValidationSchema = Yup.object().shape({
    address: Yup.object().shape({
        state: Yup.object()
            .shape({
                id: Yup.number().required("Obrigatório"),
                label: Yup.string().required("Obrigatório"),
            })
            .typeError("É necessário um estado válido")
            .required("Obrigatório"),
        city: Yup.object()
            .shape({
                id: Yup.number().required("Obrigatório"),
                label: Yup.string().required("Obrigatório"),
            })
            .typeError("É necessário uma cidade válida")
            .required("Obrigatório"),
        number_cep: Yup.string()
            .min(8, "CEP deve ter no mínimo 8 dígitos")
            .transform((value) => value.replace(/[^0-9]/g, ""))
            .required("Obrigatório"),
        neighborhood: Yup.string().max(255, "Excedeu 255 caracteres").required("Obrigatório"),
        number: Yup.number()
            .typeError("Obrigatório")
            .required("Obrigatório")
            .test("number", "Excedeu 10 caracteres", (val) => (val ? val.toString().length <= 10 : false)),
        street: Yup.string().max(255, "Excedeu 255 caracteres").required("Obrigatório"),
        complement: Yup.string().max(255, "Excedeu 255 caracteres"),
    }),
});
