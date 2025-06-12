import { Component } from "react";

class MyComponent extends Component {
    components = {};

    render() {
        const TagName = this.components[this.props.tag];
        if (!TagName) {
            console.error(`Componente não encontrado para a tag: ${this.props.tag}`);
            return null;
        }
        return <TagName />;
    }
}
export default MyComponent;
