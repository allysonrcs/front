import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useConfirm } from "material-ui-confirm";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useGlobal } from "@/contexts/GlobalContext";
import { Grid, GridProps, Icon, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import FormInput from "@/components/FormComponents/FormInput";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { IProductsUpdateColumn } from "@/types/products";
import { ArrayTypesSegmentProducts } from "@/constants/array-type-segment-products";
import { ArrayTypesPolarityProducts } from "@/constants/array-type-porality-products";
import { ArrayTypesOperatorProducts } from "@/constants/array-type-operator-products";
import { searchAutoCompleteCooperatives } from "@/services/cooperatives";
import { changeStatusProduct, searchProductByID, createProduct, updateProduct } from "@/services/products";
import FormRadioGroup from "@/components/FormComponents/FormRadioGroup";

import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type AutoCompleteString = {
    id: string;
    label: string;
};

type ProductProps = {
    product_sisbr_id?: number | null;
    name: string;
    cooperatives: AutoCompleteNumber;
    type_segment: AutoCompleteString;
    type_polarity: AutoCompleteString;
    type_operator: AutoCompleteString;
    coopcard_name?: string | null;
    coopcard?: number | null;
    is_productivity_control: boolean;
    is_bonus: boolean;
    description?: string | null;
};

type ProductsComponentProps = {
    idProduct?: number;
    updateColumn?: (products: IProductsUpdateColumn) => void;
} & GridProps;

const schemaProduct = Yup.object({
    product_sisbr_id: Yup.number()
        .nullable()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v)),
    name: Yup.string().max(255, "Máximo 255 caracteres").required("Nome do produto é obrigatório").trim(),
    cooperatives: Yup.object()
        .shape({
            id: Yup.number().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .required("Cooperativa é obrigatório!"),
    type_segment: Yup.object()
        .shape({
            id: Yup.string().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .required("Segmento é obrigatório!"),
    type_polarity: Yup.object()
        .shape({
            id: Yup.string().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .required("Polaridade é obrigatório!"),
    type_operator: Yup.object()
        .shape({
            id: Yup.string().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .required("Operador é obrigatório!"),
    coopcard_name: Yup.string().max(255, "Máximo 255 caracteres").trim().nullable(),
    coopcard: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    is_productivity_control: Yup.boolean().required("Produtividade Diária é obrigatório"),
    is_bonus: Yup.boolean().required("Bônus é obrigatório"),
    description: Yup.string().nullable().max(4000, "Excedeu 4000 caracteres"),
});

export function ProductsFields({ idProduct, updateColumn, ...props }: ProductsComponentProps) {
    const [status, setStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [autoCompleteCooperatives, setAutoCompleteCooperatives] = useState<AutoCompleteNumber[]>([]);

    const { getInfoError, toggleStatusBackdrop } = useGlobal();
    const confirm = useConfirm();

    const {
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors },
    } = useForm<ProductProps>({
        resolver: yupResolver(schemaProduct),
    });

    const onSubmitProduct = async (data: ProductProps) => {
        try {
            if (idProduct) {
                setLoading(true);

                await updateProduct(idProduct, {
                    product_sisbr_id: data?.product_sisbr_id ?? null,
                    name: data.name,
                    id_cooperative: data.cooperatives.id,
                    type_segment: data.type_segment.id,
                    type_polarity: data.type_polarity.id,
                    type_operator: data.type_operator.id,
                    coopcard_name: data?.coopcard_name || null,
                    coopcard: data?.coopcard ?? null,
                    is_productivity_control: data.is_productivity_control,
                    is_bonus: data?.is_bonus,
                    description: data?.description ?? null,
                });

                updateColumn?.({
                    id: idProduct,
                    product_sisbr_id: data.product_sisbr_id,
                    name: data.name,
                    cooperative_name: data.cooperatives.label,
                    coopcard_name: data.coopcard_name || null,
                    type_segment: data.type_segment.label,
                    type_polarity: data.type_polarity.label,
                    type_operator: data.type_operator.label,
                });

                toast.success("Produto atualizado com sucesso!");
            } else {
                setLoading(true);

                await createProduct({
                    product_sisbr_id: data?.product_sisbr_id ?? null,
                    name: data.name,
                    id_cooperative: data.cooperatives.id,
                    type_segment: data.type_segment.id,
                    type_polarity: data.type_polarity.id,
                    type_operator: data.type_operator.id,
                    coopcard_name: data?.coopcard_name ?? null,
                    coopcard: data?.coopcard ?? null,
                    is_productivity_control: data.is_productivity_control,
                    is_bonus: data?.is_bonus,
                    description: data?.description ?? null,
                });

                reset();
                toast.success("Produto criado com sucesso!");
            }
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatusProduct = async () => {
        if (idProduct) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: "O registro de produto sofrerá alteração em seu status.",
            })
                .then(async () => {
                    try {
                        await changeStatusProduct(idProduct, { is_active: !status });

                        setStatus((status) => !status);

                        updateColumn?.({
                            id: idProduct,
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

    const searchAndSetValuesRegisterProductByID = async (id_product: number) => {
        try {
            const {
                name,
                product_sisbr_id,
                is_productivity_control,
                is_bonus,
                id_cooperative,
                type_segment,
                type_polarity,
                type_operator,
                coopcard,
                coopcard_name,
                description,
                is_active,
            } = await searchProductByID(id_product);

            const selectedTypeSegment = ArrayTypesSegmentProducts.find((value) => value.id === type_segment);
            if (selectedTypeSegment) {
                setValue("type_segment", {
                    id: selectedTypeSegment.id,
                    label: selectedTypeSegment.label,
                });
            }

            const selectedTypePolarity = ArrayTypesPolarityProducts.find((value) => value.id === type_polarity);
            if (selectedTypePolarity) {
                setValue("type_polarity", {
                    id: selectedTypePolarity.id,
                    label: selectedTypePolarity.label,
                });
            }

            const selectedTypeOperator = ArrayTypesOperatorProducts.find((value) => value.id === type_operator);
            if (selectedTypeOperator) {
                setValue("type_operator", {
                    id: selectedTypeOperator.id,
                    label: selectedTypeOperator.label,
                });
            }

            setValue("name", name);
            setValue("product_sisbr_id", product_sisbr_id ?? null);
            setValue("is_productivity_control", is_productivity_control);
            setValue("is_bonus", is_bonus);
            setValue("coopcard", coopcard ?? null);
            setValue("coopcard_name", coopcard_name ?? null);
            setValue("description", description ?? null);
            setStatus(is_active);

            return {
                id_cooperative: id_cooperative,
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

                const resultAutocompletCooperatives = await searchAutoCompleteCooperatives({});

                const formattedCooperatives = resultAutocompletCooperatives.map((item) => ({
                    id: item.id,
                    label: item.abbreviation,
                }));

                setAutoCompleteCooperatives(formattedCooperatives);

                if (idProduct) {
                    const registerProduct = await searchAndSetValuesRegisterProductByID(idProduct);

                    if (registerProduct?.id_cooperative && formattedCooperatives.length > 0) {
                        const selectedCooperative = formattedCooperatives.find(
                            (value) => value.id === registerProduct.id_cooperative,
                        );
                        if (selectedCooperative) {
                            setValue("cooperatives", {
                                id: selectedCooperative.id,
                                label: selectedCooperative.label,
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
    }, [idProduct]);

    return (
        <Grid {...props}>
            <Grid spacing={2} container component='form' onSubmit={handleSubmit(onSubmitProduct)} mt={0}>
                <Grid item md={4} xs={12}>
                    <FormInput
                        fullWidth
                        label='ID Produto (Externo)'
                        name='product_sisbr_id'
                        type='number'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>
                <Grid item md={4} xs={12}>
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
                <Grid item md={4} xs={12}>
                    <FormAutocomplete
                        name='cooperatives'
                        label='Cooperativa'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={autoCompleteCooperatives}
                    />
                </Grid>
                <Grid item md={4} xs={12}>
                    <FormAutocomplete
                        name='type_segment'
                        label='Segmento'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={ArrayTypesSegmentProducts}
                    />
                </Grid>
                <Grid item md={4} xs={12}>
                    <FormAutocomplete
                        name='type_polarity'
                        label='Polaridade'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={ArrayTypesPolarityProducts}
                    />
                </Grid>
                <Grid item md={4} xs={12}>
                    <FormAutocomplete
                        name='type_operator'
                        label='Operador'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={ArrayTypesOperatorProducts}
                    />
                </Grid>
                <Grid item md={8} xs={12}>
                    <FormInput
                        fullWidth
                        label='Nome Coopcard'
                        name='coopcard_name'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>
                <Grid item md={4} xs={12}>
                    <FormInput
                        fullWidth
                        label='Valor Coopcard'
                        name='coopcard'
                        type='number'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormRadioGroup
                        row
                        control={control}
                        errors={errors}
                        defaultValue={"false"}
                        name='is_productivity_control'
                        label='Produtividade Diária'
                        options={[
                            { label: "Ativo", value: true },
                            { label: "Inativo", value: false },
                        ]}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormRadioGroup
                        row
                        control={control}
                        errors={errors}
                        defaultValue={"false"}
                        name='is_bonus'
                        label='Bônus'
                        options={[
                            { label: "Ativo", value: true },
                            { label: "Inativo", value: false },
                        ]}
                    />
                </Grid>
                <Grid item xs={12} md={12}>
                    <FormInput
                        fullWidth
                        multiline
                        rows={5}
                        label='Descrição'
                        name='description'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid item container display='flex' justifyContent='center' gap={2} mt={3}>
                    {idProduct && (
                        <LoadingButton
                            size='large'
                            color={"info"}
                            variant='contained'
                            onClick={handleChangeStatusProduct}
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
