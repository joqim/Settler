// pages/api/players.ts

import { NextApiRequest, NextApiResponse } from 'next';
import Splitwise from "splitwise";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("inside groups API")
    // Fetch the groups data from your backend or external API
    const groups = await fetchGroupsFromSplitwise();

    // Return the players data as the response
    console.log("groups", groups)
    res.status(200).json(groups);
  } catch (error) {
    // Handle any errors that occur during the API call
    console.log("Unable to fetch groups data")
    res.status(500).json({ error: 'Unable to fetch groups data' });
  }
}

async function fetchGroupsFromSplitwise() {
  const CONSUMER_KEY = process.env.CONSUMER_KEY;
  const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

  const sw = Splitwise({
    consumerKey: CONSUMER_KEY,
    consumerSecret: CONSUMER_SECRET
  });

  console.log("sw", sw, CONSUMER_KEY, CONSUMER_SECRET)
  let groups = await sw.getGroups();
  //console.log("groups", groups);

  return groups;
}
