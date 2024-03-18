import {Auth}  from './auth';
import { h} from 'snabbdom';

const auth = new Auth();

const playerRating = async (username: string) => {
  try {
    await auth.init();

    const response = await auth.fetchBody(`/api/user/${username}`, {
      method: 'get',
    });

    const rapidRating = response?.perfs?.rapid?.rating;
    const puzzleRating = response?.perfs?.puzzle?.rating;
    const classicalRating = response?.perfs?.classical?.rating;

    if (rapidRating && puzzleRating && classicalRating) {
        return(alert([`Rapid Rating: ${rapidRating}`,`Puzzle Rating: ${puzzleRating}`,`Classical Rating: ${classicalRating}`])) 
            

    } else {
      return {
        error: "One or more ratings are missing in the response",
      };
    }
  } catch (error) {
    console.error(error);
    return {
      error: "An error occurred while fetching player ratings",
    };
  }
};

export default playerRating;
