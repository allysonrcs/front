import { BoxMain } from "../../components/Box/BoxMain";
import { RolesFields } from "./RolesFields";

export function Roles() {
    return (
        <BoxMain title='Cadastro de Cargo' goBack={true}>
            <RolesFields />
        </BoxMain>
    );
}
