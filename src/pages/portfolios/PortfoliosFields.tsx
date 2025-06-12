import { useEffect, useState } from "react";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import WalletOutlinedIcon from "@mui/icons-material/WalletOutlined";
import { Grid, Icon, Typography } from "@mui/material";
import { PortfoliosStepperContextProvider } from "@/contexts/PortfoliosStepperContext";
import { Portfolio } from "./stepper-children/Portfolio";
import { Collaborators } from "./stepper-children/Collaborators";
import { LoadingButton } from "@mui/lab";
import { useGlobal } from "@/contexts/GlobalContext";
import { useConfirm } from "material-ui-confirm";
import {
    changeStatusPortfolio,
    searchPortfolioByID,
    searchPortfolioEmployeesByID,
    searchPortfolioResponsibleEmployeesByID,
} from "@/services/portfolios";
import {
    AutoCompleteNumber,
    IPortfoliosUpdateColumn,
    SearchAllParamsPortfolios,
    SearchAllParamsPortfoliosById,
} from "@/types/portfolios";
import { toast } from "react-toastify";
import { CustomizedSteppers } from "@/components/Stepper/Context/CustomizedSteppers";
import { searchAutoCompleteEmployees } from "@/services/employees";
import { searchAutocompleteAgencies } from "@/services/agencies";
import moment from "moment";

type Props = {
    idPortfolio?: number;
    updateColumn?: (params: IPortfoliosUpdateColumn) => void;
    onClose?: () => void;
};

export function PortfoliosFields({ idPortfolio, updateColumn, onClose }: Props) {
    const [infoStepperPortfolios, setInfoStepperPortfolios] = useState<SearchAllParamsPortfoliosById>();
    const [autoCompleteEmployees, setAutoCompleteEmployees] = useState<SearchAllParamsPortfolios>();
    const [autoCompleteAgencies, setAutoCompleteAgencies] = useState<AutoCompleteNumber[]>([]);
    const [autoCompleteManagersEmployees, setAutoCompleteManagersEmployees] = useState<AutoCompleteNumber[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<boolean>(true);

    const { getInfoError, toggleStatusBackdrop } = useGlobal();
    const confirm = useConfirm();

    const handleChangeStatus = () => {
        if (idPortfolio) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: "O registro de carteira sofrerá alteração em seu status.",
            })
                .then(async () => {
                    try {
                        await changeStatusPortfolio(idPortfolio, { is_active: !status });
                        setStatus((status) => !status);
                        updateColumn?.({
                            id: idPortfolio,
                            is_active: !status,
                            updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                        });
                        toast.success("Status da Carteira alterado com sucesso!");
                    } catch (error) {
                        const info = await getInfoError(error);
                        toast.error(info.message);
                    }
                })
                .catch(() => {});
        }
    };

    const getDataValuesAutoComplete = async () => {
        try {
            toggleStatusBackdrop();

            const [autocompleteAgencies, autocompleteEmployees] = await Promise.all([
                searchAutocompleteAgencies({ with_restrict_agency: true }),
                searchAutoCompleteEmployees({
                    is_active: true,
                }),
            ]);

            const formattedAgencies = autocompleteAgencies.map((item) => ({
                id: item.id,
                label: item.abbreviation,
            }));

            setAutoCompleteAgencies(formattedAgencies);

            const formattedManagersEmployees: AutoCompleteNumber[] = autocompleteEmployees
                .map((value) => ({
                    id: value.id,
                    name: value.name,
                    is_manager: value.is_manager,
                }))
                .filter(({ is_manager }) => is_manager)
                .map(({ id, name }) => ({ id, label: name }));

            setAutoCompleteManagersEmployees(formattedManagersEmployees);

            setAutoCompleteEmployees({
                employees_portfolio: autocompleteEmployees,
            });
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const getDataValuesPortfolioById = async (id_portfolio: number) => {
        try {
            toggleStatusBackdrop();

            const [dataPortfolio, dataResponsibleEmployeesPortfolio, dataEmployeesPortfolio] = await Promise.all([
                searchPortfolioByID(id_portfolio),
                searchPortfolioResponsibleEmployeesByID(id_portfolio),
                searchPortfolioEmployeesByID(id_portfolio),
            ]);

            const { substitutes, assistants } = dataResponsibleEmployeesPortfolio.reduce<{
                substitutes: { id: number; label: string }[];
                assistants: { id: number; label: string }[];
            }>(
                (acc, { id, name, type_responsible }) => {
                    const employee = { id, label: name };
                    if (type_responsible === "substituto") {
                        acc.substitutes.push(employee);
                    } else if (type_responsible === "assistente") {
                        acc.assistants.push(employee);
                    }
                    return acc;
                },
                { substitutes: [], assistants: [] },
            );

            const collaborators = dataEmployeesPortfolio.map(({ id, name }) => ({ id, name }));

            setInfoStepperPortfolios({
                name: dataPortfolio.name,
                id_agency: dataPortfolio.id_agency,
                ref_id: dataPortfolio.ref_id,
                portfolio_sisbr_id: dataPortfolio.portfolio_sisbr_id,
                id_main_responsible: dataPortfolio.id_main_responsible,
                is_global: dataPortfolio.is_global,
                is_active: dataPortfolio.is_active,
                is_visible: dataPortfolio.is_visible,
                description: dataPortfolio.description,
                substitutes,
                assistants,
                collaborators,
            });

            setStatus(dataPortfolio.is_active ?? Boolean);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    useEffect(() => {
        getDataValuesAutoComplete();

        if (idPortfolio) {
            getDataValuesPortfolioById(idPortfolio);
        }
    }, [idPortfolio]);

    return (
        <Grid display='flex' flex={1} flexDirection='column'>
            <Grid display='flex' justifyContent='center' flex={1}>
                <Typography fontWeight='bold'>ETAPAS</Typography>
            </Grid>

            <PortfoliosStepperContextProvider>
                <CustomizedSteppers
                    steps={["Carteira", "Colaboradores"]}
                    icons={{ 1: <WalletOutlinedIcon />, 2: <GroupAddIcon /> }}
                    children={(props) => [
                        <Portfolio
                            key={0}
                            dataValues={{
                                autocomplete_agencies: autoCompleteAgencies,
                                autocomplete_managers_employees: autoCompleteManagersEmployees,
                                ...autoCompleteEmployees,
                                ...infoStepperPortfolios,
                            }}
                            idPortfolio={idPortfolio}
                            {...props}
                        />,
                        <Collaborators
                            key={1}
                            idPortfolio={idPortfolio}
                            dataValues={{ ...infoStepperPortfolios, ...autoCompleteEmployees }}
                            onClose={onClose}
                            updateColumn={updateColumn}
                            {...props}
                        />,
                    ]}
                />

                <Grid container justifyContent='center' mt={0}>
                    {idPortfolio && (
                        <Grid item>
                            <LoadingButton
                                size='large'
                                color={"info"}
                                variant='contained'
                                onClick={handleChangeStatus}
                                startIcon={<Icon>autorenew</Icon>}
                                title='Alterar situação'
                                loading={loading}
                                sx={{ borderRadius: "8px" }}>
                                {status ? "Inativar" : "Ativar"}
                            </LoadingButton>
                        </Grid>
                    )}
                </Grid>
            </PortfoliosStepperContextProvider>
        </Grid>
    );
}
