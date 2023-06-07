import { NextApiRequest, NextApiResponse } from 'next';
import Splitwise from "splitwise";
import axios from "axios"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("inside groups API")
    const oauthToken = req.query.oauth_token as string;
    const oauthTokenSecret = req.query.oauth_token_secret as string;

    // Fetch the groups data from your backend or external API
    const groups = await fetchGroupsFromSplitwise(oauthToken, oauthTokenSecret);

    // Return the players data as the response
    //console.log("groups", groups)
    res.status(200).json(groups);
  } catch (error) {
    // Handle any errors that occur during the API call
    console.log("Unable to fetch groups data")
    res.status(500).json({ error: 'Unable to fetch groups data' });
  }
}

async function fetchGroupsFromSplitwise(oauthToken: string, oauthTokenSecret: string) {

  const SPLITWISE_API_CLIENT = "https://splitwise-api-pi.vercel.app";
  //const SPLITWISE_API_CLIENT = "http://127.0.0.1:5000";

  const response = await axios.get(`${SPLITWISE_API_CLIENT}/groups?oauth_token=${oauthToken}&oauth_token_secret=${oauthTokenSecret}`);
  console.log("response from groups", response.data);

  return response.data.groups;
}
