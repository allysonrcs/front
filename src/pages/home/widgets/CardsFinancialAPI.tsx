import { useEffect, useState } from "react";
import { Grid, Link, CardContentProps } from "@mui/material";
import { useGlobal } from "@/contexts/GlobalContext";
import {
    IFinancialDolarAPI,
    IFinancialEuroAPI,
    IFinancialCdiAPI,
    IFinancialSelicAPI,
    IFinancialPoupancaAPI,
    fetchFinancialDolarBCBAPI,
    fetchFinancialEuroBCBAPI,
    fetchFinancialCdiAPI,
    fetchFinancialSelicAPI,
    fetchFinancialPoupancaAPI,
} from "@/services/external-api";
import { CardTotalized } from "@/components/Card/CardTotalized";
import { formatToBRLCurrency } from "@/functions/number";

type CardsFinancialAPIProps = {
    isSidebarOpen?: boolean;
};
export function CardsFinancialAPI({ isSidebarOpen = false }: CardsFinancialAPIProps) {
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [dataDolarAPI, setDataDolarAPI] = useState<IFinancialDolarAPI>();
    const [dataEuroAPI, setDataEuroAPI] = useState<IFinancialEuroAPI>();
    const [dataCdiAPI, setDataCdiAPI] = useState<IFinancialCdiAPI>();
    const [dataSelicAPI, setDataSelicAPI] = useState<IFinancialSelicAPI>();
    const [dataPoupancaAPI, setDataPoupancaAPI] = useState<IFinancialPoupancaAPI>();

    const { theme, getInfoError } = useGlobal();
    const MAX_RETRIES = 6;
    const RETRY_DELAY = 12000;

    const styleOfCard: CardContentProps = {
        sx: {
            display: "flex",
            flexDirection: "column-reverse",
            justifyContent: "center",
            alignItems: "center",
        },
    };

    const cardStyles = {
        height: 80,
        width: 200,
        borderRadius: "16px",
        boxShadow: "none",
        background: theme === "light" ? "#ffffff" : "linear-gradient(135deg, #071d20, #0A2A2F)",
        cursor: "pointer",
    };

    async function fetchCardsFinancialsAPI(retryCount = 0) {
        try {
            setLoadingFetch(true);

            const [dolar, euro, cdi, selic, poupanca] = await Promise.all([
                fetchFinancialDolarBCBAPI(),
                fetchFinancialEuroBCBAPI(),
                fetchFinancialCdiAPI(),
                fetchFinancialSelicAPI(),
                fetchFinancialPoupancaAPI(),
            ]);

            setDataDolarAPI(dolar);
            setDataEuroAPI(euro);
            setDataCdiAPI(cdi);
            setDataSelicAPI(selic);
            setDataPoupancaAPI(poupanca);
        } catch (error) {
            const info = await getInfoError(error);
            console.error(`Erro na tentativa ${retryCount + 1}: ${info.message}`);

            if (retryCount < MAX_RETRIES) {
                setTimeout(() => fetchCardsFinancialsAPI(retryCount + 1), RETRY_DELAY);
            } else {
                console.error("Número máximo de tentativas atingido.");
            }
        } finally {
            setLoadingFetch(false);
        }
    }

    useEffect(() => {
        fetchCardsFinancialsAPI();
    }, []);

    return (
        <Grid container gap={!isSidebarOpen ? 2 : 1} justifyContent='center' marginBottom={4} marginTop={3} wrap='wrap'>
            {[
                {
                    href: "https://www.bcb.gov.br",
                    name: "💵 Dólar",
                    totalized: dataDolarAPI ? `${formatToBRLCurrency(Number(dataDolarAPI.dolar))}` : "--",
                },
                {
                    href: "https://www.bcb.gov.br",
                    name: "💶 Euro",
                    totalized: dataEuroAPI ? `${formatToBRLCurrency(Number(dataEuroAPI.euro))}` : "--",
                },
                {
                    href: "https://www.bcb.gov.br",
                    name: "📈 CDI",
                    totalized: dataCdiAPI ? `${dataCdiAPI.cdi.replace(".", ",")}%` : "--",
                },
                {
                    href: "https://www.bcb.gov.br",
                    name: "🏦 Poupança (a.m.)",
                    totalized: dataPoupancaAPI ? `${dataPoupancaAPI.poupanca.replace(".", ",")}%` : "--",
                },
                {
                    href: "https://www.bcb.gov.br",
                    name: "💹 SELIC",
                    totalized: dataSelicAPI ? `${dataSelicAPI.selic.replace(".", ",")}%` : "--",
                },
            ].map((card, index) => (
                <Link
                    sx={{
                        transition: "0.3s",
                        "&:hover": {
                            transform: "translateY(-08px)",
                        },
                        paddingBottom: "5px",
                    }}
                    key={index}
                    href={card.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    underline='none'
                    aria-label={`Link para ${card.name}`}>
                    <CardTotalized
                        colorValue='text.secondary'
                        totalized={loadingFetch ? "--" : card.totalized}
                        name={card.name}
                        xs={12}
                        sm={6}
                        md={2}
                        boxWidth='200px'
                        cardProps={{
                            sx: cardStyles,
                        }}
                        cardContentProps={styleOfCard}
                        valueProps={{
                            color: "GrayText",
                            fontSize: 18,
                            variant: "h1",
                        }}
                    />
                </Link>
            ))}
        </Grid>
    );
}
