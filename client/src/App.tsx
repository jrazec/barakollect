import './App.css'
import AppRoute from "./routes/index";
import { CacheProvider } from '@/contexts/CacheContext';

function App() {

  return (
    <CacheProvider>
      <AppRoute />
    </CacheProvider>
  );
}

export default App
