// ND-JSON response streamer
// See https://lichess.org/api#section/Introduction/Streaming-with-ND-JSON

type Handler = (line: any) => void;

export interface Stream {
  closePromise: Promise<void>;
  close(): Promise<void>;
}

export const readStream = (name: string, response: Response, handler: Handler): Stream => {
  const stream = response.body!.getReader();
  const matcher = /\r?\n/;
  const decoder = new TextDecoder();
  let buf = '';

  const process = (json: string) => {
    const msg = JSON.parse(json);
    console.log(name, msg);
    if (msg.moves) {
      const moves = msg.moves.split(' '); // Assuming moves are separated by spaces

      // Appending moves to a JavaScript file
      const processedMoves = moves.map((move: string) => {
        if (move.length >= 2) {
          return move.slice(-2);
        }
        return move;
      });

      // Storing moves in local storage
      localStorage.setItem('moves', JSON.stringify(processedMoves));

      // Displaying updates in div elements with class 'moves'
      const movesDivs = document.getElementsByClassName('moves');
      if (movesDivs && movesDivs.length > 0) {
        for (let i = 0; i < movesDivs.length; i++) {
          const movesDiv = movesDivs[i] as HTMLElement;
          const storedMoves = localStorage.getItem('moves');
          if (storedMoves) {
            const parsedMoves = JSON.parse(storedMoves);
            movesDiv.innerHTML = parsedMoves.join(', ');
          }
        }
      }
    }

    if (msg.type === 'chatLine') {
      // Create a unique key based on the URL
      const urlKey = `chats_${window.location.href}`;

      // Retrieve stored chat messages based on the URL-based key
      const storedChats = localStorage.getItem(urlKey);

      // Storing chat messages to local storage with the URL-based key
      if (storedChats) {
        const parsedChats: any[] = JSON.parse(storedChats);
        parsedChats.push(msg);
        localStorage.setItem(urlKey, JSON.stringify(parsedChats));
      } else {
        localStorage.setItem(urlKey, JSON.stringify([msg]));
      }
      
      const chatDivs = document.getElementsByClassName('chat');
      if (chatDivs && chatDivs.length > 0) {
        for (let i = 0; i < chatDivs.length; i++) {
          const chatDiv = chatDivs[i] as HTMLElement;
          // Clear existing content
          chatDiv.innerHTML = '';

          // Retrieve stored chat messages based on the URL-based key
          const storedChats = JSON.parse(localStorage.getItem(urlKey) || '[]');
          for (const chat of storedChats) {
            chatDiv.innerHTML += `<p>username: ${chat.username} said: ${chat.text}</p>`;
          }
        }
      }
    }

    handler(msg);
  };

  const loop: () => Promise<void> = () =>
    stream.read().then(({ done, value }) => {
      if (done) {
        if (buf.length > 0) process(buf);
        return;
      } else {
        const chunk = decoder.decode(value, {
          stream: true,
        });
        buf += chunk;

        const parts = buf.split(matcher);
        buf = parts.pop() || '';
        for (const i of parts.filter(p => p)) process(i);
        return loop();
      }
    });

  // Add event listener for DOMContentLoaded event
  document.addEventListener('DOMContentLoaded', (event) => {
    displayStoredData();
    console.log('DOM fully loaded and parsed');
  });

  // Check if the document is already in a loaded state
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    displayStoredData();
    console.log('Page loaded');
  }

  return {
    closePromise: loop(),
    close: () => stream.cancel(),
  };
};

// Function to retrieve data from local storage and display it
// Function to retrieve data from local storage and display it
const displayStoredData = () => {
  // Display stored moves
  const movesDivs = document.getElementsByClassName('moves');
  if (movesDivs && movesDivs.length > 0) {
    for (let i = 0; i < movesDivs.length; i++) {
      const movesDiv = movesDivs[i] as HTMLElement;
      const storedMoves = localStorage.getItem('moves');
      if (storedMoves) {
        const parsedMoves = JSON.parse(storedMoves);
        movesDiv.innerHTML = parsedMoves.join(', ');
      }
    }
  }

  // Create a unique key based on the URL
  const urlKey = `chats_${window.location.href}`;

  // Retrieve stored chat messages based on the URL-based key
  const storedChats = JSON.parse(localStorage.getItem(urlKey) || '[]');
  console.log('Retrieved Chats:', storedChats);

  // Display stored chats
  const chatDivs = document.getElementsByClassName('chat');
  if (chatDivs && chatDivs.length > 0) {
    for (let i = 0; i < chatDivs.length; i++) {
      const chatDiv = chatDivs[i] as HTMLElement;
      // Clear existing content
      chatDiv.innerHTML = '';

      for (const chat of storedChats) {
        chatDiv.innerHTML += `<p>room: ${chat.room}, text: ${chat.text}, type: ${chat.type}, username: ${chat.username}</p>`;
      }
    }
  }
};

