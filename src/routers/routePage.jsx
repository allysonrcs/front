import { Component } from "react";
import { Users } from "@/pages/users/Users";
import { ListRecordsUsers } from "@/pages/users/ListRecordsUsers";
import { UpdateMyProfile } from "@/pages/peoples/UpdateMyProfile";

class MyPage extends Component {
    components = {
        Users: Users,
        ListRecordsUsers: ListRecordsUsers,
        UpdateMyProfile: UpdateMyProfile,
    };

    render() {
        const TagName = this.components[this.props.tag || "UpdateMyProfile"];
        if (!TagName) {
            console.error(`Componente não encontrado para a tag: ${this.props.tag}`);
            return null;
        }
        return <TagName />;
    }
}
export default MyPage;
