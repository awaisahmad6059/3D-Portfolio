import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Loading from "../components/Loading";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

const VISITED_KEY = "portfolio-visited";

const hasVisitedBefore = () => {
  try {
    return sessionStorage.getItem(VISITED_KEY) === "1";
  } catch {
    return false;
  }
};

const markVisited = () => {
  try {
    sessionStorage.setItem(VISITED_KEY, "1");
  } catch {
    /* private mode — loader simply shows again */
  }
};

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(() => {
    // Skip the loader on mobile, and on repeat visits within the same tab
    // session so a refresh goes straight to the page.
    if (window.innerWidth <= 768) return false;
    return !hasVisitedBefore();
  });
  const [loading, setLoading] = useState(0);

  const value = {
    isLoading,
    setIsLoading: (state: boolean) => {
      if (!state) markVisited();
      setIsLoading(state);
    },
    setLoading,
  };

  useEffect(() => {
    // On mobile there is no 3D model, and on a repeat visit the loader is
    // skipped — in both cases initialFX still has to run, otherwise the page
    // stays locked (body overflow hidden) and invisible.
    if (window.innerWidth <= 768 || hasVisitedBefore()) {
      import("../components/utils/initialFX").then((module) => {
        if (module.initialFX) {
          setTimeout(() => {
            module.initialFX();
          }, 100);
        }
      });
    }
  }, []);

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
