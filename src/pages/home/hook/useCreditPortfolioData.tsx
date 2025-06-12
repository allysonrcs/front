import { useEffect, useState, useCallback } from "react";
import { searchListCreditPortfolio, IListCreditPortfolioProps } from "@/services/coopmais";
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

export type UseCreditPortfolioDataProps = {
    tab_ref_month: AutoCompleteString;
    tab_portfolios: ListPortfolios;
};
export function useCreditPortfolioData(tabInputs: UseCreditPortfolioDataProps) {
    const [loadingCreditPortfolio, setLoadingCreditPortfolio] = useState(false);
    const [dataCredit, setDataCredit] = useState<{
        listCredit: IListCreditPortfolioProps[];
        dateUpdate: string;
        year_month_actual: string;
        year_month_before: string;
        message?: string | null;
    }>({
        listCredit: [],
        year_month_actual: "",
        year_month_before: "",
        dateUpdate: "",
        message: "",
    });
    const { getInfoError } = useGlobal();

    const fetchDataMobilizer = useCallback(async () => {
        if (!tabInputs?.tab_ref_month?.label || !tabInputs?.tab_portfolios?.id) {
            return;
        }

        try {
            setLoadingCreditPortfolio(true);

            const {
                list_credit_portfolio,
                date_update: date_update_credit,
                year_month_actual,
                year_month_before,
                message,
            } = await searchListCreditPortfolio({
                ref_month: tabInputs.tab_ref_month.label,
                id_ref_agency:
                    (tabInputs?.tab_portfolios?.id_agency_sisbr &&
                        Number(tabInputs.tab_portfolios.id_agency_sisbr.toString())) ||
                    4071,
                id_ref_portfolio:
                    (tabInputs?.tab_portfolios?.id_ref && Number(tabInputs.tab_portfolios.id_ref.toString())) || 4071,
            });

            setDataCredit({
                listCredit: list_credit_portfolio,
                dateUpdate: date_update_credit,
                year_month_actual,
                year_month_before,
                message,
            });
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingCreditPortfolio(false);
        }
    }, [tabInputs?.tab_ref_month?.label, tabInputs?.tab_portfolios?.id_ref]);

    useEffect(() => {
        fetchDataMobilizer();
    }, [fetchDataMobilizer]);

    return { dataCredit, loadingCreditPortfolio };
}
