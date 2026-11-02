// Fluid Functionalism · Base UI · rounded · default size · Tabler icons · light theme · indigo accent.
// Wrap the root's children in <FluidRoot>.

import { FluidProvider } from "@/lib/fluid-provider";
import { tablerIcons } from "@/lib/icons-tabler";

export function FluidRoot({ children }: { children: React.ReactNode }) {
  return (
    <FluidProvider shape="rounded" size="default" icons={tablerIcons}>
      {children}
    </FluidProvider>
  );
}
