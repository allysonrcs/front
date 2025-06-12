import { ReactNode, createContext, useContext, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useGlobal } from "./GlobalContext";
import {
    searchAllDataClientByID,
    searchAllAccountsClientByID,
    searchAllDisbursementClientByID,
    ISearchExtClientAllInfo,
    ISearchExtClientAllAccounts,
    ISearchExtClientAllDisbursement,
    SearchExtClientsProps,
    searchListExtClients,
    searchAllCardsClientByID,
    ISearchExtClientAllCards,
} from "@/services/ext-tables";

export interface IListCooperatedData {
    id: number;
    cliente_documento: string;
    cliente_nome: string;
    cliente_tipo: string;
    agencia_id: number;
    carteira_nome: string;
    e_cooperado: boolean;
    e_rural: boolean;
}

export interface ICooperatedDataHistoryProps {
    id: number;
    name: string;
    document: string;
    agency: string;
    portfolio: string;
    client_type: string;
    is_rural: boolean;
    is_cooperated: boolean;
    created_at: string;
}

export interface ICooperatedDataContext {
    cooperatedList: IListCooperatedData[];
    cooperatedListHistory: ICooperatedDataHistoryProps[];
    cooperatedContent?: ISearchExtClientAllInfo;
    infoDataAccountClient?: ISearchExtClientAllAccounts[];
    infoDataCardsClient?: ISearchExtClientAllCards[];
    infoDataDisbursementClient?: ISearchExtClientAllDisbursement[];
    isDrawerOpen: boolean;
    filterMode: "id" | "document" | "name";
    setFilterMode: React.Dispatch<React.SetStateAction<"id" | "document" | "name">>;
    setCooperatedList: React.Dispatch<React.SetStateAction<IListCooperatedData[]>>;
    setCooperatedHistoryList: React.Dispatch<React.SetStateAction<ICooperatedDataHistoryProps[]>>;
    fetchListAsideCooperatedData: (params: SearchExtClientsProps) => Promise<void>;
    selectCooperatedDataContent: (id: number) => Promise<void>;
    clearContent: () => void;
    toggleDrawer: () => void;
    openDrawer: () => void;
    closeDrawer: () => void;
}

export const CooperatedDataContext = createContext<ICooperatedDataContext>({} as ICooperatedDataContext);

export function CooperatedDataContextProvider({ children }: { children: ReactNode }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [cooperatedList, setCooperatedList] = useState<IListCooperatedData[]>([]);
    const [cooperatedListHistory, setCooperatedHistoryList] = useState<ICooperatedDataHistoryProps[]>([]);
    const [cooperatedContent, setCooperatedContent] = useState<ISearchExtClientAllInfo>();
    const [infoDataAccountClient, setInfoDataAccountsClient] = useState<ISearchExtClientAllAccounts[]>([]);
    const [infoDataCardsClient, setInfoDataCardsClient] = useState<ISearchExtClientAllCards[]>([]);
    const [infoDataDisbursementClient, setInfoDataDisbursementClient] = useState<ISearchExtClientAllDisbursement[]>([]);
    const [filterMode, setFilterMode] = useState<"id" | "document" | "name">("id");

    const { getInfoError, toggleStatusBackdrop } = useGlobal();

    const fetchListAsideCooperatedData = useCallback(async (params: SearchExtClientsProps) => {
        try {
            const listNotifications = await searchListExtClients({
                ...params,
                filtro_agencia: false,
            });

            setCooperatedList(listNotifications);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error("Erro ao buscar lista de cooperados.");
            toast.error(info.message);
        }
    }, []);

    const selectCooperatedDataContent = useCallback(async (id: number) => {
        try {
            toggleStatusBackdrop();
            toggleDrawer?.();

            const [allDataClient, dataAccountsClient, dataCardsClient, dataDisbursementClient] = await Promise.all([
                searchAllDataClientByID(id),
                searchAllAccountsClientByID(id),
                searchAllCardsClientByID(id),
                searchAllDisbursementClientByID(id),
            ]);

            setCooperatedContent(allDataClient);
            setInfoDataAccountsClient(dataAccountsClient);
            setInfoDataCardsClient(dataCardsClient);
            setInfoDataDisbursementClient(dataDisbursementClient);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error("Erro ao carregar informações do cooperado.");
            toast.error(info.message);
        } finally {
            toggleDrawer?.();
            toggleStatusBackdrop();
        }
    }, []);

    const clearContent = useCallback(() => {
        setCooperatedContent(undefined);
    }, []);

    const toggleDrawer = useCallback(() => {
        setIsDrawerOpen((prev) => !prev);
    }, []);

    const openDrawer = useCallback(() => {
        setIsDrawerOpen(true);
    }, []);

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false);
        setCooperatedList([]);
    }, []);

    return (
        <CooperatedDataContext.Provider
            value={{
                cooperatedList,
                cooperatedListHistory,
                cooperatedContent,
                isDrawerOpen,
                infoDataAccountClient,
                infoDataCardsClient,
                infoDataDisbursementClient,
                filterMode,
                setFilterMode,
                fetchListAsideCooperatedData,
                setCooperatedList,
                setCooperatedHistoryList,
                selectCooperatedDataContent,
                clearContent,
                toggleDrawer,
                openDrawer,
                closeDrawer,
            }}>
            {children}
        </CooperatedDataContext.Provider>
    );
}

export const useCooperatedData = () => {
    const cooperatedDataContext = useContext(CooperatedDataContext);
    return cooperatedDataContext;
};
