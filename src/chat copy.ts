import { Auth } from './auth';

const auth = new Auth();


interface ChatLine {
  type: 'chatLine';
  room: 'player' | 'spectator';
  username: string;
  text: string;
}

export class Chat {
  static async load(gameId:string) {
    try {
      await auth.init();

      const response = await auth.fetchBody(`/api/board/game/${gameId}/chat`, {
        method: 'get',
      });

      let messages:string[] = [];

      // Check if the response is a string or already a JSON object
      const chatData = typeof response === 'string' ? JSON.parse(response) : response;

      if (Array.isArray(chatData)) {
        chatData.forEach((item) => {
          if (item.hasOwnProperty('text') && item.hasOwnProperty('user')) {
            messages.push(item.user + ' said: ');
            messages.push(item.text + ' \n');
          } else {
            throw new Error('One or more properties are missing in the response');
          }
        });

        return messages;
      } else {
        throw new Error('Invalid JSON format in the response');
      }
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred while fetching chat data');
    }
  }

  static async send(
    gameId: string,
    room: 'player' | 'spectator',
    text: string
  ): Promise<void> {
    try {
      await auth.init();

      const requestBody = new URLSearchParams();
      requestBody.append('type', 'chatLine');
      requestBody.append('room', room);
      requestBody.append('text', text);

      const response = await auth.fetchBody(`/api/board/game/${gameId}/chat`, {
        method: 'post',
        body: requestBody,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Message sent successfully');
      // Handle the response as needed
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred while sending the chat message');
    }
  }
}
