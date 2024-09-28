import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SidebarContextType {
  selectedItem: number;
  updateSelectedItem: (index: number) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebarContext = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState<number>(0);

  const updateSelectedItem = (index: number) => {
    setSelectedItem(index);
  };

  const value: SidebarContextType = {
    selectedItem,
    updateSelectedItem,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarProvider;