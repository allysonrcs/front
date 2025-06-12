import { BoxMain } from "@/components/Box/BoxMain";
import { UsersFields } from "./UsersFields";

export function Users() {
    return (
        <BoxMain title='Cadastro de Usuário' goBack={true}>
            <UsersFields marginTop={1} />
        </BoxMain>
    );
}
