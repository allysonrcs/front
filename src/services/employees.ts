import api from "./api";

const baseUrl = "/employees";

export type SearchEmployeeTdo = {
    id_cooperative?: number;
    id_agency?: number;
    id_portfolio?: number;
    id_sector?: number;
    is_active?: boolean;
    limit?: number;
    offset?: number;
    id_team?: number;
};

export interface ISearchEmployee {
    id: number;
    people_name: string;
    url_avatar: string | null;
    socket_status: string;
    employee_email_corporate: string;
    agency_name: string | null;
    id_agency: number;
    sector_name: string | null;
    role_name: string | null;
    team_name?: string | null;
    portfolio_name?: string | null;
    is_active: boolean;
    created_at: string;
}

export function searchEmployee(params: SearchEmployeeTdo): Promise<ISearchEmployee[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export type SearchAutoCompleteEmployees = {
    id_cooperative?: number;
    id_agency?: number;
    id_team?: number;
    id_portfolio?: number;
    id_sector?: number;
    is_active?: boolean;
    no_user?: boolean;
    info_sector?: boolean;
    info_image_profile?: boolean;
    has_function?: boolean;
};

export interface ISearchAutoCompleteEmployee {
    id: number;
    name: string;
    id_sector?: number;
    sector_name?: string;
    image_profile?: string;
    is_president: boolean;
    is_counselor: boolean;
    is_director: boolean;
    is_manager: boolean;
    is_coordinator: boolean;
    is_supervisor: boolean;
    is_assistent: boolean;
    is_analyst: boolean;
    is_attendant: boolean;
    is_agent: boolean;
    is_cashier: boolean;
    is_trainee: boolean;
    is_apprentice: boolean;
    id_user: number;
}

export function searchAutoCompleteEmployees(
    params: SearchAutoCompleteEmployees,
): Promise<ISearchAutoCompleteEmployee[]> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/autocomplete?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type ChangeStatusEmployeeProps = {
    is_active: boolean;
};

export function changeStatusEmployee(id_employee: number, params: ChangeStatusEmployeeProps) {
    return new Promise((resolve, reject) => {
        api()
            .patch(`${baseUrl}/${id_employee}/status`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type SaveAccessUniversaProps = {
    id_external_system: number;
    login: string;
    is_active: boolean;
};

export interface ISaveAccessUniversa {
    id_access_universa: number;
}

export function saveAccessUniversa(id_employee: number, params: SaveAccessUniversaProps): Promise<ISaveAccessUniversa> {
    return new Promise((resolve, reject) => {
        api()
            .patch(`${baseUrl}/${id_employee}/access-universa`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IAttachedTo {
    id_agency: number;
    id_sector: number;
    id_role: number | null;
}

export async function searchAttachedTo(): Promise<IAttachedTo> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/attached-to`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type CreateEmployee = {
    employees: {
        id_cooperative: number;
        id_agency: number;
        id_portfolio?: number | null;
        id_sector: number;
        id_team?: number | null;
        id_immediate_superior?: number | null;
        id_role: number;
        email_corporate: string | null;
        phone_ramal: number | null;
        matriculation_id: number | null;
        date_admission: string | null;
        is_president?: boolean;
        is_counselor?: boolean;
        is_director?: boolean;
        is_manager?: boolean;
        is_coordinator?: boolean;
        is_supervisor?: boolean;
        is_assistent?: boolean;
        is_analyst?: boolean;
        is_attendant?: boolean;
        is_agent?: boolean;
        is_cashier?: boolean;
        is_trainee?: boolean;
        is_apprentice?: boolean;
        on_vacation?: boolean;
        is_point_required?: boolean;
    };
    peoples: {
        email: string | null;
        name: string;
        document_cpf: string;
        document_rg: string;
        cel_phone_personal: number | null;
        cel_phone_company: number | null;
        birthday_date: string;
        gender: string;
        marital_status: string;
        issuing_agency_rg: string;
        description?: string | null;
    };
    working_breaks: {
        id_working_break: number[];
    };
};

export function createEmployee(data: CreateEmployee): Promise<any> {
    return new Promise((resolve, reject) => {
        api()
            .post(`${baseUrl}`, data)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

export interface IEmployee {
    id: number;
    is_active: boolean;
    email_corporate: string | null;
    phone_ramal: number | null;
    matriculation_id: number | null;
    date_admission: string | null;
    is_president?: boolean;
    is_counselor?: boolean;
    is_director?: boolean;
    is_manager?: boolean;
    is_coordinator?: boolean;
    is_supervisor?: boolean;
    is_assistent?: boolean;
    is_analyst?: boolean;
    is_attendant?: boolean;
    is_agent?: boolean;
    is_cashier?: boolean;
    is_trainee?: boolean;
    is_apprentice?: boolean;
    on_vacation: boolean;
    is_point_required: boolean;
    cooperatives: {
        id: number;
        abbreviation: string;
    };
    portfolios: {
        id: number;
        name: string;
    };
    teams: {
        id: number;
        name: string;
    };
    agencies: {
        id: number;
        name: string;
    };
    sectors: {
        id: number;
        name: string;
    };
    superior_immediate_father: {
        id: number;
        peoples: {
            name: string;
        };
    };
    peoples: {
        id: number;
        name: string;
        email: string;
        birthday_date: string;
        cel_phone_personal: string;
        document_cpf: string;
        document_rg: string;
        gender: string;
        id_address: number;
        issuing_agency_rg: string;
        marital_status: string;
        cel_phone_company: string | null;
        description: string | null;
    };
    working_breaks_employees: WorkingBreak[];
    roles: {
        id: number;
        name: string;
    };
}

type WorkingBreak = {
    id: number;
    working_breaks: {
        id: number;
        time_end: string;
        time_start: string;
        type: string;
    };
};

export function findOneEmployee(id_employee: number): Promise<IEmployee> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/${id_employee}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type UpdateEmployee = {
    employees: {
        id_cooperative: number;
        id_agency: number;
        id_portfolio?: number | null;
        id_sector: number;
        id_team?: number | null;
        id_immediate_superior?: number | null;
        email_corporate: string | null;
        phone_ramal: number | null;
        date_admission: string | null;
        matriculation_id: number | null;
        is_president?: boolean;
        is_counselor?: boolean;
        is_director?: boolean;
        is_manager?: boolean;
        is_coordinator?: boolean;
        is_supervisor?: boolean;
        is_assistent?: boolean;
        is_analyst?: boolean;
        is_attendant?: boolean;
        is_agent?: boolean;
        is_cashier?: boolean;
        is_trainee?: boolean;
        is_apprentice?: boolean;
        id_role: number;
        is_point_required: boolean | undefined;
        on_vacation: boolean | undefined;
    };
    peoples: {
        name: string;
        document_cpf: string;
        document_rg: string;
        cel_phone_personal: number | null;
        cel_phone_company: number | null;
        birthday_date: string;
        gender: string;
        marital_status: string;
        issuing_agency_rg: string;
        description?: string | null;
    };
    working_breaks: {
        id_working_break: number[];
    };
};

export function updateEmployee(id_employee: number, params: UpdateEmployee): Promise<string | null> {
    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/${id_employee}`, params)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type UpdateChatStatus = {
    socket_status: string;
};
export async function updateSocketStatus(params: UpdateChatStatus): Promise<void> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .put(`${baseUrl}/socket-status?${myQuery.toString()}`)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
}

export async function unavailableConfirm(params: { id_employee: number }): Promise<string | null> {
    let myQuery = new URLSearchParams();
    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/unavailable?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

type DashBoardEmployeeProps = {
    id_agency: number;
    id_sector?: number;
    id_team?: number;
    date_start: string;
    date_end: string;
    only_customer_service?: boolean;
};

export type IDashboardCustomerServiceEmployee = {
    name: string;
    id: number;
    url_avatar: string | null;
    total: string;
    finished: string;
    disconnected: string;
    pending: string;
    in_progress: string;
    average_valuation: string;
    average_time: string;
    socket_status: "Online" | "Ocupado" | "Ausente" | "Invisível" | "Em reunião";
};

export function getDashboardEmployees(params: DashBoardEmployeeProps): Promise<IDashboardCustomerServiceEmployee[]> {
    let myQuery = new URLSearchParams();

    for (var [key, value] of Object.entries(params)) {
        myQuery.append(key, String(value));
    }

    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/dashboard/employee?${myQuery.toString()}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}

interface IEmployeeInfo {
    id: number;
    phone_ramal: number;
    email_corporate: string;
    roles: {
        name: string;
    };
    imageprofile: {
        public_url: string;
    };
    agencies: {
        ipbx_identifier: string;
        abbreviation: string;
    };
    sectors: {
        name: string;
    };
    peoples: {
        name: string;
        cel_phone_personal: string | null;
    };
}
export function getEmployeeInfo(id: number): Promise<IEmployeeInfo> {
    return new Promise((resolve, reject) => {
        api()
            .get(`${baseUrl}/${id}/info`)
            .then((res) => {
                resolve(res.data);
            })
            .catch((res) => {
                reject(res);
            });
    });
}
