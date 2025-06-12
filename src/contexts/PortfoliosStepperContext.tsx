import { createContext, useContext, useState } from "react";
import { IPortfolioDataProps, CollaboratorsDataProps } from "../types/portfolios";

type Props = {
    children: React.ReactNode;
};

type PortfoliosStepperContextType = {
    portfolioDataSaved: IPortfolioDataProps | undefined;
    setPortfolioDataSaved: React.Dispatch<React.SetStateAction<IPortfolioDataProps | undefined>>;
    collaboratorsDataSaved: CollaboratorsDataProps | undefined;
    setCollaboratorsDataSaved: React.Dispatch<React.SetStateAction<CollaboratorsDataProps | undefined>>;
    listIdsCollaboratorsDataBase: number[];
    setListIdsCollaboratorsDataBase: React.Dispatch<React.SetStateAction<number[]>>;
    listDeleteCollaborators: number[];
    setListDeleteCollaborators: React.Dispatch<React.SetStateAction<number[]>>;
    listAddedCollaborators: number[];
    setListAddedCollaborators: React.Dispatch<React.SetStateAction<number[]>>;
};

const PortfoliosStepperContext = createContext<PortfoliosStepperContextType>({} as PortfoliosStepperContextType);

export const PortfoliosStepperContextProvider: React.FC<Props> = ({ children }) => {
    const [portfolioDataSaved, setPortfolioDataSaved] = useState<IPortfolioDataProps | undefined>(undefined);
    const [collaboratorsDataSaved, setCollaboratorsDataSaved] = useState<CollaboratorsDataProps | undefined>(undefined);
    const [listIdsCollaboratorsDataBase, setListIdsCollaboratorsDataBase] = useState<number[]>([]);
    const [listDeleteCollaborators, setListDeleteCollaborators] = useState<number[]>([]);
    const [listAddedCollaborators, setListAddedCollaborators] = useState<number[]>([]);

    return (
        <PortfoliosStepperContext.Provider
            value={{
                portfolioDataSaved,
                setPortfolioDataSaved,
                collaboratorsDataSaved,
                setCollaboratorsDataSaved,
                listIdsCollaboratorsDataBase,
                setListIdsCollaboratorsDataBase,
                listDeleteCollaborators,
                setListDeleteCollaborators,
                listAddedCollaborators,
                setListAddedCollaborators,
            }}>
            {children}
        </PortfoliosStepperContext.Provider>
    );
};

export function useStepper() {
    const context = useContext(PortfoliosStepperContext);

    return context;
}
