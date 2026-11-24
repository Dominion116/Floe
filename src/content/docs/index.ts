import type { DocPage } from "@/content/types";
import { architecture } from "./architecture";
import { claim } from "./claim";
import { client } from "./client";
import { configuration } from "./configuration";
import { contract } from "./contract";
import { deploy } from "./deploy";
import { gifts } from "./gifts";
import { httpApi } from "./http-api";
import { introduction } from "./introduction";
import { loginAndGas } from "./login-and-gas";
import { prices } from "./prices";
import { quickstart } from "./quickstart";
import { refunds } from "./refunds";
import { security } from "./security";
import { send } from "./send";
import { troubleshooting } from "./troubleshooting";
import { water } from "./water";

/** Order here is the order in the sidebar, and of the previous and next links. */
export const DOC_GROUPS: { title: string; pages: DocPage[] }[] = [
  { title: "Get started", pages: [introduction, quickstart] },
  { title: "Use Floe", pages: [send, claim, gifts, refunds, water] },
  { title: "How it works", pages: [architecture, security, loginAndGas, prices] },
  { title: "Reference", pages: [contract, httpApi, client, configuration] },
  { title: "Operate", pages: [deploy, troubleshooting] },
];

export const DOC_PAGES: DocPage[] = DOC_GROUPS.flatMap((group) => group.pages);

export const hrefOf = (page: DocPage) => (page.slug ? `/docs/${page.slug}` : "/docs");
