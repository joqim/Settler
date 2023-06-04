import { NextApiRequest, NextApiResponse } from 'next';
import Splitwise from 'splitwise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    //console.log('inside players API', req.query);
    let groupId = '';
    if (Array.isArray(req.query.groupId)) {
      groupId = req.query.groupId[0];
    } else if (typeof req.query.groupId === 'string') {
      groupId = req.query.groupId;
    }

    // Fetch the players data from your backend or external API
    const players = await fetchPlayersFromSplitwiseGroup(groupId);

    // Return the players data as the response
    res.status(200).json(players);
  } catch (error) {
    // Handle any errors that occur during the API call
    res.status(500).json({ error: 'Unable to fetch players data' });
  }
}

async function fetchPlayersFromSplitwiseGroup(groupId: string) {
  const CONSUMER_KEY = process.env.CONSUMER_KEY;
  const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

  const sw = Splitwise({
    consumerKey: CONSUMER_KEY,
    consumerSecret: CONSUMER_SECRET
  });

  let group = await sw.getGroup({ id: groupId });
  //console.log('group', group.members);

  const preparedArray = group.members.map((member: any) => {
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

