import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import '../styles/globals.css';

const PassageLogin = () => {
  console.log("inside passage login component")
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    require('@passageidentity/passage-elements/passage-auth');
  }, []);

  useEffect(() => {
    const passageAuthElement = document.querySelector('div');
    if (passageAuthElement) {
      if (theme === 'dark') {
        passageAuthElement.classList.add('darkMode');
      } else {
        passageAuthElement.classList.remove('darkMode');
      }
    }
  }, [theme]);

  return (
    <div>
      <passage-auth app-id={process.env.PASSAGE_APP_ID}></passage-auth>
    </div>
  );
};

export default PassageLogin;