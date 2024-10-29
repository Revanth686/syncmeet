import { useEffect, useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { executeCode } from "../api";

const Output = ({ roomId, editorRef, language, socketRef, onOutputChange }) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      const { run: result } = await executeCode(language, sourceCode);
      const op = result.output;
      setOutput(op.split("\n"));
      socketRef?.emit("output-change", { roomId, output: op });
      onOutputChange(op);
      result.stderr ? setIsError(true) : setIsError(false);
    } catch (error) {
      console.log(`error: unable to run code`);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    //initially setting op on load for parent elem
    onOutputChange(
      output ? output.join("\n") : 'Click "Run Code" to see the output here',
    );
  }, []);

  useEffect(() => {
    socketRef?.on("output-change", ({ output }) => {
      console.log(`received output-change ${JSON.stringify(output)}`);
      setOutput(output.split("\n"));
      onOutputChange(output); //for 2nd user to store in parElem for 3rd(new user)
    });
  }, [socketRef]);

  return (
    <Box w="50%" marginX={"auto"}>
      <Text mb={2} fontSize="lg">
        Output
      </Text>
      <Button
        variant="outline"
        colorScheme="green"
        mb={4}
        isLoading={isLoading}
        onClick={runCode}
      >
        Run Code
      </Button>
      <Box
        height="75vh"
        p={2}
        color={isError ? "red.400" : ""}
        border="1px solid"
        borderRadius={4}
        borderColor={isError ? "red.500" : "#333"}
      >
        {output
          ? output.map((line, i) => <Text key={i}>{line}</Text>)
          : 'Click "Run Code" to see the output here'}
      </Box>
    </Box>
  );
};
export default Output;
