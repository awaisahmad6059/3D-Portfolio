import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
const MyWorks = lazy(() => import("./pages/MyWorks"));
import { LoadingProvider } from "./context/LoadingProvider";
import { ThemeProvider } from "./context/ThemeContext";
import { SoundProvider } from "./context/SoundContext";

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <SoundProvider>
      <Routes>
        <Route
          path="/"
          element={
            <LoadingProvider>
              <Suspense>
                <MainContainer>
                  <Suspense>
                    <CharacterModel />
                  </Suspense>
                </MainContainer>
              </Suspense>
            </LoadingProvider>
          }
        />
        <Route
          path="/myworks"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <MyWorks />
            </Suspense>
          }
        />
      </Routes>
      <Analytics />
      <SpeedInsights />
      </SoundProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
