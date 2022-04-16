import { createContext } from 'react';
import { IGlobalContext } from './types';

const GlobalAppContext = createContext<Partial<IGlobalContext>>({});

export default GlobalAppContext;
