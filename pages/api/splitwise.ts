import { NextApiRequest, NextApiResponse } from 'next';
import Splitwise from "splitwise";
import axios from "axios";

export default async function splitWiseExpenseUpdate(req: NextApiRequest, res: NextApiResponse) {
    try {
        const CONSUMER_KEY = process.env.CONSUMER_KEY;
        const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

        const sw = Splitwise({
            consumerKey: CONSUMER_KEY,
            consumerSecret: CONSUMER_SECRET
        });

        interface MemberObject {
            name: string;
            id: number;
            money: number;
        }

        let playersArray: MemberObject[] = [];
        if (typeof req.query.playersArray === 'string') {
            playersArray = JSON.parse(req.query.playersArray);
        }
        console.log("players array", playersArray)

        let totalMoneyPaid = req.query.totalMoneyPaid;

        const payload = {
            group_id: req.query.groupId,
            players: playersArray,
            total_paid: totalMoneyPaid,
            CONSUMER_KEY: CONSUMER_KEY,
            CONSUMER_SECRET: CONSUMER_SECRET,
            API_KEY: process.env.SPLITWISE_API_KEY
        }

        let response = await axios.post("http://127.0.0.1:5000/update", payload)
        console.log("resp from python server", response.status)

        if (response.status === 200) {
            return res.status(200).json({ message: "success" });
        } else {
            return res.status(400).json({ message: "failure" });
        }

    } catch (error) {
        // authentication failed
        res.status(400).json({message: "failure"});
    }
}