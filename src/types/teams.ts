import { StepperChildrenProps } from "../components/Stepper/Context/CustomizedSteppers";

export interface ITeamProps {
    id: number;
    name: string;
    leaders: string;
    is_active: boolean;
    amount_of_people: number;
}

export type IAutocompletePeople = {
    id: number;
    name: string;
};

export type IAutocomplete = {
    id: number;
    name: string;
};

export interface ISearchAutocompleteTeams extends IAutocomplete {}
export interface IAutocompleteTeamsPeopleByPermission {
    id_team: number;
    people: ISearchAutocompleteTeams;
}

export interface ITeamDataProps {
    name: string;
    leaders?: { id: number; label: string }[];
    removedLeaders?: IAutocompletePeople[];
}

export type ICollaboratorsDataProps = {
    input: IAutocomplete[];
    collaborators: IAutocomplete[];
    listRemoveCollaborators: IAutocompletePeople[];
};

type TArrayCollaborator = {
    id: number;
    is_leader: boolean;
};

export type ITeamCreationData = {
    name: string;
    collaborators?: TArrayCollaborator[];
};

export type UpdateTeamState = {
    id: number;
    name: string;
    leaders: string;
    amount_people: number;
    is_active: boolean;
};

export interface ITeamAgentProps {
    idTeam?: number;
    closeModal?: (id?: number) => void;
    editFunctionTeam?: (params: UpdateTeamState, is_active?: boolean) => void;
}

export type ITeamData = {
    name: string;
    collaborators?: IAutocompletePeople[];
    leaders?: IAutocompletePeople[];
    is_active: boolean;
};

export type ITeamStepProps = {
    dataValues?: {
        name?: string;
        leaders?: IAutocompletePeople[];
    };
} & StepperChildrenProps;

export type ICollaboratorsStepProps = {
    idTeam?: number;
    dataValues?: {
        collaborators?: IAutocompletePeople[];
        leaders?: IAutocompletePeople[];
        is_active: boolean;
    };
    editFunctionTeam?: (params: UpdateTeamState, is_active?: boolean) => void;
} & StepperChildrenProps;

export interface UpdateTeam {
    id_team: number;
    params: {
        name: string;
        collaborators?: TArrayCollaborator;
        listRemoveCollaborators?: number[];
    };
}

export interface SearchTeamCollaborators {
    team?: IAutocomplete[];
}
