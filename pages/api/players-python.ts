import { NextApiRequest, NextApiResponse } from 'next';
import axios from "axios"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('inside players API', req.query);
    let groupId = req.query.group_id as string;
    let accessToken = req.query.access_token as string;

    // Fetch the players data from your backend or external API
    const players = await fetchPlayersFromSplitwiseGroup(groupId, accessToken);

    // Return the players data as the response
    res.status(200).json(players);
  } catch (error) {
    // Handle any errors that occur during the API call
    res.status(500).json({ error: 'Unable to fetch players data' });
  }
}

async function fetchPlayersFromSplitwiseGroup(groupId: string, accessToken: string) {
  const SPLITWISE_API_CLIENT = "https://splitwise-api-pi.vercel.app";
  //const SPLITWISE_API_CLIENT = "http://127.0.0.1:5000";

  console.log("acc tok", accessToken)
  const response = await axios.get(`${SPLITWISE_API_CLIENT}/players?token=${accessToken}&group=${groupId}`);
  console.log("response from players", response.data);

  // const preparedArray = group.members.map((member: any) => {
  //   const id = member.id;
  //   const email = member.email;
  //   const name = member.first_name && member.last_name
  //   ? `${member.first_name} ${member.last_name}`
  //   : member.first_name || member.last_name || '';
  
  //   return {
  //     id,
  //     email,
  //     name
  //   };
  // });

  return [];
}

