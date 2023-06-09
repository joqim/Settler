"use client"

import React, { useState, useEffect } from 'react';
import axios from "axios"
import { Button } from "@/components/ui/button"
import { AccountForm } from "@/app/form"
import { GroupDialog } from "@/app/splitwiseGroupsDialog";
import { GlobalDetail } from "@/app/globaldetail"
import { DotWave } from '@uiball/loaders';
import { useTheme } from 'next-themes';
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { getSupabase } from '../../utils/supabase'
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [buyIn, setBuyIn] = useState(0);
  const [playerCount, setPlayerCount] = useState([2]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [membersofSelectedGroup, setMembersforSelectedGroup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [splitwiseButtonDisabled, setSplitwiseButtonDisabled] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [syncSplitDisabled, setSyncSplitDisabled] = useState(false);
  const [secret, setSecret] = useState("");

  const { setTheme, theme } = useTheme();
  if(theme==='system') setTheme('dark');
  
  const dotWaveColor = theme === 'dark' ? 'black' : 'white';

  // Function to fetch data from the API endpoint
  const fetchPlayersForSelectedGroupId = async (selectedId: string) => {
    //console.log("inside fetch data for ", selectedId)
    try {
      if(selectedId) {
        const params = { groupId: selectedId }
        const oauth_token = localStorage.getItem('oauth_token');
        const oauth_token_secret = localStorage.getItem('oauth_token_secret');

        const response = await fetch(`/api/players?group_id=${selectedId}&oauth_token=${oauth_token}&oauth_token_secret=${oauth_token_secret}`);
        const data = await response.json();
        console.log("members", data); // Process the data as needed
        setMembersforSelectedGroup(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  async function passageAuthentication() {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();

      //console.log("data", data)
      const { isAuthorized, appID, username, userID, SUPABASE_JWT_SECRET } = data;
  
      // Handle the response accordingly
      if (isAuthorized) {
        // User is authorized
        //console.log('User is authorized with appID:', appID);
        setUserName(username);
        //console.log("userId from auth", userID)

        const supabase = getSupabase(userID, SUPABASE_JWT_SECRET)
        const {data} = await supabase.from('settler').select()
        
        console.log("data from settler - supabase", data)
      } else {
        // User is not authorized
        //console.log('User is not authorized with appID:', appID);
        window.location.href = '/';
      }
    } catch (error) {
      // Handle the error
      console.error('Error occurred while checking authorization:', error);
    }
  }

  async function fetchSplitwiseAccessToken() {
    const SPLITWISE_API_CLIENT = "https://splitwise-api-pi.vercel.app";
    //const SPLITWISE_API_CLIENT = "http://127.0.0.1:5000";

    try {
      const response = await axios.get(`${SPLITWISE_API_CLIENT}/auth_code`);
      console.log("redirect URI for auth code fetched", response);

      if (response.data && response.data.redirect_url && response.data.secret) {
        
        localStorage.setItem('secret', response.data.secret);
        setSecret(response.data.secret);

        const redirectUrl = response.data.redirect_url;
        const popupWidth = 600;
        const popupHeight = 600;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const left = (screenWidth - popupWidth) / 2;
        const top = (screenHeight - popupHeight) / 2;
        const windowFeatures = `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`;

        window.open(redirectUrl, '_blank', windowFeatures);
      }
    } catch (error) {
      console.error("Error occurred when fetching access token");
    }
  }

  useEffect(() => {
    console.log("inside useEffect");
    require('@passageidentity/passage-elements/passage-auth');
    const fetchDataAndAuthenticate = async () => {
      try {
        setLoading(true);
        await passageAuthentication(); // Assuming passageAuthentication is an async function
        setLoading(false);
      } catch (error) {
        // Handle any errors that occur during passageAuthentication or fetchData
        setLoading(false); // Set loading to false even if an error occurs
        console.error(error);
      }
    };

    fetchDataAndAuthenticate(); // Call the function to fetch data and authenticate when the component mounts
  
    const clearLocalStorage = () => {
      localStorage.clear();
    };
  
    window.addEventListener('beforeunload', clearLocalStorage);
    return () => {
      window.removeEventListener('beforeunload', clearLocalStorage);
    };
  }, []);
    

  useEffect(()=> {
    fetchPlayersForSelectedGroupId(selectedGroupId); // Call the function to fetch data when selectedGroupId changes
  }, [selectedGroupId])

  const handleBuyInChange = (value: any) => {
    setBuyIn(value);
  };

  const handlePlayerCountChange = (value: any) => {
    setPlayerCount(value);
    // Check if local storage has no array
    if (!localStorage.getItem('players')) {
      const playerArray = new Array(value);  // Create an array of length based on the value parameter
      localStorage.setItem('players', JSON.stringify(playerArray));
    } else {
      //update array accordingly
    }
  }

  const renderAccountForms = () => {
    const accountForms = [];
    for (let i = 0; i < playerCount[0]; i++) {
      accountForms.push(
        <AccountForm 
          key={i} 
          index={i} 
          playerCount={playerCount} 
          members={membersofSelectedGroup}
        />);
    }
    return accountForms;
  };

  const handleSaveChanges = (group: string, id: string) => {
    //console.log("inside handle save changes in page")
    setSelectedGroup(group);
    setSelectedGroupId(id);

    //console.log("group id before fetch id", selectedGroupId);
    fetchPlayersForSelectedGroupId(id);
  };

  const { toast } = useToast();

  const handleUpdateSplitwise = async () => {
    setSplitwiseButtonDisabled(true);
    let localStorageString = localStorage.getItem('players');
    let players;

    if (localStorageString !== null) {
      players = JSON.parse(localStorageString);
    } else {
      // Handle the case when the value is not found in local storage
      players = []; // or any default value you prefer
    }

    let preparedMembersArray = [];
    let totalMoneyPaid = 0;

    for(let member of players) {
      //console.log("member", member)
      let totalBuyInAmount = buyIn;
      let numberOfBuyIns = member.buyin;
      let totalChipValue = numberOfBuyIns*1000;
  
      let chipsWalkedAwayWith = member.chips - totalChipValue;
      let totalMoneyWalkedAwayWith = parseFloat(((chipsWalkedAwayWith/1000)*totalBuyInAmount).toFixed(2));
      //console.log("totalMoneyWalkedAwayWith", totalMoneyWalkedAwayWith);

      interface MemberObject {
        name: string;
        id: number;
        money: number;
      }
      
      let memberObject: MemberObject = {
        name: member.name,
        id: member.identifier,
        money: totalMoneyWalkedAwayWith,
      };
      
      preparedMembersArray.push(memberObject);
      //console.log("prep mem array", preparedMembersArray)
    
      if(totalMoneyWalkedAwayWith > 0) {
        totalMoneyPaid += totalMoneyWalkedAwayWith;
        //console.log("totalMoneyPaid", totalMoneyPaid)
      }
    }
    
    // Retrieve the access token from localStorage
    const oauth_token = localStorage.getItem('oauth_token') as string;
    const oauth_token_secret = localStorage.getItem('oauth_token_secret') as string;
    if(oauth_token && oauth_token_secret) {
      const params = {
        groupId: selectedGroupId,
        playersArray: JSON.stringify(preparedMembersArray),
        totalMoneyPaid: String(totalMoneyPaid),
        oauth_token: oauth_token,
        oauth_token_secret: oauth_token_secret
      };
      
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/splitwise?${queryString}`;

      const response = await fetch(url);   
      //console.log("response from python server1", response)

      const currentDate = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      };

      const formattedDate = new Intl.DateTimeFormat("en-US", options).format(currentDate);

      if (response.status === 200) {
        //console.log("response status is 200");
        toast({
          title: "Splitwise activity updated successfully",
          description: formattedDate
        });
        setSplitwiseButtonDisabled(false);
      }

      //float notification success
      else if (response.status===400) {
        toast({
          title: "Something went wrong.",
          description: "There was a problem with your request.",
          action: (
            <ToastAction altText="Goto page to undo">Undo</ToastAction>
          )
        })
        setSplitwiseButtonDisabled(false);
      } //float notification error
      localStorage.clear();
    } else {
      //Access token not present, sync with splitwise
      toast({
        title: "Access token not found",
        description: "Sync Settler with Splitwise to fetch access token",
        action: (
          <ToastAction altText="Goto page to undo">Undo</ToastAction>
        )
      })
      setSplitwiseButtonDisabled(false);
    }
  }

  const handleLogout = async () => {
    setTheme('dark')
    document.cookie = "psg_auth_token=; max-age=0; path=/;";
    window.location.href = "/";    
  }

  const handleSyncWithSplitwise = async () => {
    setSyncSplitDisabled(true);
    await fetchSplitwiseAccessToken();
    setSyncSplitDisabled(false);
  }
  
  return (
    <>
      {loading && (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        {<DotWave color={dotWaveColor} />}
      </div>)}
      {!loading && (
        <>
          <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
            <div className="flex flex-col items-start gap-2">
            <div className="flex w-full items-center justify-between">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
                Settler
                <br className="hidden sm:inline" />
              </h1>
              <div className="space-x-2">
                <Button className="mr-2" onClick={handleSyncWithSplitwise} disabled={syncSplitDisabled}>Sync with Splitwise</Button>
                <Button onClick={handleLogout}>Logout</Button>
              </div>
            </div>

              <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
                No more arguing about who owes who what.
                <br className="hidden sm:inline" />
                Built using Splitwise API.
              </p>
            </div>
          </section>
        
          <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
            <div className="flex items-center">
              <p className={selectedGroup && selectedGroup.length > 0 ? "ml-2 mr-8 text-lg" : ""}>{selectedGroup}</p>
              <GroupDialog onSaveChanges={handleSaveChanges} />
            </div>
            
            <GlobalDetail 
              onBuyInValueChange={handleBuyInChange}
              onPlayerCountValueChange={handlePlayerCountChange}
            />
          </section>

          <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
            {renderAccountForms()}
            {splitwiseButtonDisabled && (<Button className="w-40" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
            </Button>)}
            {!splitwiseButtonDisabled && (
              <Button className="w-40" onClick={handleUpdateSplitwise} >Update Splitwise</Button>
            )}
            
          </section>
        </>
      )}
    </>
  )
}