import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Panel from './classes/Panel.js'
import Sidebar from './SidebarComponent.tsx'
import MainPage from './MainPage.tsx'


function App() {
  return (
    <><div className="splitScreen">
      <div className="panel"><Sidebar></Sidebar></div>
      <div className="paner"><MainPage></MainPage></div>
      </div>
    </>
  )
}

export default App;
