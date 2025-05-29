
    import { type ReactNode, useLayoutEffect } from "react";
    import { setPreferredColorScheme } from "@react-three/uikit"
    
    
      /**
       * The global provider is rendered at the root of your application,
       * use it to set up global configuration like themes.
       * Props defined on this component appear as controls inside Triplex.
       * 
       * See: https://triplex.dev/docs/building-your-scene/providers#global-provider
       */
      export function GlobalProvider({ children, colorMode = "light" }: { children: ReactNode; colorMode?: "light" | "dark" }) {
        
          useLayoutEffect(() => {
            
        setPreferredColorScheme(colorMode);
      
          }, [colorMode]);
        
        return (
          <>
            
            {children}
          </>
        );
      }
    
      /**
       * The canvas provider is rendered as a child inside the React Three Fiber canvas,
       * use it to set up canvas specific configuration like post-processing and physics.
       * Props defined on this component appear as controls inside Triplex.
       * 
       * See: https://triplex.dev/docs/building-your-scene/providers#canvas-provider
       */
      export function CanvasProvider({ children,  }: { children: ReactNode;  }) {
        
        return (
          <>
            
            {children}
          </>
        );
      }
  