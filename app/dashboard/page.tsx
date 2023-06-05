"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { AccountForm } from "@/app/form"
import { GroupDialog } from "@/app/splitwiseGroupsDialog";
import { GlobalDetail } from "@/app/globaldetail"
import { DotWave } from '@uiball/loaders';
import { useTheme } from 'next-themes';
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { getSupabase } from '../../utils/supabase'

export default function DashboardPage() {
  const [buyIn, setBuyIn] = useState(0);
  const [playerCount, setPlayerCount] = useState([2]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [membersofSelectedGroup, setMembersforSelectedGroup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [splitwiseButtonDisabled, setSplitwiseButtonDisabled] = useState(false);

  const { setTheme, theme } = useTheme();
  if(theme==='system') setTheme('dark');
  
  const dotWaveColor = theme === 'dark' ? 'black' : 'white';

  // Function to fetch data from the API endpoint
  const fetchData = async (selectedId: string) => {
    //console.log("inside fetch data for ", selectedId)
    try {
      if(selectedId) {
        const params = { groupId: selectedId }
        const response = await fetch(`/api/players?${new URLSearchParams(params)}`);
        const data = await response.json();
        //console.log("members", data); // Process the data as needed
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

  useEffect(() => {
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

    fetchData(selectedGroupId); // Call the function to fetch data when the component mounts
  
    return () => {
      window.removeEventListener('beforeunload', clearLocalStorage);
    };
  }, []);
  

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
    fetchData(id);
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

    const params = {
      groupId: selectedGroupId,
      playersArray: JSON.stringify(preparedMembersArray),
      totalMoneyPaid: String(totalMoneyPaid),
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
          <ToastAction altText="Goto schedule to undo">Undo</ToastAction>
        )
      })
      setSplitwiseButtonDisabled(false);
    } //float notification error
    localStorage.clear();
  }

  const handleLogout = async () => {
    setTheme('dark')
    document.cookie = "psg_auth_token=; max-age=0; path=/;";
    window.location.href = "/";    
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
                <Button className="mr-5" onClick={handleLogout}>Logout</Button>
              </div>
              <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
                No more arguing about who owes who what.
                <br className="hidden sm:inline" />
                Built using Splitwise API.
              </p>
            </div>

          {/* <div className="flex gap-4">
            <Link
              href={siteConfig.links.docs}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: "lg" })}
            >
              Read article
            </Link>
            <Link
              target="_blank"
              rel="noreferrer"
              href={siteConfig.links.github}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              GitHub
            </Link>
          </div> */}
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
          <Button className="w-40" onClick={handleUpdateSplitwise} disabled={splitwiseButtonDisabled}>Update Splitwise</Button>
        </section>
        </>
      )}
    </>
  )
}