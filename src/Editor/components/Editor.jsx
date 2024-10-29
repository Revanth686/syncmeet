import { Box, HStack } from "@chakra-ui/react";
import React, { useRef, useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { CODE_SNIPPETS } from "../constants";
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";

const EditorComp = ({
  socketRef,
  roomId,
  onCodeChange,
  onLanguageChange,
  onOutputChange,
}) => {
  const [value, setValue] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const editorRef = useRef(null);
  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };
  useEffect(() => {
    //on app load set the values on parent elem for 1st user
    //if (!value) {
    onCodeChange(value || CODE_SNIPPETS[language]);
    //}
  }, []);

  useEffect(() => {
    if (socketRef) {
      socketRef.on("code-change", ({ code }) => {
        console.log(`received code-change ${JSON.stringify(code)}`);
        setValue(code);
        onCodeChange(code); //for 2nd user to send to 3rd(new user)
      });
      socketRef.on("language-change", ({ language }) => {
        console.log(`received language-change ${JSON.stringify(language)}`);
        setLanguage(language);
        onLanguageChange(language);
      });
    }
    return () => {
      socketRef?.off("code-change");
      socketRef?.off("language-change");
    };
  }, [socketRef]);
  const onChange = (v) => {
    setValue(v);
    onCodeChange(v);
    socketRef?.emit("code-change", { roomId, code: v });
  };
  return (
    <Box w="100%">
      <HStack spacing={4}>
        <Box w="50%">
          <LanguageSelector
            language={language}
            onSelect={(lang) => {
              setLanguage(lang);
              onChange(CODE_SNIPPETS[lang]);
              onLanguageChange(lang);
              //setValue(CODE_SNIPPETS[lang]);
              socketRef?.emit("language-change", { roomId, language: lang });
            }}
          />
          <Editor
            options={{
              minimap: {
                enabled: false,
              },
            }}
            height="75vh"
            theme="vs-dark"
            language={language}
            defaultValue={CODE_SNIPPETS[language]}
            onMount={onMount}
            value={value}
            onChange={onChange}
          />
        </Box>
        <Output
          roomId={roomId}
          editorRef={editorRef}
          language={language}
          socketRef={socketRef}
          onOutputChange={onOutputChange}
        />
      </HStack>
    </Box>
  );
};
export default EditorComp;
