import React, { useContext } from 'react'

const GameContext = React.createContext<unknown>('');

interface propTypes {
  children: any
  props: any
}

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGameContext must be used within a ContextProvider');
  return context;
}

export const ContextProvider = ({ children, props }: propTypes) => {
  return (
    <GameContext.Provider value={{ props }}>{children}</GameContext.Provider>
  )
}
