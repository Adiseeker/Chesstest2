import { Auth } from './auth';
import { h } from 'snabbdom';

import * as fs from 'fs';
import * as Papa from 'papaparse';

const auth = new Auth();

let msg: string="";

const playerRating = async (username: string) => {
  try {
    await auth.init();

    const response = await auth.fetchBody(`/api/user/${username}`, {
      method: 'get',
    });

   

    let ratings: number[] = [];
    const rapidRating: number = response?.perfs?.rapid?.rating;
    const minimalRating: number = rapidRating - 300;
    const puzzleRating: number = response?.perfs?.puzzle?.rating;
    

    const classicalRating: number = response?.perfs?.classical?.rating;
    const dateofCreatingProfile: number =response?.createdAt;

    const TwoMonthInMillis = 2 * 30 * 24 * 60 * 60 * 1000;


    

    


    if (rapidRating !== undefined && puzzleRating !== undefined && classicalRating !== undefined) {
      const playerDivs = Array.from(document.getElementsByClassName('stats'));
      
    if (!playerDivs || playerDivs.length === 0) {
    console.error('Unable to find the player div elements.');
    return;
    }

      
      playerDivs.forEach((playerDiv) => {
        playerDiv.innerHTML += `
          <p>Rapid Rating: ${rapidRating}</p>
          <p>Puzzle Rating: ${puzzleRating}</p>
          <p>Classical Rating: ${classicalRating}</p>
          <p>Date of Creating Profile: ${new Date(dateofCreatingProfile).toLocaleDateString()}</p>
        `;
      });

      
    } 
    else if(puzzleRating==undefined || puzzleRating==0)
    {
      msg+="Player wasn't do puzzles! \n";

      if(dateofCreatingProfile && (Date.now() - dateofCreatingProfile) <= TwoMonthInMillis)
    {
      msg+="Account was created in recently time! \n";
      
    }
    }
    else {
      throw new Error("One or more ratings are missing in the response");
    }

    //if(ratings.some(x => x <= minimalRating))

    if(puzzleRating <= minimalRating)
    {
      msg+="Puzzle rating is suspectly low. \n";

    }
    else if(dateofCreatingProfile && (Date.now() - dateofCreatingProfile) <= TwoMonthInMillis)
    {
      msg+="Account was created in recently time! \n";
      
    }

    if(msg.length>3)
    {
      alert("Watch out!\n"+msg);
    }
    

    
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while fetching player ratings");
  }
};

const playerResign = async (username: string,id: string) => {
  try {
    await auth.init();

    const response = await auth.fetchBody(`/api/user/${username}`, {
      method: 'get',
    });

   

    let ratings: number[] = [];
    const rapidRating: number = response?.perfs?.rapid?.rating;
    const minimalRating: number = rapidRating - 300;
    const puzzleRating: number = response?.perfs?.puzzle?.rating;

    const country: string | undefined = response?.profile?.country;
    

    const classicalRating: number = response?.perfs?.classical?.rating;
    const dateofCreatingProfile: number =response?.createdAt;

    const TwoMonthInMillis = 2 * 30 * 24 * 60 * 60 * 1000;
    

    const optionValues: (string | undefined)[] = [
      undefined, "AT", "BE", "CA", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "CH", "GB", "US"
    ];
    
    
    
    if (optionValues.includes(country)) {
      console.log(`The country ${country} is in the optionValues array.`);
      // Perform additional actions if the country is found
    } else {
      console.log(`The country ${country} is not in the optionValues array.`);
      await auth.fetchBody(`/api/board/game/${id}/resign`, { method: 'post' });

      // Perform additional actions if the country is not found
    }
    
    
    

    


    if (rapidRating !== undefined && puzzleRating !== undefined && classicalRating !== undefined) {
      const playerDivs = Array.from(document.getElementsByClassName('stats'));
      
    if (!playerDivs || playerDivs.length === 0) {
    console.error('Unable to find the player div elements.');
    return;
    }

      
      playerDivs.forEach((playerDiv) => {
        playerDiv.innerHTML += `
          <p>Rapid Rating: ${rapidRating}</p>
          <p>Puzzle Rating: ${puzzleRating}</p>
          <p>Classical Rating: ${classicalRating}</p>
          <p>Date of Creating Profile: ${new Date(dateofCreatingProfile).toLocaleDateString()}</p>
        `;
      });

      
    } 
    else if(puzzleRating==undefined || puzzleRating==0)
    {
      msg+="Player wasn't do puzzles! \n";

      if(dateofCreatingProfile && (Date.now() - dateofCreatingProfile) <= TwoMonthInMillis)
    {
      msg+="Account was created in recently time! \n";
      
    }
    }
    else {
      throw new Error("One or more ratings are missing in the response");
    }

    //if(ratings.some(x => x <= minimalRating))

    if(puzzleRating <= minimalRating)
    {
      msg+="Puzzle rating is suspectly low. \n";

    }
    else if(dateofCreatingProfile && (Date.now() - dateofCreatingProfile) <= TwoMonthInMillis)
    {
      msg+="Account was created in recently time! \n";
      
    }

    if(msg.length>3)
    {
      alert("Watch out!\n"+msg);
      await auth.fetchBody(`/api/board/game/${id}/resign`, { method: 'post' });
    }
    

    
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while fetching player ratings");
  }
};


const playerCheck = async (id: string) => {
  try {
    await auth.init();

  
  
  console.log('Siema!7');

  const url = `https://lichess.org/game/export/${id}`;

  const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let usernames: string[]=[];
    const data = await response.text();

    const wplayerMatch = data.match(/\[White "(.+)"\]/);
    const bplayerMatch = data.match(/\[Black "(.+)"\]/);

    
    const toLower = (str:string) => str.toLowerCase();

if (wplayerMatch && wplayerMatch[1]) {
    usernames.push(toLower(wplayerMatch[1]));
}

if (bplayerMatch && bplayerMatch[1]) {
    usernames.push(toLower(bplayerMatch[1]));
}

    

    const notEqualUsernames = usernames.filter(username => username !== auth.me?.id);

    

    playerResign(notEqualUsernames.toString(),id)



    
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while fetching player names");
  }
};

export  {playerRating,playerCheck};
