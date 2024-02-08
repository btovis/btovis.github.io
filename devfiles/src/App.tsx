import { useState } from 'react'
import './App.css'
import SidebarComp from './ui/SidebarComp.tsx'
import MainPage from './ui/MainPage.tsx'
import PageManager from './classes/PageManager.ts'


function App() {
  const [pageManager, setPageManager] = useState(new PageManager())
  pageManager.updateCallback = setPageManager;
  return (
    <><div className="splitScreen">
      <div className="panel"><SidebarComp pageManager={pageManager}></SidebarComp></div>
      <div className="panel"><MainPage pageManager={pageManager}></MainPage></div>
      </div>
    </>
  )
}

export default App;
