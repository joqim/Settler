import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('inside players API', req.query);
    let groupId = req.query.group_id as string;
    let oauthToken = req.query.oauth_token as string;
    let oauthTokenSecret = req.query.oauth_token_secret as string;

    // Fetch the players data from your backend or external API
    const players = await fetchPlayersFromSplitwiseGroup(groupId, oauthToken, oauthTokenSecret);
    console.log("players", players.length)

    // Return the players data as the response
    res.status(200).json(players);
  } catch (error) {
    // Handle any errors that occur during the API call
    res.status(500).json({ error: 'Unable to fetch players data' });
  }
}

async function fetchPlayersFromSplitwiseGroup(groupId: string, oauthToken:string, oauthTokenSecret:string) {
  console.log("inside fetchPlayersFromSplitwiseGroup")

  const SPLITWISE_API_CLIENT = "https://splitwise-api-pi.vercel.app";
  //const SPLITWISE_API_CLIENT = "http://127.0.0.1:5000";

  const response = await axios.get(`${SPLITWISE_API_CLIENT}/players?oauth_token=${oauthToken}&group=${groupId}&oauth_token_secret=${oauthTokenSecret}`);
  console.log("response from players", response.data.players.length);
  const players = response.data.players;

  const preparedArray = players.map((member: any) => {
    const id = member.id;
    const email = member.email;
    const name = member.first_name && member.last_name
    ? `${member.first_name} ${member.last_name}`
    : member.first_name || member.last_name || '';
  
    return {
      id,
      email,
      name
    };
  });

  return preparedArray;
}

