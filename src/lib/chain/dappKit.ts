// Browser only. Import this from components loaded with `ssr: false`.
import { createDAppKit } from "@mysten/dapp-kit-react";
import { enokiWalletsInitializer } from "@mysten/enoki";
import { ENOKI, NETWORK } from "./config";
import { suiClient } from "./escrow";

export const dAppKit = createDAppKit({
  networks: [NETWORK],
  defaultNetwork: NETWORK,
  createClient: () => suiClient,
  slushWalletConfig: { appName: "Floe" },
  walletInitializers: ENOKI
    ? [
        enokiWalletsInitializer({
          apiKey: ENOKI.publicKey,
          providers: {
            google: {
              clientId: ENOKI.googleClientId,
              // A fixed page, so the claim link is never part of the login redirect.
              redirectUrl: `${window.location.origin}/auth`,
            },
          },
        }),
      ]
    : [],
});
