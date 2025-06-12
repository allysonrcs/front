import { BoxMain } from "../../components/Box/BoxMain";
import { TeamsFields } from "./TeamsFields";

export function Teams() {
    return (
        <BoxMain title='Cadastro de Time' goBack={true}>
            <TeamsFields marginTop={1} />
        </BoxMain>
    );
}
