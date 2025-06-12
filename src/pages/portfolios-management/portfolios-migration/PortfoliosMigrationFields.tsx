import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Avatar, Chip, Divider, Grid, Icon, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Box } from "@mui/system";
import FormInput from "@/components/FormComponents/FormInput";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import { useConfirm } from "material-ui-confirm";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { GridProps } from "@mui/material";
import FormRadioGroup from "@/components/FormComponents/FormRadioGroup";
import { formatCnpjCpf, isValidCNPJ, isValidCPF } from "@/functions/number";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import {
    GridColDef,
    GridRowSelectionModel,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import React from "react";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import SearchIcon from "@mui/icons-material/Search";
import WalletOutlinedIcon from "@mui/icons-material/WalletOutlined";
import KeyboardDoubleArrowDownOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowDownOutlined";
import KeyboardDoubleArrowUpOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowUpOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { ISearchListExtClient, searchListExtClients } from "@/services/ext-tables";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { useNavigate } from "react-router-dom";
import { ArrayTypesDocumentClient } from "@/constants/array-type-document-client";
import { useAuth } from "@/contexts/AuthContext";
import facezinha_sicoob from "@/assets//images/facezinha-sicoob.png";
import { keyframes } from "@emotion/react";
import { createPortfoliosMigration } from "@/services/portfolios-management";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { ExtClientInfo, mapValueCurrentAccount } from "../../../components/ExtClientInfo/ExtClientInfo";
import { searchAutoCompletePortfolios } from "@/services/portfolios";
import { searchAllAccessPermissionGroup } from "@/services/access-groups";
import { ArrayTypesReasonPortfoliosMigration } from "@/constants/array-type-reason-portfolios-migration";
import { ArrayTypeStatusCurrentAccountClient } from "@/constants/array-type-status-current-account-client";

const moveUpDown = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-7px);
  }
  75% {
    transform: translateY(2px);
  }
  100% {
    transform: translateY(0);
  }
`;

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
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

type FilterExtClientsOrigin = {
    filter_origin_client_name?: string | null;
    filter_origin_client_document?: string | null;
    filter_origin_agency: ListAgencies;
    filter_origin_portfolio: ListPortfolios;
    filter_origin_client_type: AutoCompleteString | null;
    filter_origin_is_rural: AutoCompleteBoolean | null;
    filter_origin_current_account: AutoCompleteString | null;
};

type FilterExtClientsDestiny = {
    filter_destiny_client_name?: string | null;
    filter_destiny_client_document?: string | null;
    filter_destiny_agency: ListAgencies;
    filter_destiny_portfolio: ListPortfolios;
    filter_destiny_client_type: AutoCompleteString | null;
    filter_destiny_is_rural: AutoCompleteBoolean | null;
    filter_destiny_current_account: AutoCompleteString | null;
};

export type EditPortfoliosMigration = {
    id?: number;
    status_finished?: string;
    status_validation_destiny?: string;
    migration_type?: string;
    is_client?: boolean;
    client_date_movement?: string;
    client_sisbr_id?: number;
    client_name?: string;
    client_document?: string;
    client_agency?: string;
    client_id_portfolio?: number;
    client_portfolio?: string;
    client_profile?: string;
    client_is_rural?: boolean;
    new_client_id_portfolio?: number;
    new_client_portfolio?: string;
    observation?: string | null;
    created_by_id?: number;
    created_by_name?: string;
    manager_destiny_by_id?: number;
    manager_destiny_by_name?: string;
    date_validation_destiny?: string;
    audited_by_id?: number;
    audited_by_name?: string;
    date_finished?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
};

export type PortfoliosMigration = {
    migration_type: string;
    type_migration: string;
    client_name: string;
    client_document: string;
    client_profile: string;
    client_sisbr_id: number;
    client_is_rural: AutoCompleteBoolean;
    client_agency: ListAgencies;
    client_portfolio: ListPortfolios;
    new_client_agency: ListAgencies;
    new_client_portfolio: ListPortfolios;
    reason: AutoCompleteNumber;
    observation?: string | null | undefined;
};

export type NewIDAgencyAndPortfolio = {
    new_client_id_agency: number;
    new_client_id_portfolio: number;
};

type PermissionProps = {
    group: string;
};

const arrayNoAndYes = [
    { id: false, label: "Não" },
    { id: true, label: "Sim 🌱" },
];

const validationSchemaFilterOrigin = Yup.object().shape({
    filter_origin_client_name: Yup.string().max(255, "Máximo 255 caracteres").nullable().uppercase().trim(),
    filter_origin_agency: Yup.object()
        .shape({
            id: Yup.number().required("ID é obrigatório"),
            label: Yup.string().required("Nome da PA é obrigatório"),
            agency_sisbr_id: Yup.number().required("ID Sisbr Agencia é obrigatório"),
        })
        .required("Carteira é obrigatório"),
    filter_origin_portfolio: Yup.object()
        .shape({
            id: Yup.number().required("ID é obrigatório"),
            label: Yup.string().required("Nome da Carteira é obrigatório"),
            id_ref: Yup.number().nullable(),
            id_agency: Yup.number().nullable(),
        })
        .required("Carteira é Obrigatório"),
    filter_origin_client_document: Yup.string()
        .max(18, "Máximo 18 caracteres")
        .transform((value) => value.replace(/[\.\-\/]/g, ""))
        .nullable()
        .trim(),
    filter_origin_client_type: Yup.object()
        .shape({
            id: Yup.string().required("ID é obrigatório"),
            label: Yup.string().required("Nome do TIpo é obrigatório"),
        })
        .nullable(),
    filter_origin_is_rural: Yup.object()
        .shape({
            id: Yup.boolean().required("ID é obrigatório"),
            label: Yup.string().required("Nome da PA é obrigatório"),
        })
        .nullable(),
    filter_origin_current_account: Yup.object()
        .shape({
            id: Yup.string().required("ID é obrigatório"),
            label: Yup.string().required("Nome é obrigatório"),
        })
        .nullable(),
});

const validationSchemaFilterDestiny = Yup.object().shape({
    filter_destiny_client_name: Yup.string().max(255, "Máximo 255 caracteres").nullable().uppercase().trim(),
    filter_destiny_agency: Yup.object()
        .shape({
            id: Yup.number().required("ID é obrigatório"),
            label: Yup.string().required("Nome é obrigatório"),
            agency_sisbr_id: Yup.number().required("ID Sisbr Agencia é obrigatório"),
        })
        .required("Carteira é Obrigatório"),
    filter_destiny_portfolio: Yup.object()
        .shape({
            id: Yup.number().required("ID é obrigatório"),
            label: Yup.string().required("Nome é obrigatório"),
            id_ref: Yup.number().nullable(),
            id_agency: Yup.number().nullable(),
        })
        .required("Carteira é Obrigatório"),
    filter_destiny_client_document: Yup.string()
        .max(18, "Máximo 18 caracteres")
        .transform((value) => value.replace(/[\.\-\/]/g, ""))
        .nullable()
        .trim(),
    filter_destiny_client_type: Yup.object()
        .shape({
            id: Yup.string().required("ID é obrigatório"),
            label: Yup.string().required("Nome é obrigatório"),
        })
        .nullable(),
    filter_destiny_is_rural: Yup.object()
        .shape({
            id: Yup.boolean().required("ID é obrigatório"),
            label: Yup.string().required("Nome é obrigatório"),
        })
        .nullable(),
    filter_destiny_current_account: Yup.object()
        .shape({
            id: Yup.string().required("ID é obrigatório"),
            label: Yup.string().required("Nome é obrigatório"),
        })
        .nullable(),
});

const validationSchemaPortfoliosMigration = Yup.object().shape({
    migration_type: Yup.string().required("Tipo da migração é obrigatório"),
    type_migration: Yup.string().required("Tipo da migração é obrigatório"),
    client_name: Yup.string().required("Nome é obrigatório").uppercase().trim(),
    client_document: Yup.string().required("Documento é obrigatório"),
    client_profile: Yup.string().required("Perfil é obrigatório").uppercase().trim(),
    client_sisbr_id: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .required("ID Cooperado é obrigatório"),
    client_is_rural: Yup.object()
        .shape({
            id: Yup.boolean().required("ID é obrigatório"),
            label: Yup.string().required("Nome da PA é obrigatório"),
        })
        .required("É Rural, é obrigatório"),
    client_agency: Yup.object()
        .shape({
            id: Yup.number().required("ID da PA de Origem é obrigatório"),
            label: Yup.string().required("Nome da PA de Origem é obrigatório"),
            agency_sisbr_id: Yup.number().required("ID Sisbr da PA de Origem é obrigatório"),
        })
        .required("PA de Origem é obrigatório"),
    client_portfolio: Yup.object()
        .shape({
            id: Yup.number().required("ID da Carteira de Origem é obrigatório"),
            label: Yup.string().required("Nome da Carteira de Origem é obrigatório"),
            id_ref: Yup.number().nullable(),
            id_agency: Yup.number().nullable(),
        })
        .required("Carteira de Origem é Obrigatório"),
    new_client_agency: Yup.object()
        .shape({
            id: Yup.number().required("ID da PA de destino é obrigatório"),
            label: Yup.string().required("Nome da PA de destino é obrigatório"),
            agency_sisbr_id: Yup.number().required("ID Sisbr da PA de destino é obrigatório"),
        })
        .required("PA de Destino é obrigatório"),
    new_client_portfolio: Yup.object()
        .shape({
            id: Yup.number().required("ID da Carteira de Destino é obrigatório"),
            label: Yup.string().required("Nome da Carteira de Destino é obrigatório"),
            id_ref: Yup.number().nullable(),
            id_agency: Yup.number().nullable(),
        })
        .required("Carteira de Destino é Obrigatório"),
    reason: Yup.object()
        .shape({
            id: Yup.number().required("ID é obrigatório"),
            label: Yup.string().required("Motivo é obrigatório"),
        })
        .required("Motivo é obrigatório"),
    observation: Yup.string().max(4000, "Excedeu 4000 caracteres").nullable(),
});

export type ProductivityDailyProps = {
    idPortfoliosMigration?: number;
    updateColumn?: (params: EditPortfoliosMigration) => void;
} & GridProps;

export function PortfoliosMigrationFields({ idPortfoliosMigration, updateColumn, ...props }: ProductivityDailyProps) {
    const {
        getInfoError,
        toggleStatusBackdrop,
        colorBorderSystem,
        colorScrollSystem,
        colorBackgroundSystem,
        theme,
        redBlur,
        cyanBlur,
    } = useGlobal();
    const { user } = useAuth();
    const [loadingButtonSubmit, setLoadingButtonSubmit] = useState(false);
    const [loadingDataGridOrigin, setLoadingDataGridOrigin] = useState(false);
    const [loadingDataGridDestiny, setLoadingDataGridDestiny] = useState(false);
    const [loadingButtonDataGridOrigin, setLoadingButtonDataGridOrigin] = useState(false);
    const [loadingButtonDataGridDestiny, setLoadingButtonDataGridDestiny] = useState(false);
    const [listAgenciesOrigin, setListAgenciesOrigin] = useState<ListAgencies[]>([]);
    const [listAgenciesDestiny, setListAgenciesDestiny] = useState<ListAgencies[]>([]);
    const [listPortfoliosOrigin, setListPortfoliosOrigin] = useState<ListPortfolios[]>([]);
    const [listPortfoliosDestiny, setListPortfoliosDestiny] = useState<ListPortfolios[]>([]);
    const [listClientsOrigin, setListClientsOrigin] = useState<ISearchListExtClient[]>([]);
    const [listClientsDestiny, setListClientsDestiny] = useState<ISearchListExtClient[]>([]);
    const [rowSelectionGridOrigin, setRowSelectionGridOrigin] = React.useState<GridRowSelectionModel>([]);
    const [rowSelectionGridDestiny, setRowSelectionGridDestiny] = React.useState<GridRowSelectionModel>([]);
    const [isConfirming, setIsConfirming] = useState(false);
    const [initialValueSet, setInitialValueSet] = useState(false);
    const [isSendingFromMyPortfolio, setIsSendingFromMyPortfolio] = useState(true);
    const [buttonArrowDown, setButtonArrowDown] = useState(false);
    const [buttonArrowUp, setButtonArrowUp] = useState(true);
    const [openModalClient, setOpenModalClient] = useState(false);
    const [idExtClient, setIdExtClient] = useState<number>();
    const [accessPermission, setAccessPermission] = useState<PermissionProps[]>([]);
    const [isGroupManager, setIsGroupManager] = useState<boolean>();
    const [isGroupAuditorOrAdmin, setIsGroupAuditorOrAdmin] = useState<boolean>();

    const { device } = useMediaQuery();
    const confirm = useConfirm();
    const navigate = useNavigate();

    const scrollBottomRef = useRef<HTMLDivElement>(null);

    const {
        handleSubmit: handleSubmitFilterOrigin,
        resetField: resetFieldFilterOrigin,
        setValue: setValueFilterOrigin,
        getValues: getValuesFilterOrigin,
        setError: setErrorFilterOrigin,
        watch: watchFilterOrigin,
        trigger: triggerFilterOrigin,
        control: controlFilterOrigin,
        formState: { errors: errorsFilterOrigin },
    } = useForm<FilterExtClientsOrigin>({
        resolver: yupResolver(validationSchemaFilterOrigin),
        mode: "onChange",
        reValidateMode: "onChange",
    });

    const {
        handleSubmit: handleSubmitFilterDestiny,
        resetField: resetFieldFilterDestiny,
        getValues: getValuesFilterDestiny,
        setError: setErrorFilterDestiny,
        watch: watchFilterDestiny,
        trigger: triggerFilterDestiny,
        control: controlFilterDestiny,
        formState: { errors: errorsFilterDestiny },
    } = useForm<FilterExtClientsDestiny>({
        resolver: yupResolver(validationSchemaFilterDestiny),
        mode: "onChange",
        reValidateMode: "onChange",
    });

    const {
        handleSubmit: handleSubmitPortfoliosMigration,
        control: controlPortfoliosMigration,
        setValue: setValuePortfoliosMigration,
        resetField: resetFieldPortfoliosMigration,
        watch: watchPortfoliosMigration,
        clearErrors: clearErrorsPortfoliosMigration,
        formState: { errors: errorsPortfoliosMigration },
    } = useForm<PortfoliosMigration>({
        resolver: yupResolver(validationSchemaPortfoliosMigration),
    });

    const isMigrationTypeWatch = watchPortfoliosMigration("migration_type");

    const inputFilterOriginAgencyWatch = watchFilterOrigin("filter_origin_agency");
    const inputFilterOriginPortfolioWatch = watchFilterOrigin("filter_origin_portfolio");

    const inputFilterDestinyAgencyWatch = watchFilterDestiny("filter_destiny_agency");
    const inputFilterDestinyPortfolioWatch = watchFilterDestiny("filter_destiny_portfolio");

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
    };

    const saveDataClientOrigin = async () => {
        if (listClientsOrigin?.length === 0) {
            toast.error(
                "Por favor, primeiramente faça uma busca da listagem (Minha Carteira), e selecione um cooperado.",
            );
            return;
        }

        if (rowSelectionGridOrigin.length == 0) {
            toast.warning("Por favor, selecione um cooperado da lista (Minha Carteira) para prosseguir");
            return;
        }

        if (
            inputFilterOriginAgencyWatch?.id &&
            inputFilterOriginPortfolioWatch?.id &&
            inputFilterDestinyAgencyWatch?.id &&
            inputFilterDestinyPortfolioWatch?.id
        ) {
            const isSameAgency = inputFilterOriginAgencyWatch.id === inputFilterDestinyAgencyWatch.id;
            const isSamePortfolio = inputFilterOriginPortfolioWatch.id === inputFilterDestinyPortfolioWatch.id;

            if (isSameAgency && isSamePortfolio) {
                toast.error(
                    "Os valores de Agência e Carteira de Origem são iguais aos de Destino. Por favor, selecione valores diferentes.",
                );
                return;
            }
        }

        const selectedRowOrigin = listClientsOrigin.find((row) => row.id === rowSelectionGridOrigin[0]);

        if (!selectedRowOrigin) {
            toast.error("Cooperado não encontrado!");
            return;
        }

        if (!inputFilterDestinyAgencyWatch?.id || !inputFilterDestinyPortfolioWatch?.id) {
            const isValidInputs = await triggerFilterDestiny();

            if (!isValidInputs) {
                toast.error("Por favor, preencha os campos necessários em 'Carteira Destino'.");
            } else {
                toast.error("Por favor, Preencha os campos: (PA e Carteira) em: (Carteira Destino)");
            }

            return;
        }

        if (selectedRowOrigin.agencia_id !== getValuesFilterOrigin("filter_origin_agency.agency_sisbr_id")) {
            toast.error(
                "O cooperado selecionado pertence a uma PA (Ponto de Atendimento) diferente da PA escolhida no campo de entrada. Por favor, verifique a seleção e tente novamente ou faça uma nova pesquisa.",
            );
            return;
        }

        if (selectedRowOrigin.carteira_id !== getValuesFilterOrigin("filter_origin_portfolio.id_ref")) {
            toast.error(
                "O cooperado selecionado pertence a uma carteira diferente da carteira escolhida no campo de entrada. Por favor, verifique a seleção e tente novamente ou faça uma nova pesquisa.",
            );
            return;
        }

        confirm({
            title: `Deseja continuar o cadastro com o cooperador e a carteira selecionado?`,
        })
            .then(async () => {
                try {
                    setLoadingButtonSubmit(true);

                    setValuePortfoliosMigration("type_migration", "Enviar Cooperado");
                    setValuePortfoliosMigration("client_name", selectedRowOrigin.cliente_nome);
                    setValuePortfoliosMigration("client_document", formatCnpjCpf(selectedRowOrigin.cliente_documento));
                    setValuePortfoliosMigration("client_sisbr_id", selectedRowOrigin.id);
                    setValuePortfoliosMigration("client_profile", selectedRowOrigin.cliente_perfil);

                    setValuePortfoliosMigration("client_is_rural", {
                        id: selectedRowOrigin.e_rural,
                        label: selectedRowOrigin.e_rural ? "Sim" : "Não",
                    });

                    setValuePortfoliosMigration("client_agency", getValuesFilterOrigin("filter_origin_agency"));
                    setValuePortfoliosMigration("client_portfolio", getValuesFilterOrigin("filter_origin_portfolio"));

                    setValuePortfoliosMigration("new_client_agency", getValuesFilterDestiny("filter_destiny_agency"));
                    setValuePortfoliosMigration(
                        "new_client_portfolio",
                        getValuesFilterDestiny("filter_destiny_portfolio"),
                    );

                    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

                    toast.success(
                        "Cooperado e carteira selecionados com sucesso! Role a página para baixo para conferir os detalhes da migração.",
                    );
                    clearErrorsPortfoliosMigration();
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                } finally {
                    setLoadingButtonSubmit(false);
                }
            })
            .catch(() => {});
    };

    const saveDataClientDestiny = async () => {
        if (listClientsDestiny?.length === 0) {
            toast.error(
                "Por favor, primeiramente faça uma busca da listagem (Minha Carteira), e selecione um cooperado",
            );
            return;
        }

        if (rowSelectionGridDestiny.length == 0) {
            toast.warning("Por favor, selecione um cooperado da lista (Carteira de Destino)");
            return;
        }

        if (
            inputFilterOriginAgencyWatch?.id &&
            inputFilterOriginPortfolioWatch?.id &&
            inputFilterDestinyAgencyWatch?.id &&
            inputFilterDestinyPortfolioWatch?.id
        ) {
            const isSameAgency = inputFilterOriginAgencyWatch.id === inputFilterDestinyAgencyWatch.id;
            const isSamePortfolio = inputFilterOriginPortfolioWatch.id === inputFilterDestinyPortfolioWatch.id;

            if (isSameAgency && isSamePortfolio) {
                toast.error(
                    "Os valores de Agência e Carteira de Origem são iguais aos de Destino. Por favor, selecione valores diferentes.",
                );
                return;
            }
        }

        const selectedRowDestiny = listClientsDestiny.find((row) => row.id === rowSelectionGridDestiny[0]);

        if (!selectedRowDestiny) {
            toast.error("Cooperado não encontrado!");
            return;
        }

        if (!inputFilterOriginAgencyWatch?.id || !inputFilterOriginPortfolioWatch?.id) {
            const isValidInputs = await triggerFilterOrigin();

            if (!isValidInputs) {
                toast.error("Por favor, preencha os campos necessários em 'Minha Carteira'.");
            } else {
                toast.error("Por favor, Preencha os campos: (PA e Carteira) em: (Minha Carteira)");
            }

            return;
        }

        if (selectedRowDestiny.agencia_id !== getValuesFilterDestiny("filter_destiny_agency.agency_sisbr_id")) {
            toast.error(
                "O cooperado selecionado pertence a uma PA (Ponto de Atendimento) diferente da PA escolhida no campo de entrada. Por favor, verifique a seleção e tente novamente ou faça uma nova pesquisa.",
            );
            return;
        }

        if (selectedRowDestiny.carteira_id !== getValuesFilterDestiny("filter_destiny_portfolio.id_ref")) {
            toast.error(
                "O cooperado selecionado pertence a uma carteira diferente da carteira escolhida no campo de entrada. Por favor, verifique a seleção e tente novamente ou faça uma nova pesquisa.",
            );
            return;
        }

        confirm({
            title: `Deseja continuar o cadastro com o cooperador e a carteira selecionado?`,
        })
            .then(async () => {
                try {
                    setLoadingButtonSubmit(true);

                    setValuePortfoliosMigration("type_migration", "Solicitar Cooperado");
                    setValuePortfoliosMigration("client_sisbr_id", selectedRowDestiny.id);
                    setValuePortfoliosMigration("client_name", selectedRowDestiny.cliente_nome);
                    setValuePortfoliosMigration("client_document", formatCnpjCpf(selectedRowDestiny.cliente_documento));
                    setValuePortfoliosMigration("client_profile", selectedRowDestiny.cliente_perfil);
                    setValuePortfoliosMigration("client_agency", getValuesFilterDestiny("filter_destiny_agency"));
                    setValuePortfoliosMigration("client_portfolio", getValuesFilterDestiny("filter_destiny_portfolio"));

                    setValuePortfoliosMigration("client_is_rural", {
                        id: selectedRowDestiny.e_rural,
                        label: selectedRowDestiny.e_rural ? "Sim" : "Não",
                    });

                    setValuePortfoliosMigration("new_client_agency", getValuesFilterOrigin("filter_origin_agency"));

                    setValuePortfoliosMigration(
                        "new_client_portfolio",
                        getValuesFilterOrigin("filter_origin_portfolio"),
                    );

                    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

                    toast.success(
                        "Cooperado e carteira selecionados com sucesso! Role a página para baixo para conferir os detalhes da migração.",
                    );
                    clearErrorsPortfoliosMigration();
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                } finally {
                    setLoadingButtonSubmit(false);
                }
            })
            .catch(() => {});
    };

    const onSubmitFilterExtClientsOrigin = async (params: FilterExtClientsOrigin) => {
        let refactorOrigin: any = {};

        if (params?.filter_origin_client_document) {
            if (params.filter_origin_client_document.length === 11) {
                const isValid = isValidCPF(params.filter_origin_client_document);
                if (!isValid) {
                    setErrorFilterOrigin("filter_origin_client_document", {
                        type: "manual",
                        message: "CPF inválido. Verifique os dados inseridos.",
                    });
                    toast.error("CPF inválido. Verifique os dados inseridos.");
                    return false;
                }
            } else if (params.filter_origin_client_document.length === 14) {
                const isValid = isValidCNPJ(params.filter_origin_client_document);
                if (!isValid) {
                    setErrorFilterOrigin("filter_origin_client_document", {
                        type: "manual",
                        message: "CNPJ inválido. Verifique os dados inseridos.",
                    });
                    toast.error("CNPJ inválido. Verifique os dados inseridos.");
                    return false;
                }
            } else {
                setErrorFilterOrigin("filter_origin_client_document", {
                    type: "manual",
                    message: "Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).",
                });
                toast.error("Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).");
                return false;
            }
        }

        if (params.filter_origin_client_name) {
            refactorOrigin = { ...refactorOrigin, cliente_nome: params?.filter_origin_client_name };
        }

        if (params.filter_origin_client_document) {
            refactorOrigin = { ...refactorOrigin, cliente_documento: params?.filter_origin_client_document };
        }

        if (params.filter_origin_agency) {
            refactorOrigin = { ...refactorOrigin, agencia_id: params.filter_origin_agency?.agency_sisbr_id };
        }

        if (params.filter_origin_portfolio) {
            refactorOrigin = { ...refactorOrigin, carteira_nome: params.filter_origin_portfolio?.label };
        }

        if (params.filter_origin_client_type) {
            refactorOrigin = { ...refactorOrigin, cliente_tipo: params.filter_origin_client_type?.id };
        }

        if (params.filter_origin_is_rural) {
            refactorOrigin = { ...refactorOrigin, e_rural: params.filter_origin_is_rural?.id };
        }

        if (params.filter_origin_current_account) {
            refactorOrigin = { ...refactorOrigin, cc_sitconta: params.filter_origin_current_account?.id };
        }

        try {
            setLoadingButtonDataGridOrigin(true);
            setLoadingDataGridOrigin(true);

            const result = await searchListExtClients({ ...refactorOrigin, filtro_agencia: false });
            setListClientsOrigin(result);

            toast.success("Filtro da listagem aplicado com sucesso!");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingDataGridOrigin(false);

            setTimeout(() => {
                setLoadingButtonDataGridOrigin(false);
            }, 1200);
        }
    };

    const onSubmitFilterExtClientsDestiny = async (params: FilterExtClientsDestiny) => {
        let refactorDestiny: any = {};

        if (params?.filter_destiny_client_document) {
            if (params.filter_destiny_client_document.length === 11) {
                const isValid = isValidCPF(params.filter_destiny_client_document);
                if (!isValid) {
                    setErrorFilterDestiny("filter_destiny_client_document", {
                        type: "manual",
                        message: "CPF inválido. Verifique os dados inseridos.",
                    });
                    toast.error("CPF inválido. Verifique os dados inseridos.");
                    return false;
                }
            } else if (params.filter_destiny_client_document.length === 14) {
                const isValid = isValidCNPJ(params.filter_destiny_client_document);
                if (!isValid) {
                    setErrorFilterDestiny("filter_destiny_client_document", {
                        type: "manual",
                        message: "CNPJ inválido. Verifique os dados inseridos.",
                    });
                    toast.error("CNPJ inválido. Verifique os dados inseridos.");
                    return false;
                }
            } else {
                setErrorFilterDestiny("filter_destiny_client_document", {
                    type: "manual",
                    message: "Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).",
                });
                toast.error("Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).");
                return false;
            }
        }

        if (params.filter_destiny_client_name) {
            refactorDestiny = { ...refactorDestiny, cliente_nome: params?.filter_destiny_client_name };
        }

        if (params.filter_destiny_client_document) {
            refactorDestiny = { ...refactorDestiny, cliente_documento: params?.filter_destiny_client_document };
        }

        if (params.filter_destiny_agency) {
            refactorDestiny = { ...refactorDestiny, agencia_id: params.filter_destiny_agency?.agency_sisbr_id };
        }

        if (params.filter_destiny_portfolio) {
            refactorDestiny = { ...refactorDestiny, carteira_nome: params.filter_destiny_portfolio?.label };
        }

        if (params.filter_destiny_client_type) {
            refactorDestiny = { ...refactorDestiny, cliente_tipo: params.filter_destiny_client_type?.id };
        }

        if (params.filter_destiny_is_rural) {
            refactorDestiny = { ...refactorDestiny, e_rural: params.filter_destiny_is_rural?.id };
        }

        if (params.filter_destiny_current_account) {
            refactorDestiny = { ...refactorDestiny, cc_sitconta: params.filter_destiny_current_account?.id };
        }

        try {
            setLoadingButtonDataGridDestiny(true);
            setLoadingDataGridDestiny(true);

            const result = await searchListExtClients({ ...refactorDestiny, filtro_agencia: false });
            setListClientsDestiny(result);

            toast.success("Filtro da listagem aplicado com sucesso!");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingDataGridDestiny(false);

            setTimeout(() => {
                setLoadingButtonDataGridDestiny(false);
            }, 1200);
        }
    };

    const onSubmitPortfoliosMigration = async (params: PortfoliosMigration) => {
        if (
            params.reason.label.toLowerCase() === "outros" &&
            (!params.observation || params.observation.trim().length === 0)
        ) {
            toast.error("Necessário escrever uma observação para o motivo 'Outros'");
            return;
        }

        const migration_type = JSON.parse(params.migration_type);

        const refactoring: any = {
            migration_type: migration_type === true ? "ENVIANDO" : "RECEBENDO",
            client_sisbr_id: params.client_sisbr_id,
            new_client_id_agency: params.new_client_agency.id,
            new_client_id_portfolio: params.new_client_portfolio.id_ref,
            new_client_portfolio_name: params.new_client_portfolio.label,
            reason: params.reason.label,
            observation: params?.observation ?? null,
        };

        try {
            setLoadingButtonSubmit(true);

            await createPortfoliosMigration({ ...refactoring });
            navigate("/gestao-carteirizacao/migracao-carteira");

            toast.success(`Registro de Migração de Carteira criado com sucesso!`);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingButtonSubmit(false);
        }
    };

    const setPermissionOptions = async () => {
        try {
            toggleStatusBackdrop();

            const dataUserPermission = await searchAllAccessPermissionGroup();
            setAccessPermission(dataUserPermission);

            const isGroupAuditorOrAdmin = dataUserPermission.some(
                (value) => value.group === "GROUP_AUDITOR_PORTFOLIOS_MANAGEMENT" || value.group === "GROUP_ADMIN",
            );

            if (isGroupAuditorOrAdmin) {
                setIsGroupManager(isGroupAuditorOrAdmin);
            }

            const isGroupManager = dataUserPermission.some(
                (value) => value.group === "GROUP_MANAGER_PORTFOLIOS_MANAGEMENT",
            );

            if (isGroupManager) {
                setIsGroupManager(isGroupManager);
            }

            return {
                isGroupAuditorOrAdmin,
                isGroupManager,
            };
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const setPortfoliosMigrationOptions = async (isGroupManager: boolean, isGroupAuditorOrAdmin: boolean) => {
        try {
            toggleStatusBackdrop();

            const dataAgencies = await searchAutocompleteAgencies({ with_agency_sisbr_id: true, is_active: true });

            if (user) {
                let autoCompleteAgenciesOrigin;

                if (isGroupAuditorOrAdmin) {
                    autoCompleteAgenciesOrigin = dataAgencies
                        .map(({ id, abbreviation, agency_sisbr_id }) => ({
                            id,
                            label: abbreviation,
                            agency_sisbr_id,
                        }))
                        .filter((value) => value.agency_sisbr_id !== 9999 && value.agency_sisbr_id !== 102);
                } else if (isGroupManager) {
                    autoCompleteAgenciesOrigin = dataAgencies
                        .map(({ id, abbreviation, agency_sisbr_id }) => ({
                            id,
                            label: abbreviation,
                            agency_sisbr_id,
                        }))
                        .filter((value) => value.id === user.id_agency);
                } else {
                    autoCompleteAgenciesOrigin = dataAgencies
                        .map(({ id, abbreviation, agency_sisbr_id }) => ({
                            id,
                            label: abbreviation,
                            agency_sisbr_id,
                        }))
                        .filter((value) => value.id === user.id_agency);
                }

                const autoCompleteAgenciesDestiny = dataAgencies
                    .map(({ id, abbreviation, agency_sisbr_id }) => ({
                        id,
                        label: abbreviation,
                        agency_sisbr_id,
                    }))
                    .filter((value) => value.agency_sisbr_id !== 9999);

                setListAgenciesOrigin(autoCompleteAgenciesOrigin);
                setListAgenciesDestiny(autoCompleteAgenciesDestiny);

                if (autoCompleteAgenciesOrigin && autoCompleteAgenciesOrigin.length > 0) {
                    const myAgency = autoCompleteAgenciesOrigin.filter((value) => value.id === user.id_agency);

                    if (myAgency.length > 0) {
                        setValueFilterOrigin("filter_origin_agency", {
                            id: autoCompleteAgenciesOrigin[0].id,
                            label: autoCompleteAgenciesOrigin[0].label,
                            agency_sisbr_id: autoCompleteAgenciesOrigin[0].agency_sisbr_id,
                        });
                    }
                }
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const searchPortfoliosOriginOfTheAgency = async (id_agency: number) => {
        try {
            setLoadingDataGridOrigin(true);

            const dataPortfolios = await searchAutoCompletePortfolios({
                id_agency,
                is_active: true,
                with_restrict_agency: false,
                has_id_ref: true,
                has_id_agency: true,
            });

            if (user) {
                let autoCompletePortfoliosOrigin;

                if (isGroupAuditorOrAdmin || isGroupManager) {
                    autoCompletePortfoliosOrigin = dataPortfolios.map(({ id, name, ref_id }) => ({
                        id,
                        label: name,
                        id_ref: ref_id,
                    }));
                } else {
                    autoCompletePortfoliosOrigin = dataPortfolios
                        .map(({ id, name, ref_id }) => ({
                            id,
                            label: name,
                            id_ref: ref_id,
                        }))
                        .filter((value) => value.id === user.id_portfolio);
                }

                if (autoCompletePortfoliosOrigin && autoCompletePortfoliosOrigin.length > 0 && user.id_portfolio) {
                    const myPortfolio = autoCompletePortfoliosOrigin.filter((value) => value.id === user.id_portfolio);

                    if (myPortfolio.length > 0) {
                        setValueFilterOrigin("filter_origin_portfolio", {
                            id: myPortfolio[0].id,
                            label: myPortfolio[0].label,
                            id_ref: myPortfolio[0].id_ref,
                        });
                    }
                }

                setListPortfoliosOrigin(autoCompletePortfoliosOrigin);

                return {
                    portfolios: autoCompletePortfoliosOrigin,
                };
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingDataGridOrigin(false);
        }
    };

    const searchPortfoliosDestinyOfTheAgency = async (id_agency: number) => {
        try {
            setLoadingDataGridOrigin(true);

            const dataPortfolios = await searchAutoCompletePortfolios({
                id_agency,
                is_active: true,
                with_restrict_agency: false,
                has_id_ref: true,
                has_id_agency: true,
            });

            const autoCompletePortfoliosDestiny = dataPortfolios.map(({ id, name, ref_id }) => {
                return {
                    id,
                    label: name,
                    id_ref: ref_id,
                };
            });

            setListPortfoliosDestiny(autoCompletePortfoliosDestiny);

            return {
                portfolios: autoCompletePortfoliosDestiny,
            };
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingDataGridOrigin(false);
        }
    };

    const handleRowSelectionChangeGridOrigin = (newSelectionOrigin: GridRowSelectionModel) => {
        if (newSelectionOrigin.length > 1) {
            if (newSelectionOrigin.length > 2) {
                toast.info("Selecione apenas um cooperado por vez!");
            } else {
                const lastSelected = newSelectionOrigin[newSelectionOrigin.length - 1];
                setRowSelectionGridOrigin([lastSelected]);
            }
        } else {
            setRowSelectionGridOrigin(newSelectionOrigin);
        }
    };

    const handleRowSelectionChangeGridDestiny = (newSelectionDestiny: GridRowSelectionModel) => {
        if (newSelectionDestiny.length > 1) {
            if (newSelectionDestiny.length > 2) {
                toast.info("Selecione apenas um cooperado por vez!");
            } else {
                const lastSelected = newSelectionDestiny[newSelectionDestiny.length - 1];
                setRowSelectionGridDestiny([lastSelected]);
            }
        } else {
            setRowSelectionGridDestiny(newSelectionDestiny);
        }
    };

    useEffect(() => {
        if (isMigrationTypeWatch === undefined || isConfirming) {
            return;
        }

        if (!initialValueSet) {
            setIsSendingFromMyPortfolio(JSON.parse(isMigrationTypeWatch));
            setInitialValueSet(true);
            return;
        }

        const isSending = JSON.parse(isMigrationTypeWatch);

        setIsConfirming(true);

        confirm({
            title: `Deseja realmente alterar o tipo de migração?`,
            description: `Será alterado para: (${isSending ? "Enviar cooperado" : "Solicitar cooperado"}) Ao confirmar a alteração, os campos previamente preenchidos serão resetados!`,
        })
            .then(() => {
                setIsSendingFromMyPortfolio(isSending);

                if (isSending) {
                    setRowSelectionGridDestiny([]);
                    setButtonArrowUp(true);
                    setButtonArrowDown(false);

                    resetFieldPortfoliosMigration("type_migration");
                    resetFieldPortfoliosMigration("client_sisbr_id");
                    resetFieldPortfoliosMigration("client_name");
                    resetFieldPortfoliosMigration("client_document");
                    resetFieldPortfoliosMigration("client_profile");
                    resetFieldPortfoliosMigration("client_agency");
                    resetFieldPortfoliosMigration("client_portfolio");
                    resetFieldPortfoliosMigration("new_client_agency");
                    resetFieldPortfoliosMigration("new_client_portfolio");
                } else {
                    setRowSelectionGridOrigin([]);
                    setButtonArrowUp(false);
                    setButtonArrowDown(true);

                    resetFieldPortfoliosMigration("type_migration");
                    resetFieldPortfoliosMigration("client_sisbr_id");
                    resetFieldPortfoliosMigration("client_name");
                    resetFieldPortfoliosMigration("client_document");
                    resetFieldPortfoliosMigration("client_profile");
                    resetFieldPortfoliosMigration("client_agency");
                    resetFieldPortfoliosMigration("client_portfolio");
                    resetFieldPortfoliosMigration("new_client_agency");
                    resetFieldPortfoliosMigration("new_client_portfolio");
                }

                toast.info("Tipo de migração da carteira alterada com sucesso!");
            })
            .catch(() => {
                setValuePortfoliosMigration("migration_type", isSending ? "false" : "true");
            })
            .finally(() => {
                setIsConfirming(false);
            });
    }, [isMigrationTypeWatch]);

    useEffect(() => {
        async function execute() {
            if (!Object.keys(listAgenciesOrigin).length || Object.keys(listPortfoliosOrigin).length) {
                resetFieldFilterOrigin("filter_origin_portfolio");
                setListPortfoliosOrigin([]);
            }

            if (inputFilterOriginAgencyWatch) {
                await searchPortfoliosOriginOfTheAgency(inputFilterOriginAgencyWatch.id);
            }
        }

        execute();
    }, [inputFilterOriginAgencyWatch]);

    useEffect(() => {
        async function execute() {
            if (!Object.keys(listAgenciesDestiny).length || Object.keys(listPortfoliosDestiny).length) {
                resetFieldFilterDestiny("filter_destiny_portfolio");
                setListPortfoliosDestiny([]);
            }

            if (inputFilterDestinyAgencyWatch) {
                await searchPortfoliosDestinyOfTheAgency(inputFilterDestinyAgencyWatch.id);
            }
        }
        execute();
    }, [inputFilterDestinyAgencyWatch]);

    useEffect(() => {
        async function execute() {
            setLoadingButtonSubmit(true);

            const dataPermission = await setPermissionOptions();

            if (dataPermission) {
                await setPortfoliosMigrationOptions(
                    dataPermission.isGroupManager,
                    dataPermission.isGroupAuditorOrAdmin,
                );
            }

            setLoadingButtonSubmit(false);
        }

        execute();
    }, []);

    const CustomToolbarOrigin = () => {
        return (
            <GridToolbarContainer>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        mt: -1,
                    }}>
                    <Box sx={{ p: 1, display: device === "Mobile" ? "none" : "flex", alignItems: "center" }}>
                        <GridToolbarFilterButton />
                        <GridToolbarDensitySelector />
                    </Box>

                    <Box sx={{ p: 1, display: "flex", justifyContent: "end" }}>
                        <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
                    </Box>
                </Box>
            </GridToolbarContainer>
        );
    };

    const CustomToolbarDestiny = () => {
        return (
            <GridToolbarContainer>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        mt: -1,
                    }}>
                    <Box sx={{ p: 1, display: device === "Mobile" ? "none" : "flex", alignItems: "center" }}>
                        <GridToolbarFilterButton />
                        <GridToolbarDensitySelector />
                    </Box>

                    <Box sx={{ p: 1, display: "flex", justifyContent: "end" }}>
                        <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
                    </Box>
                </Box>
            </GridToolbarContainer>
        );
    };

    const columnsOrigin: GridColDef[] = [
        {
            field: "Opções",
            width: 70,
            align: "center",
            headerAlign: "center",
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (cellValues) => {
                return (
                    <Stack direction='row' spacing={1}>
                        <IconButton
                            onClick={(event) => {
                                event.stopPropagation();
                                handleOpenModalClient();
                                setIdExtClient(cellValues.row.id);
                            }}
                            color='success'
                            title='Visualizar Dados do Cooperado'
                            aria-label='Visualizar Cooperado'>
                            <AccountCircleOutlinedIcon />
                        </IconButton>
                    </Stack>
                );
            },
        },
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
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatCnpjCpf(value)}</Typography>;
            },
        },
        {
            field: "agencia_id",
            headerName: "PA",
            headerAlign: "center",
            align: "center",
            width: 60,
        },
        {
            field: "carteira_nome",
            headerName: "Carteira",
            minWidth: 165,
        },
        {
            field: "cliente_perfil",
            headerName: "Perfil",
            minWidth: 120,
        },
        {
            field: "cliente_tipo",
            headerName: "Tipo Documento",
            align: "center",
            width: 125,
        },
        {
            field: "e_rural",
            headerName: "É Rural",
            align: "center",
            headerAlign: "center",
            width: 70,
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "🌱 Sim" : "      Não"}</Typography>;
            },
        },
        {
            headerAlign: "center",
            field: "e_cooperado",
            headerName: "É Cooperado",
            align: "center",
            width: 110,
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "💚 Sim" : "🟠 Não"}</Typography>;
            },
        },
        {
            headerAlign: "center",
            field: "cc_sitconta",
            headerName: "Situação Conta Corrente",
            align: "center",
            width: 175,
            renderCell: ({ value }: any) => {
                return <Typography>{mapValueCurrentAccount(value)}</Typography>;
            },
        },
    ];

    const columnsDestiny: GridColDef[] = [
        {
            field: "id",
            headerName: "ID",
            width: 100,
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
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatCnpjCpf(value)}</Typography>;
            },
        },
        {
            field: "agencia_id",
            headerName: "PA",
            headerAlign: "center",
            align: "center",
            width: 60,
        },
        {
            field: "carteira_nome",
            headerName: "Carteira",
            minWidth: 165,
        },
        {
            field: "cliente_perfil",
            headerName: "Perfil",
            minWidth: 120,
        },
        {
            field: "cliente_tipo",
            headerName: "Tipo Documento",
            align: "center",
            width: 125,
        },
        {
            field: "e_rural",
            headerName: "É Rural",
            align: "center",
            headerAlign: "center",
            width: 70,
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "🌱 Sim" : "      Não"}</Typography>;
            },
        },
        {
            headerAlign: "center",
            field: "e_cooperado",
            headerName: "É Cooperado",
            align: "center",
            width: 110,
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "💚 Sim" : "🟠 Não"}</Typography>;
            },
        },
        {
            headerAlign: "center",
            field: "cc_sitconta",
            headerName: "Situação Conta Corrente",
            align: "center",
            width: 175,
            renderCell: ({ value }: any) => {
                return <Typography>{mapValueCurrentAccount(value)}</Typography>;
            },
        },
    ];

    return (
        <Grid item {...props}>
            <Grid container mt={idPortfoliosMigration ? -6 : 0}>
                <Grid item xs={12} md={12} mt={1} mb={1}>
                    <FormRadioGroup
                        row
                        name='migration_type'
                        label='Tipo da migração:'
                        control={controlPortfoliosMigration}
                        errors={errorsPortfoliosMigration}
                        options={[
                            { label: "Enviar cooperado", value: true },
                            { label: "Solicitar cooperado", value: false },
                        ]}
                    />
                </Grid>

                <Grid
                    container
                    padding={2}
                    sx={{
                        border: isSendingFromMyPortfolio ? `1px solid #009688` : `1px dashed ${colorBorderSystem}`,
                        boxShadow: isSendingFromMyPortfolio ? "0 0 7px 1px #0096876f" : "none",
                        borderRadius: 4,
                    }}>
                    <Grid item xs={12} md={12} mb={2}>
                        <Chip
                            avatar={<Avatar alt='Foto Perfil' src={user?.url_image_profile || facezinha_sicoob} />}
                            label='Minha Carteira:'
                            variant='outlined'
                            color='success'
                        />
                    </Grid>

                    <Box
                        component='form'
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                        }}>
                        <Grid container spacing={1}>
                            <Grid item xs={6} sm={6} md={2}>
                                <FormAutocomplete
                                    fullWidth
                                    name='filter_origin_agency'
                                    label='PA'
                                    variant='outlined'
                                    size='small'
                                    required
                                    control={controlFilterOrigin}
                                    errors={errorsFilterOrigin}
                                    options={listAgenciesOrigin.map(({ id, label, agency_sisbr_id }) => {
                                        return { id, label, agency_sisbr_id };
                                    })}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": {
                                                border: "1px dashed #009688",
                                            },
                                            "&:not(.Mui-disabled):hover fieldset": {
                                                borderColor: "#08c9b5",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "1px dashed #009688",
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6} sm={6} md={2}>
                                <FormAutocomplete
                                    fullWidth
                                    name='filter_origin_portfolio'
                                    label='Carteira'
                                    variant='outlined'
                                    size='small'
                                    required
                                    disabledAutocomplete={!inputFilterOriginAgencyWatch ? true : false}
                                    disableClearable
                                    control={controlFilterOrigin}
                                    errors={errorsFilterOrigin}
                                    options={listPortfoliosOrigin}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": {
                                                border: "1px dashed #009688",
                                            },
                                            "&:not(.Mui-disabled):hover fieldset": {
                                                borderColor: "#08c9b5",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "1px dashed #009688",
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={1.8}>
                                <FormInput
                                    fullWidth
                                    name='filter_origin_client_name'
                                    label='Nome Cooperado'
                                    variant='outlined'
                                    size='small'
                                    control={controlFilterOrigin}
                                    errors={errorsFilterOrigin}
                                    inputProps={{
                                        style: { textTransform: "uppercase" },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={1.6}>
                                <FormInputCpfCnpj
                                    fullWidth
                                    name='filter_origin_client_document'
                                    label='CPF ou CNPJ'
                                    placeholder='Digite um CPF ou CNPJ'
                                    size='small'
                                    control={controlFilterOrigin}
                                    errors={errorsFilterOrigin}
                                />
                            </Grid>

                            <Grid item xs={3} sm={4} md={0.9}>
                                <FormAutocomplete
                                    fullWidth
                                    name='filter_origin_client_type'
                                    label='Tipo'
                                    variant='outlined'
                                    size='small'
                                    control={controlFilterOrigin}
                                    errors={errorsFilterOrigin}
                                    options={ArrayTypesDocumentClient}
                                />
                            </Grid>

                            <Grid item xs={4} sm={4} md={1}>
                                <FormAutocomplete
                                    fullWidth
                                    name='filter_origin_is_rural'
                                    label='É Rural'
                                    variant='outlined'
                                    size='small'
                                    control={controlFilterOrigin}
                                    errors={errorsFilterOrigin}
                                    options={arrayNoAndYes}
                                />
                            </Grid>

                            <Grid item xs={5} sm={4} md={1.3}>
                                <FormAutocomplete
                                    fullWidth
                                    name='filter_origin_current_account'
                                    label='Conta Corrente'
                                    variant='outlined'
                                    size='small'
                                    control={controlFilterOrigin}
                                    errors={errorsFilterOrigin}
                                    options={ArrayTypeStatusCurrentAccountClient}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={1.4}>
                                <LoadingButton
                                    fullWidth
                                    type='submit'
                                    color='primary'
                                    loadingPosition='start'
                                    size='medium'
                                    variant='contained'
                                    startIcon={<SearchIcon />}
                                    loading={loadingButtonDataGridOrigin}
                                    onClick={handleSubmitFilterOrigin((params) =>
                                        onSubmitFilterExtClientsOrigin(params),
                                    )}
                                    sx={{ height: 39, borderRadius: "8px", boxShadow: "none" }}>
                                    Pesquisar
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </Box>

                    <Grid item xs={12} md={12} mt={1.5}>
                        <DataGrid
                            autoHeight
                            getRowId={(row) => row.id}
                            checkboxSelection={buttonArrowUp}
                            onRowSelectionModelChange={handleRowSelectionChangeGridOrigin}
                            rowSelectionModel={rowSelectionGridOrigin}
                            rows={listClientsOrigin}
                            columns={columnsOrigin}
                            density='compact'
                            localeText={dataGridLocaleTextTranslateFull}
                            loading={loadingDataGridOrigin}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 5,
                                    },
                                },
                            }}
                            slots={{
                                toolbar: CustomToolbarOrigin,
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
                                        backgroundColor: theme === "light" ? "#ffffff" : "#1F3D44",
                                    },
                                },
                            }}
                            pageSizeOptions={[5, 10]}
                            sx={getDataGridStyles(colorBorderSystem, colorScrollSystem)}
                            disableColumnMenu={true}
                            disableColumnFilter={true}
                        />
                    </Grid>
                </Grid>

                <Grid container justifyContent='center' mt={2.5} mb={2.5} gap={1}>
                    <Tooltip title='Enviar da minha carteira para carteira de destino →' placement='left'>
                        <span>
                            <IconButton
                                onClick={() => saveDataClientOrigin()}
                                size={"large"}
                                disabled={buttonArrowDown}
                                sx={{
                                    border: !buttonArrowDown ? `1px solid #7DB61C` : `1px solid ${colorBorderSystem}`,
                                    boxShadow: !buttonArrowDown ? "0 0 7px 1px #7eb61cc7" : "none",
                                }}>
                                <KeyboardDoubleArrowDownOutlinedIcon
                                    color={!buttonArrowDown ? "success" : "disabled"}
                                    sx={{ width: "2.5rem", height: "2.5rem" }}
                                />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title='← Solicitar da carteira de destino para a minha carteira' placement='right'>
                        <span>
                            <IconButton
                                onClick={() => saveDataClientDestiny()}
                                size={"large"}
                                disabled={buttonArrowUp}
                                sx={{
                                    border: !buttonArrowUp ? `1px solid #7DB61C` : `1px solid ${colorBorderSystem}`,
                                    boxShadow: !buttonArrowUp ? "0 0 7px 1px #7eb61cc7" : "none",
                                }}>
                                <KeyboardDoubleArrowUpOutlinedIcon
                                    color={!buttonArrowUp ? "success" : "disabled"}
                                    sx={{ width: "2.5rem", height: "2.5rem" }}
                                />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>

                <Grid
                    container
                    padding={2}
                    sx={{
                        border: !isSendingFromMyPortfolio ? `1px solid #009688` : `1px dashed ${colorBorderSystem}`,
                        boxShadow: !isSendingFromMyPortfolio ? "0 0 7px 1px #0096876f" : "none",
                        borderRadius: 4,
                    }}>
                    <Grid item xs={12} md={12} mb={2}>
                        <Chip
                            icon={<WalletOutlinedIcon />}
                            label={!isSendingFromMyPortfolio ? "Carteira de Origem" : "Carteira de Destino:"}
                            variant='outlined'
                            color='primary'
                        />
                    </Grid>

                    <Box
                        component='form'
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                        }}>
                        <Grid container spacing={1}>
                            <Grid item xs={6} sm={6} md={2}>
                                <FormAutocomplete
                                    fullWidth
                                    name='filter_destiny_agency'
                                    label='PA'
                                    variant='outlined'
                                    size='small'
                                    required
                                    control={controlFilterDestiny}
                                    errors={errorsFilterDestiny}
                                    options={listAgenciesDestiny.map(({ id, label, agency_sisbr_id }) => {
                                        return { id, label, agency_sisbr_id };
                                    })}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": {
                                                border: "1px dashed #009688",
                                            },
                                            "&:not(.Mui-disabled):hover fieldset": {
                                                borderColor: "#08c9b5",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "1px dashed #009688",
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6} sm={6} md={2}>
                                <FormAutocomplete
                                    fullWidth
                                    name='filter_destiny_portfolio'
                                    label='Carteira'
                                    variant='outlined'
                                    size='small'
                                    required
                                    disabledAutocomplete={!inputFilterDestinyAgencyWatch ? true : false}
                                    disableClearable
                                    control={controlFilterDestiny}
                                    errors={errorsFilterDestiny}
                                    options={listPortfoliosDestiny}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": {
                                                border: "1px dashed #009688",
                                            },
                                            "&:not(.Mui-disabled):hover fieldset": {
                                                borderColor: "#08c9b5",
                                            },
                                            "&.Mui-focused fieldset": {
                                                border: "1px dashed #009688",
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={1.8}>
                                <FormInput
                                    fullWidth
                                    name='filter_destiny_client_name'
                                    label='Nome Cooperado'
                                    variant='outlined'
                                    size='small'
                                    control={controlFilterDestiny}
                                    errors={errorsFilterDestiny}
                                    inputProps={{
                                        style: { textTransform: "uppercase" },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={1.6}>
                                <FormInputCpfCnpj
                                    fullWidth
                                    name='filter_destiny_client_document'
                                    label='CPF ou CNPJ'
                                    placeholder='Digite um CPF ou CNPJ'
                                    size='small'
                                    control={controlFilterDestiny}
                                    errors={errorsFilterDestiny}
                                />
                            </Grid>

                            <Grid item xs={3} sm={4} md={0.9}>
                                <FormAutocomplete
                                    fullWidth
                                    name='filter_destiny_client_type'
                                    label='Tipo'
                                    variant='outlined'
                                    size='small'
                                    control={controlFilterDestiny}
                                    errors={errorsFilterDestiny}
                                    options={ArrayTypesDocumentClient}
                                />
                            </Grid>

                            <Grid item xs={4} sm={4} md={1}>
                                <FormAutocomplete
                                    fullWidth
                                    name='filter_destiny_is_rural'
                                    label='É Rural'
                                    variant='outlined'
                                    size='small'
                                    control={controlFilterDestiny}
                                    errors={errorsFilterDestiny}
                                    options={arrayNoAndYes}
                                />
                            </Grid>

                            <Grid item xs={5} sm={4} md={1.3}>
                                <FormAutocomplete
                                    fullWidth
                                    name='filter_destiny_current_account'
                                    label='Conta Corrente'
                                    variant='outlined'
                                    size='small'
                                    control={controlFilterDestiny}
                                    errors={errorsFilterDestiny}
                                    options={ArrayTypeStatusCurrentAccountClient}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={1.4}>
                                <LoadingButton
                                    fullWidth
                                    type='submit'
                                    color='primary'
                                    loadingPosition='start'
                                    size='medium'
                                    variant='contained'
                                    startIcon={<SearchIcon />}
                                    loading={loadingButtonDataGridDestiny}
                                    onClick={handleSubmitFilterDestiny((params) =>
                                        onSubmitFilterExtClientsDestiny(params),
                                    )}
                                    sx={{ height: 39, borderRadius: "8px", boxShadow: "none" }}>
                                    Pesquisar
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </Box>

                    <Grid item xs={12} md={12} mt={1.5}>
                        <DataGrid
                            autoHeight
                            getRowId={(row) => row.id}
                            checkboxSelection={buttonArrowDown}
                            onRowSelectionModelChange={handleRowSelectionChangeGridDestiny}
                            rowSelectionModel={rowSelectionGridDestiny}
                            rows={listClientsDestiny}
                            columns={columnsDestiny}
                            density='compact'
                            localeText={dataGridLocaleTextTranslateFull}
                            loading={loadingDataGridDestiny}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 5,
                                    },
                                },
                            }}
                            slots={{
                                toolbar: CustomToolbarDestiny,
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
                                        backgroundColor: theme === "light" ? "#ffffff" : "#1F3D44",
                                    },
                                },
                            }}
                            pageSizeOptions={[5, 10]}
                            sx={getDataGridStyles(colorBorderSystem, colorScrollSystem)}
                            disableColumnMenu={true}
                            disableColumnFilter={true}
                        />
                    </Grid>
                </Grid>

                <Grid item xs={12} md={12} mt={4} mb={2.5}>
                    <Divider>
                        <Chip label='Dados da migração' size='medium' color='primary' />
                    </Divider>
                </Grid>

                <Grid
                    container
                    padding={2}
                    mt={1}
                    gap={2}
                    sx={{
                        border: `1px dashed ${colorBorderSystem}`,
                        borderRadius: 4,
                    }}>
                    <Grid item xs={12} md={12}>
                        <Typography fontSize={14} fontWeight={700}>
                            Tipo da migração:
                        </Typography>
                    </Grid>

                    <Grid item xs sm md={4}>
                        <FormInput
                            fullWidth
                            label='Tipo da migração'
                            name='type_migration'
                            variant='outlined'
                            disabled
                            control={controlPortfoliosMigration}
                            errors={errorsPortfoliosMigration}
                            inputProps={{
                                style: { textTransform: "uppercase" },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <Typography fontSize={14} fontWeight={700} mb={0.5}>
                            Carteira Origem:
                        </Typography>
                    </Grid>

                    <Grid container xs={12} md={12} gap={2}>
                        <Grid item xs={12} sm={12} md={isSendingFromMyPortfolio ? 1.4 : 1.7}>
                            {isSendingFromMyPortfolio ? (
                                <Chip
                                    avatar={
                                        <Avatar alt='Foto Perfil' src={user?.url_image_profile || facezinha_sicoob} />
                                    }
                                    label='Minha Carteira:'
                                    variant='outlined'
                                    color='success'
                                    sx={{ mt: 1.5 }}
                                />
                            ) : (
                                <Chip
                                    icon={<WalletOutlinedIcon />}
                                    label={!isSendingFromMyPortfolio ? "Carteira de Origem" : "Carteira de Destino:"}
                                    variant='outlined'
                                    color='primary'
                                    sx={{ mt: 1.5 }}
                                />
                            )}
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <FormInput
                                fullWidth
                                name='client_name'
                                label='Nome Cooperado'
                                variant='outlined'
                                disabled
                                control={controlPortfoliosMigration}
                                errors={errorsPortfoliosMigration}
                                inputProps={{
                                    style: { textTransform: "uppercase" },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm md>
                            <FormInput
                                fullWidth
                                name='client_document'
                                label='CPF/CNPJ do Cooperado'
                                variant='outlined'
                                disabled
                                control={controlPortfoliosMigration}
                                errors={errorsPortfoliosMigration}
                                inputProps={{
                                    style: { textTransform: "uppercase" },
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Grid container xs={12} md={12} gap={2}>
                        <Grid item xs={12} sm={2} md={2}>
                            <FormInput
                                fullWidth
                                label='ID'
                                name='client_sisbr_id'
                                type='number'
                                variant='outlined'
                                disabled
                                control={controlPortfoliosMigration}
                                errors={errorsPortfoliosMigration}
                            />
                        </Grid>

                        <Grid item xs={12} sm={7} md={7}>
                            <FormInput
                                fullWidth
                                name='client_profile'
                                label='Perfil'
                                variant='outlined'
                                disabled
                                control={controlPortfoliosMigration}
                                errors={errorsPortfoliosMigration}
                                inputProps={{
                                    style: { textTransform: "uppercase" },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm md>
                            <FormAutocomplete
                                fullWidth
                                name='client_is_rural'
                                label='É Rural'
                                variant={"outlined"}
                                disabledAutocomplete
                                disabled
                                control={controlPortfoliosMigration}
                                errors={errorsPortfoliosMigration}
                                options={arrayNoAndYes}
                            />
                        </Grid>
                    </Grid>

                    <Grid item xs={12} sm={6} md={6}>
                        <FormAutocomplete
                            fullWidth
                            name='client_agency'
                            label='PA Cooperado'
                            variant='outlined'
                            disabled
                            disabledAutocomplete
                            control={controlPortfoliosMigration}
                            errors={errorsPortfoliosMigration}
                            options={[]}
                        />
                    </Grid>

                    <Grid item xs={12} sm md>
                        <FormAutocomplete
                            fullWidth
                            name='client_portfolio'
                            label='Carteira Cooperado'
                            variant='outlined'
                            disabled
                            disabledAutocomplete
                            control={controlPortfoliosMigration}
                            errors={errorsPortfoliosMigration}
                            options={[]}
                        />
                    </Grid>

                    <Grid container justifyContent='center' gap={1} mt={0.5} ml={1.75}>
                        <ArrowDownwardOutlinedIcon
                            color='warning'
                            sx={{
                                width: "2.5rem",
                                height: "2.5rem",
                                animation: `${moveUpDown} 1.2s ease-in-out infinite`,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={12} mt={-6}>
                        <Typography fontSize={14} fontWeight={700} mt={3}>
                            Carteira Destino:
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={12} md={isSendingFromMyPortfolio ? 1.4 : 1.7}>
                        {!isSendingFromMyPortfolio ? (
                            <Chip
                                avatar={<Avatar alt='Foto Perfil' src={user?.url_image_profile || facezinha_sicoob} />}
                                label='Minha Carteira:'
                                variant='outlined'
                                color='success'
                                sx={{ mt: 1.5 }}
                            />
                        ) : (
                            <Chip
                                icon={<WalletOutlinedIcon />}
                                label='Carteira de Destino:'
                                variant='outlined'
                                color='primary'
                                sx={{ mt: 1.5 }}
                            />
                        )}
                    </Grid>

                    <Grid item xs={12} sm={6} md={6}>
                        <FormAutocomplete
                            fullWidth
                            name='new_client_agency'
                            label='PA Destino'
                            variant='outlined'
                            disabled
                            disabledAutocomplete
                            control={controlPortfoliosMigration}
                            errors={errorsPortfoliosMigration}
                            options={[]}
                        />
                    </Grid>

                    <Grid item xs={12} sm md>
                        <FormAutocomplete
                            fullWidth
                            name='new_client_portfolio'
                            label='Carteira Destino'
                            variant='outlined'
                            disabled
                            disabledAutocomplete
                            control={controlPortfoliosMigration}
                            errors={errorsPortfoliosMigration}
                            options={[]}
                        />
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <Typography fontSize={14} fontWeight={700} mb={0.5} mt={0.5}>
                            Motivo:
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <FormAutocomplete
                            fullWidth
                            name='reason'
                            label='Motivo'
                            variant='filled'
                            control={controlPortfoliosMigration}
                            errors={errorsPortfoliosMigration}
                            options={ArrayTypesReasonPortfoliosMigration}
                        />
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <FormInput
                            fullWidth
                            multiline
                            rows={4}
                            placeholder='Escreva sua observação aqui...'
                            name='observation'
                            type='text'
                            variant='filled'
                            control={controlPortfoliosMigration}
                            errors={errorsPortfoliosMigration}
                        />
                    </Grid>
                </Grid>

                <div ref={scrollBottomRef} />

                <Grid container justifyContent='center' mt={3} gap={1}>
                    <Grid>
                        <LoadingButton
                            size='large'
                            color='success'
                            variant='contained'
                            startIcon={<Icon>save</Icon>}
                            loading={loadingButtonSubmit}
                            sx={{ borderRadius: "8px", boxShadow: "none" }}
                            onClick={async () => {
                                await confirm({
                                    title: (
                                        <Typography fontWeight={500} fontSize={17}>
                                            Confirmação de Cadastro:
                                        </Typography>
                                    ),
                                    description: (
                                        <>
                                            <Typography component='span' fontSize={16}>
                                                Tem certeza de que deseja continuar com o cadastro desta migração?{" "}
                                                <br /> Todos os dados serão salvos e não poderão ser alterados após a
                                                submissão.
                                                <br />
                                            </Typography>
                                            <Typography component='span' mt={1} fontSize={16}>
                                                <br />O status da migração será alterado para: <br />
                                                (🟡 Pendente de Auditoria) e (🟠 Aguardando avaliação de um gestor de
                                                PA)
                                            </Typography>
                                        </>
                                    ),
                                })
                                    .then(() =>
                                        handleSubmitPortfoliosMigration((params) =>
                                            onSubmitPortfoliosMigration(params),
                                        )(),
                                    )
                                    .catch(() => {});
                            }}>
                            {!idPortfoliosMigration ? "Cadastrar Migração" : "Editar Migração"}
                        </LoadingButton>
                    </Grid>
                </Grid>
            </Grid>
            <TemporaryDrawer
                title='Dados do Cooperado'
                closeButton={handleOpenModalClient}
                open={openModalClient}
                ModalProps={{
                    BackdropProps: { style: { backgroundColor: "transparent" } },
                }}
                sx={{
                    "& .MuiDrawer-paperAnchorRight": {
                        width: device === "Mobile" ? "100%" : "75%",
                    },
                    "& .MuiDrawer-paper": {
                        background: theme === "light" ? "#ffffffae" : "linear-gradient(135deg, #051b1f, #0c2e33)",
                        borderLeft: `1px solid ${colorBorderSystem}`,
                        backdropFilter: "blur(30px)",
                        backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                        backgroundRepeat: "no-repeat, no-repeat",
                        backgroundSize: "50%, 50%",
                        backgroundPosition: "right top, left bottom",
                    },
                }}>
                <Box>
                    <ExtClientInfo idExtClient={idExtClient} p={3} />
                </Box>
            </TemporaryDrawer>
        </Grid>
    );
}
