'use client'
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi I am your interview prep bot. How may I assist you today?'
    }
  ]);
  
  const [message, setMessage] = useState<string>('');

  const sendMessage = async () => {
    if (message.trim() === "") return; // Prevent sending empty messages

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
      { role: "assistant", content: "" } // Placeholder for the assistant's response
    ]);
    setMessage(""); // Clear the input field

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';

      if (reader) {
        const processText = async ({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<string> => {
          if (done) {
            return result;
          }

          const text = decoder.decode(value || new Int8Array(), { stream: true });

          setMessages((prevMessages) => {
            let lastMessage = prevMessages[prevMessages.length - 1];
            let otherMessages = prevMessages.slice(0, prevMessages.length - 1);
            return [
              ...otherMessages,
              {
                ...lastMessage,
                content: lastMessage.content + text,
              }
            ];
          });

          result += text;

          // Continue reading the stream
          return reader.read().then(processText);
        };

        await reader.read().then(processText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Box
      width={'100vw'}
      height={"100vh"}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}>
      <Stack
        direction={"column"}
        width={"600px"}
        height={"750px"}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: '16px', 
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', 
          backgroundColor: '#fff', 
        }}
        //p={2}
        paddingTop= {0}
        spacing={3}>
        <Box
          sx={{
            backgroundColor: '#3f51b5', // Background color for header
            padding: '16px',
            borderTopLeftRadius: '16px', // Match the border radius of the container
            borderTopRightRadius: '16px',
            color: 'white',
            textAlign: 'center', // Center the text
          }}
        >
          <Typography
            variant="h5"
            
            sx={{
              fontWeight: 'bold',
            }}
          >
            Interview Prep Bot
          </Typography>
        </Box>
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow={"auto"}
          maxHeight={"100%"}
          sx={{
            padding: 1,
            '&::-webkit-scrollbar': {
              width: '6px', 
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#ccc', 
              borderRadius: '8px', 
            },
          }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              display={"flex"}
              justifyContent={message.role === 'assistant' ? 'flex-start' : "flex-end"}>
              <Box
                bgcolor={message.role === 'assistant' ? 'primary.main' : 'orange'}
                padding={3}
                borderRadius={16}
                maxWidth={"80%"}
                color={"white"}
                boxShadow= {'0 1px 3px rgba(0, 0, 0, 0.2)'}
                >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={"row"} spacing={2} sx={{ padding: 2 }}>
          <TextField
            label="Type your message..."
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }} />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
