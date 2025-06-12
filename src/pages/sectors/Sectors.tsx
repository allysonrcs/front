import { BoxMain } from "../../components/Box/BoxMain";
import { SectorsFields } from "./SectorsFields";

export function Sectors() {
    return (
        <BoxMain title='Cadastro de Setor' goBack={true}>
            <SectorsFields marginTop={1} />
        </BoxMain>
    );
}
