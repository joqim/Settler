"use client"

import Link from "next/link"
import React, { useState, useEffect } from 'react';
import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { AccountForm } from "@/app/form"
import { GroupDialog } from "@/app/splitwiseGroupsDialog";
import { GlobalDetail } from "@/app/globaldetail"

export default function IndexPage() {
  const [buyIn, setBuyIn] = useState(0);
  const [playerCount, setPlayerCount] = useState([2]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [membersofSelectedGroup, setMembersforSelectedGroup] = useState([]);
  console.log("selected group parent", selectedGroup, selectedGroupId)

  // Function to fetch data from the API endpoint
  const fetchData = async (selectedId: string) => {
    console.log("inside fetch data for ", selectedId)
    try {
      if(selectedId) {
        const params = { groupId: selectedId }
        const response = await fetch(`/api/players?${new URLSearchParams(params)}`);
        const data = await response.json();
        console.log("members", data); // Process the data as needed
        setMembersforSelectedGroup(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
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
    console.log("inside handle save changes in page")
    setSelectedGroup(group);
    setSelectedGroupId(id);

    console.log("group id before fetch id", selectedGroupId);
    fetchData(id);
  };

  const handleUpdateSplitwise = () => {
    localStorage.clear();
  }

  return (
    <>
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
            Settler <br className="hidden sm:inline" />
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            No more arguing about who owes who what.<br className="hidden sm:inline" />
            Built using Splitwise API.
          </p>
        </div>
        <div className="flex gap-4">
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
        </div>
      </section>
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex items-center">
          <p className={selectedGroup && selectedGroup.length > 0 ? "ml-2 text-lg mr-8" : ""}>{selectedGroup}</p>
          <GroupDialog onSaveChanges={handleSaveChanges} />
        </div>
        
        <GlobalDetail 
          onBuyInValueChange={handleBuyInChange}
          onPlayerCountValueChange={handlePlayerCountChange}
        />
      </section>

      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        {renderAccountForms()}
        <Button className="w-40" onClick={handleUpdateSplitwise}>Update Splitwise</Button>
      </section>
    </>
  )
}