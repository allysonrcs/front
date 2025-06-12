import { useEffect, useState } from "react";
import { Box, Grid, Modal, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useGlobal } from "@/contexts/GlobalContext";
import FormAutocomplete from "../FormComponents/FormAutocomplete";
import { CoopMaisStepKeysCard } from "./CoopMaisStepKeysCard";
import { Chart } from "../Charts/ECharts/chart";
import { useForm } from "react-hook-form";
import { RankingCoopMais } from "./RankingCoopMais";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { searchAutoCompletePortfolios } from "@/services/portfolios";
import { toast } from "react-toastify";
import { User } from "@/contexts/AuthContext";
import {
    DateCoopMaisStepKeysProps,
    ITimelineMonthsProps,
    searchDashboardCoopMais,
    searchRefYearAndMonth,
} from "@/services/coopmais";
import { formatNumberWithThousandsSeparatorComma } from "@/functions/number";
import RunningWithErrorsOutlinedIcon from "@mui/icons-material/RunningWithErrorsOutlined";
import indefinido_icon from "@/assets/icons/coop_mais/coop-indefinido.png";
import inicial_icon from "@/assets/icons/coop_mais/coop-inicial.png";
import bronze_icon from "@/assets/icons/coop_mais/coop-bronze.png";
import prata_icon from "@/assets/icons/coop_mais/coop-prata.png";
import ouro_icon from "@/assets/icons/coop_mais/coop-ouro.png";

export function getIconForPointsCoopMais(value: string): string | undefined {
    switch (value) {
        case "indefinido_icon":
            return indefinido_icon;
        case "inicial_icon":
            return inicial_icon;
        case "bronze_icon":
            return bronze_icon;
        case "prata_icon":
            return prata_icon;
        case "ouro_icon":
            return ouro_icon;
        default:
            return indefinido_icon;
    }
}

type AutoCompleteString = {
    id: string;
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

type CoopMaisFormsProps = {
    year_month_coopmais: AutoCompleteString;
    agencies_coopmais: ListAgencies;
    portfolios_coopmais: ListPortfolios;
};

type CoopMaisProps = {
    userDate: User;
};

const validationSchemaCoopMais = Yup.object().shape({
    year_month_coopmais: Yup.object()
        .shape({
            id: Yup.string().required("ID Obrigatório"),
            label: Yup.string().required("Label Obrigatório"),
        })
        .required("Obrigatório"),
    agencies_coopmais: Yup.object()
        .shape({
            id: Yup.number().required("Obrigatório"),
            label: Yup.string().required("Obrigatório"),
            agency_sisbr_id: Yup.number().required("Obrigatório"),
        })
        .required("Obrigatório"),
    portfolios_coopmais: Yup.object()
        .shape({
            id: Yup.number().required("Obrigatório"),
            label: Yup.string().required("Obrigatório"),
            id_ref: Yup.number().nullable().optional(),
            id_agency: Yup.number().nullable().optional(),
        })
        .required("Obrigatório"),
});

export function CoopMais({ userDate }: CoopMaisProps) {
    const [loadingCoopMais, setLoadingCoopMais] = useState<boolean>(false);
    const [listAgencies, setListAgencies] = useState<ListAgencies[]>([]);
    const [listPortfolios, setListPortfolios] = useState<ListPortfolios[]>([]);
    const [listRefDate, setListRefDate] = useState<AutoCompleteString[]>([]);
    const [listPanelCoopMaisStepKeys, setListCoopMaisStepKeys] = useState<DateCoopMaisStepKeysProps[]>([]);
    const [listTimelineMonths, setListTimelineMonths] = useState<ITimelineMonthsProps[]>([]);
    const [sumPointsCoopMais, setSumPointsCoopMais] = useState<number>(0);
    const [openModal, setOpenModal] = useState(false);
    const [selectedRefMes, setSelectedRefMes] = useState<string | null>(null);
    const [firstRender, setFirstRender] = useState<boolean>(false);

    const { getInfoError, theme, colorBorderSystem, isSidebarOpen } = useGlobal();
    const themeContext = useTheme();

    const {
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm<CoopMaisFormsProps>({
        resolver: yupResolver(validationSchemaCoopMais),
    });

    const yearMonthWatch = watch("year_month_coopmais");
    const agenciesWatch = watch("agencies_coopmais");
    const portfoliosWatch = watch("portfolios_coopmais");

    const handleOpenModal = (ref_mes: string) => {
        setSelectedRefMes(ref_mes);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedRefMes(null);
    };

    const onSubmitHeaderCoopMais = async (params: CoopMaisFormsProps) => {
        try {
            setLoadingCoopMais(true);

            const responseCooperatedPanel = await searchDashboardCoopMais({
                ref_month: String(params.year_month_coopmais.label),
                id_ref_agency: String(params.agencies_coopmais.agency_sisbr_id),
                id_ref_portfolio: String(params.portfolios_coopmais.id_ref) || "0",
            });

            const { step_keys, sum_ranking_points, timeline_months } = responseCooperatedPanel;

            setListCoopMaisStepKeys(step_keys);
            setSumPointsCoopMais(Number(sum_ranking_points.toFixed(2)));
            setListTimelineMonths(timeline_months);

            firstRender && toast.success(`Coop+ atualizado com sucesso!`);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingCoopMais(false);
        }
    };

    const setInputsFormsHeaderCoopMaisOptions = async (agency_ref_id: number, portfolio_ref_id: number) => {
        try {
            const [dataListAgencies, dataListPortfolios, dataListRefDate] = await Promise.all([
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
                }),
                searchRefYearAndMonth({ with_last_year: false, from_database: "bi_coop_chave_etapa" }),
            ]);

            const autoCompleteRefDate = dataListRefDate.ref_date.map((value) => ({
                id: value.id,
                label: value.label,
            }));

            setListRefDate(autoCompleteRefDate);
            setValue("year_month_coopmais", autoCompleteRefDate[0]);

            let autoCompleteListAgencies;

            if (agency_ref_id === 0) {
                setValue("agencies_coopmais", {
                    id: 4071,
                    label: "4071 - Consolidado",
                    agency_sisbr_id: 4071,
                });

                autoCompleteListAgencies = [
                    { id: 4071, label: "4071 - Consolidado", agency_sisbr_id: 4071 },
                    ...dataListAgencies
                        .map(({ id, abbreviation, agency_sisbr_id }) => ({
                            id,
                            label: abbreviation,
                            agency_sisbr_id,
                        }))
                        .filter((value) => ![0, 9999].includes(value.agency_sisbr_id)),
                ];
            } else {
                autoCompleteListAgencies = [
                    { id: 4071, label: "4071 - Consolidado", agency_sisbr_id: 4071 },
                    ...dataListAgencies
                        .map(({ id, abbreviation, agency_sisbr_id }) => ({
                            id,
                            label: abbreviation,
                            agency_sisbr_id,
                        }))
                        .filter((value) => ![0, 9999].includes(value.agency_sisbr_id)),
                ];

                const searchAutoCompleteListAgencies = dataListAgencies
                    .map(({ id, abbreviation, agency_sisbr_id }) => ({
                        id,
                        label: abbreviation,
                        agency_sisbr_id,
                    }))
                    .filter((value) => value.agency_sisbr_id === agency_ref_id);

                if (searchAutoCompleteListAgencies.length > 0) {
                    setValue("agencies_coopmais", {
                        id: searchAutoCompleteListAgencies[0].id,
                        label: searchAutoCompleteListAgencies[0].label,
                        agency_sisbr_id: searchAutoCompleteListAgencies[0].agency_sisbr_id,
                    });
                }
            }

            setListAgencies(autoCompleteListAgencies);

            const isGlobalPortfolio = portfolio_ref_id.toString().startsWith(`999${agency_ref_id}`);

            let autoCompleteListPortfolios = dataListPortfolios
                .map(({ id, name, ref_id }) => ({
                    id,
                    label: name,
                    id_ref: ref_id,
                }))
                .filter(({ label }) => label !== "Global");

            if (autoCompleteListPortfolios.length > 1) {
                autoCompleteListPortfolios = [
                    { id: 4071, label: "Todos", id_ref: agency_ref_id },
                    ...autoCompleteListPortfolios,
                ];
            }

            let selectedPortfolio;

            if (agency_ref_id === 4071) {
                selectedPortfolio = { id: 4071, label: "CONSOLIDADO", id_ref: 4071 };
            } else {
                selectedPortfolio = isGlobalPortfolio
                    ? autoCompleteListPortfolios.find(({ label }) => label === "Todos")
                    : autoCompleteListPortfolios.find(({ id_ref }) => id_ref === portfolio_ref_id) ||
                      autoCompleteListPortfolios[0];
            }

            if (selectedPortfolio) {
                setValue("portfolios_coopmais", {
                    id: selectedPortfolio.id,
                    label: selectedPortfolio.label,
                    id_ref: selectedPortfolio.id_ref,
                });
            }

            setListPortfolios(autoCompleteListPortfolios);

            setTimeout(() => {
                setFirstRender(true);
            }, 1000);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchPortfoliosOfTheAgency = async (agency_sisbr_id: number) => {
        try {
            setLoadingCoopMais(true);

            const dataPortfolios = await searchAutoCompletePortfolios({
                agency_sisbr_id,
                is_active: true,
                with_restrict_agency: false,
                has_id_ref: true,
                has_id_agency: true,
            });

            let autoCompleteListPortfolios = dataPortfolios
                .map(({ id, name, ref_id }) => ({
                    id,
                    label: name,
                    id_ref: ref_id,
                }))
                .filter(({ label }) => label !== "Global");

            if (autoCompleteListPortfolios.length > 1) {
                autoCompleteListPortfolios = [
                    { id: 4071, label: "Todos", id_ref: agency_sisbr_id },
                    ...autoCompleteListPortfolios,
                ];
            }

            let selectedPortfolio;

            if (agency_sisbr_id === 4071) {
                selectedPortfolio = { id: 4071, label: "CONSOLIDADO", id_ref: 4071 };
            } else {
                selectedPortfolio =
                    autoCompleteListPortfolios.length === 1
                        ? autoCompleteListPortfolios[0]
                        : autoCompleteListPortfolios[0];
            }

            if (selectedPortfolio) {
                setValue("portfolios_coopmais", {
                    id: selectedPortfolio.id,
                    label: selectedPortfolio.label,
                    id_ref: selectedPortfolio.id_ref ?? 4071,
                });
            }

            setListPortfolios(autoCompleteListPortfolios);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingCoopMais(false);
        }
    };

    useEffect(() => {
        async function execute() {
            if (firstRender && yearMonthWatch && agenciesWatch) {
                await searchPortfoliosOfTheAgency(agenciesWatch.agency_sisbr_id);
            }
        }
        execute();
    }, [agenciesWatch]);

    useEffect(() => {
        async function initInputs() {
            if (userDate) {
                setInputsFormsHeaderCoopMaisOptions(userDate.agency_sisbr_id, userDate.portfolio_sisbr_id || 0);
            }
        }
        initInputs();
    }, [userDate]);

    useEffect(() => {
        if (yearMonthWatch && agenciesWatch && portfoliosWatch) {
            onSubmitHeaderCoopMais({
                year_month_coopmais: yearMonthWatch,
                agencies_coopmais: agenciesWatch,
                portfolios_coopmais: portfoliosWatch,
            });
        }
    }, [yearMonthWatch, portfoliosWatch]);

    const getProgressColor = () => {
        if (sumPointsCoopMais < 800) return themeContext.palette.info.light;
        if (sumPointsCoopMais < 900) return themeContext.palette.warning.light;
        if (sumPointsCoopMais < 1000) return themeContext.palette.success.light;
        return themeContext.palette.primary.light;
    };

    const gaugeOptions = {
        series: [
            {
                name: "Main Gauge",
                type: "gauge",
                startAngle: 180,
                endAngle: 0,
                min: 0,
                max: 1500,
                radius: "100%",
                progress: {
                    show: true,
                    width: 16,
                },
                axisLine: {
                    lineStyle: {
                        width: 16,
                    },
                },
                axisTick: { show: false },
                splitLine: { show: false },
                pointer: { show: false },
                axisLabel: { show: false },
                detail: {
                    formatter(value: number) {
                        return formatNumberWithThousandsSeparatorComma(value);
                    },
                    fontSize: 14,
                    fontWeight: "bold",
                    color: theme === "light" ? "#003641" : "#fff",
                    offsetCenter: [0, "-10%"],
                },
                title: { show: false },
                data: [
                    {
                        value: sumPointsCoopMais,
                        name: "Progresso",
                        itemStyle: { color: getProgressColor() },
                    },
                ],
            },
            {
                name: "Secondary Gauge",
                type: "gauge",
                startAngle: 180,
                endAngle: 0,
                min: 0,
                max: 1500,
                radius: "100%",
                progress: { show: false },
                pointer: { show: false },
                axisLabel: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
                detail: { show: false },
                title: { show: false },
                axisLine: {
                    lineStyle: {
                        width: 16,
                        color: [
                            [1000 / 1500, "transparent"],
                            [1010 / 1500, themeContext.palette.primary.light],
                            [1, "transparent"],
                        ],
                    },
                },
                data: [{ value: 0 }],
            },
        ],
    };

    return (
        <>
            <Grid item xs={12} sm={12} md={12}>
                <Box
                    component={Paper}
                    paddingTop={2}
                    paddingBottom={0.75}
                    sx={{
                        border: `1px solid ${colorBorderSystem}`,
                        borderRadius: "16px",
                        background: theme === "light" ? "#ffffff" : "linear-gradient(135deg, #071d20, #0A2A2F)",
                        width: "100%",
                        boxShadow:
                            theme === "light"
                                ? " rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
                                : "none",
                        "&::-webkit-scrollbar": {
                            height: "8px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: colorBorderSystem,
                        },
                    }}>
                    <Box
                        sx={{
                            display: "flex",
                            overflowX: "auto",
                            whiteSpace: "wrap",
                            paddingX: 2,
                            gap: 1,
                            "&::-webkit-scrollbar": {
                                height: "8px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: colorBorderSystem,
                            },
                        }}>
                        <Grid item xs={3} sm={3} md={!isSidebarOpen ? 1.75 : 1.25} sx={{ minWidth: 150 }} mt={0.65}>
                            <FormAutocomplete
                                fullWidth
                                name='year_month_coopmais'
                                placeholder='Selecione um Mês'
                                label='Ano / Mês'
                                variant='outlined'
                                size='medium'
                                disableClearable
                                disabled={loadingCoopMais}
                                disabledAutocomplete={loadingCoopMais}
                                control={control}
                                errors={errors}
                                options={listRefDate}
                            />
                        </Grid>

                        <Grid item xs={3} sm={3.5} md={!isSidebarOpen ? 3 : 2.5} sx={{ minWidth: 200 }} mt={0.65}>
                            <FormAutocomplete
                                fullWidth
                                name='agencies_coopmais'
                                label='Agência'
                                placeholder='Selecione uma Agência'
                                variant='outlined'
                                size='medium'
                                disableClearable
                                disabled={loadingCoopMais}
                                disabledAutocomplete={loadingCoopMais}
                                control={control}
                                errors={errors}
                                options={listAgencies}
                            />
                        </Grid>

                        <Grid item xs={3} sm={3.5} md={!isSidebarOpen ? 3 : 2.5} sx={{ minWidth: 200 }} mt={0.65}>
                            <FormAutocomplete
                                fullWidth
                                name='portfolios_coopmais'
                                label='Carteira'
                                placeholder='Selecione uma Carteira'
                                variant='outlined'
                                size='medium'
                                disableClearable
                                disabled={loadingCoopMais}
                                disabledAutocomplete={loadingCoopMais}
                                control={control}
                                errors={errors}
                                options={listPortfolios}
                            />
                        </Grid>

                        <Grid item xs={2} sm={2} md={!isSidebarOpen ? 1.2 : 1.5} sx={{ minWidth: 135 }}>
                            <Box
                                sx={{
                                    width: "100%",
                                    height: 56,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    overflow: "hidden",
                                }}>
                                <Chart options={gaugeOptions} height={110} width={135} mt={7} />
                            </Box>
                        </Grid>

                        <Grid item xs sm={12} md>
                            <Box display='flex' alignItems='center' paddingBlock={0.5} paddingBottom={1.25} mt={-0.5}>
                                {listTimelineMonths.map(({ month, icon, points, is_active }) => (
                                    <Tooltip
                                        key={month}
                                        title={is_active && formatNumberWithThousandsSeparatorComma(points)}>
                                        <Box mx={1.25} display='flex' flexDirection='column' alignItems='center'>
                                            <img
                                                src={getIconForPointsCoopMais(icon)}
                                                alt={`Ícone de ${month}`}
                                                width={40}
                                                height={40}
                                                style={{ cursor: is_active ? "pointer" : "default" }}
                                                onClick={() => {
                                                    if (!is_active) {
                                                        return;
                                                    }
                                                    handleOpenModal(month);
                                                }}
                                            />
                                            <Typography
                                                pt={0.75}
                                                variant='caption'
                                                color='text.secondary'
                                                fontSize={10}
                                                textAlign='center'>
                                                {month}
                                            </Typography>
                                        </Box>
                                    </Tooltip>
                                ))}
                            </Box>
                        </Grid>
                    </Box>
                </Box>
            </Grid>

            <Grid item container spacing={!isSidebarOpen ? 2 : 1} alignItems='stretch'>
                {listPanelCoopMaisStepKeys.length > 0 ? (
                    listPanelCoopMaisStepKeys
                        .sort((a, b) => a.order - b.order)
                        .map((item) => (
                            <Grid item xs={6} sm={6} md={3} lg={12 / listPanelCoopMaisStepKeys.length} key={item.id}>
                                <CoopMaisStepKeysCard
                                    title={item.title}
                                    currentValue={item.current_value}
                                    goalValue={item.goal_value}
                                    targetDateBottom={item.target_date}
                                    achievementPercentage={item.achievement_percentage}
                                    weight={item.weight}
                                    points={item.points}
                                    borderColor={colorBorderSystem}
                                    isInverse={item.is_inverse}
                                />
                            </Grid>
                        ))
                ) : (
                    <Grid
                        item
                        xs={12}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",
                            padding: "16px",
                            backgroundColor: "background.default",
                            mt: 3,
                            mb: 2,
                        }}>
                        <RunningWithErrorsOutlinedIcon color='primary' sx={{ fontSize: 35, mb: 1 }} />
                        <Typography color='text.secondary' sx={{ textAlign: "center" }}>
                            Não foram encontrados cards para a <b>agência</b> e <b>carteira</b> selecionadas. Por favor,
                            revise os filtros ou tente uma nova consulta.
                        </Typography>
                    </Grid>
                )}
            </Grid>

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                disableEscapeKeyDown={false}
                sx={{
                    "& .MuiModal-backdrop": {
                        backgroundColor: "rgb(0 0 0 / 60%)",
                    },
                }}>
                <Box>
                    {selectedRefMes && <RankingCoopMais closeButton={handleCloseModal} refMes={selectedRefMes} />}
                </Box>
            </Modal>
        </>
    );
}
