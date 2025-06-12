import { useEffect, useState } from "react";
import { alpha, styled } from "@mui/material/styles";
import { TreeView, TreeViewProps } from "@mui/x-tree-view/TreeView";
import { TreeItem, TreeItemProps, treeItemClasses } from "@mui/x-tree-view";
import Collapse from "@mui/material/Collapse";
import { useSpring, animated } from "@react-spring/web";
import { TransitionProps } from "@mui/material/transitions";
import Checkbox from "@mui/material/Checkbox";
import { FormControlLabel } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { ITreeRouteProps } from "@/services/access-groups";

export type TypeRouteProps = {
    id: number;
    name: string;
    sub_routes?: TypeRouteProps[];
    selected?: boolean;
};

function TransitionComponent(props: TransitionProps) {
    const style = useSpring({
        from: {
            opacity: 0,
            transform: "translate3d(20px,0,0)",
        },
        to: {
            opacity: props.in ? 1 : 0,
            transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
        },
    });

    return (
        <animated.div style={style}>
            <Collapse {...props} />
        </animated.div>
    );
}

const StyledTreeItem = styled((props: TreeItemProps) => (
    <TreeItem {...props} ref={undefined} TransitionComponent={TransitionComponent} />
))(({ theme }) => ({
    [`& .${treeItemClasses.iconContainer}`]: {
        "& .close": {
            opacity: 0.3,
        },
    },
    [`& .${treeItemClasses.group}`]: {
        marginLeft: 15,
        paddingLeft: 18,
        borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
}));

type Props = TreeViewProps<any> & {
    routes: ITreeRouteProps[];
    all_selected?: string[];
    onChangeData?: (data: string[] | null) => void;
};

export default function TreeComponent({ routes, all_selected, onChangeData, ...props }: Props) {
    const [selected, setSelected] = useState<string[]>(all_selected ?? []);

    let expanded: string[] = [];

    for (var i = 0; i < routes.length; i++) {
        expanded.push(String(routes[i].id_unique));
        const { children } = routes[i];

        children?.forEach((value) => {
            expanded.push(value.id_unique);
        });
    }

    function getChildById(id: string) {
        let array: string[] = [];

        function getAllChild(nodes: ITreeRouteProps | null) {
            if (nodes === null) {
                return [];
            }

            array.push(nodes.id_unique);

            if (Array.isArray(nodes.children)) {
                nodes.children.forEach((node) => {
                    let arrayChild = getAllChild(node);

                    if (arrayChild) {
                        array = [...array, ...arrayChild];
                        array = array.filter((v, i) => array.indexOf(v) === i);
                    }
                });
            }
        }

        function getNodeById(route: ITreeRouteProps, id: string) {
            if (route.id_unique === id) {
                return route;
            } else if (Array.isArray(route.children)) {
                let result = null;
                route.children.forEach((node) => {
                    if (!!getNodeById(node, id)) {
                        result = getNodeById(node, id);
                    }
                });
                return result;
            }

            return null;
        }

        for (var i = 0; i < routes.length; i++) {
            getAllChild(getNodeById(routes[i], id));
        }

        return array;
    }

    function getFatherById(route: ITreeRouteProps, id: string): ITreeRouteProps | null {
        if (route.id_unique === id) {
            return route;
        } else if (Array.isArray(route.children)) {
            let result = null;
            route.children.forEach((node) => {
                if (!!getFatherById(node, id)) {
                    result = getFatherById(node, id);
                }
            });
            return result;
        }

        return null;
    }

    function getOnChange(checked: boolean, route: ITreeRouteProps) {
        const allRoute: string[] = getChildById(route.id_unique);

        let newSelected = checked ? [...selected, ...allRoute] : selected.filter((value) => !allRoute.includes(value));

        function verifyParent(id_parent: string) {
            let allRoute: string[] = getChildById(id_parent);
            let allRouteSon = allRoute.filter((value) => value !== id_parent);

            let routeNotSelected = allRouteSon.filter((value) => !newSelected.includes(value));

            if (routeNotSelected.length === 0) {
                newSelected.push(id_parent);
            } else {
                newSelected = newSelected.filter((value) => value !== id_parent);
            }
        }

        if (route.id_parent) {
            let id_parent: string = route.id_parent;

            do {
                verifyParent(id_parent);

                for (var i = 0; i < routes.length; i++) {
                    let father = getFatherById(routes[i], id_parent);
                    if (father && father.id_parent) {
                        id_parent = father.id_parent;
                        break;
                    } else {
                        id_parent = "";
                    }
                }
            } while (id_parent !== "");
        }

        newSelected = newSelected.filter((v, i) => newSelected.indexOf(v) === i);

        setSelected(newSelected);
    }

    const isIndeterminate = (route: ITreeRouteProps) => {
        if (selected.length === 0) {
            return false;
        } else {
            const exist = selected.find((value) => value === route.id_unique);

            if (exist) {
                return undefined;
            }
        }

        let allRoute: string[] = getChildById(route.id_unique);
        allRoute = allRoute.filter((value) => value !== route.id_unique);
        let routeSelected = allRoute.filter((x) => selected.includes(x));

        if (routeSelected.length === allRoute.length) {
            return undefined;
        } else if (routeSelected.length > 0) {
            return true;
        } else {
            return false;
        }
    };

    useEffect(() => {
        if (onChangeData) {
            onChangeData(selected.length ? selected : null);
        }
    }, [selected]);

    useEffect(() => {
        if (all_selected?.length) {
            let array: string[] = [];
            for (let route of routes) {
                if (route.children && route.children.length > 0) {
                    let allRoute: string[] = getChildById(route.id_unique);
                    let unchecked = allRoute.filter((x) => !all_selected.includes(x));
                    unchecked = unchecked.filter((value) => value !== route.id_unique);
                    if (unchecked.length === 0) {
                        array.push(route.id_unique);
                    }
                }
            }
            setSelected([...array, ...all_selected]);
        } else {
            setSelected([]);
        }
    }, [all_selected]);

    const renderTree = (route: ITreeRouteProps) => (
        <StyledTreeItem
            key={route.id_unique}
            nodeId={route.id_unique}
            label={
                <FormControlLabel
                    control={
                        <Checkbox
                            indeterminate={route.children ? isIndeterminate(route) : false}
                            checked={selected.some((item) => item === route.id_unique)}
                            onChange={(event) => getOnChange(event.currentTarget.checked, route)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    }
                    label={route.name}
                    key={route.id_unique}
                />
            }>
            {Array.isArray(route.children) ? route.children.map((value) => renderTree(value)) : null}
        </StyledTreeItem>
    );

    return (
        <TreeView
            {...props}
            expanded={expanded}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            ref={undefined}
            sx={{ maxHeight: "auto", flexGrow: 1, maxWidth: "inherit", overflowY: "scroll" }}>
            {routes.map(renderTree)}
        </TreeView>
    );
}
