import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import {
    Grid,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Icon,
    IconButton,
    Chip,
    Tooltip,
    Alert,
    Collapse,
    CardActionArea,
    Stack,
} from "@mui/material";
import { Box } from "@mui/system";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { GridProps } from "@mui/material";
import backGroundImageCard from "@/assets//images/report/report-bg-dashboard.jpg";
import FormRadioGroup from "@/components/FormComponents/FormRadioGroup";
import FormInput from "@/components/FormComponents/FormInput";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormSwitchGroup from "@/components/FormComponents/FormSwitchGroup";
import AppsIcon from "@mui/icons-material/Apps";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import PlaylistAddCircleOutlinedIcon from "@mui/icons-material/PlaylistAddCircleOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
    createReportsCatalog,
    ReportsCatalogProps,
    searchOneReportsCatalogByID,
    updateReportsCatalog,
} from "@/services/reports";
import { DataGrid, GridColDef, GridPagination, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useConfirm } from "material-ui-confirm";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { IAutocompleteSector, searchAutocompleteSector } from "@/services/sectors";
import { ITeamAutocomplete, searchTeamAutocomplete } from "@/services/teams";
import { ISearchAutoCompleteEmployee, searchAutoCompleteEmployees } from "@/services/employees";
import { IAgenciesAutocomplete, searchAutocompleteAgencies } from "@/services/agencies";
import { ArrayTypesVisibilityScope } from "@/constants/array-visibility-scope";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";

type AutoCompleteString = {
    id?: string | null;
    label?: string | null;
};

type AutoCompleteNumber = {
    id?: number | null;
    label?: string | null;
};

interface onSubmitAddOn {
    visibility_scope: AutoCompleteString | null;
    agencies: AutoCompleteNumber | null;
    sectors: AutoCompleteNumber | null;
    teams: AutoCompleteNumber | null;
    employees: AutoCompleteNumber | null;
}

export type CatalogProps = {
    card_type: string;
    card_order?: number | null;
    title: string;
    label_icon?: string | null;
    background_color: string;
    label_card?: string | null;
    label_bignumber?: string | null;
    description?: string | null;
    route?: string | null;
    link_card?: string | null;
    powerbi_height?: number | null;
    use_card_image: boolean;
    is_new: boolean;
    is_active: boolean;
    is_public: boolean;
};

export type CatalogIsPrivateProps = {
    visibility_scope: AutoCompleteString | null;
    agencies: AutoCompleteNumber | null;
    sectors: AutoCompleteNumber | null;
    teams: AutoCompleteNumber | null;
    employees: AutoCompleteNumber | null;
};

export type EditReportsCatalogProps = {
    card_type?: string;
    card_order?: number | null;
    title?: string;
    label_icon?: string | null;
    background_color?: string;
    label_card?: string | null;
    label_bignumber?: string | null;
    description?: string | null;
    route?: string | null;
    link_card?: string | null;
    powerbi_height?: number | null;
    use_card_image?: boolean;
    is_new?: boolean;
    is_active?: boolean;
    is_public?: boolean;
};

type RowsProps = {
    id: string;
    agencies?: string;
    id_agency?: number | null;
    sectors?: string;
    id_sector?: number | null;
    teams?: string;
    id_team?: number | null;
    employees?: string;
    id_employee?: number | null;
    granted_by_name?: string | null;
};

export type OptionSelecteds = {
    id_agency: string | undefined;
    id_sector: string | undefined;
    id_team: string | undefined;
    id_employee: string | undefined;
};

export type TypeSelected = "Agência" | "Setor" | "Time" | "Colaborador";

export type EditCatalogProps = {
    idReport?: number;
    updateColumn?: () => void;
} & GridProps;

const validationSchema = Yup.object().shape({
    card_type: Yup.string().required("Categoria do Card é obrigatório"),
    card_order: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .min(0, "O número deve ser no mínimo 1")
        .max(100, "O número deve ser no máximo 100")
        .nullable(),
    title: Yup.string().max(255, "Excedeu 255 caracteres").required("Título do Card é obrigatório"),
    label_icon: Yup.string().max(255, "Excedeu 255 caracteres").nullable(),
    background_color: Yup.string().max(255, "Excedeu 255 caracteres").required("Cor de Fundo do Card é obrigatório"),
    label_card: Yup.string().uppercase().max(40, "Excedeu 40 caracteres").nullable(),
    label_bignumber: Yup.string().max(20, "Excedeu 20 caracteres").nullable(),
    description: Yup.string().max(4000, "Excedeu 4000 caracteres").nullable(),
    route: Yup.string().max(255, "Excedeu 255 caracteres").nullable(),
    link_card: Yup.string()
        .nullable()
        .test("is-valid-url-or-empty", "O link deve começar com 'http://' ou 'https://'", (value) => {
            if (!value) return true;

            return /^(https?:\/\/)[^\s$.?#].[^\s]*$/.test(value);
        }),
    powerbi_height: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .min(400, "O número deve ser no mínimo 400")
        .max(2000, "O número deve ser no máximo 2000")
        .nullable(),
    use_card_image: Yup.boolean().required(),
    is_new: Yup.boolean().required(),
    is_active: Yup.boolean().required(),
    is_public: Yup.boolean().required(),
});

const validationSchemaIsPrivate = Yup.object().shape({
    visibility_scope: Yup.object()
        .shape({
            id: Yup.string().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    agencies: Yup.object()
        .shape({
            id: Yup.number().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    sectors: Yup.object()
        .shape({
            id: Yup.number().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    teams: Yup.object()
        .shape({
            id: Yup.number().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    employees: Yup.object()
        .shape({
            id: Yup.number().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
});

export function CatalogFields({ idReport, updateColumn, ...props }: EditCatalogProps) {
    const [loading, setLoading] = useState(false);
    const [loadingAddOn, setLoadingAddOn] = useState(false);
    const [cardHeight, setCardHeight] = useState<string>("70px");
    const [inputRoute, setInputRoute] = useState<boolean>();
    const [rows, setRows] = useState<RowsProps[]>([]);
    const [arrayAgencies, setArrayAgencies] = useState<IAgenciesAutocomplete[]>([]);
    const [arraySectors, setArraySectors] = useState<IAutocompleteSector[]>([]);
    const [arrayTeams, setArrayTeams] = useState<ITeamAutocomplete[]>([]);
    const [arrayEmployees, setArrayEmployees] = useState<ISearchAutoCompleteEmployee[]>([]);
    const [isChangingScope, setIsChangingScope] = useState(false);
    const [previousScope, setPreviousScope] = useState<AutoCompleteString | null>();

    const {
        getInfoError,
        toggleStatusBackdrop,
        colorBorderSystem,
        colorBackgroundSystem,
        colorBoxShadowSystem,
        colorScrollSystem,
        theme: themeContext,
        redBlur,
        cyanBlur,
    } = useGlobal();

    const { user } = useAuth();
    const confirm = useConfirm();

    const {
        handleSubmit,
        resetField,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm<CatalogProps>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            card_type: "DASHBOARD",
            is_active: true,
            is_public: true,
        },
    });

    const {
        handleSubmit: handleSubmitIsPrivate,
        resetField: resetFieldIsPrivate,
        reset: resetIsPrivate,
        setValue: setValueIsPrivate,
        watch: watchIsPrivate,
        setError: setErrorIsPrivate,
        control: controlIsPrivate,
        formState: { errors: errosIsPrivate },
    } = useForm<CatalogIsPrivateProps>({
        resolver: yupResolver(validationSchemaIsPrivate),
    });

    const cardTypeWatch = watch("card_type");
    const cardOrderWatch = watch("card_order");
    const cardTitleWatch = watch("title");
    const cardDescriptionWatch = watch("description");
    const cardLabelIconWatch = watch("label_icon");
    const cardLabelCardWatch = watch("label_card");
    const cardBackgroundColor = watch("background_color");
    const cardLabelBigNumberWatch = watch("label_bignumber");
    const cardLinkWatch = watch("link_card");
    const cardUseCardImagemWatch = watch("use_card_image");
    const cardIsNewWatch = watch("is_new");
    const cardIsActiveWatch = watch("is_active");
    const cardIsPublicWatch = watch("is_public");
    const visibilityScopeSelected = watchIsPrivate("visibility_scope");
    const agencySelected = watchIsPrivate("agencies");
    const sectorSelected = watchIsPrivate("sectors");
    const teamSelected = watchIsPrivate("teams");

    const onSubmitCatalog = async (params: CatalogProps) => {
        if (!idReport && params.card_type === "PAINEL") {
            toast.error(
                "A criação de Cards do tipo 'Painel' não é permitida, pois esses são gerados diretamente no código pelo desenvolvedor.",
            );

            return;
        }

        if (params.is_public === false) {
            if (!visibilityScopeSelected?.id || visibilityScopeSelected?.id.length === 0) {
                setErrorIsPrivate("visibility_scope", { message: "Obrigatório", type: "required" });

                toast.error(
                    "Para cards privados é obrigatório preencher o tipo da permissão e adicionar pelo menos uma regra!",
                );
                return;
            }

            if (!rows.length) {
                toast.warning("Nenhum registro de permissão para visualizar o card foi selecionado!");
                return;
            }
        }

        const getDefaultCardHeight = (cardType: string): string | null => {
            switch (cardType) {
                case "PAINEL":
                    return "70px";
                case "DASHBOARD":
                    return "160px";
                case "LINK_INTERNO":
                case "LINK_EXTERNO":
                    return "38px";
                default:
                    return null;
            }
        };

        let refactoring: ReportsCatalogProps = {
            card_type: params.card_type,
            card_height: getDefaultCardHeight(params.card_type),
            card_order: params.card_order ?? null,
            title: params.title,
            description: params?.description || null,
            label_icon: params.label_icon || null,
            background_color: params.background_color,
            label_card: params.label_card?.toUpperCase() || null,
            label_bignumber: params.label_bignumber || null,
            use_card_image: params.use_card_image,
            is_new: params.is_new,
            is_active: params.is_active,
            is_public: params.is_public,
            route: ["DASHBOARD", "LINK_EXTERNO"].includes(params.card_type) ? null : params.route,
            external_link: ["DASHBOARD", "LINK_INTERNO", "PAINEL"].includes(params.card_type) ? null : params.link_card,
            powerbi_link: ["LINK_INTERNO", "LINK_EXTERNO", "PAINEL"].includes(params.card_type)
                ? null
                : params.link_card,
            powerbi_height: params.powerbi_height ? String(`${params.powerbi_height}px`) : null,
            visibility_scope: !params.is_public ? visibilityScopeSelected?.id : "Todos",
        };

        if (visibilityScopeSelected?.id) {
            const mapRows: OptionSelecteds[] = rows.map((row) => ({
                id_agency: row.id_agency?.toString() ?? undefined,
                id_sector: row.id_sector?.toString() ?? undefined,
                id_team: row.id_team?.toString() ?? undefined,
                id_employee: row.id_employee?.toString() ?? undefined,
            }));

            refactoring = {
                ...refactoring,
                permission: mapRows ?? [],
            };
        }

        try {
            setLoading(true);

            if (idReport) {
                await updateReportsCatalog(idReport, refactoring);
            } else {
                await createReportsCatalog({
                    ...refactoring,
                });

                resetField("card_order");
                resetField("title");
                resetField("label_card");
                resetField("label_bignumber");
                resetField("description");
                setValue("is_new", false);
                setValue("is_public", true);
                resetField("route");
                resetField("link_card");
                resetIsPrivate();
                setRows([]);

                params.card_type === "LINK_INTERNO" && resetField("label_icon");

                if (params.card_type !== "DASHBOARD") {
                    resetField("powerbi_height");
                    setValue("use_card_image", false);
                } else {
                    setValue("powerbi_height", 800);
                }
            }

            updateColumn?.();
            toast.success(`Registro de Catálogo ${idReport ? "atualizado" : "criado"} com sucesso!`);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setValuesReportsCatalog = async (idReport: number) => {
        try {
            toggleStatusBackdrop();

            const {
                card_type,
                card_order,
                title,
                description,
                background_color,
                label_icon,
                label_card,
                label_bignumber,
                use_card_image,
                is_new,
                is_active,
                route,
                external_link,
                powerbi_link,
                powerbi_height,
                is_public,
                visibility_scope,
                permissions,
            } = await searchOneReportsCatalogByID(idReport);

            setValue("card_type", card_type);
            label_icon && setValue("label_icon", label_icon);
            card_order && setValue("card_order", card_order);
            setValue("title", title);
            setValue("background_color", background_color);
            label_card && setValue("label_card", label_card);
            label_bignumber && setValue("label_bignumber", label_bignumber);
            description && setValue("description", description);
            route && setValue("route", route);
            external_link && setValue("link_card", external_link);
            powerbi_height && setValue("powerbi_height", parseInt(powerbi_height.replace("px", ""), 10));
            powerbi_link && setValue("link_card", powerbi_link);
            setValue("use_card_image", use_card_image);
            setValue("is_new", is_new);
            setValue("is_active", is_active);
            setValue("is_public", is_public);
            if (visibility_scope) {
                visibility_scope !== "Todos" &&
                    setValueIsPrivate("visibility_scope", { id: visibility_scope, label: visibility_scope });

                visibility_scope !== "Todos" && setPreviousScope({ id: visibility_scope, label: visibility_scope });
            }

            if (permissions.length) {
                setRows(permissions);
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const searchAgency = async () => {
        try {
            const agency = await searchAutocompleteAgencies({ is_active: true });
            setArrayAgencies(agency);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchSectorsByIdAgency = async (id_agency: number) => {
        try {
            const sector = await searchAutocompleteSector({ is_active: true, id_agency });
            setArraySectors(sector);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchTeamsByIdSector = async (id_sector: number) => {
        try {
            const teams = await searchTeamAutocomplete({ is_active: true, id_sector });
            setArrayTeams(teams);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchEmployee = async () => {
        try {
            setLoadingAddOn(true);

            let params: any = {
                id_agency: agencySelected?.id,
                is_active: true,
            };

            if (sectorSelected) {
                params = { ...params, id_sector: sectorSelected.id };
            }

            if (teamSelected) {
                params = { ...params, id_team: teamSelected.id };
            }

            const employee = await searchAutoCompleteEmployees(params);

            setArrayEmployees(employee);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingAddOn(false);
        }
    };

    useEffect(() => {
        async function execute() {
            setLoadingAddOn(true);

            await searchAgency();

            setLoadingAddOn(false);
        }

        execute();
    }, []);

    useEffect(() => {
        async function execute() {
            resetFieldIsPrivate("sectors");
            setArraySectors([]);

            if (agencySelected) {
                setLoadingAddOn(true);
                await searchSectorsByIdAgency(Number(agencySelected?.id));
                setLoadingAddOn(false);
            }
        }

        (visibilityScopeSelected?.id === "Setor" ||
            visibilityScopeSelected?.id === "Time" ||
            visibilityScopeSelected?.id === "Colaborador") &&
            execute();
    }, [agencySelected]);

    useEffect(() => {
        async function execute() {
            resetFieldIsPrivate("teams");
            setArrayTeams([]);

            if (sectorSelected) {
                setLoadingAddOn(true);
                await searchTeamsByIdSector(Number(sectorSelected.id));
                setLoadingAddOn(false);
            }
        }

        (visibilityScopeSelected?.id === "Time" || visibilityScopeSelected?.id === "Colaborador") && execute();
    }, [sectorSelected]);

    useEffect(() => {
        async function execute() {
            resetFieldIsPrivate("employees");
            setArrayEmployees([]);

            if (agencySelected) {
                await searchEmployee();
            }
        }

        visibilityScopeSelected?.id === "Colaborador" && execute();
    }, [agencySelected, sectorSelected, teamSelected]);

    useEffect(() => {
        if (isChangingScope) return;

        if (visibilityScopeSelected?.id === previousScope?.id) {
            return;
        }

        if (!rows.length) {
            setRows([]);
            resetFieldIsPrivate("agencies");
            resetFieldIsPrivate("sectors");
            resetFieldIsPrivate("teams");
            resetFieldIsPrivate("employees");
        } else {
            setIsChangingScope(true);

            confirm({
                title: `Deseja realmente modificar o tipo de seleção?`,
                description: "As opções selecionadas na tabela serão removidas para adicionar os novos tipos.",
            })
                .then(() => {
                    setRows([]);
                    resetFieldIsPrivate("agencies");
                    resetFieldIsPrivate("sectors");
                    resetFieldIsPrivate("teams");
                    resetFieldIsPrivate("employees");
                    setPreviousScope(visibilityScopeSelected);
                })
                .catch(() => {
                    setValueIsPrivate("visibility_scope", { id: previousScope?.id, label: previousScope?.label });
                })
                .finally(() => {
                    setIsChangingScope(false);
                });
        }
    }, [visibilityScopeSelected]);

    useEffect(() => {
        if (idReport) {
            setValuesReportsCatalog(idReport);
        }
    }, [idReport]);

    useEffect(() => {
        if (cardTypeWatch === undefined) {
            return;
        }

        if (idReport) {
            if (cardTypeWatch === "DASHBOARD") {
                setCardHeight("160px");
                setInputRoute(true);
                setValue("label_icon", "poll");
            }

            if (cardTypeWatch === "LINK_EXTERNO") {
                setCardHeight("38px");
                setInputRoute(true);
                setValue("label_icon", "output");
            }

            if (cardTypeWatch === "LINK_INTERNO") {
                setCardHeight("38px");
                setInputRoute(false);
                setValue("label_icon", "output");
            }

            if (cardTypeWatch === "PAINEL") {
                setCardHeight("70px");
                setInputRoute(true);
            }
        } else {
            if (cardTypeWatch === "DASHBOARD") {
                setCardHeight("160px");
                setInputRoute(true);
                setValue("use_card_image", true);
                setValue("label_icon", "poll");
                setValue("route", "/relatorios/catalogo/dashboard/<id>");
                resetField("label_bignumber");
                setValue("powerbi_height", 800);
                setValue("background_color", "linear-gradient(to right, #009688, #025e70)");
            }

            if (cardTypeWatch === "LINK_EXTERNO") {
                setCardHeight("38px");
                setInputRoute(true);
                setValue("use_card_image", false);
                resetField("label_card");
                resetField("label_bignumber");
                resetField("route");
                setValue("label_icon", "output");
                setValue("background_color", "linear-gradient(to right, #7DB61C, #c9d200)");
            }

            if (cardTypeWatch === "LINK_INTERNO") {
                setCardHeight("38px");
                setInputRoute(false);
                setValue("use_card_image", false);
                resetField("label_card");
                resetField("label_icon");
                resetField("link_card");
                resetField("label_bignumber");
                resetField("route");
                setValue("background_color", "linear-gradient(to right, #009688, #025e70)");
            }

            if (cardTypeWatch === "PAINEL") {
                setCardHeight("70px");
                setInputRoute(true);
                setValue("use_card_image", false);
                resetField("label_card");
                resetField("label_icon");
                resetField("route");
                setValue("background_color", "linear-gradient(to right, #009688, #025e70)");
            }
        }
    }, [cardTypeWatch]);

    const isValid = (params: onSubmitAddOn) => {
        let valid = true;

        if (visibilityScopeSelected?.id === "Agência" && !params.agencies?.id) {
            setErrorIsPrivate("agencies", { message: "Obrigatório", type: "required" });
            valid = false;
        } else if (visibilityScopeSelected?.id === "Setor") {
            if (!params.agencies?.id) {
                setErrorIsPrivate("agencies", { message: "Obrigatório", type: "required" });
                valid = false;
            }

            if (!params.sectors?.id) {
                setErrorIsPrivate("sectors", { message: "Obrigatório", type: "required" });
                valid = false;
            }
        } else if (visibilityScopeSelected?.id === "Time") {
            if (!params.agencies?.id) {
                setErrorIsPrivate("agencies", { message: "Obrigatório", type: "required" });
                valid = false;
            }

            if (!params.sectors?.id) {
                setErrorIsPrivate("sectors", { message: "Obrigatório", type: "required" });
                valid = false;
            }

            if (!params.teams?.id) {
                setErrorIsPrivate("teams", { message: "Obrigatório", type: "required" });
                valid = false;
            }
        } else if (visibilityScopeSelected?.id === "Colaborador") {
            if (!params.agencies?.id) {
                setErrorIsPrivate("agencies", { message: "Obrigatório", type: "required" });
                valid = false;
            }

            if (!params.sectors?.id) {
                setErrorIsPrivate("sectors", { message: "Obrigatório", type: "required" });
                valid = false;
            }

            if (!params.employees?.id) {
                setErrorIsPrivate("employees", { message: "Obrigatório", type: "required" });
                valid = false;
            }
        }

        return valid;
    };

    const onAdd = async (params: onSubmitAddOn) => {
        try {
            !idReport || (!rows.length && setPreviousScope(visibilityScopeSelected));

            if (!isValid(params)) {
                return;
            }

            const data = {
                id: `${rows.length}-${uuidv4()}`,
                agencies: params?.agencies?.label || "-",
                id_agency: Number(params?.agencies?.id),
                sectors: params?.sectors?.label || "-",
                id_sector: Number(params?.sectors?.id),
                teams: params?.teams?.label || "-",
                id_team: Number(params?.teams?.id),
                employees: params?.employees?.label || "-",
                id_employee: Number(params?.employees?.id),
                granted_by_name: user?.name,
            };

            if (visibilityScopeSelected?.id === "Agência") {
                const exists = rows.find((item) => item.agencies === data.agencies);
                if (!exists) {
                    setRows((prev) => [
                        {
                            id: data.id,
                            agencies: data.agencies,
                            id_agency: data.id_agency,
                            sectors: "-",
                            id_sector: null,
                            teams: "-",
                            id_team: null,
                            employees: "-",
                            id_employee: null,
                            granted_by_name: data.granted_by_name,
                        },
                        ...prev,
                    ]);
                }

                resetFieldIsPrivate("agencies");
            } else if (visibilityScopeSelected?.id === "Setor") {
                const exists = rows.find((item) => item.sectors === data.sectors);
                if (!exists) {
                    setRows((prev) => [
                        {
                            id: data.id,
                            agencies: "-",
                            id_agency: null,
                            sectors: data.sectors,
                            id_sector: data.id_sector,
                            teams: "-",
                            id_team: null,
                            employees: "-",
                            id_employee: null,
                            granted_by_name: data.granted_by_name,
                        },
                        ...prev,
                    ]);
                }

                resetFieldIsPrivate("sectors");
            } else if (visibilityScopeSelected?.id === "Time") {
                const exists = rows.find((item) => item.teams === data.teams);
                if (!exists) {
                    setRows((prev) => [
                        {
                            id: data.id,
                            agencies: "-",
                            id_agency: null,
                            sectors: "-",
                            id_sector: null,
                            teams: data.teams,
                            id_team: data.id_team,
                            employees: "-",
                            id_employee: null,
                            granted_by_name: data.granted_by_name,
                        },
                        ...prev,
                    ]);
                }

                resetFieldIsPrivate("teams");
            } else if (visibilityScopeSelected?.id === "Colaborador") {
                const exists = rows.find((item) => item.employees === data.employees);
                if (!exists) {
                    setRows((prev) => [
                        {
                            id: data.id,
                            agencies: "-",
                            id_agency: null,
                            sectors: "-",
                            id_sector: null,
                            teams: "-",
                            id_team: null,
                            employees: data.employees,
                            id_employee: data.id_employee,
                            granted_by_name: data.granted_by_name,
                        },
                        ...prev,
                    ]);
                }

                resetFieldIsPrivate("employees");
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const handleRemove = (id: string) => {
        confirm({
            title: `Deseja realmente remover o registro? ID: ${id}`,
            description: "O registro será removido.",
        })
            .then(async () => {
                try {
                    setLoadingAddOn(true);

                    setRows(rows.filter((item) => item.id !== id));
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                } finally {
                    setLoadingAddOn(false);
                }
            })
            .catch(() => {});
    };

    const handleRemoveAll = () => {
        confirm({
            title: `Deseja realmente remover todos os registros?`,
            description: "Os registros serão removidos.",
        })
            .then(async () => {
                try {
                    setLoadingAddOn(true);

                    setRows([]);
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                } finally {
                    setLoadingAddOn(false);
                }
            })
            .catch(() => {});
    };

    function buttonDeleteRowsPermissions() {
        return (
            <Stack
                direction='row'
                spacing={1}
                alignItems='center'
                justifyContent='space-between'
                sx={{ width: "100%" }}>
                <Box>
                    <Tooltip title='Remover todos os registros da listagem'>
                        <span>
                            <IconButton
                                size='large'
                                color='error'
                                onClick={handleRemoveAll}
                                disabled={rows.length === 0}
                                sx={{ ml: 1.25 }}>
                                <DeleteSweepOutlinedIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
                <GridPagination />
            </Stack>
        );
    }

    const QuickSearchToolbar = () => {
        return (
            <GridToolbarContainer>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Box sx={{ p: 1, display: "flex", justifyContent: "start" }}>
                        <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
                    </Box>
                </Box>
            </GridToolbarContainer>
        );
    };

    const columns: GridColDef[] = [
        {
            field: "Opções",
            width: 60,
            renderCell: (cellValues) => {
                return (
                    <Stack direction='row' spacing={1}>
                        <IconButton
                            onClick={() => handleRemove(cellValues.row.id)}
                            color='error'
                            title='Excluir'
                            aria-label='Excluir registro'>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                );
            },
        },
        {
            field: "id",
            headerName: "ID",
            minWidth: 295,
            flex: 1,
        },
        {
            field: "agencies",
            headerName: "Agência",
            minWidth: 100,
            flex: 1,
        },
        {
            field: "sectors",
            headerName: "Setor",
            minWidth: 125,
            flex: 1,
        },
        {
            field: "teams",
            headerName: "Time",
            minWidth: 125,
            flex: 1,
        },
        {
            field: "employees",
            headerName: "Colaborador",
            minWidth: 125,
            flex: 1,
        },
        {
            field: "granted_by_name",
            headerName: "Quem concedeu",
            width: 125,
        },
    ];

    return (
        <Grid {...props}>
            <Box
                marginInline={2}
                padding={2.5}
                flexDirection='column'
                sx={{ border: `1px dashed ${colorBorderSystem}`, borderRadius: 4 }}
                gap={1}
                mb={2}>
                <Grid
                    container
                    component={"form"}
                    direction='row'
                    sx={{ paddingTop: 2, paddingBottom: 2 }}
                    onSubmit={handleSubmit(onSubmitCatalog)}>
                    <Grid item xs={12} md={12} mt={-2} mb={-1}>
                        <FormRadioGroup
                            row
                            name='card_type'
                            label='Categoria do Card:'
                            disabled={idReport ? true : false}
                            control={control}
                            errors={errors}
                            options={[
                                { label: "Dashboard", value: "DASHBOARD" },
                                { label: "Link Externo", value: "LINK_EXTERNO" },
                                { label: "Link Interno", value: "LINK_INTERNO" },
                                { label: "Painel", value: "PAINEL" },
                            ]}
                        />
                    </Grid>

                    <Grid
                        container
                        paddingTop={3}
                        paddingBottom={5}
                        justifyContent={"center"}
                        m={0}
                        mt={1}
                        sx={{
                            border: cardIsActiveWatch ? `2px dashed #7DB61C` : `2px dashed #dc2626`,
                            borderRadius: 4,
                            background: colorBackgroundSystem,
                            backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                            backgroundRepeat: "no-repeat, no-repeat",
                            backgroundSize: "50%, 50%",
                            backgroundPosition: "right top, left bottom",
                        }}
                        position='relative'>
                        <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                            <Tooltip title={cardDescriptionWatch}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        borderRadius: "8px",
                                        border: cardIsActiveWatch
                                            ? `1px solid ${colorBorderSystem}`
                                            : `1px dashed #dc2626`,
                                        background: colorBackgroundSystem,
                                        boxShadow: cardIsActiveWatch
                                            ? colorBoxShadowSystem
                                            : "0px 0px 20px -6px rgba(220,38,38,1);",
                                    }}>
                                    <CardActionArea
                                        onClick={() => {
                                            if (
                                                cardTypeWatch === "LINK_EXTERNO" &&
                                                cardLinkWatch &&
                                                cardLinkWatch.length > 8
                                            ) {
                                                window.open(cardLinkWatch, "_blank", "noopener,noreferrer");
                                            }
                                        }}
                                        sx={{
                                            cursor:
                                                cardTypeWatch === "LINK_EXTERNO" &&
                                                cardLinkWatch &&
                                                cardLinkWatch.length > 8
                                                    ? "pointer"
                                                    : "default",
                                        }}>
                                        <Box position='relative'>
                                            {cardUseCardImagemWatch ? (
                                                <CardMedia
                                                    component='img'
                                                    height={cardHeight}
                                                    image={backGroundImageCard}
                                                    alt='Imagem de Capa'
                                                />
                                            ) : (
                                                <Box
                                                    height={cardHeight}
                                                    sx={{
                                                        backgroundImage:
                                                            cardBackgroundColor ||
                                                            "linear-gradient(to right, #009688, #025e70)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: "white",
                                                        fontSize: "1.5rem",
                                                        fontWeight: "bold",
                                                        position: "relative",
                                                    }}
                                                />
                                            )}

                                            {cardLabelBigNumberWatch && cardTypeWatch !== "DASHBOARD" && (
                                                <Box
                                                    position='absolute'
                                                    bottom={8}
                                                    right={8}
                                                    bgcolor='rgba(0, 0, 0, 0.6)'
                                                    color='white'
                                                    padding='4px 8px'
                                                    borderRadius='4px'
                                                    fontSize='1rem'>
                                                    {cardLabelBigNumberWatch || null}
                                                </Box>
                                            )}
                                            <Box
                                                position='absolute'
                                                top={2}
                                                left={2}
                                                color='white'
                                                padding='4px 8px'
                                                borderRadius='4px'
                                                fontSize='1rem'>
                                                <Icon className='material-icons-outlined'>{cardLabelIconWatch}</Icon>
                                            </Box>
                                            <Box
                                                position='absolute'
                                                top={2}
                                                right={2}
                                                color='white'
                                                padding='4px 8px'
                                                borderRadius='4px'
                                                fontSize='1rem'>
                                                {cardIsPublicWatch ? (
                                                    <Icon
                                                        title='Este card é público e visível para todos os usuários.'
                                                        className='material-icons-outlined'
                                                        color={cardUseCardImagemWatch ? "success" : "inherit"}>
                                                        public
                                                    </Icon>
                                                ) : (
                                                    <Icon
                                                        title='Este card é privado e visível apenas para grupos autorizados.'
                                                        className='material-icons-outlined'
                                                        color={cardUseCardImagemWatch ? "primary" : "inherit"}>
                                                        security
                                                    </Icon>
                                                )}
                                            </Box>
                                            {cardTypeWatch === "DASHBOARD" && (
                                                <Box
                                                    position='absolute'
                                                    top={20}
                                                    left={25}
                                                    right={25}
                                                    height={"120px"}
                                                    color='white'
                                                    padding='4px 8px'
                                                    borderRadius='4px'
                                                    display='flex'
                                                    alignItems='center'
                                                    justifyContent='center'
                                                    textAlign='center'>
                                                    <Typography
                                                        fontSize='1.45rem'
                                                        fontWeight='bold'
                                                        fontStyle='italic'
                                                        textTransform='uppercase'
                                                        sx={{
                                                            textShadow: "2px 4px 8px rgba(0, 0, 0, 0.70)",
                                                        }}>
                                                        {cardLabelCardWatch || null}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                        <CardContent>
                                            <Box>
                                                <Typography
                                                    variant='body2'
                                                    fontSize='0.90rem'
                                                    color='text.primary'
                                                    textOverflow='ellipses'
                                                    noWrap>
                                                    {cardIsActiveWatch ? (
                                                        cardIsNewWatch && (
                                                            <Chip
                                                                label={
                                                                    <Typography color='success.main' fontSize={10}>
                                                                        Novo
                                                                    </Typography>
                                                                }
                                                                color='success'
                                                                variant='outlined'
                                                                component={"span"}
                                                                size='small'
                                                                sx={{
                                                                    mr: 1,
                                                                    height: "14px",
                                                                    mb: 0.5,
                                                                }}
                                                            />
                                                        )
                                                    ) : (
                                                        <Chip
                                                            label={
                                                                <Typography color='error.main' fontSize={10}>
                                                                    Inativo
                                                                </Typography>
                                                            }
                                                            color='error'
                                                            variant='outlined'
                                                            component={"span"}
                                                            size='small'
                                                            sx={{
                                                                mr: 1,
                                                                height: "14px",
                                                                mb: 0.5,
                                                            }}
                                                        />
                                                    )}
                                                    {cardTitleWatch || "Título do card"}
                                                </Typography>
                                                <Typography
                                                    width='100%'
                                                    maxWidth='400px'
                                                    minWidth='150px'
                                                    variant='body2'
                                                    fontSize='0.8rem'
                                                    color='text.secondary'
                                                    textOverflow='ellipses'
                                                    noWrap>
                                                    {["DASHBOARD", "PAINEL"].includes(cardTypeWatch) &&
                                                        cardDescriptionWatch}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Tooltip>
                        </Grid>
                        <Typography position='absolute' top={5} left={10} color='text.secondary'>
                            {cardHeight || "70px"}
                        </Typography>
                        <Typography position='absolute' top={5} right={10} color='text.secondary'>
                            {cardIsPublicWatch ? "Público" : "Privado"}
                        </Typography>
                        <Grid item position='absolute' bottom={5} left={10}>
                            <Typography
                                fontSize='1rem'
                                fontWeight='bold'
                                color={themeContext === "light" ? "text.secondary" : "text.primary"}>
                                Posição:
                                <Typography
                                    component={"span"}
                                    bottom={5}
                                    left={10}
                                    fontSize='1rem'
                                    fontWeight='bold'
                                    fontStyle='italic'
                                    textTransform='uppercase'>
                                    {" "}
                                    {cardOrderWatch || ""}
                                </Typography>
                            </Typography>
                        </Grid>

                        <Typography position='absolute' bottom={5} right={10} color='text.primary'>
                            {cardIsActiveWatch ? "🟢 Ativo" : "🔴 Inativo"}
                        </Typography>
                    </Grid>

                    <Grid container spacing={2} mt={0.35}>
                        <Grid item xs={12} md={3}>
                            <FormInput
                                fullWidth
                                label='Ordem do Card'
                                placeholder='Digite um número'
                                name='card_order'
                                type='number'
                                variant='outlined'
                                control={control}
                                errors={errors}
                                inputProps={{
                                    min: 0,
                                    max: 100,
                                }}
                            />
                        </Grid>

                        <Grid item xs={11} md={8}>
                            <FormInput
                                fullWidth
                                label='Cor do Cabeçalho'
                                name='background_color'
                                placeholder='Ex: linear-gradient(to right, #009688, #025e70)'
                                type='text'
                                variant='outlined'
                                control={control}
                                errors={errors}
                            />
                        </Grid>

                        <Grid item xs={1} md={1}>
                            <IconButton
                                title='Resetar cor'
                                size='small'
                                type='button'
                                disabled={loading}
                                sx={{ border: `1px solid ${colorBorderSystem}`, mt: 1, ml: -0.5 }}
                                onClick={() => {
                                    setValue("background_color", "linear-gradient(to right, #009688, #025e70)");
                                }}>
                                <ColorLensIcon color='warning' />
                            </IconButton>
                        </Grid>

                        <Grid item xs={12} md={7}>
                            <FormInput
                                fullWidth
                                label='Título do Card'
                                placeholder='Digite o título do card'
                                name='title'
                                type='text'
                                variant='outlined'
                                control={control}
                                errors={errors}
                            />
                        </Grid>

                        <Grid item xs={11} md={4}>
                            <FormInput
                                fullWidth
                                label='Icone'
                                name='label_icon'
                                type='text'
                                disabled={["DASHBOARD", "LINK_EXTERNO"].includes(cardTypeWatch) ? true : false}
                                placeholder='Ex: cake, wallet, info'
                                variant={["DASHBOARD", "LINK_EXTERNO"].includes(cardTypeWatch) ? "filled" : "outlined"}
                                control={control}
                                errors={errors}
                            />
                        </Grid>

                        <Grid item xs={1} md={1}>
                            <IconButton
                                title='Lista de Icones'
                                size='small'
                                type='button'
                                disabled={loading}
                                sx={{ border: `1px solid ${colorBorderSystem}`, mt: 1, ml: -0.5 }}
                                onClick={() => {
                                    window.open(
                                        "https://mui.com/material-ui/material-icons/",
                                        "_blank",
                                        "noopener,noreferrer",
                                    );
                                }}>
                                <AppsIcon color='primary' />
                            </IconButton>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormInput
                                fullWidth
                                label='Título da Imagem'
                                name='label_card'
                                type='text'
                                disabled={cardTypeWatch !== "DASHBOARD" ? true : false}
                                variant={cardTypeWatch !== "DASHBOARD" ? "filled" : "outlined"}
                                control={control}
                                errors={errors}
                                inputProps={{
                                    style: { textTransform: "uppercase" },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormInput
                                fullWidth
                                label='Rótulo'
                                name='label_bignumber'
                                type='text'
                                disabled={
                                    ["DASHBOARD", "LINK_EXTERNO", "LINK_INTERNO"].includes(cardTypeWatch) ? true : false
                                }
                                variant={
                                    ["DASHBOARD", "LINK_EXTERNO", "LINK_INTERNO"].includes(cardTypeWatch)
                                        ? "filled"
                                        : "outlined"
                                }
                                control={control}
                                errors={errors}
                                inputProps={{
                                    maxLength: 20,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={12}>
                            <FormInput
                                fullWidth
                                multiline
                                rows={2}
                                label='Descrição'
                                name='description'
                                type='text'
                                variant='outlined'
                                control={control}
                                errors={errors}
                            />
                        </Grid>

                        <Grid item xs={12} md={12}>
                            <FormSwitchGroup
                                row
                                title='Configurações do Card'
                                options={[
                                    { name: "use_card_image", label: "Imagem de fundo" },
                                    { name: "is_new", label: "Tag (novo)" },
                                    { name: "is_active", label: "Situação" },
                                    { name: "is_public", label: "É Publico?" },
                                ]}
                                control={control}
                            />
                        </Grid>

                        {cardTypeWatch !== "LINK_EXTERNO" && (
                            <Grid item xs={12} md={12}>
                                <FormInput
                                    fullWidth
                                    label={`Rota`}
                                    name='route'
                                    type='text'
                                    placeholder='Ex: /controle-produtividades/produtividade-diaria'
                                    variant={inputRoute ? "filled" : "outlined"}
                                    disabled={inputRoute}
                                    control={control}
                                    errors={errors}
                                />
                            </Grid>
                        )}

                        {!["LINK_INTERNO", "PAINEL"].includes(cardTypeWatch) && (
                            <Grid item xs={12} md={cardTypeWatch === "DASHBOARD" ? 9 : 12}>
                                <FormInput
                                    fullWidth
                                    label={cardTypeWatch === "DASHBOARD" ? "Link PorweBi" : "Link"}
                                    placeholder={
                                        cardTypeWatch === "DASHBOARD"
                                            ? "https://app.powerbi.com/view?..."
                                            : "Ex: https://www..."
                                    }
                                    name='link_card'
                                    type='text'
                                    variant='outlined'
                                    control={control}
                                    errors={errors}
                                />
                            </Grid>
                        )}

                        {cardTypeWatch === "DASHBOARD" && (
                            <Grid item xs={12} md={3}>
                                <FormInput
                                    fullWidth
                                    label='Altura Frame BI'
                                    placeholder='Ex: 800px'
                                    name='powerbi_height'
                                    type='number'
                                    variant='outlined'
                                    control={control}
                                    errors={errors}
                                    inputProps={{
                                        min: 400,
                                        max: 2000,
                                        step: 25,
                                    }}
                                />
                            </Grid>
                        )}

                        {cardIsPublicWatch ? (
                            <Grid item xs={12} md={12} mb={-1}>
                                <Alert severity='warning' sx={{ mb: 1.5, fontSize: 12, border: `1px dashed #a1a800` }}>
                                    Este card está configurado como público, o que significa que todos os usuários com
                                    acesso à página de Catálogo poderão visualizá-lo e acessa-lo!
                                </Alert>
                            </Grid>
                        ) : (
                            <Grid item container xs={12} md={12} marginBlock={1}>
                                <Grid
                                    item
                                    padding={2}
                                    xs={12}
                                    md={12}
                                    sx={{
                                        border: `1px solid #1F3E45`,
                                        borderRadius: 2.5,
                                        backgroundColor: themeContext === "light" ? "#f5f8f7" : "#00161b",
                                    }}>
                                    <Grid item container spacing={2}>
                                        <Grid item xs={12} md={12}>
                                            <Typography
                                                color={themeContext === "light" ? "#1F3E45" : "text.primary"}
                                                overflow='hidden'
                                                whiteSpace='nowrap'
                                                textOverflow='ellipses'
                                                fontSize={14}
                                                fontWeight={700}
                                                sx={{ display: "inline-flex", alignItems: "center" }}>
                                                <VisibilityOutlinedIcon color='primary' sx={{ mr: 0.5 }} />
                                                Quem poderá visualizar o Card
                                            </Typography>
                                        </Grid>

                                        {rows.length > 0 && (
                                            <Grid item xs={12} md={12} marginBlock={-1}>
                                                <Alert
                                                    severity='warning'
                                                    sx={{
                                                        mb: 2,
                                                        fontSize: 12,
                                                        border: `1px dashed #a1a800`,
                                                    }}>
                                                    Para alterar o tipo de permissão, é necessário primeiro remover os
                                                    registros da listagem, pois apenas um tipo de permissão pode ser
                                                    aplicado por vez.
                                                </Alert>
                                            </Grid>
                                        )}

                                        <Grid item xs={12} md={12}>
                                            <FormAutocomplete
                                                fullWidth
                                                name='visibility_scope'
                                                label='Tipo de permissão por:'
                                                variant='outlined'
                                                size='medium'
                                                disableClearable
                                                disabled={rows.length > 0}
                                                disabledAutocomplete={rows.length > 0}
                                                control={controlIsPrivate}
                                                errors={errosIsPrivate}
                                                options={ArrayTypesVisibilityScope}
                                            />
                                        </Grid>

                                        {visibilityScopeSelected &&
                                            (visibilityScopeSelected?.id === "Agência" ||
                                                visibilityScopeSelected?.id === "Setor" ||
                                                visibilityScopeSelected?.id === "Time" ||
                                                visibilityScopeSelected?.id === "Colaborador") && (
                                                <Grid
                                                    item
                                                    xs={12}
                                                    md={
                                                        visibilityScopeSelected?.id === "Agência"
                                                            ? 12
                                                            : visibilityScopeSelected?.id === "Setor"
                                                              ? 6
                                                              : 4
                                                    }>
                                                    <FormAutocomplete
                                                        fullWidth
                                                        name='agencies'
                                                        label='Agência'
                                                        variant='filled'
                                                        size='medium'
                                                        control={controlIsPrivate}
                                                        errors={errosIsPrivate}
                                                        options={arrayAgencies.map((value) => {
                                                            return {
                                                                id: value.id,
                                                                label: value.abbreviation,
                                                            };
                                                        })}
                                                    />
                                                </Grid>
                                            )}

                                        {visibilityScopeSelected &&
                                            (visibilityScopeSelected?.id === "Setor" ||
                                                visibilityScopeSelected?.id === "Time" ||
                                                visibilityScopeSelected?.id === "Colaborador") && (
                                                <Grid item xs={12} md={visibilityScopeSelected?.id === "Setor" ? 6 : 4}>
                                                    <FormAutocomplete
                                                        fullWidth
                                                        name='sectors'
                                                        label='Setor'
                                                        variant='filled'
                                                        size='medium'
                                                        disabledAutocomplete={!agencySelected}
                                                        control={controlIsPrivate}
                                                        errors={errosIsPrivate}
                                                        options={arraySectors.map((value) => {
                                                            return {
                                                                id: value.id,
                                                                label: value.name,
                                                            };
                                                        })}
                                                    />
                                                </Grid>
                                            )}

                                        {visibilityScopeSelected &&
                                            (visibilityScopeSelected?.id === "Colaborador" ||
                                                visibilityScopeSelected?.id === "Time") && (
                                                <Grid item xs={12} md={4}>
                                                    <FormAutocomplete
                                                        fullWidth
                                                        name='teams'
                                                        label='Time'
                                                        variant='filled'
                                                        size='medium'
                                                        disabledAutocomplete={!sectorSelected}
                                                        control={controlIsPrivate}
                                                        errors={errosIsPrivate}
                                                        options={arrayTeams.map((value) => {
                                                            return {
                                                                id: value.id,
                                                                label: value.name,
                                                            };
                                                        })}
                                                    />
                                                </Grid>
                                            )}

                                        {visibilityScopeSelected && visibilityScopeSelected?.id === "Colaborador" && (
                                            <Grid item xs={12} md={12}>
                                                <FormAutocomplete
                                                    fullWidth
                                                    name='employees'
                                                    variant='filled'
                                                    size='medium'
                                                    label='Colaborador'
                                                    disabledAutocomplete={!agencySelected}
                                                    control={controlIsPrivate}
                                                    errors={errosIsPrivate}
                                                    options={arrayEmployees.map((value) => {
                                                        return {
                                                            id: value.id,
                                                            label: value.name,
                                                        };
                                                    })}
                                                />
                                            </Grid>
                                        )}

                                        {visibilityScopeSelected && visibilityScopeSelected.id && (
                                            <Grid
                                                container
                                                display='flex'
                                                justifyContent='center'
                                                gap={1}
                                                mt={3}
                                                mb={1}>
                                                <Grid>
                                                    <LoadingButton
                                                        type='submit'
                                                        size='large'
                                                        color='primary'
                                                        variant='contained'
                                                        title='Adicionar'
                                                        onClick={handleSubmitIsPrivate((params) => onAdd(params))}
                                                        startIcon={<PlaylistAddCircleOutlinedIcon />}
                                                        loading={loadingAddOn}>
                                                        Adicionar
                                                    </LoadingButton>
                                                </Grid>
                                            </Grid>
                                        )}

                                        <Grid item xs={12} md={12}>
                                            <DataGrid
                                                autoHeight
                                                columns={columns}
                                                rows={rows}
                                                density='compact'
                                                localeText={dataGridLocaleTextTranslateFull}
                                                loading={loading}
                                                disableRowSelectionOnClick
                                                initialState={{
                                                    pagination: {
                                                        paginationModel: {
                                                            pageSize: 10,
                                                        },
                                                    },
                                                    columns: {
                                                        columnVisibilityModel: {
                                                            id: false,
                                                        },
                                                    },
                                                }}
                                                slots={{
                                                    toolbar: QuickSearchToolbar,
                                                    pagination: buttonDeleteRowsPermissions,
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
                                                            transform: "translate(44%, 52%)",
                                                            zIndex: 1300,
                                                            borderRadius: "8px",
                                                            boxShadow:
                                                                "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
                                                            backgroundColor:
                                                                themeContext === "light" ? "#ffffff" : "#1F3D44",
                                                        },
                                                    },
                                                }}
                                                pageSizeOptions={[10, 25]}
                                                sx={getDataGridStyles("#1F3E45", colorScrollSystem)}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}

                        {cardTypeWatch === "PAINEL" && !idReport && (
                            <Grid item xs={12} mb={-2}>
                                <Collapse in={true}>
                                    <Alert severity='info' sx={{ mb: 2, fontSize: 12 }}>
                                        Atenção: Não é possível criar um card do tipo 'PAINEL'. Esse modelo é
                                        configurado manualmente pelos desenvolvedores e permite apenas a edição de
                                        alguns dados básicos.
                                    </Alert>
                                </Collapse>
                            </Grid>
                        )}

                        <Grid item xs={12} md={12} mb={-1}>
                            <LoadingButton
                                fullWidth
                                type='submit'
                                size='large'
                                color={"success"}
                                variant='contained'
                                startIcon={<Icon> {!idReport ? "add_card" : "edit_note"}</Icon>}
                                loading={loading}
                                onClick={handleSubmit((params) => onSubmitCatalog(params))}
                                disabled={cardTypeWatch === "PAINEL" && !idReport ? true : false}
                                sx={{ boxShadow: "none" }}>
                                {!idReport ? "Criar Card" : "Editar Card"}
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Grid>
    );
}
