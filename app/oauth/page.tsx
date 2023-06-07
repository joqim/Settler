"use client"

import React, { useState, useEffect } from 'react';
import axios from "axios"
import { useTheme } from 'next-themes';
import { DotWave } from '@uiball/loaders';

export default function DashboardPage() {
    const { setTheme, theme } = useTheme();
    if(theme==='system') setTheme('dark');
    const dotWaveColor = theme === 'dark' ? 'black' : 'white';

    useEffect(() => {
        console.log("inside useEffect");
        fetchSplitwiseAccessToken(); // Checking if URL contains 'code' then fetch access token
    }, [])

  async function fetchSplitwiseAccessToken() {
    const SPLITWISE_API_CLIENT = "https://splitwise-api-pi.vercel.app";
    //const SPLITWISE_API_CLIENT = "http://127.0.0.1:5000";

    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('oauth_token');
    const oauthVerifier = urlParams.get('oauth_verifier');

    console.log('Oauth token and verifier exists:', oauthToken, oauthVerifier);
        try {
            const secret = localStorage.getItem('secret');

            if (secret) {
                const response = await axios.get(`${SPLITWISE_API_CLIENT}/access_token?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}&secret=${secret}`);
                console.log("access token fetched", response);

                if (response.data && response.data.token) {
                    localStorage.setItem('oauth_token', response.data.token['oauth_token']);
                    localStorage.setItem('oauth_token_secret', response.data.token['oauth_token_secret']);
                    window.opener.postMessage('Token updated', window.origin);
                    window.close();
                }
            }
        } catch (error) {
            console.error("Error occurred when fetching access token");
        }
  }
    
  return (
    <>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            {<DotWave color={dotWaveColor} />}
        </div>
    </>
  )
}