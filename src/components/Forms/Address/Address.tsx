import { useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { findAllState, IState } from "../../../services/addresses-states";
import { ICity, searchCity } from "../../../services/addresses-cities";
import { IAddressV2, searchCep } from "../../../services/apiBrasil";
import { AutocompleteOption, AddressPros } from "./constant";
import { useGlobal } from "../../../contexts/GlobalContext";
import FormInput from "../../FormComponents/Context/FormInput";
import FormInputMask from "../../FormComponents/Context/FormInputMask";
import FormAutocomplete from "../../FormComponents/Context/FormAutocomplete";

type FormAddressProps = {
    address?: AddressPros;
    disabledInputs?: boolean;
};

export default function Address({ address, disabledInputs = false }: FormAddressProps) {
    const [stateOptions, setStateOptions] = useState<IState[]>([]);
    const [cityOptions, setCityOptions] = useState<ICity[]>([]);
    const [dataCep, setDataCep] = useState<IAddressV2 | null>(null);
    const [loadingInfo, setLoadingInfo] = useState<boolean>(false);

    const { setValue, getValues } = useFormContext();
    const { getInfoError } = useGlobal();

    const regex = /[^\d]/gm;

    const searchAddressByCep = async (cep: number) => {
        try {
            const data = await searchCep(cep);
            const optionState = stateOptions.find((value) => value.abbreviation === data.state);

            setDataCep(data);

            const stateSelected = getValues("address.state");
            if (optionState && (!stateSelected || stateSelected.id !== optionState.id)) {
                setValue("address.state", { id: optionState.id, label: optionState.name });
            } else {
                const optionCity = cityOptions.find((value) => value.name === data.city);
                const citySelected = getValues("address.city");
                if (optionCity && (!citySelected || citySelected.id !== optionCity.id)) {
                    setValue("address.city", { id: optionCity.id, label: optionCity.name });
                }
            }

            setValue("address.neighborhood", data.neighborhood);
            setValue("address.street", data.street);
            setValue("address.number", "");
            setValue("address.complement", "");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchAllState = async () => {
        try {
            const options = await findAllState();
            setStateOptions((prev) => {
                return (prev = options);
            });
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchCityBySate = async (state: AutocompleteOption, clearCity = true) => {
        try {
            const data = await searchCity({ id_addresses_state: state.id });

            setCityOptions((prev) => {
                return (prev = data);
            });

            if (clearCity) {
                setValue("address.city", "");
            }

            if (dataCep) {
                const city = data.find((value) => value.name === dataCep.city);
                if (city) {
                    setValue("address.city", { id: city.id, label: city.name });
                }
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    useEffect(() => {
        async function execute() {
            if (address) {
                setLoadingInfo(true);

                setValue("address.state", address.state);
                setValue("address.number_cep", String(address.number_cep));
                setValue("address.city", address.city);
                setValue("address.neighborhood", address.neighborhood);
                setValue("address.number", address.number);
                setValue("address.street", address.street);
                setValue("address.complement", address.complement ?? "");

                await searchCityBySate(address.state, false);

                setLoadingInfo(false);
            }
        }

        execute();
    }, [address]);

    useEffect(() => {
        searchAllState();
    }, []);

    useEffect(() => {
        const number_cep = getValues("address.number_cep");
        if (number_cep && number_cep.replace(regex, "").length === 8 && !loadingInfo) {
            searchAddressByCep(number_cep);
        }
    }, [useWatch({ name: "address.number_cep", defaultValue: address ? String(address.number_cep) : "" })]);

    useEffect(() => {
        const state = getValues("address.state");
        if (state && state.id && !loadingInfo) {
            searchCityBySate(state);
        }
    }, [useWatch({ name: "address.state", defaultValue: address ? address.state : "" })]);

    return (
        <>
            <Grid item xs={12} mt={2}>
                <Typography overflow='hidden' whiteSpace='nowrap' textOverflow='ellipses' fontWeight={500}>
                    Endereço
                </Typography>
            </Grid>

            <Grid item xs={12} md={2}>
                <FormInputMask
                    fullWidth
                    disabledInput={disabledInputs}
                    label='CEP'
                    mask='99999-999'
                    name='address.number_cep'
                    variant='outlined'
                />
            </Grid>

            <Grid item xs={12} md={4}>
                <FormAutocomplete
                    fullWidth
                    label='Estado'
                    type='text'
                    name='address.state'
                    disabledAutocomplete={disabledInputs}
                    variant='outlined'
                    options={stateOptions.map(({ id, name }) => {
                        return {
                            id: id,
                            label: name,
                        };
                    })}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <FormAutocomplete
                    fullWidth
                    label='Cidade'
                    type='text'
                    disabledAutocomplete={disabledInputs}
                    name='address.city'
                    variant='outlined'
                    options={cityOptions.map(({ id, name }) => {
                        return {
                            id: id,
                            label: name,
                        };
                    })}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <FormInput
                    fullWidth
                    type='text'
                    disabled={disabledInputs}
                    label='Bairro'
                    name='address.neighborhood'
                    variant='outlined'
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <FormInput
                    fullWidth
                    type='text'
                    disabled={disabledInputs}
                    label='Logradouro'
                    name='address.street'
                    variant='outlined'
                />
            </Grid>

            <Grid item xs={12} md={4}>
                <FormInput
                    fullWidth
                    label='Número'
                    disabled={disabledInputs}
                    type='number'
                    name='address.number'
                    variant='outlined'
                />
            </Grid>

            <Grid item xs={12} md={8}>
                <FormInput
                    fullWidth
                    type='text'
                    disabled={disabledInputs}
                    label='Complemento'
                    name='address.complement'
                    variant='outlined'
                />
            </Grid>
        </>
    );
}
