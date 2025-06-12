import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import Avatar, { AvatarProps } from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
        backgroundColor: "#44b700",
        color: "#44b700",
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        "&::after": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            animation: "ripple 1.2s infinite ease-in-out",
            border: "1px solid currentColor",
            content: '""',
        },
    },
    "@keyframes ripple": {
        "0%": {
            transform: "scale(.8)",
            opacity: 1,
        },
        "100%": {
            transform: "scale(2.4)",
            opacity: 0,
        },
    },
}));

const SmallAvatar = styled(CameraAltIcon)(({ theme }) => ({
    width: 22,
    height: 22,
    backgroundColor: `${theme.palette.background.paper}`,
    borderRadius: "50%",
}));

type UserProps = {
    name: string;
    url_image_profile?: string | null;
};

type BadgeProps = {
    badgeActionClick?: () => void;
    user: UserProps | null;
    type: "default" | "dot";
    status?: "Online" | "Ocupado" | "Ausente" | "Invisível" | "Em reunião";
    badgeContent?: JSX.Element;
} & AvatarProps;

export default function BadgeAvatars({ badgeActionClick, user, type, status, badgeContent, ...props }: BadgeProps) {
    function statusColor(status: "Online" | "Ocupado" | "Ausente" | "Invisível" | "Em reunião"): string {
        switch (status) {
            case "Online":
                return "#21D87D";
            case "Ocupado":
                return "#F94C4A";
            case "Em reunião":
                return "#FF7B40";
            case "Ausente":
                return "#FCDB58";
            case "Invisível":
                return "#b1b1b1";
            default:
                return "#49479d";
        }
    }
    return (
        <Stack direction='row' spacing={2}>
            {type === "dot" ? (
                <StyledBadge
                    overlap='circular'
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant='dot'
                    sx={{
                        textTransform: "uppercase",
                        "& .MuiBadge-badge": {
                            background: status ? statusColor(status) : "grey",
                            color: status ? statusColor(status) : "grey",
                        },
                    }}>
                    {user && user.url_image_profile ? (
                        <Avatar
                            {...props}
                            alt='Avatar profile'
                            onClick={badgeActionClick}
                            src={user.url_image_profile}
                        />
                    ) : (
                        <Avatar {...props} alt='Avatar profile' onClick={badgeActionClick}>
                            {user && user.name !== undefined ? user.name.charAt(0) : null}
                        </Avatar>
                    )}
                </StyledBadge>
            ) : (
                <Badge
                    overlap='circular'
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                        badgeContent ? (
                            badgeContent
                        ) : (
                            <SmallAvatar
                                sx={{
                                    color: "grey",
                                    cursor: "pointer",
                                }}
                            />
                        )
                    }
                    onClick={badgeActionClick}>
                    <Avatar
                        {...props}
                        src={user?.url_image_profile ?? undefined}
                        sx={{ textTransform: "uppercase", backgroundColor: "#91919158", color: "#ffffff" }}
                    />
                </Badge>
            )}
        </Stack>
    );
}
