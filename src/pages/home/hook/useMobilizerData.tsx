import { useEffect, useState, useCallback } from "react";
import { searchListMobilizer, IListMobilizerProps } from "@/services/coopmais";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";

interface AutoCompleteString {
    id: string;
    label: string;
}

type ListPortfolios = {
    id: number;
    label: string;
    id_ref?: number | null;
    id_agency?: number | null;
    id_agency_sisbr?: number | null;
};

export type UseMobilizerDataProps = {
    tab_ref_month: AutoCompleteString;
    tab_portfolios: ListPortfolios;
};
export function useMobilizerData(tabInputs: UseMobilizerDataProps) {
    const [loadingMobilizer, setLoadingMobilizer] = useState(false);
    const [dataMobilizer, setDataMobilizer] = useState<{
        list: IListMobilizerProps[];
        idealSpeed: number;
        dateUpdate: string;
        mensagem?: string | null;
    }>({
        list: [],
        idealSpeed: 0,
        dateUpdate: "",
        mensagem: "",
    });

    const { getInfoError } = useGlobal();

    const fetchDataMobilizer = useCallback(async () => {
        if (!tabInputs?.tab_ref_month?.label || !tabInputs?.tab_portfolios?.id) {
            return;
        }

        try {
            setLoadingMobilizer(true);

            const { list_mobilizer, ideal_speed, date_update, mensagem } = await searchListMobilizer({
                ref_month: tabInputs.tab_ref_month.label,
                id_ref_portfolio:
                    (tabInputs?.tab_portfolios?.id_ref && Number(tabInputs.tab_portfolios.id_ref.toString())) || 4071,
            });

            setDataMobilizer({
                list: list_mobilizer,
                idealSpeed: ideal_speed,
                dateUpdate: date_update,
                mensagem: mensagem,
            });
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingMobilizer(false);
        }
    }, [tabInputs?.tab_ref_month?.label, tabInputs?.tab_portfolios?.id_ref]);

    useEffect(() => {
        fetchDataMobilizer();
    }, [fetchDataMobilizer]);

    return { dataMobilizer, loadingMobilizer };
}
