// import { Extension } from '@tiptap/core';
// import { Plugin, PluginKey } from 'prosemirror-state';
// import { Decoration, DecorationSet } from 'prosemirror-view';

// const HighlightFocusedLine = Extension.create({
//     name: 'highlightFocusedLine',

//     addProseMirrorPlugins() {
//         return [
//             new Plugin({
//                 key: new PluginKey('highlightFocusedLine'),

//                 state: {
//                     init: () => DecorationSet.empty,
//                     apply(tr, oldDecorations, oldState, newState) {
//                         const decorations = [];
//                         const { from, to, empty } = newState.selection;

//                         // 如果焦点处于文档中且有选中区域，则设置高亮
//                         if (!empty) {
//                             newState.doc.nodesBetween(from, to, (node, pos) => {
//                                 if (node.isTextblock) {
//                                     const startPos = pos;
//                                     const endPos = pos + node.nodeSize;
//                                     decorations.push(Decoration.node(startPos, endPos, { class: 'focused-line' }));
//                                 }
//                             });
//                         }

//                         return DecorationSet.create(newState.doc, decorations);
//                     },
//                 },
//                 props: {
//                     decorations(state) {
//                         return this.getState(state);
//                     },
//                     handleDOMEvents: {
//                         blur(view) {
//                             // 清除所有装饰当失去焦点时
//                             const { state, dispatch } = view;
//                             dispatch(state.tr.setMeta('clearHighlight', true));
//                             return false;
//                         },
//                     },
//                 },
//             }),
//         ];
//     },
// });

// export default HighlightFocusedLine;
