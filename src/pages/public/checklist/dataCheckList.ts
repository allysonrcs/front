export interface IDataSectorsCheckList {
    id: number;
    name: string;
}

export const dataSectorsCheckList: IDataSectorsCheckList[] = [
    { id: 1, name: "CRÉDITO" },
    { id: 2, name: "INTELIGÊNCIA" },
    { id: 3, name: "PRODUTOS" },
    { id: 4, name: "OQS" },
];

export interface IChecklists {
    [key: number]: string[];
}

export const dataChecklists: IChecklists = {
    1: [
        "Checklist de Operações de Limite de Cartão de Crédito 1",
        "Checklist de Operações de Limite de Cartão de Crédito 2",
    ],
    2: ["Checklist de Inteligência 1", "Checklist de Inteligência 2"],
    3: ["Checklist de Produtos 1", "Checklist de Produtos 2"],
};

export interface ICheckListItems {
    [key: string]: string[];
}

export const dataCheckListItems: ICheckListItems = {
    "Checklist de Operações de Limite de Cartão de Crédito 1": ["Item 1", "Item 2", "Item 3"],
    "Checklist de Operações de Limite de Cartão de Crédito 2": ["Item 1", "Item 2"],
};
