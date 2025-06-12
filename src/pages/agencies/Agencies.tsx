import { BoxMain } from "@/components/Box/BoxMain";
import { AgenciesFields } from "./AgenciesFields";

export function Agencies() {
    return (
        <BoxMain title='Cadastro de Agência' goBack={true}>
            <AgenciesFields marginTop={1} />
        </BoxMain>
    );
}
