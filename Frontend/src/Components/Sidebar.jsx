import { useState,useEffect } from "react";
import AsteroidDetails from "./AsteroidDetails";
import ImpactAnalysis from "./ImpactAnalysis";
import Globe from "./globe.jsx";
import useAsteroidStore from "../other/useAsteroidStore";

export default function SimpleToggleSidebar() {
    const [open, setOpen] = useState(true);
     const launched = useAsteroidStore((state) => state.launched);
     const {crashed}=useAsteroidStore()

    useEffect(() => {
    if (launched && open) {
      setOpen(!open)

    } else {
      console.log("simulation reset")
    }
  }, [launched]);

    useEffect(()=>{
      if (!crashed && !open){
        setOpen(!open)
      }

    },[crashed]);





 

    return (
        <div className="flex fixed top-0 left-0 z-20">

            <aside className={`h-screen bg-neutral-800 text-neutral-100 transition-all duration-300 overflow-y-auto top-0 ${open ? "w-88" : "w-0"}`}>

                <AsteroidDetails />

            </aside>

            <button
                className={`fixed top-0 left-0 h-screen p-2 bg-neutral-900 hover:bg-neutral-700 text-neutral-100 rounded-r transition-all duration-300 w-12 ${open ? "left-88" : "left-0"}`}
                onClick={() => setOpen(!open)  
                }

            >
                {open ? '<' : '>'}
            </button>
        </div>
    );
}
