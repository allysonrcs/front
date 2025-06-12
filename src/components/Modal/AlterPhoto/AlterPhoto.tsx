import { createRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Divider } from "@mui/material";
import { useAuth, User } from "../../../contexts/AuthContext";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { useGlobal } from "../../../contexts/GlobalContext";
import { uploadImageProfile } from "../../../services/upload-image-profile";
import { CameraAltOutlined } from "@mui/icons-material";
import { useTheme } from "@mui/system";
import { LightTheme } from "../../../themes";
import BadgeAvatars from "../../AvatarWithBadge/AvatarWithBadge";
import DeleteIcon from "@mui/icons-material/Delete";
import { useConfirm } from "material-ui-confirm";

const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: "5px",
    boxShadow: 24,
    p: 4,
    height: 500,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
};

type AlterPhotoProps = {
    open: boolean;
    handleClose: () => void;
    user: User | null;
};

export default function AlterPhoto({ open, handleClose, user }: AlterPhotoProps) {
    const [image, setImage] = useState<string>();

    const { getInfoError } = useGlobal();
    const theme = useTheme(LightTheme);
    const { updateLocalUser } = useAuth();

    const confirm = useConfirm();

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
            toast.success("Imagem de perfil atualizada com sucesso!");
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
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

    return (
        <Modal open={open} aria-labelledby='modal-modal-title' aria-describedby='modal-modal-description'>
            <Box sx={style}>
                <Box onClick={handleClose}>
                    <CloseIcon style={{ color: "grey" }} />
                </Box>

                <Divider />

                <Box>
                    <Typography color='primary' fontWeight={600} fontSize={"20px"} mb={1} id='modal-modal-description'>
                        Foto do perfil
                    </Typography>
                    <Typography fontSize={16} textAlign={"justify"}>
                        Adicionar uma foto de perfil ajuda as pessoas a reconhecerem você mais facilmente.
                    </Typography>
                </Box>

                <Divider />

                <Box className='box-image-profile'>
                    <BadgeAvatars
                        style={{ width: "200px", height: "200px" }}
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
                        badgeActionClick={
                            user?.url_image_profile || image ? removeImage : () => inputFile.current?.click()
                        }>
                        <Typography fontSize={"5rem"}>{user?.name[0]}</Typography>
                    </BadgeAvatars>

                    <Box className='box-icon-camera' component='label' htmlFor='image'>
                        <CameraAltOutlined
                            className='icon-camera'
                            sx={{
                                color: theme.palette.primary.light,
                            }}
                        />
                    </Box>

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
            </Box>
        </Modal>
    );
}
