import React from "react"

export const ContextProvider = ({ context, value, children }: any) => {
  const Provider = context.Provider

  return <Provider value={value}>{children}</Provider>
}
