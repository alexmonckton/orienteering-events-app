import React from 'react'
import Button from '../components/button';
import reactLogo from '@shared/assets/react.svg'
import viteLogo from '@shared/assets/vite.svg'

function Home() {
    return (
         <div>
            <a href="https://vite.dev" target="_blank">
                <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
            <h1>Vite + React</h1>
            <div className="card">
            <Button />
            <p>
                Edit <code>src/App.tsx</code> and save to test HMR
            </p>
            </div>
            <p className="read-the-docs">
            Click on the Vite and React logos to learn more
            </p>
        </div>
    );
}

export default Home;