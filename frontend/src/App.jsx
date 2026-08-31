import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

import {BrowserRouter,Routes,Route} from "react-router-dom"

import Home from "./Home";
import ShareLocation  from "./ShareLocation"

function App() {
    return (
      
      <BrowserRouter>
      <Routes>

        <Route path='/' element={<Home/>}/>
        <Route path="/share/:requestId" element={<ShareLocation />}/>
      </Routes>

      </BrowserRouter>
    );
}

export default App
