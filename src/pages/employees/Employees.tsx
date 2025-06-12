import { BoxMain } from "@/components/Box/BoxMain";
import { EmployeesFields } from "./EmployeesFields";

export function Employees() {
    return (
        <BoxMain title='Cadastro de Colaborador' goBack={true}>
            <EmployeesFields />
        </BoxMain>
    );
}
