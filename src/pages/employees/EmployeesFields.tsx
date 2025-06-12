import { FormProvider, useForm } from "react-hook-form";
import { Grid, GridProps, Icon, Typography } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import { useConfirm } from "material-ui-confirm";
import * as Yup from "yup";
import { useGlobal } from "@/contexts/GlobalContext";
import {
    PeopleProps as ComponentPeopleProps,
    validationPeopleEmployeeSchema,
} from "@/components/Forms/People/constants";
import FormAutocomplete from "@/components/FormComponents/Context/FormAutocomplete";
import { FormPeople } from "@/components/Forms/People/FormPeople";
import {
    createEmployee,
    updateEmployee,
    findOneEmployee,
    IEmployee,
    changeStatusEmployee,
    searchAutoCompleteEmployees,
} from "@/services/employees";
import { searchAutocompleteAgencies as searchAutocompleteAgencies } from "@/services/agencies";
import { searchAutocompleteSector } from "@/services/sectors";
import { searchTeamAutocomplete } from "@/services/teams";
import FormInput from "@/components/FormComponents/Context/FormInput";
import FormCheckbox from "@/components/FormComponents/FormCheckbox";
import { IAgencyIntervalAutocomplete, autocompleteWorkBreak } from "@/services/working-breaks";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import { searchAutocompleteRole } from "@/services/roles";
import { UpdateColumnEmployeeProps } from "./ListRecordsEmployees";
import moment from "moment";
import { searchAutoCompleteCooperatives } from "@/services/cooperatives";
import FormDatePicker from "@/components/FormComponents/Context/FormDatePicker";
import { searchAutoCompletePortfolios } from "@/services/portfolios";

type AutocompleteNumber = {
    id: number;
    label: string;
};

type workbreak = {
    id: number;
    label: string;
};

type EmployeeProps = {
    cooperatives: AutocompleteNumber;
    agency: AutocompleteNumber;
    portfolio?: AutocompleteNumber;
    sector: AutocompleteNumber;
    team?: AutocompleteNumber;
    role: AutocompleteNumber;
    immediate_superior?: AutocompleteNumber;
    people: ComponentPeopleProps;
    email_corporate?: string | null;
    phone_ramal?: number | null;
    matriculation_id?: number | null;
    date_admission?: string | null;
    is_president?: boolean;
    is_counselor?: boolean;
    is_director?: boolean;
    is_manager?: boolean;
    is_coordinator?: boolean;
    is_supervisor?: boolean;
    is_assistent?: boolean;
    is_analyst?: boolean;
    is_attendant?: boolean;
    is_agent?: boolean;
    is_cashier?: boolean;
    is_trainee?: boolean;
    is_apprentice?: boolean;
    workingBreak: workbreak[];
    on_vacation?: boolean;
    is_point_required?: boolean;
};

export type EmployeeComponentProps = {
    idEmployee?: number;
    updateColumn?: (employee: UpdateColumnEmployeeProps) => void;
} & GridProps;

export function EmployeesFields({ idEmployee, updateColumn, ...props }: EmployeeComponentProps) {
    const { getInfoError, toggleStatusBackdrop } = useGlobal();
    const [listIntervalInfo, setListIntervalInfo] = useState<IAgencyIntervalAutocomplete[]>([]);
    const [dataEmployee, setDataEmployee] = useState<IEmployee>({} as IEmployee);
    const [arrayCooperatives, setArrayCooperatives] = useState<AutocompleteNumber[]>([]);
    const [arrayAgencies, setArrayAgencies] = useState<AutocompleteNumber[]>([]);
    const [arrayPortfolio, setArrayPortfolio] = useState<AutocompleteNumber[]>([]);
    const [arraySector, setArraySector] = useState<AutocompleteNumber[]>([]);
    const [arrayTeam, setArrayTeam] = useState<AutocompleteNumber[]>([]);
    const [arrayCollaborator, setArrayCollaborator] = useState<AutocompleteNumber[]>([]);
    const [roles, setRoles] = useState<AutocompleteNumber[]>([]);
    const [status, setStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const confirm = useConfirm();

    const methods = useForm<EmployeeProps | any>({
        resolver: yupResolver(
            Yup.object()
                .shape({
                    cooperatives: Yup.object().typeError("Obrigatório").required("Obrigatório"),
                    agency: Yup.object().typeError("Obrigatório").required("Obrigatório"),
                    portfolio: Yup.object().nullable(),
                    sector: Yup.object().typeError("Obrigatório").required("Obrigatório"),
                    immediate_superior: Yup.object().nullable(),
                    team: Yup.object().nullable(),
                    email_corporate: Yup.string()
                        .max(255, "Excedeu 255 caracteres")
                        .email("Email inválido")
                        .nullable()
                        .trim(),
                    phone_ramal: Yup.number()
                        .nullable()
                        .transform((v) => (v === "" || Number.isNaN(v) ? null : v)),
                    matriculation_id: Yup.number()
                        .nullable()
                        .transform((v) => (v === "" || Number.isNaN(v) ? null : v)),
                    date_admission: Yup.date().typeError("Digite uma data válida").nullable(),
                    is_president: Yup.boolean().nullable(),
                    is_counselor: Yup.boolean().nullable(),
                    is_director: Yup.boolean().nullable(),
                    is_manager: Yup.boolean().nullable(),
                    is_coordinator: Yup.boolean().nullable(),
                    is_supervisor: Yup.boolean().nullable(),
                    is_assistent: Yup.boolean().nullable(),
                    is_analyst: Yup.boolean().nullable(),
                    is_attendant: Yup.boolean().nullable(),
                    is_agent: Yup.boolean().nullable(),
                    is_cashier: Yup.boolean().nullable(),
                    is_trainee: Yup.boolean().nullable(),
                    is_apprentice: Yup.boolean().nullable(),
                    workingBreak: Yup.array().nullable(),
                    role: Yup.object().typeError("Obrigatório").required("Obrigatório"),
                    on_vacation: Yup.boolean(),
                    is_point_required: Yup.boolean(),
                })
                .concat(validationPeopleEmployeeSchema),
        ),
    });

    const cooperative_selected = methods.watch("cooperatives");
    const agency_selected = methods.watch("agency");
    const sector_selected = methods.watch("sector");

    const onSubmit = async (data: EmployeeProps) => {
        try {
            setLoading(true);

            let team = {};
            if (data.team) {
                team = {};
            }

            let immediate_superior = {};
            if (data.immediate_superior) {
                immediate_superior = {};
            }

            let peoples = {
                name: data.people.name,
                email: data.people.email ? data.people.email : null,
                document_cpf: data.people.document_cpf,
                document_rg: data.people.document_rg,
                cel_phone_personal: data.people.cel_phone_personal ? parseInt(data.people.cel_phone_personal) : null,
                cel_phone_company: data.people.cel_phone_company ? parseInt(data.people.cel_phone_company) : null,
                birthday_date: data.people.birthday_date,
                gender: data.people.gender.id,
                marital_status: data.people.marital_status.id,
                issuing_agency_rg: data.people.issuing_agency_rg,
                description: data.people.description,
            };

            if (idEmployee) {
                await updateEmployee(idEmployee, {
                    peoples,
                    employees: {
                        id_cooperative: data.cooperatives.id,
                        id_agency: data.agency.id,
                        id_portfolio: data.portfolio ? data.portfolio.id : null,
                        id_sector: data.sector.id,
                        phone_ramal: data.phone_ramal ? data.phone_ramal : null,
                        matriculation_id: data.matriculation_id ? data.matriculation_id : null,
                        email_corporate: data.email_corporate ? data.email_corporate : null,
                        date_admission: data.date_admission ? data.date_admission : null,
                        is_president: data.is_president,
                        is_counselor: data.is_counselor,
                        is_director: data.is_director,
                        is_manager: data.is_manager,
                        is_coordinator: data.is_coordinator,
                        is_supervisor: data.is_supervisor,
                        is_assistent: data.is_assistent,
                        is_analyst: data.is_analyst,
                        is_attendant: data.is_attendant,
                        is_agent: data.is_agent,
                        is_cashier: data.is_cashier,
                        is_trainee: data.is_trainee,
                        is_apprentice: data.is_apprentice,
                        id_team: data.team ? data.team.id : null,
                        id_immediate_superior: data.immediate_superior?.id ? data.immediate_superior.id : null,
                        id_role: data.role.id,
                        on_vacation: data.on_vacation,
                        is_point_required: data.is_point_required,
                    },
                    working_breaks: {
                        id_working_break: data.workingBreak.map((ref) => ref.id),
                    },
                });

                updateColumn?.({
                    id: idEmployee,
                    id_agency: data.agency.id,
                    cooperative_name: data.cooperatives.label,
                    people_name: data.people.name,
                    sector_name: data.sector.label,
                    team_name: data.team?.label ?? "",
                    portfolio_name: data.portfolio?.label ?? "",
                    role_name: data.role.label,
                    agency_name: data.agency.label,
                    employee_email_corporate: data.email_corporate ?? "",
                });

                toast.success("Registro atualizado com sucesso.");
            } else {
                await createEmployee({
                    peoples: peoples,
                    employees: {
                        id_cooperative: data.cooperatives.id,
                        id_agency: data.agency.id,
                        id_portfolio: data.portfolio ? data.portfolio.id : null,
                        id_sector: data.sector.id,
                        email_corporate: data.email_corporate ? data.email_corporate : null,
                        phone_ramal: data.phone_ramal ? data.phone_ramal : null,
                        matriculation_id: data.matriculation_id ? data.matriculation_id : null,
                        date_admission: data.date_admission ? data.date_admission : null,
                        is_president: data.is_president,
                        is_counselor: data.is_counselor,
                        is_director: data.is_director,
                        is_manager: data.is_manager,
                        is_coordinator: data.is_coordinator,
                        is_supervisor: data.is_supervisor,
                        is_assistent: data.is_assistent,
                        is_analyst: data.is_analyst,
                        is_attendant: data.is_attendant,
                        is_agent: data.is_agent,
                        is_cashier: data.is_cashier,
                        is_trainee: data.is_trainee,
                        is_apprentice: data.is_apprentice,
                        id_team: data.team ? data.team.id : null,
                        id_immediate_superior: data.immediate_superior?.id ? data.immediate_superior.id : null,
                        id_role: data.role.id,
                        on_vacation: data.on_vacation,
                        is_point_required: data.is_point_required,
                    },
                    working_breaks: {
                        id_working_break: data.workingBreak.map((ref) => ref.id),
                    },
                });
                methods.reset();
                methods.setValue("date_admission", null);
                methods.setValue("people.birthday_date", null);

                toast.success("Registro criado com sucesso.");
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const getPeople = () => {
        const { peoples } = dataEmployee;

        return {
            id: peoples.id,
            email: peoples.email,
            name: peoples.name,
            document_cpf: peoples.document_cpf,
            document_rg: peoples.document_rg,
            cel_phone_company: peoples.cel_phone_company ? parseInt(peoples.cel_phone_company) : undefined,
            cel_phone_personal: parseInt(peoples.cel_phone_personal),
            birthday_date: peoples.birthday_date,
            gender: peoples.gender,
            marital_status: peoples.marital_status,
            issuing_agency_rg: peoples.issuing_agency_rg,
            description: peoples.description ? peoples.description : "",
        };
    };

    const componentPeople = useMemo(
        () => <FormPeople people={Object.keys(dataEmployee).length > 0 ? getPeople() : undefined} />,
        [dataEmployee],
    );

    const searchRegister = async (id_employee: number) => {
        try {
            const data = await findOneEmployee(id_employee);
            setDataEmployee(data);

            let arrayCooperatives = {
                id: data.cooperatives.id,
                label: data.cooperatives.abbreviation,
            };

            if (data.portfolios) {
                let arrayPortfolios = {
                    id: data.portfolios.id,
                    label: data.portfolios.name,
                };
                methods.setValue("portfolio", arrayPortfolios);
            }

            let arrayAgencies = {
                id: data.agencies.id,
                label: data.agencies.name,
            };

            let arraySectors = {
                id: data.sectors.id,
                label: data.sectors.name,
            };

            if (data.teams) {
                let arrayTeam = {
                    id: data.teams.id,
                    label: data.teams.name,
                };
                methods.setValue("team", arrayTeam);
            }

            if (data.superior_immediate_father) {
                let arrayImmediateSuperior = {
                    id: data.superior_immediate_father.id,
                    label: data.superior_immediate_father.peoples.name,
                };
                methods.setValue("immediate_superior", arrayImmediateSuperior);
            }

            methods.setValue("cooperatives", arrayCooperatives);
            methods.setValue("agency", arrayAgencies);
            methods.setValue("sector", arraySectors);

            if (data.phone_ramal) {
                methods.setValue("phone_ramal", data.phone_ramal);
            }

            if (data.matriculation_id) {
                methods.setValue("matriculation_id", data.matriculation_id);
            }

            methods.setValue("date_admission", data?.date_admission ?? null);
            methods.setValue("email_corporate", data.email_corporate ?? "");
            methods.setValue("is_president", data.is_president);
            methods.setValue("is_counselor", data.is_counselor);
            methods.setValue("is_director", data.is_director);
            methods.setValue("is_manager", data.is_manager);
            methods.setValue("is_coordinator", data.is_coordinator);
            methods.setValue("is_supervisor", data.is_supervisor);
            methods.setValue("is_assistent", data.is_assistent);
            methods.setValue("is_analyst", data.is_analyst);
            methods.setValue("is_attendant", data.is_attendant);
            methods.setValue("is_agent", data.is_agent);
            methods.setValue("is_cashier", data.is_cashier);
            methods.setValue("is_trainee", data.is_trainee);
            methods.setValue("is_apprentice", data.is_apprentice);
            methods.setValue("on_vacation", data.on_vacation);
            methods.setValue("is_point_required", data.is_point_required);

            if (data?.roles) {
                methods.setValue("role", { ...data.roles, label: data.roles.name });
            }

            methods.setValue(
                "workingBreak",
                data.working_breaks_employees.map((value) => {
                    const timeStart = moment(value.working_breaks.time_start, "HH:mm:ss").format("HH:mm");
                    const timeEnd = moment(value.working_breaks.time_end, "HH:mm:ss").format("HH:mm");

                    return {
                        id: value.working_breaks.id,
                        label: `${value.working_breaks.type} ${timeStart} às ${timeEnd}`,
                    };
                }),
            );

            setStatus(data.is_active);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchAgency = async () => {
        try {
            const agency = await searchAutocompleteAgencies({ is_active: true, with_restrict_agency: true });

            let arrayAgencies = agency.map((value) => {
                return {
                    id: value.id,
                    label: value.abbreviation,
                };
            });

            setArrayAgencies(arrayAgencies);

            if (arrayAgencies && arrayAgencies.length === 1) {
                methods.setValue("agency", arrayAgencies[0]);
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchPortfoliosOfTheAgency = async (id_agency: number) => {
        try {
            const dataPortfolios = await searchAutoCompletePortfolios({
                id_agency,
                is_active: true,
                with_restrict_agency: false,
            });

            let arrayPortfolios = dataPortfolios.map((value) => {
                return {
                    id: value.id,
                    label: value.name,
                };
            });

            setArrayPortfolio(arrayPortfolios);

            if (arrayPortfolio && arrayPortfolio.length === 1) {
                methods.setValue("portfolio", arrayPortfolio[0]);
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchSectorsOfTheAgency = async (id_agency: number) => {
        try {
            const sector = await searchAutocompleteSector({
                is_active: true,
                id_agency,
            });
            let arraySector = sector.map((value) => {
                return {
                    id: value.id,
                    label: value.name,
                };
            });

            setArraySector(arraySector);

            if (arraySector && arraySector.length === 1) {
                methods.setValue("sector", arraySector[0]);
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const handleChangeStatus = () => {
        confirm({
            title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
            description: "O registro do colaborador sofrerá alteração em seu status.",
        })
            .then(async () => {
                try {
                    idEmployee && (await changeStatusEmployee(idEmployee, { is_active: !status }));

                    setStatus((status) => !status);

                    idEmployee &&
                        updateColumn?.({
                            id: idEmployee,
                            is_active: !status,
                        });

                    toast.success("Situação alterada com sucesso!");
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                }
            })
            .catch(() => {});
    };

    const setAutocompleteIntervalAgencies = async (id_agency: number) => {
        try {
            const data = await autocompleteWorkBreak({
                id_agency,
                is_active: true,
            });

            setListIntervalInfo(data);
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
        }
    };

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();

                const resultAutocompletCooperatives = await searchAutoCompleteCooperatives({ is_active: true });

                const formattedCooperatives = resultAutocompletCooperatives.map((item) => ({
                    id: item.id,
                    label: item.abbreviation,
                }));

                setArrayCooperatives(formattedCooperatives);

                await searchAgency();
                if (idEmployee) {
                    await searchRegister(idEmployee);
                }
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        }
        execute();
    }, []);

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();

                if (
                    !Object.keys(dataEmployee).length ||
                    (Object.keys(dataEmployee).length && agency_selected?.id !== dataEmployee.agencies.id)
                ) {
                    methods.resetField("portfolio");
                    setArrayPortfolio([]);
                    methods.resetField("sector");
                    setArraySector([]);
                }

                const autoEmployee = await searchAutoCompleteEmployees({
                    is_active: true,
                });

                const refactor = autoEmployee
                    .filter((employee) => employee.id !== idEmployee)
                    .map(({ id, name }) => {
                        return { id: id, label: name };
                    });

                setArrayCollaborator(refactor);

                if (agency_selected) {
                    await searchPortfoliosOfTheAgency(agency_selected.id);
                    await searchSectorsOfTheAgency(agency_selected.id);
                    await setAutocompleteIntervalAgencies(agency_selected.id);
                    // COLOCAR LÓGICA PARA PEGAR O ID DO INPUT DA COOPERATIVA QUANDO SELECIONADA
                    const data = await searchAutocompleteRole({ id_cooperative: 1 });
                    setRoles(data.map((item: any) => ({ ...item, label: item.name })));
                }
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        }
        execute();
    }, [agency_selected]);

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();

                if (
                    !Object.keys(dataEmployee).length ||
                    (Object.keys(dataEmployee).length && sector_selected?.id !== dataEmployee.sectors?.id)
                ) {
                    methods.resetField("team");
                    setArrayTeam([]);
                }

                if (sector_selected) {
                    const teams = await searchTeamAutocomplete({
                        is_active: true,
                        id_sector: sector_selected.id,
                    });

                    setArrayTeam(
                        teams.map(({ id, name }: any) => {
                            return {
                                id,
                                label: name,
                            };
                        }),
                    );
                }
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        }
        execute();
    }, [sector_selected]);

    return (
        <FormProvider {...methods}>
            <Grid {...props}>
                <Grid component='form' container spacing={2} onSubmit={methods.handleSubmit(onSubmit)}>
                    <Grid item xs={12} mt={idEmployee ? -2 : undefined}>
                        <Typography overflow='hidden' whiteSpace='nowrap' textOverflow='ellipses' fontWeight={500}>
                            Dados de configuração do colaborador:
                        </Typography>
                    </Grid>

                    <Grid container item xs={12} md={12} spacing={2}>
                        <Grid item xs={12} md={6}>
                            <FormAutocomplete
                                name='cooperatives'
                                label='Cooperativa'
                                variant='outlined'
                                options={arrayCooperatives}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocomplete
                                fullWidth
                                name='agency'
                                variant='outlined'
                                label='Agência'
                                disabled={!cooperative_selected ? true : false}
                                disabledAutocomplete={!cooperative_selected ? true : false}
                                options={arrayAgencies}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                disabled={!agency_selected ? true : false}
                                disabledAutocomplete={!agency_selected ? true : false}
                                name='portfolio'
                                variant='outlined'
                                label='Carteira'
                                options={arrayPortfolio}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                options={arraySector}
                                disabled={!agency_selected ? true : false}
                                disabledAutocomplete={!agency_selected ? true : false}
                                name='sector'
                                variant='outlined'
                                label='Setor'
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                options={arrayTeam}
                                disabled={!sector_selected ? true : false}
                                disabledAutocomplete={!sector_selected ? true : false}
                                name='team'
                                variant='outlined'
                                label='Time'
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                options={roles.filter((gender) => gender.label !== "Administrador de Sistema")}
                                name='role'
                                variant='outlined'
                                label='Cargo'
                                fullWidth
                                disabled={!agency_selected}
                                disabledAutocomplete={!agency_selected}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormInput
                                fullWidth
                                type='email'
                                label='Email Corporativo'
                                variant='outlined'
                                name='email_corporate'
                            />
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <FormInput fullWidth type='number' label='Ramal' variant='outlined' name='phone_ramal' />
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <FormInput
                                fullWidth
                                type='number'
                                label='Chapa'
                                variant='outlined'
                                name='matriculation_id'
                            />
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <FormDatePicker
                                fullWidth
                                type='date'
                                name='date_admission'
                                variant='outlined'
                                label='Data Admissão'
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                name='immediate_superior'
                                variant='outlined'
                                label='Superior Imediato'
                                options={arrayCollaborator}
                            />
                        </Grid>
                    </Grid>

                    <Grid item xs={12} mt={2}>
                        <Typography overflow='hidden' whiteSpace='nowrap' textOverflow='ellipses' fontWeight={500}>
                            Atribuição:
                        </Typography>
                    </Grid>

                    <Grid item xs={12} container display='flex' gap={0.25}>
                        <FormCheckbox name='is_president' label='Presidente' control={methods.control} />
                        <FormCheckbox name='is_counselor' label='Conselheiro' control={methods.control} />
                        <FormCheckbox name='is_director' label='Diretor' control={methods.control} />
                        <FormCheckbox name='is_manager' label='Gerente' control={methods.control} />
                        <FormCheckbox name='is_coordinator' label='Coordenador' control={methods.control} />
                        <FormCheckbox name='is_analyst' label='Analista' control={methods.control} />
                        <FormCheckbox name='is_agent' label='Agente' control={methods.control} />
                        <FormCheckbox name='is_assistent' label='Assistente' control={methods.control} />
                        <FormCheckbox name='is_attendant' label='Atendente' control={methods.control} />
                        <FormCheckbox name='is_cashier' label='Caixa' control={methods.control} />
                        <FormCheckbox name='is_trainee' label='Estagiário' control={methods.control} />
                        <FormCheckbox name='is_apprentice' label='Aprendiz' control={methods.control} />
                        {/* <FormCheckbox name='is_supervisor' label='Supervisor' control={methods.control} /> */}
                    </Grid>

                    <Grid item xs={12} mt={2}>
                        <Typography overflow='hidden' whiteSpace='nowrap' textOverflow='ellipses' fontWeight={500}>
                            Dados pessoais do colaborador:
                        </Typography>
                    </Grid>

                    {componentPeople}

                    <Grid item xs={12} mt={1}>
                        <Typography overflow='hidden' whiteSpace='nowrap' textOverflow='ellipses' fontWeight={500}>
                            Informações Adicionais:
                        </Typography>
                    </Grid>

                    <Grid item md={6} xs={12}>
                        <FormCheckbox
                            name='is_point_required'
                            label='Colaborador Bate Ponto'
                            control={methods.control}
                        />
                    </Grid>

                    <Grid item md={6} xs={12}>
                        <FormCheckbox
                            name='on_vacation'
                            label='Colaborador se encontra de férias'
                            control={methods.control}
                        />
                    </Grid>

                    <Grid item xs={12} mt={1}>
                        <Typography overflow='hidden' whiteSpace='nowrap' textOverflow='ellipses' fontWeight={500}>
                            Intervalos do colaborador:
                        </Typography>
                    </Grid>

                    <Grid sx={{ display: "flex", flexDirection: "row", mt: 2 }} item xs={12} md={12}>
                        <Grid item xs={12}>
                            <FormAutocompleteMultiple
                                fullWidth
                                label='Intervalo'
                                name='workingBreak'
                                variant='outlined'
                                size='medium'
                                options={listIntervalInfo.map((value) => {
                                    const timeStart = moment(value.time_start).format("HH:mm");
                                    const timeEnd = moment(value.time_end).format("HH:mm");

                                    return {
                                        ...value,
                                        label: `${value.type} ${timeStart} às ${timeEnd}`,
                                    };
                                })}
                                control={methods.control}
                                errors={methods.formState.errors}
                            />
                        </Grid>
                    </Grid>

                    <Grid container justifyContent='center' mt={5} spacing={1}>
                        {idEmployee && (
                            <Grid item>
                                <LoadingButton
                                    size='large'
                                    color={"info"}
                                    variant='contained'
                                    onClick={handleChangeStatus}
                                    startIcon={<Icon>autorenew</Icon>}
                                    title='Alterar situação'
                                    loading={loading}>
                                    {!status ? "Ativar" : "Inativar"}
                                </LoadingButton>
                            </Grid>
                        )}

                        <Grid item>
                            <LoadingButton
                                type='submit'
                                size='large'
                                color={"success"}
                                variant='contained'
                                title='Salvar'
                                startIcon={<Icon>save</Icon>}
                                loading={loading}>
                                Salvar
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </FormProvider>
    );
}
