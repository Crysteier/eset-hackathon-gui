import React, { useState } from 'react';
import "./App.css";

class ResponseData {
  answer: string;
  source: string;

  constructor(data: any) {
    this.answer = data.answer;
    this.source = "Sources: " + data.source;
  }
}

function App() {
  const [activeChat, setActiveChat] = useState('one');
  const [chats, setChats] = useState({
    one: [],
    two: [],
    three: []
  });
  const [input, setInput] = useState('');
  let active = '';
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  }

  const handleButtonClick = async () => {
    setInput('');
    setIsLoading(true);
    console.log(activeChat);
    if (activeChat === 'one') {
      active = 'chatSimple';
    }
    else if (activeChat === 'two') {
      active = 'chatWithHistory';
    }
    else {
      active = 'functionCalling';
    }
    console.log(active);
    setChats(prevChats => ({
      ...prevChats,
      [activeChat]: [...prevChats[activeChat as keyof typeof chats], {text: input, type: 'user'}]
    }));

    const response = await fetch(`http://127.0.0.1:5000/${active}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question: input.trim() })
    });

    if (!response.ok) {
      console.error('Failed to send message');
      return null;
    } else {
      console.log('Success');
      const data = await response.json();
      const responseData = new ResponseData(data);

      setChats(prevChats=>({
        ...prevChats,
        [activeChat]: [...prevChats[activeChat as keyof typeof chats], {text: responseData.answer, type: 'response'}]
      }));

       setChats(prevChats=>({
        ...prevChats,
        [activeChat]: [...prevChats[activeChat as keyof typeof chats], {text: responseData.source, type: 'response'}]
       }));
    }
    setIsLoading(false);

  }

  const handleRibbonClick = (chat: string) => {
    setActiveChat(chat);
  }

  return (
    <div className='app-container'>
      {isLoading ? (<div className='loading'>Loading...</div>) : (<></>)}
      <div className='centered-top'>
        <button className={activeChat === 'one' ? 'active' : ''} onClick={() => handleRibbonClick('one')}>Simple</button>
        <button className={activeChat === 'two' ? 'active' : ''} onClick={() => handleRibbonClick('two')}>History</button>
        <button className={activeChat === 'three' ? 'active' : ''} onClick={() => handleRibbonClick('three')}>Functions</button>
      </div>
      <div className='chats-container'>
        <div className='centered-input'>
          {(chats[activeChat]).map((message: { text: string, type: string }, index) => (
            <p key={index} className={message.type}>{message.text}</p>
          ))}
        </div>
      </div>
      <div className='centered-input'>
        <textarea
          rows={4}
          cols={50}
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>
      <button disabled={isLoading} onClick={handleButtonClick}>Send</button>
    </div>
  );
}

export default App;