import { useState } from "react";

export async function SendMessage(activeChat: string, input: string) {
    const [active, setActive] = useState('chatSimple');    
    if(activeChat === 'one') {
       setActive('chatSimple');
    }
    else if(activeChat === 'two') {
        setActive('chatWithHistory');

    }
    else {
        setActive('functionCalling');

    }
  const response = await fetch(`http://127.0.0.1:5000/${active}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question: input})
  });

  if (!response.ok) {
    console.error('Failed to send message');
    return null;
  } else {
    const data = await response.json();
    return data.message;
  }
}