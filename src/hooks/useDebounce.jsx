import { useEffect, useState } from "react"

const useDebounce = (value,delay=300) => {
  const [debouncedValue,setDebouncedValue]=useState("")

  useEffect(()=>
    {
        let timer=setTimeout(()=>
        {
           setDebouncedValue(value)
        },delay)
     return ()=>{clearTimeout(timer)}
    },[value,delay])
  return debouncedValue;
}

export default useDebounce