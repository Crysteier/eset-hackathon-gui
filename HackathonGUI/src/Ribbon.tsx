import React from 'react';

interface RibbonProps {
  endpoint: string;
  message: string;
}

const Ribbon: React.FC<RibbonProps> = ({ endpoint, message }) => {
  const handleClick = async () => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      console.error('Failed to send message');
    }
  }

  return <button onClick={handleClick}>{message}</button>;
}

const Header: React.FC = () => {
  return (
    <div>
      <Ribbon endpoint="/chat/one" message="One" />
      <Ribbon endpoint="/chat/two" message="Two" />
      <Ribbon endpoint="/chat/three" message="Three" />
    </div>
  );
}

export default Header;