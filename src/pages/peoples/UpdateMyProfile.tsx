import { useEffect, useMemo, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { Breadcrumbs, Grid, Icon, Typography } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { BoxMain } from "@/components/Box/BoxMain";
import { FormPeople } from "@/components/Forms/People/FormPeople";
import { PeopleProps, validationPeopleSchema } from "@/components/Forms/People/constants";
import { IInfoPeopleConnected, searchInfoPeopleConnected, updateMyPerson } from "@/services/peoples";
import { useGlobal } from "@/contexts/GlobalContext";
import Address from "@/components/Forms/Address/Address";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import { AddressPros, AddressValidationSchema } from "@/components/Forms/Address/constant";

type UpdatePeopleFormProps = {
    people: PeopleProps;
    address: AddressPros;
};
export function UpdateMyProfile() {
    const [people, setPeople] = useState<IInfoPeopleConnected>({} as IInfoPeopleConnected);
    const { getInfoError, toggleStatusBackdrop, theme } = useGlobal();
    const [loading, setLoading] = useState(false);

    const methods = useForm<UpdatePeopleFormProps | any>({
        resolver: yupResolver(validationPeopleSchema.concat(AddressValidationSchema)),
    });

    const findPeople = async () => {
        try {
            toggleStatusBackdrop();
            const response = await searchInfoPeopleConnected();
            if (!response) {
                toast.error("Dados pessoais não encontrado");
                return;
            }
            setPeople((_) => ({ ...response }));
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    useEffect(() => {
        findPeople();
    }, []);

    const componentAddress = useMemo(
        () => (
            <Address
                address={
                    people.addresses
                        ? {
                              state: {
                                  id: people.addresses.addresses_cities.addresses_states.id,
                                  label: people.addresses.addresses_cities.addresses_states.name,
                              },
                              city: {
                                  id: people.addresses.addresses_cities.id,
                                  label: people.addresses.addresses_cities.name,
                              },
                              number_cep: String(people.addresses.number_cep),
                              number: people.addresses.number,
                              street: people.addresses.street,
                              complement: people.addresses.complement,
                              neighborhood: people.addresses.neighborhood,
                          }
                        : undefined
                }
            />
        ),
        [people.addresses],
    );

    const onSubmit = async ({ people: peopleForm, address }: UpdatePeopleFormProps) => {
        try {
            setLoading(true);

            const dataSent = {
                ...peopleForm,
                cel_phone_company: parseInt(peopleForm.cel_phone_company),
                cel_phone_personal: parseInt(peopleForm.cel_phone_personal),
                gender: peopleForm.gender.id,
                marital_status: peopleForm.marital_status.id,
                description: peopleForm.description,
                addresses: people.addresses
                    ? {
                          id: people.addresses.id,
                          id_addresses_city: address.city.id,
                          number_cep: parseInt(address.number_cep),
                          neighborhood: address.neighborhood,
                          street: address.street,
                          complement: address.complement,
                          number: address.number,
                      }
                    : address
                      ? {
                            id_addresses_city: address.city.id,
                            number_cep: parseInt(address.number_cep),
                            neighborhood: address.neighborhood,
                            street: address.street,
                            complement: address.complement,
                            number: address.number,
                        }
                      : undefined,
            };

            await updateMyPerson(dataSent);

            setLoading(false);
            toast.success("Atualizado com sucesso");

            await findPeople();
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
            setLoading(false);
        }
    };

    return (
        <>
            <Grid container spacing={1} justifyContent='center' paddingInline={2} mt={0} mb={0.75} wrap='wrap'>
                <Grid item xs={12} md={12}>
                    <Breadcrumbs aria-label='breadcrumb' separator='›'>
                        <Typography color='text.primary' sx={{ display: "inline-flex", alignItems: "center" }} pt={1}>
                            <ManageAccountsOutlinedIcon
                                sx={{ color: theme === "light" ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }}
                            />
                            Meu Perfil
                        </Typography>
                    </Breadcrumbs>
                </Grid>
            </Grid>

            <BoxMain isDivider={false} mt={0}>
                <FormProvider {...methods}>
                    <Grid component='form' container spacing={2} mt={0} onSubmit={methods.handleSubmit(onSubmit)}>
                        <FormPeople people={people} disabledInputsPeopleUpdate showImageProfile={true} />
                        {componentAddress}
                        <Grid container display='flex' justifyContent='center' mt={5} spacing={2}>
                            <LoadingButton
                                type='submit'
                                size='large'
                                color={"success"}
                                variant='contained'
                                startIcon={<Icon>save</Icon>}
                                loading={loading}
                                sx={{ boxShadow: "none" }}>
                                Salvar
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </FormProvider>
            </BoxMain>
        </>
    );
}
