import React, { useState } from 'react';
import "./App.css";

class ResponseData {
  answer: string;
  source: string;

  constructor(data: any) {
    this.answer = data.answer;
    this.source = data.source ? "Sources: " + data.source : "No sources provided";
  }
}

const simpleSystemMsg = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.
Provide sources (document name) for your answer.`

const simpleContextMsg = `Given a chat history and the latest user question 
    which might reference context in the chat history, formulate a standalone question 
    which can be understood without the chat history. Do NOT answer the question,
    just reformulate it if needed and otherwise return it as is.`

function App() {
  const [activeChat, setActiveChat] = useState('one');
  const [chats, setChats] = useState({
    one: [],
    two: [],
    three: []
  });
  const [input, setInput] = useState('');
  const [systemText, setSystemText] = useState('');
  const [contextMessage, setContextMessage] = useState(simpleContextMsg);
  const [temperature, setTemperature] = useState('0.7');
  let active = '';
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  }

  const handleSystemInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSystemText(event.target.value);
  }

  const handleContextInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContextMessage(event.target.value);
  }

  const handleTemperatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTemperature(event.target.value);
  }

  const handleButtonClick = async () => {
    if (input.trim() === '') {
      alert('Question cannot be empty');
      return;
    }
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

    setChats(prevChats => ({
      ...prevChats,
      [activeChat]: [...prevChats[activeChat as keyof typeof chats], { text: input, type: 'user' }]
    }));

    const body = {
      question: input.trim(),
      messages: [
        {
          systemMessage: systemText, // Replace with the actual system message
          contextMessage: contextMessage // Replace with the actual context message
        }
      ],
      temperature: temperature // Replace with the actual temperature
    };

    const response = await fetch(`http://127.0.0.1:5000/${active}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
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
          [activeChat]: [...prevChats[activeChat as keyof typeof chats], { text: responseData?.answer, type: 'response' }]
        }));

        if (responseData.source) {
          setChats(prevChats => ({
            ...prevChats,
            [activeChat]: [...prevChats[activeChat as keyof typeof chats], { text: responseData?.source, type: 'response' }]
          }))
          console.log(responseData.source);
        };
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
        <div>
          {(chats[activeChat]).map((message: { text: string, type: string }, index) => (
            <p key={index} className={message.type}>{message.text}</p>
          ))}
        </div>
      </div>
      <div className='centered-input'>
        <textarea
          placeholder='Write your question here.'
          rows={4}
          cols={50}
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ margin: '5px' }}>System: </label>
          <textarea
            placeholder='Here you need to write the SYSTEM prompt or leave empty to use default.'
            rows={4}
            cols={50}
            value={systemText}
            onChange={handleSystemInputChange}
            disabled={isLoading}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ margin: '5px' }}>Context: </label>
          <textarea
            placeholder='Here you can write the CONTEXT prompt for the history chat or leave empty for default.'
            rows={4}
            cols={50}
            value={contextMessage}
            onChange={handleContextInputChange}
            disabled={isLoading || activeChat !== 'two'}
          />
        </div>

      </div>
      <div>
        <label>Temperature: </label>
        <input type="number" min="0.0" max="1.0" step="0.1" value={temperature} onChange={handleTemperatureChange} />
      </div>
      <button
        style={{ backgroundColor: 'blue', color: 'white', margin: '5px' }}
        disabled={isLoading}
        onClick={handleButtonClick}>Send</button>
    </div>
  );
}

export default App;