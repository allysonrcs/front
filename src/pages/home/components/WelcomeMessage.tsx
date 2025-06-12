import { Typography } from "@mui/material";

export function WelcomeMessage({ user }: { user: { name: string; agency: string; portfolio: string } }) {
    const firstName = user?.name.split(" ")[0];
    const agencyName = user?.agency;
    const portfolioName = user?.portfolio;

    const getGreeting = () => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) return "☀️ Bom dia";
        if (currentHour < 18) return "🌤️ Boa tarde";
        return "🌙 Boa noite";
    };

    return (
        <Typography fontSize={18} component='span' color='text.primary'>
            {`${getGreeting()}, ${firstName}`}
            <Typography
                fontSize={18}
                component='span'
                color='text.secondary'>{` • ${agencyName} • ${portfolioName}`}</Typography>
        </Typography>
    );
}
