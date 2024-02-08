import { Dispatch, SetStateAction, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Panel from '../classes/Panel.js'
import PageManager from '../classes/PageManager.js'

function GlobalOptionsComp(params:{pageManager:PageManager}) {

  return (
   <> 
      Global Options
    </>
  )
}

export default GlobalOptionsComp
