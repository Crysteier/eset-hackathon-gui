import React, { useState } from 'react';
import "./App.css";

class ResponseData {
  answer: string;
  source: string;

  constructor(data: any) {
    this.answer = data.answer;
    this.source = "Sources: " + data.source ? data.source : "No sources provided";
  }
}

class RequestData {
  question: string;
  systemText: string;
  systemContext: string;

  constructor(question: string, systemText: string, systemContext: string) {
    this.question = question;
    this.systemText = systemText;
    this.systemContext = systemContext;
  }
}

const simpleContext = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.
Provide sources (document name) for your answer.
Format your answer into json format with following structure: {ansWer: 'answer', source: 'source' }`

function App() {
  const [activeChat, setActiveChat] = useState('one');
  const [chats, setChats] = useState({
    one: [],
    two: [],
    three: []
  });
  const [input, setInput] = useState('');
  const [systemText, setSystemText] = useState(simpleContext);
  let active = '';
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  }

  const handleSystemInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSystemText(event.target.value);
  }

  const handleButtonClick = async () => {
    setInput('');
    setIsLoading(true);
    //const requestData = new RequestData(input, systemText);
    if (activeChat === 'one') {
      active = 'chatSimple';
    }
    else if (activeChat === 'two') {
      active = 'chatWithHistory';
    }
    else {
      active = 'functionCalling';
    }

    console.log(systemText);
    setChats(prevChats => ({
      ...prevChats,
      [activeChat]: [...prevChats[activeChat as keyof typeof chats], { text: input, type: 'user' }]
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
      setIsLoading(false);
      return null;
    } else {
      try {
        const data = await response.json();
        const responseData = new ResponseData(data);

        setChats(prevChats => ({
          ...prevChats,
          [activeChat]: [...prevChats[activeChat as keyof typeof chats], { text: responseData.answer, type: 'response' }]
        }));

        setChats(prevChats => ({
          ...prevChats,
          [activeChat]: [...prevChats[activeChat as keyof typeof chats], { text: responseData.source, type: 'response' }]
        }));
      } catch (error) {
        alert('Failed to parse response with error: ' + error);
      } finally {
        setIsLoading(false);
      }
    }
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
          placeholder='Here you need to write the system prompt to give the llm identity.'
          rows={4}
          cols={50}
          value={systemText}
          onChange={handleSystemInputChange}
          disabled={isLoading} />
        <textarea
          placeholder='Write your question here.'
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