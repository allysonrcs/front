import { useEffect, useState } from "react";
import { Box, CircularProgress, Grid, IconButton, Modal, Paper, Tab, Tabs, Theme } from "@mui/material";
import { User } from "@/contexts/AuthContext";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { ThemeProps, useGlobal } from "@/contexts/GlobalContext";
import { DashboardOutlined, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { TabMobilizer } from "./TabChilds/TabMobilizer";
import { TabCreditPortfolio } from "./TabChilds/TabCreditPortfolio";
import { toast } from "react-toastify";
import { searchRefYearAndMonth } from "@/services/coopmais";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { IAutoCompletePortfolios, searchAutoCompletePortfolios } from "@/services/portfolios";
import { useMobilizerData } from "../hook/useMobilizerData";
import { useCreditPortfolioData } from "../hook/useCreditPortfolioData";
import { ModalMobConsolidated } from "./modal/ModalMobConsolidated";
import { ModalConsolidatedCreditPortfolio } from "./modal/ModalConsolidatedCreditPortfolio";

type InsightsPanelProps = {
    userDate: User;
    isThemeLight: boolean;
    colorBorderSystem: string;
    isSidebarOpen: boolean;
    themeUI: Theme;
    themeContext: ThemeProps;
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface AutoCompleteString {
    id: string;
    label: string;
}

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
    id_agency_sisbr?: number | null;
};

export type TabHomeOptionsFormsProps = {
    tab_ref_month: AutoCompleteString;
    tab_agencies: ListAgencies;
    tab_portfolios: ListPortfolios;
};

const validationSchemaTabHomeOptions = Yup.object().shape({
    tab_ref_month: Yup.object()
        .shape({
            id: Yup.string().required("ID Obrigatório"),
            label: Yup.string().required("Label Obrigatório"),
        })
        .required("Obrigatório"),
    tab_agencies: Yup.object()
        .shape({
            id: Yup.number().required("Obrigatório"),
            label: Yup.string().required("Obrigatório"),
            agency_sisbr_id: Yup.number().required("Obrigatório"),
        })
        .required("Obrigatório"),
    tab_portfolios: Yup.object()
        .shape({
            id: Yup.number().required("Obrigatório"),
            label: Yup.string().required("Obrigatório"),
            id_ref: Yup.number().nullable().optional(),
            id_agency: Yup.number().nullable().optional(),
            id_agency_sisbr: Yup.number().nullable().optional(),
        })
        .required("Obrigatório"),
});

export function TabHomeOptions({
    userDate,
    isThemeLight,
    colorBorderSystem,
    isSidebarOpen,
    themeUI,
    themeContext,
}: InsightsPanelProps) {
    const [loadingOptionsInputs, setLoadingOptionsInputs] = useState<boolean>(false);
    const [autoCompleteRefMonth, setAutoCompleteRefMonth] = useState<AutoCompleteString[]>([]);
    const [autoCompleteAgencies, setAutoCompleteAgencies] = useState<ListAgencies[]>([]);
    const [autoCompletePortfolios, setAutoCompletePortfolios] = useState<ListPortfolios[]>([]);
    const [openModalMobConsolidated, setOpenModalMobConsolidated] = useState<boolean>(false);
    const [openModalCreditPortfolio, setOpenModalCreditPortfolio] = useState<boolean>(false);
    const [isReady, setIsReady] = useState(false);
    const [valueFirstTabs, setValueFirstTabs] = useState(0);

    const { getInfoError } = useGlobal();

    const {
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm<TabHomeOptionsFormsProps>({
        resolver: yupResolver(validationSchemaTabHomeOptions),
    });

    const tabRefMonthWatch = watch("tab_ref_month");
    const tabAgenciesWatch = watch("tab_agencies");
    const tabPortfoliosWatch = watch("tab_portfolios");

    const { dataMobilizer } = useMobilizerData({
        tab_ref_month: tabRefMonthWatch,
        tab_portfolios: tabPortfoliosWatch,
    });

    const { dataCredit } = useCreditPortfolioData({
        tab_ref_month: tabRefMonthWatch,
        tab_portfolios: tabPortfoliosWatch,
    });

    function CustomTabPanel(props: TabPanelProps) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role='tabpanel'
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}>
                {value === index && <Box sx={{ pt: 1.5 }}>{children}</Box>}
            </div>
        );
    }

    const handleChangeFirstTabs = (event: unknown, newValue: number) => {
        setValueFirstTabs(newValue);
    };

    const handleOpenModalMobConsorcio = () => {
        setOpenModalMobConsolidated((oldValue) => !oldValue);
    };

    const handleOpenModalCreditPortfolio = () => {
        setOpenModalCreditPortfolio((oldValue) => !oldValue);
    };

    function tabsProps(index: number) {
        return {
            id: `action-tab-${index}`,
            "aria-controls": `action-tabpanel-${index}`,
        };
    }

    async function searchFormInputsOptions(agency_ref_id: number, portfolio_ref_id: number) {
        try {
            setIsReady(false);
            setLoadingOptionsInputs(true);

            const [dataListAgencies, dataListPortfolios, dataListRefDate] = await Promise.allSettled([
                searchAutocompleteAgencies({
                    with_agency_sisbr_id: true,
                    is_active: true,
                    with_restrict_agency: false,
                }),
                searchAutoCompletePortfolios({
                    agency_sisbr_id: agency_ref_id,
                    is_active: true,
                    with_restrict_agency: false,
                    has_id_ref: true,
                    has_id_agency: true,
                    has_agency_sisbr_id: true,
                }),
                searchRefYearAndMonth({ with_last_year: false, from_database: "bi_coop_mobilizadores" }),
            ]);

            if (
                dataListAgencies.status === "fulfilled" &&
                dataListPortfolios.status === "fulfilled" &&
                dataListRefDate.status === "fulfilled"
            ) {
                const autoCompleteRefDate = dataListRefDate.value.ref_date.map((value) => ({
                    id: value.id,
                    label: value.label,
                }));

                setAutoCompleteRefMonth(autoCompleteRefDate);
                setValue("tab_ref_month", autoCompleteRefDate[0]);

                let autoCompleteListAgencies = [
                    { id: 4071, label: "4071 - Consolidado", agency_sisbr_id: 4071 },
                    ...dataListAgencies.value
                        .map(({ id, abbreviation, agency_sisbr_id }) => ({
                            id,
                            label: abbreviation,
                            agency_sisbr_id,
                        }))
                        .filter((value) => ![0, 9999].includes(value.agency_sisbr_id)),
                ];

                setAutoCompleteAgencies(autoCompleteListAgencies);

                if (agency_ref_id === 0) {
                    setValue("tab_agencies", { id: 4071, label: "4071 - Consolidado", agency_sisbr_id: 4071 });
                } else {
                    const selectedAgency = autoCompleteListAgencies.find(
                        (value) => value.agency_sisbr_id === agency_ref_id,
                    );

                    if (selectedAgency) {
                        setValue("tab_agencies", selectedAgency);
                    }
                }

                handlePortfolioSelection(agency_ref_id, portfolio_ref_id, dataListPortfolios.value);
            }

            if (dataListAgencies.status === "rejected" || dataListPortfolios.status === "rejected") {
                toast.error("Erro ao carregar opções (Campos mobilizador).");
            }

            setTimeout(() => {
                setIsReady(true);
            }, 500);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingOptionsInputs(false);
        }
    }

    const handlePortfolioSelection = (
        agency_ref_id: number,
        portfolio_ref_id: number,
        portfolios: IAutoCompletePortfolios[],
    ) => {
        const isGlobalPortfolio = portfolio_ref_id.toString().startsWith(`999${agency_ref_id}`);

        let autoCompleteListPortfolios = portfolios
            .map(({ id, name, ref_id, id_agency_sisbr }) => ({
                id,
                label: name,
                id_ref: ref_id,
                id_agency_sisbr,
            }))
            .filter(({ label }) => label !== "Global");

        if (autoCompleteListPortfolios.length > 1) {
            autoCompleteListPortfolios = [
                { id: 4071, label: "Todos", id_ref: agency_ref_id, id_agency_sisbr: agency_ref_id },
                ...autoCompleteListPortfolios,
            ];
        }

        let selectedPortfolio;

        if (agency_ref_id === 4071) {
            selectedPortfolio = { id: 4071, label: "CONSOLIDADO", id_ref: 4071, id_agency_sisbr: 4071 };
        } else {
            selectedPortfolio = isGlobalPortfolio
                ? autoCompleteListPortfolios.find(({ label }) => label === "Todos")
                : autoCompleteListPortfolios.find(({ id_ref }) => id_ref === portfolio_ref_id) ||
                  autoCompleteListPortfolios[0];
        }

        if (selectedPortfolio) {
            setValue("tab_portfolios", {
                id: selectedPortfolio.id,
                label: selectedPortfolio.label,
                id_ref: selectedPortfolio.id_ref ?? 4071,
                id_agency_sisbr: selectedPortfolio.id_agency_sisbr ?? 4071,
            });
        }

        setAutoCompletePortfolios(autoCompleteListPortfolios);
    };

    const searchPortfoliosOfTheAgencyMob = async (agency_sisbr_id: number) => {
        try {
            setLoadingOptionsInputs(true);

            const dataPortfolios = await searchAutoCompletePortfolios({
                agency_sisbr_id,
                is_active: true,
                with_restrict_agency: false,
                has_id_ref: true,
                has_id_agency: true,
                has_agency_sisbr_id: true,
            });

            handlePortfolioSelection(agency_sisbr_id, 0, dataPortfolios);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingOptionsInputs(false);
        }
    };

    useEffect(() => {
        if (userDate) {
            searchFormInputsOptions(userDate.agency_sisbr_id, userDate.portfolio_sisbr_id || 0);
        }
    }, [userDate]);

    useEffect(() => {
        async function execute() {
            if (isReady && tabAgenciesWatch) {
                await searchPortfoliosOfTheAgencyMob(tabAgenciesWatch.agency_sisbr_id);
            }
        }
        execute();
    }, [tabAgenciesWatch]);

    return (
        <Box
            component={Paper}
            borderRadius={"16px"}
            padding={2}
            minHeight={"424px"}
            sx={{
                border: `1px solid ${colorBorderSystem}`,
                borderRadius: "16px",
                background: themeContext === "light" ? "#ffffff" : "linear-gradient(135deg, #071d20, #0A2A2F)",
                overflow: "hidden",
                boxShadow:
                    themeContext === "light"
                        ? " rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
                        : "none",
            }}>
            <Grid item xs={12} sm={12} md={12} mb={1.5} spacing={!isSidebarOpen ? 2 : 1} container alignItems='center'>
                <Grid item xs={12} sm={12} md={12}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider", mt: -1.75 }}>
                        <Tabs
                            value={valueFirstTabs}
                            onChange={handleChangeFirstTabs}
                            variant='scrollable'
                            scrollButtons
                            allowScrollButtonsMobile
                            aria-label='tabs1'
                            ScrollButtonComponent={(props) => {
                                if (props.direction === "left" && !props.disabled) {
                                    return (
                                        <IconButton {...props}>
                                            <KeyboardArrowLeft color='primary' />
                                        </IconButton>
                                    );
                                } else if (props.direction === "right" && !props.disabled) {
                                    return (
                                        <IconButton {...props}>
                                            <KeyboardArrowRight color='primary' />
                                        </IconButton>
                                    );
                                } else {
                                    return null;
                                }
                            }}>
                            <Tab disableTouchRipple label='Mobilizador' {...tabsProps(0)} />
                            <Tab disableTouchRipple label='Carteira Crédito' {...tabsProps(1)} />
                        </Tabs>
                    </Box>
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={12}
                    md
                    container
                    spacing={1}
                    justifyContent='end'
                    alignItems='center'
                    mb={0.75}
                    mt={0.25}>
                    <Grid item xs={3} sm={3} md={3.5}>
                        <FormAutocomplete
                            fullWidth
                            name='tab_ref_month'
                            placeholder='Selecione um Mês'
                            label='Ano / Mês'
                            variant='outlined'
                            size='small'
                            disableClearable
                            disabled={loadingOptionsInputs}
                            disabledAutocomplete={loadingOptionsInputs}
                            control={control}
                            errors={errors}
                            options={autoCompleteRefMonth}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4}>
                        <FormAutocomplete
                            fullWidth
                            name='tab_agencies'
                            label='Agência'
                            placeholder='Selecione uma Agência'
                            variant='outlined'
                            size='small'
                            disableClearable
                            disabled={loadingOptionsInputs}
                            disabledAutocomplete={loadingOptionsInputs}
                            control={control}
                            errors={errors}
                            options={autoCompleteAgencies}
                        />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4}>
                        <FormAutocomplete
                            fullWidth
                            name='tab_portfolios'
                            label='Carteira'
                            placeholder='Selecione uma Carteira'
                            variant='outlined'
                            size='small'
                            disableClearable
                            disabled={loadingOptionsInputs || valueFirstTabs === 1}
                            disabledAutocomplete={loadingOptionsInputs || valueFirstTabs === 1}
                            control={control}
                            errors={errors}
                            options={autoCompletePortfolios}
                        />
                    </Grid>
                    <Grid item xs={1} sm={1} md={0.5}>
                        <IconButton
                            title='Abrir Consolidado'
                            size='small'
                            disabled={!tabRefMonthWatch}
                            sx={{
                                border: `1px solid ${colorBorderSystem}`,
                                backgroundColor: !tabRefMonthWatch ? "grey" : "transparent",
                            }}
                            onClick={() => {
                                if (valueFirstTabs === 0) {
                                    handleOpenModalMobConsorcio();
                                } else {
                                    handleOpenModalCreditPortfolio();
                                }
                            }}>
                            <DashboardOutlined
                                color={
                                    valueFirstTabs === 0
                                        ? !tabRefMonthWatch || tabRefMonthWatch.label.trim() === ""
                                            ? "disabled"
                                            : "success"
                                        : !tabRefMonthWatch || tabRefMonthWatch.label.trim() === ""
                                          ? "disabled"
                                          : "primary"
                                }
                            />
                        </IconButton>
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={12} mt={-1}>
                <CustomTabPanel value={valueFirstTabs} index={0}>
                    {isReady ? (
                        <TabMobilizer
                            dataMobilizer={dataMobilizer}
                            isThemeLight={isThemeLight}
                            colorBorderSystem={colorBorderSystem}
                            isSidebarOpen={isSidebarOpen}
                            themeUI={themeUI}
                        />
                    ) : (
                        <Box display='flex' alignItems='center' justifyContent='center' minHeight={300}>
                            <CircularProgress size={40} />
                        </Box>
                    )}
                </CustomTabPanel>

                <CustomTabPanel value={valueFirstTabs} index={1}>
                    {isReady ? (
                        <TabCreditPortfolio
                            dataCreditPortfolio={dataCredit}
                            isThemeLight={isThemeLight}
                            colorBorderSystem={colorBorderSystem}
                            isSidebarOpen={isSidebarOpen}
                            themeUI={themeUI}
                        />
                    ) : (
                        <Box display='flex' alignItems='center' justifyContent='center' minHeight={300}>
                            <CircularProgress size={40} />
                        </Box>
                    )}
                </CustomTabPanel>
            </Grid>

            <Modal
                open={openModalMobConsolidated}
                onClose={handleOpenModalMobConsorcio}
                disableEscapeKeyDown={false}
                sx={{
                    "& .MuiModal-backdrop": {
                        backgroundColor: "rgb(0 0 0 / 60%)",
                    },
                }}>
                <Box>
                    {tabRefMonthWatch && tabRefMonthWatch.label.length && (
                        <ModalMobConsolidated
                            closeButton={handleOpenModalMobConsorcio}
                            refMonth={tabRefMonthWatch.label}
                        />
                    )}
                </Box>
            </Modal>

            <Modal
                open={openModalCreditPortfolio}
                onClose={handleOpenModalCreditPortfolio}
                disableEscapeKeyDown={false}
                sx={{
                    "& .MuiModal-backdrop": {
                        backgroundColor: "rgb(0 0 0 / 60%)",
                    },
                }}>
                <Box>
                    {tabRefMonthWatch && tabRefMonthWatch.label.length && (
                        <ModalConsolidatedCreditPortfolio
                            closeButton={handleOpenModalCreditPortfolio}
                            refMonth={tabRefMonthWatch.label}
                        />
                    )}
                </Box>
            </Modal>
        </Box>
    );
}
