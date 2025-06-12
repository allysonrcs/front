import { useEffect, useState } from "react";
import { Box, BoxProps, Grid, Icon, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useGlobal } from "@/contexts/GlobalContext";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { searchAutocompleteSector } from "@/services/sectors";
import { searchAutoCompleteEmployees } from "@/services/employees";
import { searchProductivityDailyByID, transferResponsibleProductivityDaily } from "@/services/productivities-control";
import moment from "moment";
import FormInput from "@/components/FormComponents/FormInput";
import { useConfirm } from "material-ui-confirm";
import { statusWithoutLabelMap } from "../ListRecordsProductivityDaily";

type AutoCompleteNumber = {
    id: number;
    label: string;
};
export type TransferProps = {
    agencies: AutoCompleteNumber;
    sectors: AutoCompleteNumber;
    employees: AutoCompleteNumber;
    content_manual?: string | null;
};

export interface IInfoProductivityDaily {
    id: number;
    status: string;
    client_name: string;
    created_by_name: string;
}

export type EditTransferProductivityProps = {
    id?: number;
    created_by_name?: string;
    creator_agency_name?: string;
    updated_at?: string;
};

export type ModalTransferProductivityProps = {
    idProductivityDaily?: number;
    handleClose?: () => void;
    updateColumn?: (params: EditTransferProductivityProps) => void;
} & BoxProps;

export function TransferProductivityDaily({
    idProductivityDaily,
    handleClose,
    updateColumn,
    ...props
}: ModalTransferProductivityProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [agencies, setAgencies] = useState<AutoCompleteNumber[]>([]);
    const [sectors, setSectors] = useState<AutoCompleteNumber[]>([]);
    const [collaborators, setCollaborators] = useState<AutoCompleteNumber[]>([]);
    const [infoProductivityDaily, setInfoProductivityDaily] = useState<IInfoProductivityDaily>();
    const { getInfoError } = useGlobal();
    const confirm = useConfirm();

    const validationTransferProductivityDailySchema = Yup.object().shape({
        agencies: Yup.object()
            .shape({
                id: Yup.number().required(),
                label: Yup.string().required(),
            })
            .required("Obrigatório"),
        sectors: Yup.object()
            .shape({
                id: Yup.number().required(),
                label: Yup.string().required(),
            })
            .required("Obrigatório"),
        employees: Yup.object()
            .shape({
                id: Yup.number().required(),
                label: Yup.string().required(),
            })
            .required("Obrigatório"),
        content_manual: Yup.string().nullable(),
    });

    const {
        handleSubmit,
        setValue,
        resetField,
        watch,
        control,
        formState: { errors },
    } = useForm<TransferProps>({ resolver: yupResolver(validationTransferProductivityDailySchema) });

    const agenciesWatch = watch("agencies");
    const sectorsWatch = watch("sectors");
    const employeesWatch = watch("employees");

    const onSubmitTransferResponsibleProductivityDaily = async (params: TransferProps) => {
        try {
            setLoading(true);

            if (idProductivityDaily) {
                await transferResponsibleProductivityDaily(idProductivityDaily, {
                    id_employee: params.employees.id,
                    content_manual: params?.content_manual,
                });

                updateColumn?.({
                    created_by_name: params.employees.label,
                    creator_agency_name: params.agencies.label,
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                });

                toast.success(`Responsável da Produtividade Alterado com sucesso!`);

                handleClose?.();
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const searchAgencies = async () => {
        try {
            const agenciesAutoComplete = await searchAutocompleteAgencies({
                is_active: true,
                with_restrict_agency: true,
            });

            const mapAgency = agenciesAutoComplete.map(({ id, abbreviation }) => {
                return { id, label: abbreviation };
            });

            setAgencies(mapAgency);

            if (mapAgency && mapAgency.length === 1) {
                setValue("agencies", { id: mapAgency[0].id, label: mapAgency[0].label });
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchSectorsOfTheAgency = async (id_agency: number) => {
        try {
            const sectorAutoComplete = await searchAutocompleteSector({ is_active: true, id_agency });

            const mapSector = sectorAutoComplete.map(({ id, name }) => {
                return { id, label: name };
            });

            setSectors(mapSector);

            if (mapSector && mapSector.length === 1) {
                setValue("sectors", {
                    id: mapSector[0].id,
                    label: mapSector[0].label,
                });
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchEmployeeOfTheSector = async () => {
        try {
            const employeesAutoComplete = await searchAutoCompleteEmployees({
                id_agency: agenciesWatch.id,
                id_sector: sectorsWatch.id,
                is_active: true,
                has_function: true,
            });

            const mapEmployees = employeesAutoComplete.map(({ id, name }) => {
                return { id, label: name };
            });

            setCollaborators(mapEmployees);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    useEffect(() => {
        async function execute() {
            resetField("sectors");
            resetField("employees");
            setSectors([]);
            setCollaborators([]);

            if (agenciesWatch?.id) {
                setLoading(true);
                await searchSectorsOfTheAgency(agenciesWatch.id);
                setLoading(false);
            }
        }
        execute();
    }, [agenciesWatch]);

    useEffect(() => {
        async function execute() {
            resetField("employees");
            setCollaborators([]);

            if (sectorsWatch?.id) {
                setLoading(true);
                await searchEmployeeOfTheSector();
                setLoading(false);
            }
        }
        execute();
    }, [sectorsWatch]);

    useEffect(() => {
        async function execute() {
            setLoading(true);
            if (idProductivityDaily) {
                await searchAgencies();

                const { id, status, client_name, created_by_name } =
                    await searchProductivityDailyByID(idProductivityDaily);

                setInfoProductivityDaily({ id, status, client_name, created_by_name });
            }

            setLoading(false);
        }

        execute();
    }, []);

    return (
        <BoxModal title='Transferir Responsável' handleClose={handleClose} width={"450px"} {...props}>
            {infoProductivityDaily && (
                <Grid container justifyContent='center' mt={-2.5} mb={1.5}>
                    <Typography fontWeight={"100"} fontSize={14}>
                        {statusWithoutLabelMap[infoProductivityDaily.status] + " " + infoProductivityDaily.client_name}
                    </Typography>
                </Grid>
            )}

            <Box component={"form"}>
                <Grid container gap={2}>
                    <Grid item xs={12} md={12}>
                        <FormAutocomplete
                            fullWidth
                            name='agencies'
                            label='Agência'
                            variant='outlined'
                            disabledAutocomplete={idProductivityDaily ? false : true}
                            control={control}
                            errors={errors}
                            options={agencies}
                        />
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <FormAutocomplete
                            fullWidth
                            name='sectors'
                            label='Setor'
                            variant='outlined'
                            disabledAutocomplete={!agenciesWatch || (idProductivityDaily ? false : true)}
                            control={control}
                            errors={errors}
                            options={sectors}
                        />
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <FormAutocomplete
                            fullWidth
                            name='employees'
                            label='Colaborador'
                            variant='outlined'
                            disabledAutocomplete={!sectorsWatch}
                            control={control}
                            errors={errors}
                            options={collaborators}
                        />
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <FormInput
                            fullWidth
                            multiline
                            label='Motivo da transferência:'
                            name='content_manual'
                            type='text'
                            variant='outlined'
                            rows={3}
                            control={control}
                            errors={errors}
                        />
                    </Grid>
                </Grid>

                {infoProductivityDaily && (
                    <Grid container justifyContent='center' mt={1.5}>
                        <Typography fontWeight={"100"} fontSize={14}>
                            <Typography component={"span"} color={"primary"} fontWeight={"600"} fontSize={14}>
                                De:
                            </Typography>{" "}
                            {infoProductivityDaily.created_by_name + " "}
                            <Typography component={"span"} color={"primary"} fontWeight={"600"} fontSize={14}>
                                ➡
                            </Typography>{" "}
                            {employeesWatch?.label ? ` ${employeesWatch.label}` : "Indefinido"}
                        </Typography>
                    </Grid>
                )}

                <Grid container justifyContent={"center"} mt={2}>
                    <LoadingButton
                        fullWidth
                        size='large'
                        color='primary'
                        variant='contained'
                        title='Transferir'
                        startIcon={<Icon>published_with_changes_outlined_icon</Icon>}
                        loading={loading}
                        onClick={async () => {
                            await confirm({
                                title: "Confirmação de Transferência de Responsabilidade",
                                description: "Tem certeza de que deseja realizar a transferência do responsável?",
                            })
                                .then(() =>
                                    handleSubmit((params) => onSubmitTransferResponsibleProductivityDaily(params))(),
                                )
                                .catch(() => {});
                        }}>
                        Transferir
                    </LoadingButton>
                </Grid>
            </Box>
        </BoxModal>
    );
}
