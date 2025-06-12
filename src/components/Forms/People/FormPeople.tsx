import { createRef, useEffect, useState } from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { useFormContext } from "react-hook-form";
import { ArrayTypesGenders } from "@/constants/array-genders";
import { ArrayTypesMaritalStatus } from "@/constants/array-marital-status";
import FormInput from "../../FormComponents/Context/FormInput";
import FormInputMask from "../../FormComponents/Context/FormInputMask";
import FormAutocomplete from "../../FormComponents/Context/FormAutocomplete";
import { IInfoPeopleConnected } from "@/services/peoples";
import FormDatePicker from "../../FormComponents/Context/FormDatePicker";
import BadgeAvatars from "../../AvatarWithBadge/AvatarWithBadge";
import { toast } from "react-toastify";
import { useAuth, User } from "../../../contexts/AuthContext";
import { uploadImageProfile } from "../../../services/upload-image-profile";
import { useGlobal } from "../../../contexts/GlobalContext";
import DeleteIcon from "@mui/icons-material/Delete";
import { useConfirm } from "material-ui-confirm";

type FormPeopleProp = {
    people?: IInfoPeopleConnected;
    showImageProfile?: boolean;
    disabledInputs?: boolean;
    disabledInputsPeopleUpdate?: boolean;
};

export const FormPeople = ({
    people,
    showImageProfile = false,
    disabledInputsPeopleUpdate = false,
    disabledInputs = false,
}: FormPeopleProp) => {
    const { setValue } = useFormContext();
    const [image, setImage] = useState<string>();
    const theme = useTheme();
    const { updateLocalUser, user } = useAuth();
    const { getInfoError } = useGlobal();
    const confirm = useConfirm();
    const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);

    useEffect(() => {
        setValue("people.name", people?.name ?? "");
        setValue("people.email", people?.email ?? "");
        setValue("people.document_cpf", people?.document_cpf ?? "");
        setValue("people.document_rg", people?.document_rg ?? "");
        setValue("people.issuing_agency_rg", people?.issuing_agency_rg ?? "");
        setValue("people.birthday_date", people?.birthday_date ?? null);
        setValue("people.gender", people?.gender ? ArrayTypesGenders.find((value) => value.id === people?.gender) : "");
        setValue(
            "people.marital_status",
            people?.marital_status ? ArrayTypesMaritalStatus.find((value) => value.id === people?.marital_status) : "",
        );
        setValue("people.cel_phone_personal", people?.cel_phone_personal ? String(people?.cel_phone_personal) : "");
        setValue("people.cel_phone_company", people?.cel_phone_company ? String(people?.cel_phone_company) : "");
        setValue("people.description", people?.description ?? "");
    }, [people]);

    const inputFile = createRef<HTMLInputElement>();

    const getImage = async (e: React.ChangeEvent<HTMLInputElement> | null): Promise<any> => {
        if (!e) {
            return;
        }

        const file = e.target.files?.item(0);
        if (!file) {
            return;
        }

        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (data) => {
            if (typeof data.target?.result === "string") {
                setImage(data.target?.result);
                updateLocalUser({ ...user, url_image_profile: data.target?.result } as User);
            }
        };

        const form = new FormData();
        form.append("image", file);

        try {
            await uploadImageProfile(form);
            toast.success("Atualizado com sucesso!");
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
        } finally {
            e.target.value = "";
        }
    };

    const removeImage = async () => {
        confirm({
            title: `Remover imagem de perfil`,
            description: "Você realmente deseja remover a foto de perfil?",
        })
            .then(async () => {
                try {
                    setImage(undefined);
                    updateLocalUser({ ...user, url_image_profile: null } as User);
                    const form = new FormData();
                    form.append("image", "undefined");

                    await uploadImageProfile(form);
                    toast.success("A imagem de perfil foi removida!");
                } catch (error) {
                    const { message } = await getInfoError(error);
                    toast.error(message);
                }
            })
            .catch(() => {});
    };

    useEffect(() => {
        setFileInput(inputFile.current);
    }, [inputFile]);

    const handleOnClick = () => {
        confirm({
            title: `Adicionar imagem de perfil`,
            description: "Você realmente deseja adicionar uma foto de perfil?",
        })
            .then(async () => {
                try {
                    fileInput?.click();
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                }
            })
            .catch(() => {});
    };

    return (
        <>
            <Grid item xs={12} md={12} display='flex' flexWrap={"wrap"}>
                {showImageProfile ? (
                    <Grid
                        item
                        xs={12}
                        sm={3}
                        md={2}
                        columns={2}
                        display='flex'
                        justifyContent={"center"}
                        alignItems={"center"}>
                        <Box className='box-image-profile'>
                            <BadgeAvatars
                                style={{ width: "120px", height: "120px" }}
                                src={user?.url_image_profile ?? image ?? ""}
                                type='default'
                                user={user}
                                badgeContent={
                                    user?.url_image_profile || image ? (
                                        <DeleteIcon
                                            sx={{
                                                color: "red",
                                                cursor: "pointer",
                                                background: "#fff",
                                                borderRadius: "50%",
                                                padding: "2px",
                                                boxShadow:
                                                    theme.palette.mode === "light"
                                                        ? "3px 3px 3px " + theme.palette.grey[500]
                                                        : "none",
                                            }}
                                        />
                                    ) : undefined
                                }
                                badgeActionClick={user?.url_image_profile || image ? removeImage : handleOnClick}>
                                <Typography fontSize={"5rem"}>{user?.name.charAt(0)}</Typography>
                            </BadgeAvatars>
                            <input
                                accept='image/*'
                                type='file'
                                name='image'
                                id='image'
                                style={{ display: "none" }}
                                onChange={getImage}
                                ref={inputFile}
                            />
                        </Box>
                    </Grid>
                ) : undefined}

                <Grid item xs={12} sm={showImageProfile ? 9 : 12} md={showImageProfile ? 10 : 12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <FormInput
                                fullWidth
                                autoFocus
                                disabled={disabledInputs ? true : disabledInputsPeopleUpdate ? true : false}
                                name='people.name'
                                type='text'
                                label='Nome Completo'
                                variant={disabledInputs ? "filled" : disabledInputsPeopleUpdate ? "filled" : "outlined"}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormInput
                                type='email'
                                disabled={disabledInputs}
                                name='people.email'
                                aria-readonly={people?.email ? true : false}
                                fullWidth
                                label='E-mail Pessoal'
                                variant='outlined'
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormInputMask
                                fullWidth
                                label='CPF'
                                disabledInput={disabledInputs ? true : disabledInputsPeopleUpdate ? true : false}
                                variant={disabledInputs ? "filled" : disabledInputsPeopleUpdate ? "filled" : "outlined"}
                                name='people.document_cpf'
                                mask='999.999.999-99'
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormInputMask
                                fullWidth
                                label='RG'
                                disabledInput={disabledInputs}
                                variant='outlined'
                                name='people.document_rg'
                                mask='99.999.999-9'
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormInput
                                fullWidth
                                disabled={disabledInputs}
                                label='Órgão expedidor'
                                variant='outlined'
                                name='people.issuing_agency_rg'
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormDatePicker
                                fullWidth
                                type='date'
                                name='people.birthday_date'
                                variant='outlined'
                                label='Data Nascimento'
                                disabled={disabledInputs}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                label='Gênero'
                                variant='outlined'
                                name='people.gender'
                                disabledAutocomplete={disabledInputs}
                                disabled={disabledInputs}
                                options={
                                    showImageProfile
                                        ? ArrayTypesGenders.filter((gender) => gender.label !== "Não Informado")
                                        : ArrayTypesGenders.filter((gender) => gender.label !== "Prefiro não informar")
                                }
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormAutocomplete
                                disabledAutocomplete={disabledInputs}
                                name='people.marital_status'
                                label='Estado civil'
                                variant='outlined'
                                options={ArrayTypesMaritalStatus}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormInputMask
                                name='people.cel_phone_company'
                                fullWidth
                                label='Celular Corporativo'
                                variant='outlined'
                                mask='(99) 9 9999 - 9999'
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormInputMask
                                name='people.cel_phone_personal'
                                fullWidth
                                label='Celular Pessoal'
                                variant='outlined'
                                mask='(99) 9 9999 - 9999'
                            />
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <FormInput
                                fullWidth
                                multiline
                                rows={3}
                                label='Descrição'
                                name='people.description'
                                type='text'
                                variant='outlined'
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
};
