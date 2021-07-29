import { useEffect } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { sql } from "@codemirror/lang-sql";

import { logger } from "../logger";
import { useEditorParent } from "./useEditorParent";
import { useEditorTheme } from "./useEditorTheme";
import { useEditorAppearance } from "./useEditorAppearance";
import { useEditorBehaviour } from "./useEditorBehaviour";
import { useEditorKeymap } from "./useEditorKeymap";

const log = logger("sql-editor", "aquamarine");

type EditorParams = {
  code: string;
  readonly?: boolean;
  onChange?: (value: string) => void;
  onExecuteQuery?: (value: string) => void;
};

/**
 * Creates a CodeMirror instance for editing SQL
 *
 * @param domSelector DOM Element where the editor will be rendered
 * @param params Editor configuration
 */
export function useSqlEditor(domSelector: string, params: EditorParams) {
  const { parent, dimensions } = useEditorParent(domSelector);
  const editorTheme = useEditorTheme(dimensions);

  const appearanceExtensions = useEditorAppearance();
  const behaviourExtensions = useEditorBehaviour();
  const keyMapExtensions = useEditorKeymap();

  useEffect(() => {
    const view = new EditorView({
      parent,
      dispatch: transaction => {
        if (params.readonly && transaction.docChanged) {
          return;
        }

        view.update([transaction]);

        if (transaction.docChanged) {
          params.onChange?.(transaction.newDoc.sliceString(0));
        }
      },
      state: EditorState.create({
        doc: params.code,

        extensions: [
          sql(),

          editorTheme,
          ...appearanceExtensions,
          ...behaviourExtensions,
          ...keyMapExtensions,
        ],
      }),
    });

    log("Initialized");

    return () => {
      view.destroy();
    };
  });
}