import { Extension } from "@tiptap/core";
import type { Editor, Range } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions, type Trigger } from "@tiptap/suggestion";
import type { RefObject } from "react";
import type { ReactNode } from "react";
import tippy, { type GetReferenceClientRect, type Instance, type Props } from "tippy.js";
import { EditorCommandOut } from "../components/editor-command";

const Command = Extension.create({
  name: "slash-command",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        findSuggestionMatch: ((config: Trigger) => {
          const contentBeforeSelection = config.$position.parent.textContent.slice(0, config.$position.parentOffset);
          const lastSlashIndex = contentBeforeSelection.lastIndexOf('/');
          if (contentBeforeSelection[contentBeforeSelection.length - 1] === '/') {
            const query = contentBeforeSelection.slice(contentBeforeSelection.length);
            return {
              range: {
                from: config.$position.pos - 1, // '/' 的位置
                to: config.$position.pos, // 当前光标的位置
              },
              query,
              text: contentBeforeSelection,
            };
          }
          if (contentBeforeSelection.length - lastSlashIndex < 5 && lastSlashIndex > -1) {
            const query = contentBeforeSelection.slice(lastSlashIndex + 1)
            return {
              range: {
                from: config.$position.pos - query.length - 1, // 计算从 '/' 开始的范围
                to: config.$position.pos, // 当前光标的位置
              },
              query,
              text: contentBeforeSelection,
            };
          }
          return null;
        })
      } as SuggestionOptions,
    };
  },
  addProseMirrorPlugins() {
    console.log(this.options.suggestion);

    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

const renderItems = (elementRef?: RefObject<Element> | null) => {
  let component: ReactRenderer | null = null;
  let popup: Instance<Props>[] | null = null;

  return {
    onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
      component = new ReactRenderer(EditorCommandOut, {
        props,
        editor: props.editor,
      });

      const { selection } = props.editor.state;

      const parentNode = selection.$from.node(selection.$from.depth);
      const blockType = parentNode.type.name;

      if (blockType === "codeBlock") {
        return false;
      }

      // @ts-ignore
      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => (elementRef ? elementRef.current : document.body),
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },
    onUpdate: (props: { editor: Editor; clientRect: GetReferenceClientRect }) => {
      component?.updateProps(props);

      popup?.[0]?.setProps({
        getReferenceClientRect: props.clientRect,
      });
    },

    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === "Escape") {
        popup?.[0]?.hide();

        return true;
      }

      // @ts-ignore
      return component?.ref?.onKeyDown(props);
    },
    onExit: () => {
      popup?.[0]?.destroy();
      component?.destroy();
    },
  };
};

export interface SuggestionItem {
  title: string;
  description: string;
  icon: ReactNode;
  searchTerms?: string[];
  command?: (props: { editor: Editor; range: Range }) => void;
}

export const createSuggestionItems = (items: SuggestionItem[]) => items;

export const handleCommandNavigation = (event: KeyboardEvent) => {
  if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
    const slashCommand = document.querySelector("#slash-command");
    if (slashCommand) {
      return true;
    }
  }
};

export { Command, renderItems };
