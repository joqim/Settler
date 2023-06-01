// components/login.tsx
import { useEffect } from 'react';
import "../styles/globals.css"

const PassageLogin = () => {
  useEffect(() => {
    require('@passageidentity/passage-elements/passage-auth');
  }, []);

  return (
    <>
      <passage-auth app-id={process.env.PASSAGE_APP_ID} ></passage-auth>
    </>
  );
};

export default PassageLogin;
