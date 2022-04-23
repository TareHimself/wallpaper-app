import { createContext } from 'react';

const GlobalAppContext = createContext<Partial<IGlobalContext>>({});

export default GlobalAppContext;
