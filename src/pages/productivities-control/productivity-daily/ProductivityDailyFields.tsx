import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
    Alert,
    Badge,
    Chip,
    Collapse,
    Divider,
    Grid,
    Icon,
    IconButton,
    Modal,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Box } from "@mui/system";
import FormInput from "@/components/FormComponents/FormInput";
import { useConfirm } from "material-ui-confirm";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { GridProps } from "@mui/material";
import FormRadioGroup from "@/components/FormComponents/FormRadioGroup";
import FormInputMask from "@/components/FormComponents/FormInputMask";
import FormInputCurrency from "@/components/FormComponents/FormInputCurrency";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import { formatCnpjCpf, isValidCNPJ, isValidCPF } from "@/functions/number";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import {
    GridColDef,
    GridRowSelectionModel,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import React from "react";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { ArrayTypesYesOrNo } from "@/constants/array-type-yes-or-no";
import SearchIcon from "@mui/icons-material/Search";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { ISearchListExtClient, searchListExtClients } from "@/services/ext-tables";
import { searchAutoCompleteProducts, searchAutoCompleteProductsModalities } from "@/services/products";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { ArrayTypesDocument } from "@/constants/array-type-document";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/functions/date";
import { ArrayTypesPortfolioName } from "@/constants/array-type-portfolio-name";
import { ArrayTypesDocumentClient } from "@/constants/array-type-document-client";
import {
    createProductivityDaily,
    searchProductivityDailyByID,
    updateProductivityDaily,
} from "@/services/productivities-control";
import { GridCloseIcon } from "@mui/x-data-grid";
import moment from "moment";
import { productMap } from "./ListRecordsProductivityDaily";
import { InteractionsProductivityDaily } from "./modal-interactions/InteractionsProductivityDaily";
import { searchAutoCompletePortfolios } from "@/services/portfolios";
import { useAuth } from "@/contexts/AuthContext";

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type AutoCompleteMobNumber = {
    id?: number | null;
    label?: string | null;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

type InputComponentDinamic = {
    name: string;
    label: string;
    type: string;
    grid_size: number;
    required?: boolean;
    min?: number;
    max?: number;
};

type ListAgencies = {
    id: number;
    label: string;
    agency_sisbr_id: number;
};

type ListPortfolios = {
    id: number;
    label: string;
    id_ref?: number | null;
    id_agency?: number | null;
};

type ListModalities = {
    id: number;
    label: string;
    input_components?: InputComponentDinamic[] | null;
    is_operator_price: boolean;
    is_operator_amount: boolean;
    is_operator_percentage: boolean;
    is_operator_points: boolean;
};

type getModalityAndDetail = {
    id_modality: number;
    detail: string;
};

type FilterExtClients = {
    filter_client_name?: string | null;
    filter_client_document?: string | null;
    filter_client_sisbr_id?: number | null;
    filter_agency: ListAgencies | null;
    filter_portfolio_name: AutoCompleteString | null;
    filter_client_type: AutoCompleteString | null;
    filter_is_rural: AutoCompleteBoolean | null;
};

export type ProductivityDaily = {
    is_client: string;
    client_name: string;
    type_document: AutoCompleteString;
    client_document: string;
    is_client_rural: AutoCompleteBoolean;
    products: AutoCompleteNumber;
    modalities: ListModalities;
    price?: number | null;
    amount?: number | null;
    observation?: string | null | undefined;
    mob_validation_agency: AutoCompleteMobNumber | null;
    mob_validation_portfolio: AutoCompleteMobNumber | null;
    [key: string]: any;
};

export type EditProductivityDailyProps = {
    id?: number;
    client_sisbr_id?: number | null;
    status?: string;
    is_client?: boolean;
    is_client_rural?: boolean;
    client_date_movement?: string;
    client_name?: string;
    client_document?: string;
    client_portfolio_name?: string;
    client_agency_name?: string;
    price?: number | null;
    amount?: number | null;
    product_name?: string;
    modality_name?: string;
    detail?: string;
    observation?: string | null;
    is_active?: boolean;
    updated_at?: string;
    interaction_count_manual?: number;
    mob_validation_agency_name?: string;
    mob_validation_portfolio_name?: string;
    mob_validation_date?: string;
    mob_validation_is_counted?: boolean;
};

export type ProductivityDailyProps = {
    idProductivityDaily?: number;
    updateColumn?: (params: EditProductivityDailyProps) => void;
} & GridProps;

const validationSchemaFilter = Yup.object().shape({
    filter_client_name: Yup.string().max(255, "Máximo 255 caracteres").nullable().uppercase().trim(),
    filter_client_document: Yup.string()
        .max(18, "Máximo 18 caracteres")
        .transform((value) => value.replace(/[\.\-\/]/g, ""))
        .nullable()
        .trim(),
    filter_agency: Yup.object()
        .shape({
            id: Yup.number().required("ID é Obrigatório"),
            label: Yup.string().required("Nome da PA é obrigatório"),
            agency_sisbr_id: Yup.number().required("ID Sisbr Agencia é Obrigatório"),
        })
        .nullable(),
    filter_portfolio_name: Yup.object()
        .shape({
            id: Yup.string().required("ID é Obrigatório"),
            label: Yup.string().required("Nome da Carteira é Obrigatório"),
        })
        .nullable(),
    filter_client_type: Yup.object()
        .shape({
            id: Yup.string().required("ID é Obrigatório"),
            label: Yup.string().required("Nome do Tipo é Obrigatório"),
        })
        .nullable(),
    filter_is_rural: Yup.object()
        .shape({
            id: Yup.boolean().required("ID é Obrigatório"),
            label: Yup.string().required("Nome da PA é Obrigatório"),
        })
        .nullable(),
    filter_client_sisbr_id: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
});

const validationSchemaProductivity = Yup.object().shape({
    is_client: Yup.string().required("Obrigatório"),
    client_name: Yup.string()
        .max(255, "Máximo 255 caracteres")
        .required("Nome do Cooperado é obrigatório")
        .uppercase()
        .trim(),
    type_document: Yup.object({
        id: Yup.string().required("ID é obrigatório"),
        label: Yup.string().required("Label é obrigatório"),
    }).required("Obrigatório"),
    client_document: Yup.string()
        .max(18, "Máximo 18 caracteres")
        .transform((value) => value.replace(/[\.\-\/]/g, ""))
        .test("isValidDocument", "Documento inválido", (val) => {
            if (!val) return false;

            if (val.length === 11) {
                return isValidCPF(val);
            } else if (val.length === 14) {
                return isValidCNPJ(val);
            }
            return false;
        })
        .required("Documento do Cooperado é obrigatório")
        .trim(),
    is_client_rural: Yup.object({
        id: Yup.boolean().required("ID é obrigatório"),
        label: Yup.string().required("Label é obrigatório"),
    }).required("Obrigatório"),
    products: Yup.object({
        id: Yup.number().required("ID é obrigatório"),
        label: Yup.string().required("Label é obrigatório"),
    }).required("Produto é Obrigatório"),
    modalities: Yup.object({
        id: Yup.number().required("ID é obrigatório"),
        label: Yup.string().required("Label é obrigatório"),
        input_components: Yup.array()
            .of(
                Yup.object().shape({
                    name: Yup.string().required("O nome do componente é obrigatório"),
                    label: Yup.string().required("O label do componente é obrigatório"),
                    type: Yup.string().required("O tipo do componente é obrigatório"),
                    grid_size: Yup.number().required("O tamanho da grade é obrigatório"),
                }),
            )
            .nullable(),
        is_operator_price: Yup.boolean().required("ID é obrigatório"),
        is_operator_amount: Yup.boolean().required("ID é obrigatório"),
        is_operator_percentage: Yup.boolean().required("ID é obrigatório"),
        is_operator_points: Yup.boolean().required("ID é obrigatório"),
    }).required("Modalidade é Obrigatório"),
    price: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    amount: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    observation: Yup.string().max(4000, "Excedeu 4000 caracteres").nullable(),
    mob_validation_agency: Yup.object()
        .shape({
            id: Yup.number().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    mob_validation_portfolio: Yup.object()
        .shape({
            id: Yup.number().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
});

const arrayNoAndYes = [
    { id: false, label: "Não" },
    { id: true, label: "Sim 🌱" },
];

const buildDynamicSchema = (inputComponents: InputComponentDinamic[]) => {
    const dynamicSchema: { [key: string]: Yup.AnySchema } = {};

    inputComponents.forEach((component) => {
        switch (component.type) {
            case "string":
                dynamicSchema[component.name] = Yup.string()
                    .nullable()
                    .transform((value) => (value === "" ? null : value));

                if (component.required) {
                    dynamicSchema[component.name] = dynamicSchema[component.name].required(
                        `${component.label} é obrigatório`,
                    );
                }
                break;

            case "number":
                let numberSchema = Yup.number()
                    .nullable()
                    .transform((value) => (isNaN(value) ? null : value))
                    .typeError(`${component.label} deve ser um número válido`);

                if (typeof component.min !== "undefined") {
                    numberSchema = numberSchema.min(
                        component.min,
                        `${component.label} deve ser maior ou igual a ${component.min}`,
                    );
                }
                if (typeof component.max !== "undefined") {
                    numberSchema = numberSchema.max(
                        component.max,
                        `${component.label} deve ser menor ou igual a ${component.max}`,
                    );
                }

                if (component.required) {
                    numberSchema = numberSchema.required(`${component.label} é obrigatório`);
                }

                dynamicSchema[component.name] = numberSchema;
                break;

            default:
                dynamicSchema[component.name] = Yup.mixed().nullable();
        }
    });

    return Yup.object().shape(dynamicSchema);
};

export function ProductivityDailyFields({ idProductivityDaily, updateColumn, ...props }: ProductivityDailyProps) {
    const [dynamicValidationSchema, setDynamicValidationSchema] = useState(validationSchemaProductivity);
    const [status, setStatus] = useState<string | null>(null);
    const [mobValidationDate, setMobValidationDate] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [loadingDataGrid, setLoadingDataGrid] = useState(false);
    const [loadingButtonDataGrid, setLoadingButtonDataGrid] = useState(false);
    const [listClients, setListClients] = useState<ISearchListExtClient[]>([]);
    const [listAgencies, setListAgencies] = useState<ListAgencies[]>([]);
    const [listMobValidationAgencies, setListMobValidationAgencies] = useState<ListAgencies[]>([]);
    const [listMobValidationPortfolios, setListMobValidationPortfolios] = useState<ListPortfolios[]>([]);
    const [listProducts, setListProducts] = useState<AutoCompleteNumber[]>([]);
    const [listProductsModalities, setListProductsModalities] = useState<ListModalities[]>([]);
    const [isMounted, setIsMounted] = useState<boolean>(true);
    const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);
    const [showDataGrid, setShowDataGrid] = useState<boolean>(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [documentMask, setDocumentMask] = useState("999.999.999-99");
    const [dataClientByID, setDataClientByID] = useState<ISearchListExtClient | null>();
    const [isClientDocumentDisabled, setIsClientDocumentDisabled] = useState(false);
    const [dataModalityAndDetailProductivityDaily, setDataModalityAndDetailProductivityDaily] =
        useState<getModalityAndDetail | null>(null);
    const previousModalityId = useRef<number | null>(null);
    const [openModalInteraction, setOpenModalInteraction] = useState(false);
    const [interactionCountManual, setInteractionCountManual] = useState<number>();
    const [showAlert, setShowAlert] = useState(true);

    const { user } = useAuth();

    const {
        getInfoError,
        toggleStatusBackdrop,
        colorBorderSystem,
        colorScrollSystem,
        theme: themeContext,
    } = useGlobal();
    const confirm = useConfirm();
    const navigate = useNavigate();

    const theme = useTheme();
    const smDown = useMediaQuery(theme.breakpoints.down("sm"));

    const {
        handleSubmit: handleSubmitFilter,
        control: controlFilter,
        setError: setErrorFilter,
        formState: { errors: errorsFilter },
    } = useForm<FilterExtClients>({
        resolver: yupResolver(validationSchemaFilter, { context: { isSubmitting: true } }),
    });

    const {
        handleSubmit: handleSubmitProductivity,
        control: controlProductivity,
        setValue: setValueProductivity,
        setError: setErrorProductivity,
        resetField: resetFieldProductivity,
        getValues: getValuesProductivity,
        watch: watchProductivity,
        clearErrors: clearErrorsProductivity,
        formState: { errors: errorsProductivity },
    } = useForm<ProductivityDaily>({
        resolver: yupResolver(dynamicValidationSchema),
    });

    const isClientWatch = watchProductivity("is_client");
    const clientNameWatch = watchProductivity("client_name");
    const clientDocumentWatch = watchProductivity("client_document");
    const clientTypeDocumentWatch = watchProductivity("type_document");
    const clientIsRuralWatch = watchProductivity("is_client_rural");
    const productWatch = watchProductivity("products");
    const modalityWatch = watchProductivity("modalities");
    const mobValidationAgencyWatch = watchProductivity("mob_validation_agency");
    const mobValidationPortfolioWatch = watchProductivity("mob_validation_portfolio");

    const handleModalInteractionProductivityDaily = () => {
        setOpenModalInteraction((oldValue) => !oldValue);
    };

    const renderDynamicInputs = (inputComponents: InputComponentDinamic[]) => {
        return inputComponents.map((component: InputComponentDinamic, index: number) => {
            const commonProps = {
                fullWidth: true,
                name: component.name,
                label: component.label,
                variant: "outlined" as "outlined",
                control: controlProductivity,
                errors: errorsProductivity,
            };

            return (
                <Grid item xs={12} md={component.grid_size} key={index}>
                    <FormInput {...commonProps} type={component.type} />
                </Grid>
            );
        });
    };

    function validateDocument(type: string, document: string): boolean {
        if (type === "CPF") {
            return isValidCPF(document);
        } else if (type === "CNPJ") {
            return isValidCNPJ(document);
        }
        return false;
    }

    const saveIdClientRefresh = async () => {
        if (rowSelectionModel.length === 0) {
            toast.info(
                "Selecione um cooperado da lista abaixo e clique novamente aqui para confirmar sua escolha corretamente.",
            );
            return;
        }

        const selectedRow = listClients.find((row) => row.id === rowSelectionModel[0]);

        if (!selectedRow) {
            toast.error("Cooperado não encontrado!");
            return;
        }

        confirm({
            title: `Deseja continuar o cadastro com o cooperador selecionado?`,
        })
            .then(async () => {
                try {
                    setLoading(true);

                    setDataClientByID(selectedRow);

                    const documentValue = selectedRow.cliente_documento.replace(/\D/g, "");

                    if (documentValue.length > 11) {
                        setValueProductivity("type_document", { id: "CNPJ", label: "CNPJ" });
                        setValueProductivity("client_document", selectedRow.cliente_documento);
                    } else {
                        setValueProductivity("type_document", { id: "CPF", label: "CPF" });
                        setValueProductivity("client_document", selectedRow.cliente_documento);
                    }

                    setValueProductivity("client_name", selectedRow.cliente_nome.trim());
                    setValueProductivity("is_client_rural", {
                        id: selectedRow.e_rural,
                        label: selectedRow.e_rural ? "Sim" : "Não",
                    });

                    toast.success("Cooperado selecionado com sucesso!");
                    clearErrorsProductivity();
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                } finally {
                    setLoading(false);
                }
            })
            .catch(() => {});
    };

    const onSubmitFilterExtClients = async (params: FilterExtClients) => {
        let refactor: any = {};

        if (params?.filter_client_document) {
            if (params.filter_client_document.length === 11) {
                const isValid = isValidCPF(params.filter_client_document);
                if (!isValid) {
                    setErrorFilter("filter_client_document", {
                        type: "manual",
                        message: "CPF inválido. Verifique os dados inseridos.",
                    });
                    toast.error("CPF inválido. Verifique os dados inseridos.");
                    return false;
                }
            } else if (params.filter_client_document.length === 14) {
                const isValid = isValidCNPJ(params.filter_client_document);
                if (!isValid) {
                    setErrorFilter("filter_client_document", {
                        type: "manual",
                        message: "CNPJ inválido. Verifique os dados inseridos.",
                    });
                    toast.error("CNPJ inválido. Verifique os dados inseridos.");
                    return false;
                }
            } else {
                setErrorFilter("filter_client_document", {
                    type: "manual",
                    message: "Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).",
                });
                toast.error("Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).");
                return false;
            }
        }

        if (params.filter_client_name) {
            refactor = { ...refactor, cliente_nome: params?.filter_client_name };
        }

        if (params.filter_client_document) {
            refactor = { ...refactor, cliente_documento: params?.filter_client_document };
        }

        if (params.filter_client_sisbr_id) {
            refactor = { ...refactor, cliente_id: params?.filter_client_sisbr_id };
        }

        if (params.filter_agency) {
            refactor = { ...refactor, agencia_id: params.filter_agency?.agency_sisbr_id };
        }

        if (params.filter_portfolio_name) {
            refactor = { ...refactor, carteira_nome: params.filter_portfolio_name?.id };
        }

        if (params.filter_client_type) {
            refactor = { ...refactor, cliente_tipo: params.filter_client_type?.id };
        }

        if (params.filter_is_rural) {
            refactor = { ...refactor, e_rural: params.filter_is_rural?.id };
        }

        try {
            setLoadingButtonDataGrid(true);
            setLoadingDataGrid(true);

            const result = await searchListExtClients({ ...refactor, filtro_agencia: false });
            setListClients(result);

            toast.success("Filtro da listagem aplicado com sucesso!");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingDataGrid(false);

            setTimeout(() => {
                setLoadingButtonDataGrid(false);
            }, 2000);
        }
    };

    const onSubmitProductivityDaily = async (params: ProductivityDaily, buttonStatus: string) => {
        if (!idProductivityDaily) {
            if (!mobValidationAgencyWatch?.id) {
                setErrorProductivity("mob_validation_agency", { message: "Obrigatório", type: "required" });

                toast.error("Agência de validação é obrigatório!");
                return;
            }

            if (!mobValidationPortfolioWatch?.id) {
                setErrorProductivity("mob_validation_portfolio", { message: "Obrigatório", type: "required" });

                toast.error("Carteira de validação é obrigatório!");
                return;
            }
        }

        const isDocumentValid = validateDocument(params.type_document.id, params.client_document);
        if (!isDocumentValid) {
            toast.error(`${params.type_document.id} inválido`);
            return;
        }

        const is_client = JSON.parse(params.is_client);

        let statusParams: string = buttonStatus;

        if (idProductivityDaily) {
            if (status !== null) {
                if (statusParams === "RASCUNHO") {
                    if (status === "RASCUNHO") {
                        statusParams = "RASCUNHO";
                    }
                }

                if (statusParams === "PENDENTE") {
                    if (status === "RASCUNHO" || status === "CORREÇÃO") {
                        statusParams = "PENDENTE";
                        setStatus("PENDENTE");
                    } else {
                        statusParams = status;
                    }
                }
            }
        }

        const refactoring: any = {
            is_client: is_client,
            client_sisbr_id: is_client === true ? Number(dataClientByID?.id) : null,
            client_name: params.client_name,
            client_document: params.client_document,
            is_client_rural: params.is_client_rural.id,
            id_product: params.products.id,
            product_name: params.products.label,
            id_modality: params.modalities.id,
            modality_name: params.modalities.label,
            price: params?.price ?? null,
            amount: params?.amount ? Math.abs(params.amount) : null,
            observation: params.observation ?? null,
            status: statusParams,
            mob_validation_agency_id: params.mob_validation_agency?.id ?? null,
            mob_validation_portfolio_id: params.mob_validation_portfolio?.id ?? null,
        };

        const renderedComponentNames = modalityWatch?.input_components?.map((component) => component.name) || [];

        const dynamicFieldsValues: { [key: string]: any } = {};
        renderedComponentNames.forEach((fieldName) => {
            const component = modalityWatch?.input_components?.find((component) => component.name === fieldName);

            if (component?.type === "number") {
                const value = getValuesProductivity()[fieldName];
                dynamicFieldsValues[fieldName] = value !== "" ? Number(value) : null;
            } else {
                dynamicFieldsValues[fieldName] = getValuesProductivity()[fieldName];
            }
        });

        refactoring.detail = JSON.stringify(dynamicFieldsValues);

        try {
            setLoading(true);

            if (idProductivityDaily) {
                await updateProductivityDaily(idProductivityDaily, refactoring);

                updateColumn?.({
                    status: statusParams,
                    is_client: JSON.parse(params.is_client),
                    client_date_movement: dataClientByID?.id ? String(dataClientByID?.data_movimento) : "",
                    client_sisbr_id: dataClientByID?.id ? Number(dataClientByID?.id) : null,
                    client_name: params.client_name,
                    client_document: params.client_document,
                    client_agency_name: dataClientByID?.agencia_id ? String(dataClientByID?.agencia_id) : "",
                    client_portfolio_name: dataClientByID?.carteira_nome,
                    is_client_rural: params.is_client_rural.id,
                    product_name: params.products.label,
                    modality_name: params.modalities.label,
                    price: params?.price ?? null,
                    amount: params?.amount ? Math.abs(params.amount) : null,
                    observation: params.observation ?? null,
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                });
            } else {
                await createProductivityDaily({ ...refactoring });

                navigate("/controle-produtividades/produtividade-diaria");
            }

            toast.success(
                `Registro de Produtividade Diária ${idProductivityDaily ? "atualizado" : "criado"} com sucesso!`,
            );
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setProductivityDailyOptions = async (
        id_client?: number,
        mob_validation_agency_ref_id?: number,
        mob_validation_portfolio_ref_id?: number,
    ) => {
        try {
            toggleStatusBackdrop();

            const clientParams = idProductivityDaily
                ? id_client
                    ? { cliente_id: id_client, filtro_agencia: false }
                    : { agencia_id: undefined }
                : {};

            if (idProductivityDaily) {
                const [dataClients, dataAgencies, dataProducts, dataMobValidationPortfolios] = await Promise.all([
                    searchListExtClients(clientParams),
                    searchAutocompleteAgencies({
                        with_agency_sisbr_id: true,
                        is_active: true,
                        with_restrict_agency: false,
                    }),
                    searchAutoCompleteProducts({
                        is_active: true,
                        is_productivity_control: true,
                    }),
                    searchAutoCompletePortfolios({
                        agency_sisbr_id: mob_validation_agency_ref_id,
                        is_active: true,
                        with_restrict_agency: false,
                        has_id_ref: true,
                        has_id_agency: true,
                    }),
                ]);

                const autoCompleteAgencies = dataAgencies.map(({ id, abbreviation, agency_sisbr_id }) => ({
                    id,
                    label: abbreviation,
                    agency_sisbr_id,
                }));

                const autoCompleteProducts = dataProducts.map(({ id, name }) => ({
                    id,
                    label: productMap[name] || name,
                }));

                const autoCompleteMobValidationAgencies = dataAgencies
                    .map(({ id, abbreviation, agency_sisbr_id }) => ({
                        id,
                        label: abbreviation,
                        agency_sisbr_id,
                    }))
                    .filter((value) => value.agency_sisbr_id === mob_validation_agency_ref_id);

                const selectedMobValidationPortfolio = dataMobValidationPortfolios.find(
                    (value) => value.ref_id === mob_validation_portfolio_ref_id,
                );

                setListAgencies(autoCompleteAgencies);
                setListProducts(autoCompleteProducts);
                setListClients(dataClients);
                setListMobValidationAgencies(autoCompleteMobValidationAgencies);

                setValueProductivity("mob_validation_agency", {
                    id: autoCompleteMobValidationAgencies[0].id,
                    label: autoCompleteMobValidationAgencies[0].label,
                });

                if (selectedMobValidationPortfolio) {
                    setValueProductivity("mob_validation_portfolio", {
                        id: selectedMobValidationPortfolio.id,
                        label: selectedMobValidationPortfolio.name,
                    });
                }

                if (dataClients.length === 1) {
                    setDataClientByID(dataClients[0]);
                }

                return {
                    products: autoCompleteProducts,
                };
            } else {
                const [dataAgencies, dataProducts] = await Promise.all([
                    searchAutocompleteAgencies({
                        with_agency_sisbr_id: true,
                        is_active: true,
                        with_restrict_agency: false,
                    }),
                    searchAutoCompleteProducts({
                        is_active: true,
                        is_productivity_control: true,
                    }),
                ]);

                const autoCompleteAgencies = dataAgencies.map(({ id, abbreviation, agency_sisbr_id }) => ({
                    id,
                    label: abbreviation,
                    agency_sisbr_id,
                }));

                const autoCompleteProducts = dataProducts.map(({ id, name }) => ({
                    id,
                    label: productMap[name] || name,
                }));

                setListAgencies(autoCompleteAgencies);
                setListProducts(autoCompleteProducts);

                if (user) {
                    const autoCompleteMobValidationAgencies = dataAgencies
                        .map(({ id, abbreviation, agency_sisbr_id }) => ({
                            id,
                            label: abbreviation,
                            agency_sisbr_id,
                        }))
                        .filter((value) => value.agency_sisbr_id !== 9999);

                    setListMobValidationAgencies(autoCompleteMobValidationAgencies);

                    const myAgency = autoCompleteMobValidationAgencies.filter((value) => value.id === user.id_agency);

                    if (myAgency.length > 0) {
                        setValueProductivity("mob_validation_agency", {
                            id: myAgency[0].id,
                            label: myAgency[0].label,
                        });
                    }
                }

                return {
                    products: autoCompleteProducts,
                };
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const setValuesProductivityDailyByID = async (id_productivity_daily: number) => {
        try {
            setLoading(true);

            if (id_productivity_daily) {
                const {
                    status,
                    client_sisbr_id,
                    is_client,
                    client_name,
                    client_document,
                    is_client_rural,
                    id_product,
                    id_modality,
                    price,
                    amount,
                    detail,
                    observation,
                    interaction_count_manual,
                    mob_validation_agency_ref_id,
                    mob_validation_portfolio_ref_id,
                    mob_validation_date,
                } = await searchProductivityDailyByID(id_productivity_daily);

                setDataModalityAndDetailProductivityDaily({ id_modality, detail });

                setStatus(status);
                setInteractionCountManual(interaction_count_manual);

                setValueProductivity("is_client", String(is_client));

                const dataProducts = await setProductivityDailyOptions(
                    client_sisbr_id,
                    mob_validation_agency_ref_id,
                    mob_validation_portfolio_ref_id,
                );

                setValueProductivity("client_name", client_name);

                setValueProductivity(
                    "type_document",
                    client_document.length > 11 ? { id: "CNPJ", label: "CNPJ" } : { id: "CPF", label: "CPF" },
                );

                setValueProductivity("client_document", client_document);

                const selectedIsRural = arrayNoAndYes.find((value) => value.id == is_client_rural);
                if (selectedIsRural) {
                    setValueProductivity("is_client_rural", {
                        id: selectedIsRural.id,
                        label: selectedIsRural.label,
                    });
                }

                if (dataProducts) {
                    const selectedProduct = dataProducts.products.find((value) => value.id === id_product);
                    if (selectedProduct) {
                        setValueProductivity("products", {
                            id: selectedProduct.id,
                            label: selectedProduct.label,
                        });
                    }
                }

                setValueProductivity("price", price);
                setValueProductivity("amount", amount);
                setValueProductivity("observation", observation);

                if (mob_validation_date !== null) {
                    setMobValidationDate(moment(mob_validation_date).format("DD/MM/YYYY"));
                } else {
                    setMobValidationDate("-");
                }

                if (is_client) {
                    setRowSelectionModel([client_sisbr_id]);
                }
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const searchModalitiesOfTheProduct = async (id_product: number, idModality?: number, detail?: string) => {
        try {
            setLoading(true);

            const dataProductsModalities = await searchAutoCompleteProductsModalities({
                is_active: true,
                id_product,
                has_input_components: true,
                has_is_operators: true,
            });

            const autoCompleteProductsModalities = dataProductsModalities.map(
                ({
                    id,
                    name,
                    input_components,
                    is_operator_price,
                    is_operator_amount,
                    is_operator_percentage,
                    is_operator_points,
                }: {
                    id: number;
                    name: string;
                    input_components: string | InputComponentDinamic[];
                    is_operator_price: boolean;
                    is_operator_amount: boolean;
                    is_operator_percentage: boolean;
                    is_operator_points: boolean;
                }) => {
                    let parsedInputComponents: InputComponentDinamic[] | null = null;

                    if (typeof input_components === "string") {
                        try {
                            parsedInputComponents = JSON.parse(input_components);
                        } catch (error) {
                            parsedInputComponents = null;
                        }
                    } else {
                        parsedInputComponents = input_components;
                    }

                    return {
                        id,
                        label: name,
                        name,
                        input_components: parsedInputComponents,
                        is_operator_price,
                        is_operator_amount,
                        is_operator_percentage,
                        is_operator_points,
                    };
                },
            );

            setListProductsModalities(autoCompleteProductsModalities);

            if (idModality) {
                const selectedModality = autoCompleteProductsModalities.find((value) => value.id === idModality);
                if (selectedModality) {
                    setValueProductivity("modalities", {
                        id: selectedModality.id,
                        label: selectedModality.label,
                        input_components: selectedModality.input_components,
                        is_operator_price: selectedModality.is_operator_price,
                        is_operator_amount: selectedModality.is_operator_amount,
                        is_operator_percentage: selectedModality.is_operator_percentage,
                        is_operator_points: selectedModality.is_operator_points,
                    });
                }
            }

            return {
                modalities: autoCompleteProductsModalities,
            };
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRowSelectionChange = (newSelection: GridRowSelectionModel) => {
        if (newSelection.length > 1) {
            if (newSelection.length > 2) {
                toast.info("Selecione apenas um cooperado por vez!");
            } else {
                const lastSelected = newSelection[newSelection.length - 1];

                setRowSelectionModel([lastSelected]);
            }
        } else {
            setRowSelectionModel(newSelection);
        }
    };

    const resetFields = (fields: string[]) => {
        fields.forEach((field) => resetFieldProductivity(field));
    };

    const handleDynamicComponentResetAndUnmount = (
        modality: ListModalities | null,
        detail?: { [key: string]: any },
        idModality?: number,
    ) => {
        if (modalityWatch?.id !== previousModalityId.current) {
            setIsMounted(false);
            clearErrorsProductivity();

            const isCorrectModality = idModality ? modality?.id === idModality : true;

            if (modality?.input_components && modality?.input_components.length > 0) {
                setLoading(true);

                resetFields(modality.input_components.map((comp) => comp.name));

                const newDynamicSchema = buildDynamicSchema(modality.input_components);
                setDynamicValidationSchema(validationSchemaProductivity.concat(newDynamicSchema as any));

                setTimeout(() => {
                    setLoading(false);
                    setIsMounted(true);

                    if (detail && isCorrectModality) {
                        modality.input_components?.forEach((component) => {
                            if (detail[component.name] !== undefined) {
                                setValueProductivity(component.name, detail[component.name]);
                            }
                        });
                    }
                }, 150);
            }

            previousModalityId.current = modalityWatch?.id;
        }
    };

    const searchPortfoliosOfTheAgency = async (id_agency: number) => {
        try {
            setLoading(true);

            if (user) {
                const dataPortfolios = await searchAutoCompletePortfolios({
                    id_agency,
                    is_active: true,
                    with_restrict_agency: false,
                    has_id_ref: true,
                    has_id_agency: true,
                });

                const autoCompleteMobValidationPortfolios = dataPortfolios.map(({ id, name, ref_id }) => {
                    return {
                        id,
                        label: name,
                        id_ref: ref_id,
                    };
                });

                setListMobValidationPortfolios(autoCompleteMobValidationPortfolios);

                const myPortfolio = autoCompleteMobValidationPortfolios.filter(
                    (value) => value.id === user.id_portfolio,
                );

                if (myPortfolio.length > 0) {
                    setValueProductivity("mob_validation_portfolio", {
                        id: myPortfolio[0].id,
                        label: myPortfolio[0].label,
                    });
                }

                if (autoCompleteMobValidationPortfolios.length === 1) {
                    setValueProductivity("mob_validation_portfolio", {
                        id: autoCompleteMobValidationPortfolios[0].id,
                        label: autoCompleteMobValidationPortfolios[0].label,
                    });
                }
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        async function execute() {
            if (!Object.keys(listAgencies).length || Object.keys(listMobValidationPortfolios).length) {
                resetFieldProductivity("mob_validation_portfolio");
                setListMobValidationPortfolios([]);
            }

            if (mobValidationAgencyWatch?.id) {
                await searchPortfoliosOfTheAgency(mobValidationAgencyWatch?.id);
            }
        }
        !idProductivityDaily && execute();
    }, [mobValidationAgencyWatch?.id, user?.id_portfolio]);

    useEffect(() => {
        if (isClientWatch === undefined || isConfirming) {
            return;
        }

        if (JSON.parse(isClientWatch) === true) {
            if (
                clientNameWatch?.length > 0 ||
                clientDocumentWatch?.length > 0 ||
                clientTypeDocumentWatch?.id ||
                clientIsRuralWatch?.label
            ) {
                setIsConfirming(true);
                confirm({
                    title: `Deseja realmente alterar o tipo de registro?`,
                    description:
                        "Ao confirmar a alteração, os campos (Nome do Cooperado, Documento e Tipo Rural) previamente preenchidos serão resetados!",
                })
                    .then(() => {
                        resetFieldProductivity("client_name");
                        resetFieldProductivity("client_document");
                        resetFieldProductivity("type_document");
                        resetFieldProductivity("is_client_rural");
                        clearErrorsProductivity();
                        setRowSelectionModel([]);
                        setShowDataGrid(true);
                        toast.info("Dados do Cooperado resetados!");
                    })
                    .catch(() => {
                        setValueProductivity("is_client", "false");
                    })
                    .finally(() => {
                        setIsConfirming(false);
                    });
            } else {
                setShowDataGrid(true);
            }
        } else {
            if (rowSelectionModel.length > 0) {
                setIsConfirming(true);
                confirm({
                    title: `Deseja realmente alterar o tipo de registro?`,
                    description:
                        "Ao confirmar a alteração, os campos (Seleção da listagem, Nome do Cooperado, Documento e Tipo Rural) previamente preenchidos serão resetados!",
                })
                    .then(() => {
                        setDataClientByID(null);
                        resetFieldProductivity("client_name");
                        resetFieldProductivity("client_document");
                        resetFieldProductivity("type_document");
                        resetFieldProductivity("is_client_rural");
                        clearErrorsProductivity();
                        setRowSelectionModel([]);
                        setShowDataGrid(false);
                        toast.info("Dados do Cooperado resetados!");
                    })
                    .catch(() => {
                        setValueProductivity("is_client", "true");
                    })
                    .finally(() => {
                        setIsConfirming(false);
                    });
            } else {
                setShowDataGrid(false);
            }
        }
    }, [isClientWatch]);

    useEffect(() => {
        if (!clientTypeDocumentWatch || !clientTypeDocumentWatch.id) {
            setIsClientDocumentDisabled(true);
            setValueProductivity("client_document", "");
        } else {
            setIsClientDocumentDisabled(false);
            if (clientTypeDocumentWatch.id === "CPF") {
                setDocumentMask("999.999.999-99");
            } else if (clientTypeDocumentWatch.id === "CNPJ") {
                setDocumentMask("99.999.999/9999-99");
            }
        }
    }, [clientTypeDocumentWatch]);

    useEffect(() => {
        async function execute() {
            if (!Object.keys(listProductsModalities).length || Object.keys(listProductsModalities).length) {
                resetFieldProductivity("modalities");
                setListProductsModalities([]);

                if (!productWatch || !productWatch.label) {
                    resetFields(["price", "amount"]);
                }
            }

            if (productWatch) {
                if (idProductivityDaily) {
                    if (dataModalityAndDetailProductivityDaily) {
                        await searchModalitiesOfTheProduct(
                            productWatch.id,
                            dataModalityAndDetailProductivityDaily.id_modality,
                            dataModalityAndDetailProductivityDaily.detail,
                        );
                    }
                } else {
                    await searchModalitiesOfTheProduct(productWatch.id);
                }
            }
        }
        execute();
    }, [productWatch]);

    useEffect(() => {
        if (!modalityWatch?.is_operator_price) {
            resetFieldProductivity("price");
        }

        if (!modalityWatch?.is_operator_amount) {
            resetFieldProductivity("amount");
        }

        if (!idProductivityDaily) {
            handleDynamicComponentResetAndUnmount(modalityWatch);
        } else {
            if (dataModalityAndDetailProductivityDaily) {
                const parsedDetail = JSON.parse(dataModalityAndDetailProductivityDaily.detail);
                handleDynamicComponentResetAndUnmount(
                    modalityWatch,
                    parsedDetail,
                    dataModalityAndDetailProductivityDaily.id_modality,
                );
            }
        }
    }, [modalityWatch]);

    useEffect(() => {
        async function execute() {
            setLoading(true);
            if (idProductivityDaily) {
                await setValuesProductivityDailyByID(idProductivityDaily);
            } else {
                await setProductivityDailyOptions();
            }
            setLoading(false);
        }

        execute();
    }, [idProductivityDaily]);

    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
                        <GridToolbarColumnsButton sx={{ display: smDown ? "none" : "flex" }} />
                        <GridToolbarFilterButton sx={{ display: smDown ? "none" : "flex" }} />
                        <GridToolbarDensitySelector sx={{ display: smDown ? "none" : "flex" }} />
                        <IconButton
                            onClick={() => saveIdClientRefresh()}
                            sx={{
                                ml: 1,
                                cursor: rowSelectionModel.length === 0 ? "default" : "pointer",
                                border: rowSelectionModel.length === 0 ? "1px solid transparent" : `1px solid #7DB61C`,
                                borderRadius: 8,
                                boxShadow: rowSelectionModel.length === 0 ? "none" : "0 0 7px 1px #7DB61C9e",
                            }}
                            size='medium'>
                            <CheckBoxIcon color={rowSelectionModel.length === 0 ? "disabled" : "success"} />
                        </IconButton>
                        <Typography
                            ml={1}
                            sx={{ fontSize: "14px" }}
                            fontWeight={"bold"}
                            color={themeContext === "light" ? "text.secondary" : "text.primary"}>
                            {smDown ? "Selecionar Cooperado" : "Selecionar Cooperado"}
                        </Typography>
                    </Box>

                    <Box sx={{ p: 1, display: "flex", justifyContent: "end" }}>
                        <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
                    </Box>
                </Box>
            </GridToolbarContainer>
        );
    };

    const columns: GridColDef[] = [
        {
            field: "id",
            headerName: "ID",
            width: 80,
        },
        {
            field: "cliente_nome",
            headerName: "Nome",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "cliente_documento",
            headerName: "CPF/CNPJ",
            minWidth: 150,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatCnpjCpf(value)}</Typography>;
            },
        },
        {
            field: "agencia_id",
            headerName: "PA Cooperado",
            minWidth: 110,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "carteira_nome",
            headerName: "Carteira",
            minWidth: 150,
        },
        {
            field: "cliente_perfil",
            headerName: "Perfil",
            minWidth: 120,
        },
        {
            field: "cliente_tipo",
            headerName: "Tipo",
            width: 70,
        },
        {
            field: "e_rural",
            headerName: "É Rural",
            width: 80,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "🌱 Sim" : "      Não"}</Typography>;
            },
        },
        {
            field: "e_cooperado",
            headerName: "É Cooperado",
            width: 100,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "Sim" : "Não"}</Typography>;
            },
        },
    ];

    return (
        <Grid {...props}>
            <Grid container spacing={2} mt={idProductivityDaily ? -6 : -1}>
                <Grid item xs={12}>
                    <FormRadioGroup
                        row
                        name='is_client'
                        label='Cadastro Novo:'
                        control={controlProductivity}
                        errors={errorsProductivity}
                        options={[
                            { label: "Não 💚", value: true },
                            { label: "Sim 🚩", value: false },
                        ]}
                    />
                </Grid>

                {showDataGrid ? (
                    <>
                        <Grid item xs={12} mt={-1}>
                            <Collapse in={showAlert}>
                                <Alert
                                    severity='warning'
                                    action={
                                        <IconButton
                                            aria-label='close'
                                            color='inherit'
                                            size='small'
                                            onClick={() => {
                                                setShowAlert(false);
                                            }}>
                                            <GridCloseIcon fontSize='inherit' />
                                        </IconButton>
                                    }
                                    sx={{ mb: 2, fontSize: 12 }}>
                                    Primeiro, utilize os filtros para realizar a busca. Em seguida, selecione um
                                    cooperado na lista abaixo e confirme clicando no botão '✅ Selecionar Cooperado'.
                                    Isso preencherá automaticamente os dados do cadastro (Nome, Documento e Tipo Rural):
                                </Alert>
                            </Collapse>
                        </Grid>
                        <Grid
                            item
                            component='form'
                            onSubmit={handleSubmitFilter(onSubmitFilterExtClients)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                mt: -1,
                            }}>
                            <Grid container spacing={1}>
                                <Grid item xs={12} md={2.2}>
                                    <FormInput
                                        fullWidth
                                        name='filter_client_name'
                                        label='Nome Cooperado'
                                        variant='outlined'
                                        size='small'
                                        control={controlFilter}
                                        errors={errorsFilter}
                                        inputProps={{
                                            style: { textTransform: "uppercase" },
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={1.5}>
                                    <FormInputCpfCnpj
                                        fullWidth
                                        name='filter_client_document'
                                        label='CPF ou CNPJ'
                                        placeholder='Digite um CPF ou CNPJ'
                                        size='small'
                                        control={controlFilter}
                                        errors={errorsFilter}
                                    />
                                </Grid>

                                <Grid item xs={12} md={1.9}>
                                    <FormAutocomplete
                                        fullWidth
                                        name='filter_agency'
                                        label='PA'
                                        variant='outlined'
                                        size='small'
                                        control={controlFilter}
                                        errors={errorsFilter}
                                        options={listAgencies
                                            .map(({ id, label, agency_sisbr_id }) => {
                                                return { id, label, agency_sisbr_id };
                                            })
                                            .filter((value) => value.agency_sisbr_id !== 9999)}
                                    />
                                </Grid>

                                <Grid item xs={12} md={2}>
                                    <FormAutocomplete
                                        fullWidth
                                        name='filter_portfolio_name'
                                        label='Carteira'
                                        variant='outlined'
                                        size='small'
                                        control={controlFilter}
                                        errors={errorsFilter}
                                        options={ArrayTypesPortfolioName}
                                    />
                                </Grid>

                                <Grid item xs={6} md={1.1}>
                                    <FormAutocomplete
                                        fullWidth
                                        name='filter_client_type'
                                        label='Tipo'
                                        variant='outlined'
                                        size='small'
                                        control={controlFilter}
                                        errors={errorsFilter}
                                        options={ArrayTypesDocumentClient}
                                    />
                                </Grid>

                                <Grid item xs={6} md={1.1}>
                                    <FormAutocomplete
                                        fullWidth
                                        name='filter_is_rural'
                                        label='É Rural'
                                        variant='outlined'
                                        size='small'
                                        control={controlFilter}
                                        errors={errorsFilter}
                                        options={ArrayTypesYesOrNo}
                                    />
                                </Grid>

                                <Grid item xs={12} md={1}>
                                    <FormInput
                                        fullWidth
                                        label='ID'
                                        name='filter_client_sisbr_id'
                                        type='number'
                                        size='small'
                                        variant='outlined'
                                        control={controlFilter}
                                        errors={errorsFilter}
                                    />
                                </Grid>

                                <Grid item xs={12} md={1.2}>
                                    <LoadingButton
                                        fullWidth
                                        type='submit'
                                        color='success'
                                        loadingPosition='start'
                                        size='medium'
                                        variant='contained'
                                        startIcon={<SearchIcon />}
                                        loading={loadingButtonDataGrid}
                                        sx={{ height: 39, borderRadius: "8px" }}>
                                        Pesquisar
                                    </LoadingButton>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={12} sx={{ display: !showDataGrid ? "none" : "grid" }}>
                            <DataGrid
                                autoHeight
                                getRowId={(row) => row.id}
                                checkboxSelection
                                onRowSelectionModelChange={handleRowSelectionChange}
                                rowSelectionModel={rowSelectionModel}
                                rows={listClients}
                                columns={columns}
                                density='compact'
                                localeText={dataGridLocaleTextTranslateFull}
                                loading={loadingDataGrid}
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 5,
                                        },
                                    },
                                }}
                                slots={{
                                    toolbar: CustomToolbar,
                                }}
                                slotProps={{
                                    toolbar: {
                                        quickFilterProps: { debounceMs: 300 },
                                    },
                                    columnsPanel: {
                                        style: {
                                            maxHeight: "360px",
                                            position: "absolute",
                                            top: "auto",
                                            bottom: 0,
                                            transform: "translate(48%, 35%)",
                                            zIndex: 1300,
                                            borderRadius: "8px",
                                            boxShadow:
                                                "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
                                            backgroundColor: themeContext === "light" ? "#ffffff" : "#1F3D44",
                                        },
                                    },
                                }}
                                pageSizeOptions={[5, 10]}
                                sx={getDataGridStyles(colorBorderSystem, colorScrollSystem)}
                            />
                        </Grid>
                        {listClients && listClients.length > 0 && listClients[0].data_movimento && (
                            <Grid item xs={12} md={12} mt={-1}>
                                <Typography fontSize={12}>
                                    {`Atualização da Base de cooperados do dia: ${formatDate(listClients[0].data_movimento, "DD/MM/YYYY")}`}
                                </Typography>
                            </Grid>
                        )}
                    </>
                ) : (
                    !idProductivityDaily && (
                        <Grid item xs={12} md={12} mt={-1} mb={-2}>
                            <Collapse in={showAlert}>
                                <Alert
                                    severity='warning'
                                    action={
                                        <IconButton
                                            aria-label='close'
                                            color='inherit'
                                            size='small'
                                            onClick={() => {
                                                setShowAlert(false);
                                            }}>
                                            <GridCloseIcon fontSize='inherit' />
                                        </IconButton>
                                    }
                                    sx={{ mb: 2, fontSize: 12 }}>
                                    Atenção: cadastre um (🚩Novo cooperado) apenas se ele não estiver na listagem
                                    anterior da opção: (Não 💚), para evitar duplicidade de registros.
                                </Alert>
                            </Collapse>
                        </Grid>
                    )
                )}
            </Grid>

            <Box component='form'>
                <Grid container spacing={2} mt={1.5}>
                    <Grid item xs={12} md={12} mb={2.5}>
                        <Divider>
                            <Chip label='Dados do Cooperado' size='medium' color='info' />
                        </Divider>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <FormInput
                            fullWidth
                            name='client_name'
                            label='Nome Cooperado'
                            variant={showDataGrid ? "filled" : "outlined"}
                            disabled={showDataGrid}
                            control={controlProductivity}
                            errors={errorsProductivity}
                            inputProps={{
                                style: { textTransform: "uppercase" },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={1.5}>
                        <FormAutocomplete
                            fullWidth
                            name='type_document'
                            label='Tipo Documento'
                            variant={showDataGrid ? "filled" : "outlined"}
                            disabledAutocomplete={showDataGrid ? true : false}
                            disabled={showDataGrid}
                            control={controlProductivity}
                            errors={errorsProductivity}
                            options={ArrayTypesDocument}
                        />
                    </Grid>

                    <Grid item xs={12} md={3.5}>
                        <FormInputMask
                            fullWidth
                            label='CPF/CNPJ do Cooperado'
                            name='client_document'
                            mask={documentMask}
                            variant={showDataGrid ? "filled" : "outlined"}
                            disabled={showDataGrid || isClientDocumentDisabled}
                            control={controlProductivity}
                            errors={errorsProductivity}
                        />
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <FormAutocomplete
                            fullWidth
                            name='is_client_rural'
                            label='É Rural'
                            variant={showDataGrid ? "filled" : "outlined"}
                            disabledAutocomplete={showDataGrid ? true : false}
                            disabled={showDataGrid}
                            control={controlProductivity}
                            errors={errorsProductivity}
                            options={arrayNoAndYes}
                        />
                    </Grid>

                    <Grid item xs={12} md={12} mt={3} mb={2.5}>
                        <Divider>
                            <Chip label='Dados do Produto' size='medium' color='primary' />
                        </Divider>
                    </Grid>

                    {idProductivityDaily && status && ["CORREÇÃO"].includes(status) && (
                        <Grid item xs={12} mt={-1} mb={-1}>
                            <Collapse in={true}>
                                <Alert severity='info' sx={{ mb: 2, fontSize: 12 }}>
                                    Atenção: Esta produção precisa ser ajustada conforme a solicitação do auditor. Para
                                    ver os detalhes do que precisa ser corrigido, clique no botão "Interações desta
                                    Produção" abaixo do campo de observações. Lá, você encontrará a última avaliação do
                                    auditor.
                                </Alert>
                            </Collapse>
                        </Grid>
                    )}

                    <Grid item xs={12} md={4}>
                        <FormAutocomplete
                            fullWidth
                            name='products'
                            label='Produtos'
                            variant='outlined'
                            control={controlProductivity}
                            errors={errorsProductivity}
                            options={listProducts}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormAutocomplete
                            fullWidth
                            disabledAutocomplete={!productWatch ? true : false}
                            disableClearable
                            name='modalities'
                            label='Modalidades'
                            variant='outlined'
                            control={controlProductivity}
                            errors={errorsProductivity}
                            options={listProductsModalities.map(
                                ({
                                    id,
                                    label,
                                    input_components,
                                    is_operator_price,
                                    is_operator_amount,
                                    is_operator_percentage,
                                    is_operator_points,
                                }) => {
                                    return {
                                        id,
                                        label,
                                        input_components,
                                        is_operator_price,
                                        is_operator_amount,
                                        is_operator_percentage,
                                        is_operator_points,
                                    };
                                },
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <FormInputCurrency
                            fullWidth
                            label='Valor (R$)'
                            name='price'
                            variant={!productWatch || !modalityWatch?.is_operator_price ? "filled" : "outlined"}
                            placeholder='R$ '
                            decimalScale={2}
                            disabled={!productWatch || !modalityWatch?.is_operator_price ? true : false}
                            control={controlProductivity}
                            errors={errorsProductivity}
                        />
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <FormInput
                            fullWidth
                            label='Quantidade'
                            name='amount'
                            type='number'
                            variant={!productWatch || !modalityWatch?.is_operator_amount ? "filled" : "outlined"}
                            disabled={!productWatch || !modalityWatch?.is_operator_amount ? true : false}
                            control={controlProductivity}
                            errors={errorsProductivity}
                        />
                    </Grid>

                    {isMounted
                        ? modalityWatch?.input_components &&
                          modalityWatch.input_components.length > 0 &&
                          renderDynamicInputs(modalityWatch.input_components)
                        : null}

                    <Grid item xs={12} md={12}>
                        <FormInput
                            fullWidth
                            multiline
                            rows={5}
                            label='Observação'
                            name='observation'
                            type='text'
                            variant='outlined'
                            control={controlProductivity}
                            errors={errorsProductivity}
                        />
                    </Grid>

                    {idProductivityDaily && (
                        <Grid item xs={12} mb={-1.5} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Badge
                                color='primary'
                                badgeContent={interactionCountManual}
                                max={999}
                                title='Contagem de Interações Manuais'
                                sx={{
                                    "& .MuiBadge-badge": {
                                        height: "22px",
                                        minWidth: "22px",
                                        borderRadius: "50%",
                                        fontSize: "9px",
                                        backgroundColor: "#605ebb",
                                        color: "white",
                                        fontWeight: "bold",
                                        cursor: "default",
                                        top: 3,
                                        right: 2,
                                    },
                                }}>
                                <IconButton
                                    title='Interações'
                                    size='medium'
                                    disabled={loading}
                                    sx={{ border: `1px solid #605ebb` }}
                                    onClick={handleModalInteractionProductivityDaily}>
                                    <ChatOutlinedIcon color='info' />
                                </IconButton>
                            </Badge>

                            <Typography>Interações desta Produção</Typography>
                        </Grid>
                    )}
                </Grid>

                <Grid
                    container
                    justifyContent='center'
                    mt={3}
                    p={1.5}
                    border={themeContext === "light" ? `1px dashed #BDBDBD` : `1px dashed #53676A`}
                    borderRadius={2}
                    gap={2}>
                    <Grid item xs={12} sm={12} md={12} mb={1}>
                        <Typography
                            fontWeight={700}
                            color={themeContext === "light" ? "text.secondary" : "text.primary"}>
                            PA e Carteira que será contabilizado para o mobilizador:
                        </Typography>
                    </Grid>

                    <Grid item container spacing={2} justifyContent='center'>
                        <Grid item xs={12} sm={4} md={4}>
                            <FormAutocomplete
                                fullWidth
                                name='mob_validation_agency'
                                label='PA'
                                variant='outlined'
                                size='medium'
                                disabled={idProductivityDaily || loading ? true : false}
                                disabledAutocomplete={idProductivityDaily || loading ? true : false}
                                disableClearable
                                control={controlProductivity}
                                errors={errorsProductivity}
                                options={listMobValidationAgencies}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4} md={4}>
                            <FormAutocomplete
                                fullWidth
                                name='mob_validation_portfolio'
                                label='Carteira'
                                variant='outlined'
                                size='medium'
                                disabled={idProductivityDaily || loading ? true : false}
                                disabledAutocomplete={idProductivityDaily || loading ? true : false}
                                disableClearable
                                control={controlProductivity}
                                errors={errorsProductivity}
                                options={listMobValidationPortfolios}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4} md={2.5} alignContent={"center"}>
                            <Typography
                                fontWeight={700}
                                color={themeContext === "light" ? "text.secondary" : "text.primary"}>
                                Data validação:{" "}
                                {!idProductivityDaily ? moment().format("DD/MM/YYYY") : mobValidationDate}
                            </Typography>
                        </Grid>
                    </Grid>

                    {!idProductivityDaily &&
                        mobValidationAgencyWatch &&
                        mobValidationPortfolioWatch &&
                        user?.id_portfolio !== mobValidationPortfolioWatch.id && (
                            <Grid item xs={12} sm={12} md={12}>
                                <Collapse in={true}>
                                    <Alert
                                        severity='warning'
                                        sx={{
                                            fontSize: 12,
                                            border: `1px dashed #a1a800`,
                                        }}>
                                        {user?.id_agency !== mobValidationAgencyWatch.id &&
                                            user?.id_portfolio !== mobValidationPortfolioWatch.id && (
                                                <>
                                                    Você está prestes a cadastrar uma produção em uma{" "}
                                                    <b>agência e carteira diferentes das suas.</b> Se isso não for o
                                                    desejado, por favor, corrija a seleção dos campos acima. Caso seja
                                                    esse o objetivo, prossiga com o cadastro.
                                                </>
                                            )}
                                        {user?.id_agency === mobValidationAgencyWatch.id &&
                                            user?.id_portfolio !== mobValidationPortfolioWatch.id && (
                                                <>
                                                    Você está prestes a cadastrar uma produção em uma{" "}
                                                    <b>carteira diferente da sua.</b> Se isso não for o desejado, por
                                                    favor, corrija a seleção dos campos acima. Caso seja esse o
                                                    objetivo, prossiga com o cadastro.
                                                </>
                                            )}
                                    </Alert>
                                </Collapse>
                            </Grid>
                        )}
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography color='text.secondary' fontSize={12}>
                            {!idProductivityDaily ? (
                                <>
                                    <b>Atenção:</b> Os campos acima determinam para qual PA e carteira essa produção
                                    será contabilizada. Se for necessário cadastrar a produtividade em outra agência ou
                                    carteira, ajuste-os conforme necessário. Em caso de ajustes futuros ou erros de
                                    envio, deixe uma interação nesta produção e chame um auditor responsável.
                                </>
                            ) : (
                                <>
                                    <b>Atenção:</b> Os campos acima determinam para qual PA e carteira essa produção
                                    será contabilizada. Em caso de ajustes futuros ou erros de envio, deixe uma
                                    interação nesta produção e chame um auditor responsável para aplicar a correção
                                    necessária.
                                </>
                            )}
                        </Typography>
                    </Grid>
                </Grid>

                <Grid container justifyContent='center' mt={3} gap={1}>
                    <>
                        <Grid>
                            {!idProductivityDaily || (status && ["RASCUNHO"].includes(status)) ? (
                                <LoadingButton
                                    size='large'
                                    color='info'
                                    variant='contained'
                                    startIcon={<Icon>edit_note_icon</Icon>}
                                    loading={loading}
                                    onClick={async () => {
                                        await confirm({
                                            title: (
                                                <Typography fontWeight={500} fontSize={17}>
                                                    Confirmação de Rascunho:
                                                </Typography>
                                            ),

                                            description: (
                                                <>
                                                    <Typography fontSize={16}>
                                                        Tem certeza de que deseja salvar este rascunho?
                                                    </Typography>
                                                    <Typography mt={1} fontSize={16}>
                                                        As informações serão armazenadas para edição posterior, não
                                                        serão consideradas como cadastro finalizado e não aparecerão
                                                        para o auditor.
                                                    </Typography>
                                                    <Typography mt={1} fontSize={16}>
                                                        O status da produtividade será: 🟣 Rascunho.
                                                    </Typography>
                                                </>
                                            ),
                                        })
                                            .then(() =>
                                                handleSubmitProductivity((params) =>
                                                    onSubmitProductivityDaily(params, "RASCUNHO"),
                                                )(),
                                            )
                                            .catch(() => {});
                                    }}>
                                    {!idProductivityDaily ? "Cadastrar Rascunho" : "Editar Rascunho"}
                                </LoadingButton>
                            ) : null}
                        </Grid>

                        <Grid>
                            <LoadingButton
                                size='large'
                                color='success'
                                variant='contained'
                                startIcon={<Icon>save</Icon>}
                                loading={loading}
                                disabled={
                                    status && ["APROVADO", "REPROVADO", "PENDENTE", "CANCELADO"].includes(status)
                                        ? true
                                        : false
                                }
                                onClick={async () => {
                                    await confirm({
                                        title: (
                                            <Typography fontWeight={500} fontSize={17}>
                                                Confirmação de Cadastro:
                                            </Typography>
                                        ),
                                        description: (
                                            <>
                                                <Typography fontSize={16}>
                                                    Tem certeza de que deseja continuar com o cadastro desta
                                                    produtividade? Todos os dados serão salvos e não poderão ser
                                                    alterados após a submissão.
                                                </Typography>
                                                <Typography mt={1} fontSize={16}>
                                                    O status da produtividade será alterado para: 🟡 Pendente
                                                </Typography>
                                            </>
                                        ),
                                    })
                                        .then(() =>
                                            handleSubmitProductivity((params) =>
                                                onSubmitProductivityDaily(params, "PENDENTE"),
                                            )(),
                                        )
                                        .catch(() => {});
                                }}>
                                {!idProductivityDaily ? "Cadastrar Produtividade" : "Editar Produtividade"}
                            </LoadingButton>
                        </Grid>

                        <Modal open={openModalInteraction}>
                            <Box>
                                <InteractionsProductivityDaily
                                    idProductivityDaily={idProductivityDaily}
                                    handleClose={handleModalInteractionProductivityDaily}
                                    updateColumn={updateColumn}
                                />
                            </Box>
                        </Modal>
                    </>
                </Grid>
            </Box>
        </Grid>
    );
}
