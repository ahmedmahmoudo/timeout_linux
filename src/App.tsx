import "./App.css";
import { AppRouter } from "./router";
import { BreaksProvider } from "./hooks/useBreaks";

function App() {
  return (
    <BreaksProvider>
      <AppRouter />
    </BreaksProvider>
  );
}

export default App;
