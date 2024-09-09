import { ICache } from "./ICache";
import { InMemoryCache } from "./InMemoryCache";


export const serverCache : ICache = new InMemoryCache()