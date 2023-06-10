"use client";
import "../styles/globals.css"

import { DotWave } from '@uiball/loaders'
import PassageLogin from "@/components/login";
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function LoginPage() {
  console.log("inside Login Page")
  const [authenticated, setAuthenticationStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  const { setTheme, theme } = useTheme();
  if(theme==='system') setTheme('dark');
  const dotWaveColor = theme === 'dark' ? 'white' : 'black';

  async function passageAuthentication() {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();

      //console.log("data", data);
      const { isAuthorized, appID } = data;

      // Handle the response accordingly
      if (isAuthorized) {
        // User is authorized
        //console.log('User is authorized with appID:', appID);
        setAuthenticationStatus(true);
        window.location.href = '/dashboard'; // Route to /dashboard
      } else {
        // User is not authorized
        //console.log('User is not authorized with appID:', appID);
        setAuthenticationStatus(false);
      }
    } catch (error) {
      // Handle the error
      console.error('Error occurred while checking authorization:', error);
      setAuthenticationStatus(false);
    }
  }

  useEffect(() => {
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
  
    fetchDataAndAuthenticate();
  }, []);

  return (
    <>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          {loading && <DotWave color={dotWaveColor}/>}
        </div>
      )}
      {!authenticated && <PassageLogin/>}
    </>
  )
}
