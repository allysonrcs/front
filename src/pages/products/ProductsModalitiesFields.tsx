import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useConfirm } from "material-ui-confirm";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useGlobal } from "@/contexts/GlobalContext";
import { Grid, GridProps, Icon, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import FormInput from "@/components/FormComponents/FormInput";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { IProductsModalitiesUpdateColumn } from "@/types/products";
import {
    changeStatusProductModality,
    createProductModality,
    searchAutoCompleteProducts,
    searchOneProductModalityByID,
    updateProductModality,
} from "@/services/products";
import { ArrayTypesActiveOrInactive } from "@/constants/array-type-active-or-inactive";

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

type ProductModalityProps = {
    product_modality_sisbr_id?: number | null;
    name: string;
    products: AutoCompleteNumber;
    modality: string;
    multiplier: number;
    input_components?: string | null;
    description?: string | null;
    is_operator_price: AutoCompleteBoolean;
    is_operator_amount: AutoCompleteBoolean;
    is_operator_percentage: AutoCompleteBoolean;
    is_operator_points: AutoCompleteBoolean;
};

type ProductsModalitiesComponentProps = {
    idProductModality?: number;
    updateColumn?: (agency: IProductsModalitiesUpdateColumn) => void;
} & GridProps;

const schemaProductModality = Yup.object({
    product_modality_sisbr_id: Yup.number()
        .nullable()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v)),
    name: Yup.string().max(255, "Máximo 255 caracteres").required("Nome do produto é obrigatório").trim(),
    products: Yup.object()
        .shape({
            id: Yup.number().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .required("Produto é obrigatório!"),
    modality: Yup.string().max(255, "Máximo 255 caracteres").required("Modalide é obrigatório").trim(),
    multiplier: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .required("Multiplicador é obrigatório"),
    input_components: Yup.string().nullable(),
    description: Yup.string().nullable().max(4000, "Descrição Excedeu 4000 caracteres"),
    is_operator_price: Yup.object()
        .shape({
            id: Yup.boolean().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .required("Valor é Obrigatório"),
    is_operator_amount: Yup.object()
        .shape({
            id: Yup.boolean().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .required("Quantidade é Obrigatório"),
    is_operator_percentage: Yup.object()
        .shape({
            id: Yup.boolean().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .required("Porcentagem é Obrigatório"),
    is_operator_points: Yup.object()
        .shape({
            id: Yup.boolean().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .required("Pontos é Obrigatório"),
});

export function ProductsModalitiesFields({
    idProductModality,
    updateColumn,
    ...props
}: ProductsModalitiesComponentProps) {
    const [status, setStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [autoCompleteProducts, setAutoCompleteProducts] = useState<AutoCompleteNumber[]>([]);

    const { getInfoError, toggleStatusBackdrop } = useGlobal();
    const confirm = useConfirm();

    const {
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors },
    } = useForm<ProductModalityProps>({
        resolver: yupResolver(schemaProductModality),
    });

    const onSubmitProductModalitiy = async (data: ProductModalityProps) => {
        try {
            const formattedInputComponents = data.input_components
                ? JSON.stringify(JSON.parse(data.input_components))
                : null;

            if (idProductModality) {
                setLoading(true);

                await updateProductModality(idProductModality, {
                    product_modality_sisbr_id: data.product_modality_sisbr_id,
                    name: data.name.trim(),
                    id_product: data.products.id,
                    modality: data.modality.trim(),
                    multiplier: data.multiplier,
                    input_components: formattedInputComponents,
                    description: data.description,
                    is_operator_price: data.is_operator_price.id,
                    is_operator_amount: data.is_operator_amount.id,
                    is_operator_percentage: data.is_operator_percentage.id,
                    is_operator_points: data.is_operator_points.id,
                });

                updateColumn?.({
                    id: idProductModality,
                    name: data.name,
                    modality: data.modality,
                    multiplier: data.multiplier,
                    product_name: data.products.label,
                });

                toast.success("Modalidade atualizada com sucesso!");
            } else {
                setLoading(true);

                await createProductModality({
                    product_modality_sisbr_id: data.product_modality_sisbr_id,
                    name: data.name.trim(),
                    id_product: data.products.id,
                    modality: data.modality.trim(),
                    multiplier: data.multiplier,
                    input_components: formattedInputComponents,
                    description: data.description,
                    is_operator_price: data.is_operator_price.id,
                    is_operator_amount: data.is_operator_amount.id,
                    is_operator_percentage: data.is_operator_percentage.id,
                    is_operator_points: data.is_operator_points.id,
                });

                reset();
                toast.success("Modalidade criada com sucesso!");
            }
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatusProductodality = async () => {
        if (idProductModality) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: "O registro de modalidade de produto sofrerá alteração em seu status.",
            })
                .then(async () => {
                    try {
                        await changeStatusProductModality(idProductModality, { is_active: !status });

                        setStatus((status) => !status);

                        updateColumn?.({
                            id: idProductModality,
                            is_active: !status,
                        });

                        toast.success(`${status ? "Inativo" : "Ativo"} com sucesso!`);
                    } catch (error) {
                        const info = await getInfoError(error);
                        toast.error(info.message);
                    }
                })
                .catch(() => {});
        }
    };

    const searchAndSetValuesRegisterProductModalityByID = async (id_product_modality: number) => {
        try {
            const {
                id_product,
                name,
                product_modality_sisbr_id,
                modality,
                multiplier,
                description,
                is_operator_price,
                is_operator_amount,
                is_operator_percentage,
                is_operator_points,
                input_components,
                is_active,
            } = await searchOneProductModalityByID(id_product_modality);

            setValue("name", name);
            setValue("product_modality_sisbr_id", product_modality_sisbr_id ?? null);
            setValue("modality", modality);
            setValue("multiplier", multiplier);
            setValue("description", description ?? null);
            setValue(
                "input_components",
                input_components ? JSON.stringify(JSON.parse(input_components), null, 2) : null,
            );
            setStatus(is_active);

            const selectedOperatorPrice = ArrayTypesActiveOrInactive.find((value) => value.id === is_operator_price);
            if (selectedOperatorPrice) {
                setValue("is_operator_price", {
                    id: selectedOperatorPrice.id,
                    label: selectedOperatorPrice.label,
                });
            }

            const selectedOperatorAmount = ArrayTypesActiveOrInactive.find((value) => value.id === is_operator_amount);
            if (selectedOperatorAmount) {
                setValue("is_operator_amount", {
                    id: selectedOperatorAmount.id,
                    label: selectedOperatorAmount.label,
                });
            }

            const selectedOperatorPercentage = ArrayTypesActiveOrInactive.find(
                (value) => value.id === is_operator_percentage,
            );
            if (selectedOperatorPercentage) {
                setValue("is_operator_percentage", {
                    id: selectedOperatorPercentage.id,
                    label: selectedOperatorPercentage.label,
                });
            }

            const selectedOperatorPoints = ArrayTypesActiveOrInactive.find((value) => value.id === is_operator_points);
            if (selectedOperatorPoints) {
                setValue("is_operator_points", {
                    id: selectedOperatorPoints.id,
                    label: selectedOperatorPoints.label,
                });
            }

            return {
                id_product: id_product,
            };
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();

                const resultAutocompletProducts = await searchAutoCompleteProducts({});

                const formattedProducts = resultAutocompletProducts.map((item) => ({
                    id: item.id,
                    label: item.name,
                }));

                setAutoCompleteProducts(formattedProducts);

                if (idProductModality) {
                    const registerProductModality =
                        await searchAndSetValuesRegisterProductModalityByID(idProductModality);

                    if (registerProductModality?.id_product && formattedProducts.length > 0) {
                        const selectedProduct = formattedProducts.find(
                            (value) => value.id === registerProductModality.id_product,
                        );
                        if (selectedProduct) {
                            setValue("products", {
                                id: selectedProduct.id,
                                label: selectedProduct.label,
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
        }

        execute();
    }, [idProductModality]);

    return (
        <Grid {...props}>
            <Grid
                spacing={2}
                container
                component='form'
                onSubmit={handleSubmit(onSubmitProductModalitiy)}
                mt={idProductModality ? -5 : 0}>
                <Grid item md={1} xs={12}>
                    <FormInput
                        fullWidth
                        label='ID Modalidade (Externo)'
                        name='product_modality_sisbr_id'
                        type='number'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>
                <Grid item md={3} xs={12}>
                    <FormInput
                        fullWidth
                        label='Nome'
                        name='name'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>
                <Grid item md={3} xs={12}>
                    <FormInput
                        fullWidth
                        label='Modalidade'
                        name='modality'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>
                <Grid item md={1} xs={12}>
                    <FormInput
                        fullWidth
                        label='Multiplicador'
                        name='multiplier'
                        type='number'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>
                <Grid item md={4} xs={12}>
                    <FormAutocomplete
                        name='products'
                        label='Selecione um Produto'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={autoCompleteProducts}
                    />
                </Grid>
                <Grid item xs={12} md={12}>
                    <FormInput
                        fullWidth
                        multiline
                        rows={3}
                        label='Descrição'
                        name='description'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>
                <Grid item xs={12} md={12}>
                    <Typography overflow='hidden' whiteSpace='nowrap' textOverflow='ellipses' fontWeight={500}>
                        Informações Adicionais:
                    </Typography>
                </Grid>
                <Grid item md={3} xs={12}>
                    <FormAutocomplete
                        name='is_operator_price'
                        label='Habilitar valor'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={ArrayTypesActiveOrInactive}
                    />
                </Grid>
                <Grid item md={3} xs={12}>
                    <FormAutocomplete
                        name='is_operator_amount'
                        label='Habilitar quantidade'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={ArrayTypesActiveOrInactive}
                    />
                </Grid>
                <Grid item md={3} xs={12}>
                    <FormAutocomplete
                        name='is_operator_percentage'
                        label='Habilitar porcentagem'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={ArrayTypesActiveOrInactive}
                    />
                </Grid>
                <Grid item md={3} xs={12}>
                    <FormAutocomplete
                        name='is_operator_points'
                        label='Habilitar pontos'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={ArrayTypesActiveOrInactive}
                    />
                </Grid>
                <Grid item xs={12} md={12}>
                    <FormInput
                        fullWidth
                        multiline
                        rows={12}
                        label='Componentes Dinâmicos'
                        placeholder={`Ex: [{"type":"string"} ...]`}
                        name='input_components'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid item container display='flex' justifyContent='center' gap={2} mt={1}>
                    {idProductModality && (
                        <LoadingButton
                            size='large'
                            color={"info"}
                            variant='contained'
                            onClick={handleChangeStatusProductodality}
                            startIcon={<Icon>autorenew</Icon>}
                            title='Alterar situação'
                            loading={loading}>
                            {status ? "Inativar" : "Ativar"}
                        </LoadingButton>
                    )}

                    <LoadingButton
                        type='submit'
                        size='large'
                        color={"success"}
                        variant='contained'
                        startIcon={<Icon>save</Icon>}
                        loading={loading}>
                        Salvar
                    </LoadingButton>
                </Grid>
            </Grid>
        </Grid>
    );
}
