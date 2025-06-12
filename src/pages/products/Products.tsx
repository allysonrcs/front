import { BoxMain } from "@/components/Box/BoxMain";
import { ProductsFields } from "./ProductsFields";

export function Products() {
    return (
        <BoxMain title='Cadastro de Produto' goBack={true}>
            <ProductsFields />
        </BoxMain>
    );
}
