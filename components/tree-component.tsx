import { hotkeysCoreFeature, syncDataLoaderFeature } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { Tree, TreeItem, TreeItemLabel } from "@/components/ui/tree";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Item } from "@/app/builder/page";

export const TreeComponent = ({
  tree,
  files,
  setSelectedFile,
}: {
  setSelectedFile: React.Dispatch<React.SetStateAction<{ fileName: string; code: string } | null>>;
  tree: any;
  files: { path: string; code: string }[];
}) => {
  const treeStr = useTree<Item>({
    indent: 20,
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) => tree[itemId],
      getChildren: (itemId) => tree[itemId].children ?? [],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  });
  return (
    <div>
      <Tree
        className="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
        indent={20}
        tree={tree}
      >
        {treeStr.getItems().map((item) => {
          return (
            <TreeItem key={item.getId()} item={item}>
              <TreeItemLabel
                onClick={() => {
                  if (!item.isFolder()) {
                    const x = files.find((f) => f.path == item.getId());

                    if (!x) {
                      return alert("File not found");
                    }
                    const file = {
                      fileName: x.path,
                      code: x.code,
                    };
                    setSelectedFile(file);
                  }
                }}
                className="relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background"
              />
            </TreeItem>
          );
        })}
      </Tree>
    </div>
  );
};
