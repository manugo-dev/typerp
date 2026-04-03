import { initializeDatabaseServices } from "@typerp/database";

import { environmentConfig } from "./config.server";

export const database = initializeDatabaseServices(environmentConfig.databaseUrl);
